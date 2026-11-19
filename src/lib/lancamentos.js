export const TIPOS_LANCAMENTO = [
  { value: "prevenda", label: "Pré-venda", acao: "Ver pré-venda" },
  { value: "financiamento", label: "Financiamento coletivo", acao: "Apoiar a campanha" },
  { value: "lancamento", label: "Lançamento", acao: "Onde comprar" },
];

export const tipoLancamento = (v) => TIPOS_LANCAMENTO.find((t) => t.value === v) || TIPOS_LANCAMENTO[0];

const pad = (n) => String(n).padStart(2, "0");
const hojeISO = (ref = new Date()) => `${ref.getFullYear()}-${pad(ref.getMonth() + 1)}-${pad(ref.getDate())}`;

// "aberto" (rolando agora), "em_breve" (ainda vai começar) ou "encerrado".
export function situacao(l, ref = new Date()) {
  const hoje = hojeISO(ref);
  if (l.data_inicio > hoje) return "em_breve";
  // Lançamento sem data de fim fica "aberto" por 30 dias depois de sair.
  const fim = l.data_fim || somarDias(l.data_inicio, l.tipo === "lancamento" ? 30 : 0);
  return fim >= hoje ? "aberto" : "encerrado";
}

function somarDias(iso, dias) {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + dias);
  return hojeISO(d);
}

export function dataCurta(iso) {
  if (!iso) return "";
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }).replace(".", "");
}

export function mesAno(iso) {
  const d = new Date(`${iso}T00:00:00`);
  const s = d.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function periodo(l) {
  if (!l.data_fim || l.data_fim === l.data_inicio) return dataCurta(l.data_inicio);
  return `${dataCurta(l.data_inicio)} a ${dataCurta(l.data_fim)}`;
}

// Abertos primeiro (o que acaba antes no topo), depois os próximos, por fim os encerrados.
export function ordenarLancamentos(lista, ref = new Date()) {
  const peso = { aberto: 0, em_breve: 1, encerrado: 2 };
  return [...lista].sort((a, b) => {
    const sa = situacao(a, ref);
    const sb = situacao(b, ref);
    if (sa !== sb) return peso[sa] - peso[sb];
    if (sa === "aberto") return (a.data_fim || "9999").localeCompare(b.data_fim || "9999");
    if (sa === "encerrado") return b.data_inicio.localeCompare(a.data_inicio);
    return a.data_inicio.localeCompare(b.data_inicio);
  });
}
