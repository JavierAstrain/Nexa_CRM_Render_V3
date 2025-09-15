import "dotenv/config";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { PrismaClient } from "@prisma/client";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { typeDefs } from "./schema.js";
import { resolvers } from "./resolvers.js";
import { authMiddleware, createToken } from "./auth.js";
import type { AppContext, AuthUser } from "./types.js";

const prisma = new PrismaClient();
const app = express();
import { execSync } from "child_process";
try {
  console.log("Running prisma migrate deploy...");
  execSync("pnpm prisma migrate deploy", { stdio: "inherit" });
  console.log("Migrations applied.");
} catch (e) {
  console.error("Prisma migrate failed:", e);
}
const corsOrigin = process.env.CORS_ORIGIN || "http://localhost:5173";
app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(bodyParser.json());
app.use(authMiddleware);

app.get("/health", (_req, res) => res.send("ok"));

// REST endpoint: Captura de Leads
app.post("/api/leads", async (req, res) => {
  try {
    const { firstName, lastName, email, phone, company, message } = req.body || {};
    const account = await prisma.account.upsert({
      where: { name: company || "Sin empresa" },
      update: {},
      create: { name: company || "Sin empresa" }
    });
    const contact = await prisma.contact.create({
      data: { firstName, lastName, email, phone, accountId: account.id, title: "Inbound Lead" }
    });
    const opp = await prisma.opportunity.create({
      data: { name: `Oportunidad de ${contact.firstName}`, stage: "PROSPECT", accountId: account.id, contactId: contact.id, probability: 10 }
    });
    await prisma.activity.create({
      data: { type: "NOTE", subject: "Nuevo lead web", notes: message || "s/n", opportunityId: opp.id, contactId: contact.id }
    });
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Lead capture failed" });
  }
});

// SSO (simulado) - rutas de ejemplo que retornan un JWT demo
app.get("/auth/demo", async (_req, res) => {
  const user = await prisma.user.findFirst();
  const token = createToken({ id: user!.id, email: user!.email, role: user!.role, viewFinancials: user!.viewFinancials });
  res.json({ token });
});

const server = new ApolloServer<AppContext>({ typeDefs, resolvers });
await server.start();
app.use(
  "/graphql",
  expressMiddleware(server, {
    context: async ({ req }) => {
      const user = (req as any).user as AuthUser | undefined;
      const permissions = [
        ...(user?.role === "ADMIN" ? ["*"] : []),
        ...(user?.viewFinancials ? ["viewFinancials"] : [])
      ];
      return { prisma, user, permissions };
    }
  })
);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Nexa backend running on :${PORT}`);
});
