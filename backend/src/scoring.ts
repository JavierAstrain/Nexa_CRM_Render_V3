// Regla simple de Lead/Deal Scoring (0-100)
// +20 si amount >= 10000, +15 si stage >= PROPOSAL, +15 si probability >= 50
// +10 si closeDate dentro de 30 días, +10 si owner asignado, +10 si tiene contacto
// +20 si cuenta existe
export function computeOpportunityScore(o: {
  amount?: number | null;
  stage?: string | null;
  probability?: number | null;
  closeDate?: Date | null;
  accountId?: string | null;
  ownerId?: string | null;
  contactId?: string | null;
}) {
  let score = 0;
  if ((o.amount ?? 0) >= 10000) score += 20;
  const stages = ["PROSPECT","QUALIFIED","PROPOSAL","NEGOTIATION","WON","LOST"];
  if (o.stage && stages.indexOf(o.stage) >= 2) score += 15;
  if ((o.probability ?? 0) >= 50) score += 15;
  if (o.closeDate) {
    const days = (o.closeDate.getTime() - Date.now()) / (1000*3600*24);
    if (days <= 30) score += 10;
  }
  if (o.ownerId) score += 10;
  if (o.contactId) score += 10;
  if (o.accountId) score += 20;
  return Math.max(0, Math.min(100, score));
}
