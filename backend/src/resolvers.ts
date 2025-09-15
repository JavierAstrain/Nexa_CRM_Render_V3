import { PrismaClient, Role } from "@prisma/client";
import type { AppContext } from "./types.js";
import { computeOpportunityScore } from "./scoring.js";
import { ragSearch } from "./rag.js";
import { runWorkflows } from "./workflow.js";
import { GraphQLError } from "graphql";

const prisma = new PrismaClient();

function maskFinancial<T extends { amount?: number | null }>(obj: T, canView: boolean): T {
  if (!canView) {
    return { ...obj, amount: null };
  }
  return obj;
}

export const resolvers = {
  Query: {
    me: async (_: any, __: any, ctx: AppContext) => ctx.user || null,

    accounts: async (_: any, { search }: any, ctx: AppContext) => {
      const list = await prisma.account.findMany({
        where: search ? { name: { contains: search, mode: "insensitive" } } : undefined,
        include: { contacts: true, opps: true, owner: true }
      });
      return list;
    },
    contacts: async (_: any, { search }: any) => {
      return prisma.contact.findMany({
        where: search
          ? { OR: [
                { firstName: { contains: search, mode: "insensitive" } },
                { lastName: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } }
              ] }
          : undefined,
        include: { account: true, activities: true }
      });
    },
    opportunities: async (_: any, { search, stage }: any, ctx: AppContext) => {
      const list = await prisma.opportunity.findMany({
        where: {
          AND: [
            search ? { name: { contains: search, mode: "insensitive" } } : {},
            stage ? { stage } : {}
          ]
        },
        include: { account: true, contact: true, owner: true, activities: true, quotes: true }
      });
      return list.map(o => maskFinancial(o, ctx.user?.viewFinancials ?? false));
    },
    activities: async (_: any, { opportunityId, contactId }: any) => {
      return prisma.activity.findMany({
        where: {
          AND: [
            opportunityId ? { opportunityId } : {},
            contactId ? { contactId } : {}
          ]
        },
        include: { contact: true, opportunity: true }
      });
    },
    emailThreads: async (_: any, { accountId, contactId }: any) => {
      return prisma.emailThread.findMany({ where: { accountId, contactId } });
    },
    products: async (_: any, { search }: any) => {
      return prisma.product.findMany({
        where: search ? { name: { contains: search, mode: "insensitive" } } : undefined
      });
    },
    priceLists: async () => prisma.priceList.findMany({ include: { items: { include: { product: true } } } }),
    quotes: async (_: any, { opportunityId }: any) => prisma.quote.findMany({
      where: { opportunityId: opportunityId || undefined },
      include: { lines: { include: { product: true } } }
    }),

    analytics: async () => {
      const stages = ["PROSPECT","QUALIFIED","PROPOSAL","NEGOTIATION","WON","LOST"] as const;
      const counts = await Promise.all(stages.map(async s => ({
        stage: s,
        count: await prisma.opportunity.count({ where: { stage: s as any } })
      })));
      const total = await prisma.opportunity.count();
      const won = await prisma.opportunity.count({ where: { stage: "WON" as any } });
      // Sales velocity: días promedio entre createdAt y closeDate de las ganadas
      const wonList = await prisma.opportunity.findMany({ where: { stage: "WON" as any }, select: { createdAt: true, closeDate: true } });
      const diffs = wonList.map(w => w.closeDate ? ((w.closeDate.getTime() - w.createdAt.getTime())/(1000*3600*24)) : 0).filter(n => n>0);
      const salesVelocityDays = diffs.length ? (diffs.reduce((a,b)=>a+b,0)/diffs.length) : 0;
      return {
        funnel: counts,
        winRate: total ? won/total : 0,
        salesVelocityDays
      };
    },

    rag: async (_: any, { query }: any) => {
      return ragSearch(query);
    },

    copilot: async (_: any, { entityType, entityId }: any) => {
      // Simulación de sugerencias: next best action + resumen
      return [
        { title: "Next-best action", detail: `Programa una reunión de discovery para ${entityType} ${entityId} en las próximas 48h.` },
        { title: "Resumen", detail: `Los últimos intercambios muestran interés alto. Prepara una propuesta abreviada.` }
      ];
    }
  },

  Mutation: {
    login: async (_: any, { email, password }: any, ctx: AppContext) => {
      const u = await prisma.user.findUnique({ where: { email } });
      if (!u) throw new GraphQLError("Invalid credentials");
      const bcrypt = await import("bcryptjs");
      const ok = await bcrypt.compare(password, u.password);
      if (!ok) throw new GraphQLError("Invalid credentials");
      const jwt = await import("jsonwebtoken");
      const token = jwt.sign({ sub: u.id, email: u.email, role: u.role, viewFinancials: u.viewFinancials }, process.env.JWT_SECRET || "devsecret", { expiresIn: "7d" });
      return { token, user: u };
    },

    register: async (_: any, { email, password, name }: any) => {
      const bcrypt = await import("bcryptjs");
      const hash = await bcrypt.hash(password, 10);
      const u = await prisma.user.create({ data: { email, password: hash, name, role: "USER", viewFinancials: false } });
      const jwt = await import("jsonwebtoken");
      const token = jwt.sign({ sub: u.id, email: u.email, role: u.role, viewFinancials: u.viewFinancials }, process.env.JWT_SECRET || "devsecret", { expiresIn: "7d" });
      return { token, user: u };
    },

    createAccount: async (_: any, args: any, ctx: AppContext) => {
      if (!ctx.user) throw new GraphQLError("Unauthorized");
      return prisma.account.create({ data: { ...args, ownerId: ctx.user.id } });
    },
    createContact: async (_: any, { firstName, lastName, email, accountId }: any) => {
      return prisma.contact.create({ data: { firstName, lastName, email, accountId } });
    },
    createOpportunity: async (_: any, { input }: any, ctx: AppContext) => {
      if (!ctx.user) throw new GraphQLError("Unauthorized");
      const opp = await prisma.opportunity.create({ data: { ...input, ownerId: ctx.user.id } });
      const score = computeOpportunityScore(opp);
      await prisma.opportunity.update({ where: { id: opp.id }, data: { score } });
      await runWorkflows("opportunity.created", { opportunityId: opp.id });
      return maskFinancial({ ...opp, score }, ctx.user.viewFinancials);
    },
    updateOpportunity: async (_: any, { id, input }: any, ctx: AppContext) => {
      if (!ctx.user) throw new GraphQLError("Unauthorized");
      const opp = await prisma.opportunity.update({ where: { id }, data: { ...input } });
      const score = computeOpportunityScore(opp);
      const updated = await prisma.opportunity.update({ where: { id }, data: { score } });
      return maskFinancial(updated, ctx.user.viewFinancials);
    },
    setOpportunityStage: async (_: any, { id, stage }: any) => {
      const opp = await prisma.opportunity.update({ where: { id }, data: { stage } });
      await runWorkflows("opportunity.stage_changed", { opportunityId: id, stage });
      return opp;
    },
    addActivity: async (_: any, { opportunityId, contactId, type, subject, notes, dueDate }: any) => {
      return prisma.activity.create({
        data: { opportunityId, contactId, type, subject, notes, dueDate: dueDate ? new Date(dueDate) : undefined }
      });
    },

    createQuote: async (_: any, { opportunityId, title, currency, lines }: any) => {
      const q = await prisma.quote.create({ data: { opportunityId, title, currency, total: 0 } });
      let total = 0;
      for (const ln of lines) {
        const lineTotal = ln.unitPrice * ln.qty;
        await prisma.quoteLine.create({ data: { quoteId: q.id, productId: ln.productId, qty: ln.qty, unitPrice: ln.unitPrice, lineTotal } });
        total += lineTotal;
      }
      return prisma.quote.update({ where: { id: q.id }, data: { total }, include: { lines: { include: { product: true } } } });
    },
    updateQuote: async (_: any, { id, title, status, lines }: any) => {
      if (title || status) {
        await prisma.quote.update({ where: { id }, data: { title: title || undefined, status: status || undefined } });
      }
      if (lines) {
        await prisma.quoteLine.deleteMany({ where: { quoteId: id } });
        let total = 0;
        for (const ln of lines) {
          const lineTotal = ln.unitPrice * ln.qty;
          await prisma.quoteLine.create({ data: { quoteId: id, productId: ln.productId, qty: ln.qty, unitPrice: ln.unitPrice, lineTotal } });
          total += lineTotal;
        }
        await prisma.quote.update({ where: { id }, data: { total } });
      }
      return prisma.quote.findUnique({ where: { id }, include: { lines: { include: { product: true } } } });
    },

    simulateCalendarSync: async () => "Calendar sync OK (simulado)",
    simulateEmailSync: async () => "Email sync OK (simulado)",

    createWorkflow: async (_: any, { name, definition }: any) => {
      await prisma.workflow.create({ data: { name, definition } });
      return "Workflow creado";
    }
  }
};
