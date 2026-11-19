import { base44 } from "@/api/base44Client";
import { diaISO } from "@/lib/presencas";

// Eventos em destaque (plano Destaque, marcado pelo admin) que ainda valem hoje.
export async function fetchDestaqueEventoIds() {
  try {
    const page = await base44.entities.DestaqueEvento.filter({ ate: { $gte: diaISO(new Date()) } }, { limit: 500, fields: ["evento_id"] });
    return new Set((page.items || []).map((d) => d.evento_id));
  } catch (e) {
    return new Set();
  }
}

// Marca os destacados com _destaque, sem mudar a ordem.
export const marcarDestaques = (eventos, ids) =>
  ids.size === 0 ? eventos : eventos.map((e) => (ids.has(e.id) ? { ...e, _destaque: true } : e));

// Destacados primeiro, mantendo a ordem dentro de cada grupo.
export const destacadosPrimeiro = (eventos) => [...eventos.filter((e) => e._destaque), ...eventos.filter((e) => !e._destaque)];
