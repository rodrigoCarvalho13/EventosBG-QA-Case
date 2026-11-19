import { base44 } from "@/api/base44Client";

// ids das lojas marcadas como parceiras pelo admin.
export async function fetchParceriaIds() {
  try {
    const page = await base44.entities.Parceria.filter({}, { limit: 500, fields: ["loja_id"] });
    return new Set((page.items || []).map((p) => p.loja_id));
  } catch (e) {
    return new Set();
  }
}

// Parceiras primeiro, mantendo a ordem original dentro de cada grupo.
export function parceirasPrimeiro(lojas, ids) {
  return [...lojas.filter((l) => ids.has(l.id)), ...lojas.filter((l) => !ids.has(l.id))];
}
