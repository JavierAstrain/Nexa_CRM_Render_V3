import fs from "fs";
import path from "path";

type Doc = { title: string; content: string; tags: string[] };

export function ragSearch(query: string): { answer: string; context: string[] } {
  const dataPath = path.join(process.cwd(), "src", "data", "knowledge.json");
  let docs: Doc[] = [];
  try {
    const raw = fs.readFileSync(dataPath, "utf-8");
    docs = JSON.parse(raw);
  } catch {
    docs = [];
  }
  const q = query.toLowerCase();
  const scored = docs.map(d => ({
    doc: d,
    score:
      (d.title.toLowerCase().includes(q) ? 2 : 0) +
      d.tags.reduce((acc, t) => acc + (q.includes(t.toLowerCase()) ? 1 : 0), 0) +
      (d.content.toLowerCase().split(q).length - 1)
  }));
  scored.sort((a, b) => b.score - a.score);
  const top = scored.slice(0, 3).filter(s => s.score > 0).map(s => s.doc);
  const context = top.map(t => `${t.title}: ${t.content.slice(0, 200)}...`);
  const answer = top.length
    ? `Basado en el conocimiento: ${top.map(t => t.title).join(", ")}. Respuesta: ${generateAnswer(query, top)}`
    : "No encontré contexto relevante. Respuesta simulada: prueba re-formular tu pregunta o agrega más detalles.";
  return { answer, context };
}

function generateAnswer(query: string, _docs: Doc[]) {
  // Simulación muy básica
  return `Para "${query}", recomendamos priorizar cuentas con mayor valor potencial y programar follow-ups en 48h.`;
}
