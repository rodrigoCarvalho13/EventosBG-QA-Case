import { base44 } from "@/api/base44Client";

export async function invocar(nome, payload) {
  try {
    const res = await base44.functions.invoke(nome, payload || {});
    const data = res?.data ?? res ?? {};
    if (data?.error) {
      const err = new Error(Array.isArray(data.erros) && data.erros.length ? data.erros.join(" ") : data.error);
      err.erros = data.erros;
      throw err;
    }
    return data;
  } catch (err) {
    if (err?.erros) throw err;
    const data = err?.data || err?.response?.data;
    if (data?.error || data?.erros) {
      const erros = Array.isArray(data.erros) ? data.erros : undefined;
      const message = erros?.join(" ") || (typeof data.error === "string" ? data.error : err?.message) || "Algo deu errado. Tente novamente.";
      const wrapped = new Error(message);
      wrapped.erros = erros;
      throw wrapped;
    }
    throw err;
  }
}
