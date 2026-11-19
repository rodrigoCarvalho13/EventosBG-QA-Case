// "Vou!": cada pessoa marca presença numa ocorrência do evento (o dia, para os encontros fixos).
import { proximaOcorrencia } from "@/lib/eventStatus";

const pad = (n) => String(n).padStart(2, "0");
export const diaISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

// Dia que o "Vou!" marca: a próxima ocorrência, ou null quando o evento já passou.
export function diaDaPresenca(evento, ref = new Date()) {
  const d = proximaOcorrencia(evento, ref);
  return d ? diaISO(d) : null;
}

const DIAS = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];

// Como falar do dia: { para: "para sexta, 30/10", em: "na sexta, 30/10" }, ou "hoje"/"amanhã".
export function rotuloDia(iso, ref = new Date()) {
  const d = new Date(`${iso}T00:00:00`);
  const hoje = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate());
  const dif = Math.round((d - hoje) / 86400000);
  if (dif === 0) return { para: "para hoje", em: "hoje" };
  if (dif === 1) return { para: "para amanhã", em: "amanhã" };
  const nome = `${DIAS[d.getDay()]}, ${pad(d.getDate())}/${pad(d.getMonth() + 1)}`;
  const artigo = d.getDay() === 0 || d.getDay() === 6 ? "no" : "na";
  return { para: `para ${artigo === "no" ? "o" : "a"} ${nome}`, em: `${artigo} ${nome}` };
}
