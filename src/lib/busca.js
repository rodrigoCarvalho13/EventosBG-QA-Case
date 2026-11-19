// Busca sem acento e sem diferença de maiúsculas; todas as palavras digitadas precisam aparecer.
export const normalizar = (s) =>
  String(s ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

// Junta só texto: strings e listas de strings (objetos são ignorados).
export function textoDe(...valores) {
  const partes = [];
  const juntar = (v) => {
    if (typeof v === "string" || typeof v === "number") partes.push(String(v));
    else if (Array.isArray(v)) v.forEach(juntar);
  };
  valores.forEach(juntar);
  return partes.join(" ");
}

export function casa(termo, ...valores) {
  const t = normalizar(termo);
  if (!t) return true;
  const palheiro = normalizar(textoDe(...valores));
  return t.split(/\s+/).every((p) => palheiro.includes(p));
}

export const EVENTO_ABRIR_BUSCA = "abrir-busca";
export const abrirBusca = () => window.dispatchEvent(new Event(EVENTO_ABRIR_BUSCA));
