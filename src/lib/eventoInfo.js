// Rótulos dos campos de público, entrada e alimentação dos eventos.

export const PUBLICO = [
  { value: "misto", label: "Misto", hint: "Aberto a todas as pessoas" },
  { value: "mulheres", label: "Para mulheres" },
  { value: "homens", label: "Para homens" },
];

export const ENTRADA = [
  { value: "gratuito", label: "Gratuito" },
  { value: "pago", label: "Pago" },
];

export const ALIMENTACAO = [
  { value: "lanches", label: "Lanches à venda" },
  { value: "refeicoes", label: "Refeições à venda" },
  { value: "bebidas", label: "Bebidas à venda" },
  { value: "pode_levar", label: "Pode levar comida" },
  { value: "nao_tem", label: "Sem alimentação no local" },
];

const labelOf = (list, v) => list.find((o) => o.value === v)?.label;

export const publicoLabel = (v) => labelOf(PUBLICO, v);
export const alimentacaoLabel = (v) => labelOf(ALIMENTACAO, v);

// "24, 90", "R$ 24, 90" e "24.90" viram "R$ 24,90". Texto livre (ex. "15 a 30 com consumação") segue legível.
export function formatarPreco(valor) {
  if (valor == null) return "";
  const v = String(valor).trim().replace(/\s*([.,])\s*/g, "$1").replace(/\s+/g, " ");
  if (!v) return "";
  const semMoeda = v.replace(/^r\$\s*/i, "");
  if (/^\d/.test(semMoeda)) return `R$ ${semMoeda}`;
  return v;
}

// "Gratuito", "R$ 20" ou "Pago" (sem valor informado); null se não informado.
export function entradaTexto(evento) {
  if (evento?.entrada === "gratuito") return "Gratuito";
  if (evento?.entrada === "pago") {
    const v = String(evento.valor || "").trim();
    if (!v) return "Pago";
    return formatarPreco(v);
  }
  return null;
}

// Garante que uma URL tenha protocolo (http/https) para funcionar como link externo.
export function normalizeUrl(url) {
  let u = String(url || "").trim();
  if (!u) return null;
  u = u.replace(/^https?:\/\//i, "");
  return `https://${u}`;
}

// Link do WhatsApp a partir de um número brasileiro digitado de qualquer jeito.
export function whatsappLink(numero, mensagem) {
  let d = String(numero || "").replace(/\D/g, "");
  if (!d) return null;
  if (d.length <= 11) d = "55" + d; // sem DDI: assume Brasil
  const texto = mensagem ? `?text=${encodeURIComponent(mensagem)}` : "";
  return `https://wa.me/${d}${texto}`;
}
// Quebra o texto de contato em pedaços, trocando cada link por { href, label }:
// links do WhatsApp viram "WhatsApp" e os demais, "Abrir link".
export function partesContato(texto) {
  if (!texto) return [];
  return texto.split(/((?:https?:\/\/|www\.|wa\.me\/|chat\.whatsapp\.com\/)\S+)/i).filter(Boolean).map((p) => {
    if (!/^(https?:\/\/|www\.|wa\.me\/|chat\.whatsapp\.com\/)/i.test(p)) return p;
    const href = /^https?:\/\//i.test(p) ? p : `https://${p}`;
    const whats = /(wa\.me|whatsapp\.com)/i.test(p);
    return { href, label: whats ? "WhatsApp" : "Abrir link", whats };
  });
}
