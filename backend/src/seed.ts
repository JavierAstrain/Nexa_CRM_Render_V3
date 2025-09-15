import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
const prisma = new PrismaClient();

async function main() {
  const adminEmail = "admin@nexa.dev";
  const pass = await bcrypt.hash("nexa1234", 10);
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: { email: adminEmail, password: pass, name: "Admin Nexa", role: "ADMIN", viewFinancials: true }
  });

  const acc = await prisma.account.create({ data: { name: "Fénix Automotriz", website: "https://www.fenixautomotriz.cl", ownerId: admin.id } });
  const c1 = await prisma.contact.create({ data: { firstName: "Javier", lastName: "Astrain", email: "javier@fenix.cl", accountId: acc.id, title: "Gerente" } });
  const c2 = await prisma.contact.create({ data: { firstName: "Marcelo", lastName: "Arismendi", email: "marcelo@fenix.cl", accountId: acc.id, title: "Marketing" } });

  const now = new Date();
  const dSoon = new Date(now.getTime() + 1000*3600*24*20);
  await prisma.opportunity.create({
    data: { name: "Implementación Bot IA", amount: 15000, probability: 60, stage: "PROPOSAL", closeDate: dSoon, accountId: acc.id, contactId: c1.id, ownerId: admin.id, score: 75 }
  });
  await prisma.opportunity.create({
    data: { name: "CRM Nexa Enterprise", amount: 45000, probability: 40, stage: "QUALIFIED", accountId: acc.id, contactId: c2.id, ownerId: admin.id, score: 55 }
  });

  const p1 = await prisma.product.create({ data: { name: "Nexa CRM Licencia", sku: "NEXA-CRM-001", basePrice: 1200 } });
  const p2 = await prisma.product.create({ data: { name: "Implementación Premium", sku: "SERV-IMP-PRM", basePrice: 8000 } });
  const list = await prisma.priceList.create({ data: { name: "Lista Base", currency: "USD" } });
  await prisma.priceListItem.create({ data: { priceListId: list.id, productId: p1.id, price: 1000 } });
  await prisma.priceListItem.create({ data: { priceListId: list.id, productId: p2.id, price: 7000 } });

  await prisma.workflow.create({
    data: { name: "Auto note on opp create", definition: { trigger: "opportunity.created", actions: [{ type:"ADD_NOTE_TO_OPP", params:{ subject:"Seguimiento automático", notes:"Generado por Workflow" } }] } as any }
  });

  await prisma.knowledgeDoc.createMany({
    data: [
      { title: "Onboarding CRM", content: "Pasos para adoptar Nexa en tu equipo.", tags: ["onboarding","crm"] },
      { title: "Playbook SDR", content: "Cadencias y guiones de llamadas.", tags: ["sdr","calls"] }
    ]
  });

  console.log("Seed OK");
}
main().catch(e => { console.error(e); process.exit(1); }).finally(()=> prisma.$disconnect());
