// Curtidas dos cards. Cada card pede a contagem do próprio item; os pedidos feitos no mesmo
// instante viram uma consulta só por tipo, para a home não disparar uma requisição por card.
// Monitores seguem na entidade CurtidaMonitor (a mesma do botão da página do monitor).
import { base44 } from "@/api/base44Client";
import { listarTudo } from "../../base44/shared/paginar.js";

const ESPERA_MS = 40;
const LOTE = 40;

const estado = new Map(); // "tipo:id" -> { total, meu } (meu = id da minha curtida ou null)
const ouvintes = new Map(); // "tipo:id" -> Set<fn>
const pendentes = new Map(); // tipo -> Set<id>
let usuarioDoCache = null;
let agendado = null;

const chave = (tipo, id) => `${tipo}:${id}`;
const avisar = (k) => ouvintes.get(k)?.forEach((fn) => fn());

const alvo = (tipo) =>
  tipo === "monitor"
    ? { entidade: base44.entities.CurtidaMonitor, campo: "monitor_id", extra: {} }
    : { entidade: base44.entities.Curtida, campo: "item_id", extra: { tipo } };

async function buscarLote(tipo, ids, userId) {
  const { entidade, campo, extra } = alvo(tipo);
  const linhas = await listarTudo(entidade, { ...extra, [campo]: { $in: ids } }, { limit: 1000, maxPaginas: 5 });
  const por = new Map(ids.map((id) => [id, { total: 0, meu: null }]));
  for (const l of linhas) {
    const e = por.get(l[campo]);
    if (!e) continue;
    e.total += 1;
    if (userId && l.created_by_id === userId) e.meu = l.id;
  }
  for (const [id, e] of por) {
    estado.set(chave(tipo, id), e);
    avisar(chave(tipo, id));
  }
}

async function descarregar(userId) {
  agendado = null;
  const lotes = [...pendentes.entries()];
  pendentes.clear();
  await Promise.all(
    lotes.flatMap(([tipo, ids]) => {
      const lista = [...ids];
      const partes = [];
      for (let i = 0; i < lista.length; i += LOTE) partes.push(lista.slice(i, i + LOTE));
      return partes.map((p) =>
        buscarLote(tipo, p, userId).catch(() => {
          // sem contagem: o card continua usável
          for (const id of p) estado.set(chave(tipo, id), { total: 0, meu: null, falhou: true });
          for (const id of p) avisar(chave(tipo, id));
        })
      );
    })
  );
}

export function pedirCurtidas(tipo, id, userId) {
  if (usuarioDoCache !== (userId || null)) {
    // Entrou ou saiu alguém: o "curti" de cada item precisa ser lido de novo.
    usuarioDoCache = userId || null;
    estado.clear();
  }
  const k = chave(tipo, id);
  if (estado.has(k)) return;
  if (!pendentes.has(tipo)) pendentes.set(tipo, new Set());
  pendentes.get(tipo).add(String(id));
  if (!agendado) agendado = setTimeout(() => descarregar(userId), ESPERA_MS);
}

export const lerCurtidas = (tipo, id) => estado.get(chave(tipo, id)) || null;

export function assinarCurtidas(tipo, id, fn) {
  const k = chave(tipo, id);
  if (!ouvintes.has(k)) ouvintes.set(k, new Set());
  ouvintes.get(k).add(fn);
  return () => ouvintes.get(k)?.delete(fn);
}

// Curte ou descurte; devolve o estado novo.
export async function alternarCurtida(tipo, id) {
  const k = chave(tipo, id);
  const atual = estado.get(k) || { total: 0, meu: null };
  const { entidade, campo, extra } = alvo(tipo);
  if (atual.meu) {
    await entidade.delete(atual.meu);
    estado.set(k, { total: Math.max(0, atual.total - 1), meu: null });
  } else {
    const nova = await entidade.create({ ...extra, [campo]: String(id) });
    estado.set(k, { total: atual.total + 1, meu: nova.id });
  }
  avisar(k);
  return estado.get(k);
}
