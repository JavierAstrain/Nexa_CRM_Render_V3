// Simulaciones de integraciones
export async function simulateCalendarSync(): Promise<string> {
  await new Promise(r => setTimeout(r, 150));
  return "Calendar sync OK (simulado)";
}
export async function simulateEmailSync(): Promise<string> {
  await new Promise(r => setTimeout(r, 120));
  return "Email sync OK (simulado)";
}
