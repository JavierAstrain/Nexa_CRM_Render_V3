import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Ejecuta acciones simples cuando hay cambios (simulación)
export async function runWorkflows(trigger: string, payload: any) {
  const flows = await prisma.workflow.findMany({ where: { active: true } });
  for (const f of flows) {
    try {
      const def = f.definition as any;
      if (def.trigger === trigger) {
        for (const a of def.actions || []) {
          if (a.type === "ADD_NOTE_TO_OPP" && payload.opportunityId) {
            await prisma.activity.create({
              data: {
                type: "NOTE",
                subject: a.params?.subject ?? "Auto note",
                notes: a.params?.notes ?? "Workflow note",
                opportunityId: payload.opportunityId
              }
            });
          }
          if (a.type === "SET_STAGE" && payload.opportunityId && a.params?.stage) {
            await prisma.opportunity.update({
              where: { id: payload.opportunityId },
              data: { stage: a.params.stage }
            });
          }
        }
      }
    } catch (e) {
      console.error("Workflow execution error", e);
    }
  }
}
