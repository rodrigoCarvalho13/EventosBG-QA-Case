import { useEffect, useState } from "react";

// Municípios de cada estado, vindos da API pública do IBGE (com cache no navegador).
const memoria = new Map();
const CHAVE = (uf) => `ebg:cidades:${uf}`;

function doCache(uf) {
  try {
    const salvo = JSON.parse(localStorage.getItem(CHAVE(uf)));
    return Array.isArray(salvo) && salvo.length ? salvo : null;
  } catch (e) {
    return null;
  }
}

export async function carregarCidades(uf) {
  if (memoria.has(uf)) return memoria.get(uf);
  const cache = doCache(uf);
  if (cache) {
    memoria.set(uf, cache);
    return cache;
  }
  const res = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios?orderBy=nome`);
  if (!res.ok) throw new Error("Falha ao carregar cidades");
  const lista = (await res.json()).map((m) => m.nome);
  memoria.set(uf, lista);
  try { localStorage.setItem(CHAVE(uf), JSON.stringify(lista)); } catch (e) {}
  return lista;
}

// Lista de cidades do estado; `null` enquanto carrega ou se a consulta falhar.
export function useCidades(uf) {
  const [lista, setLista] = useState(() => memoria.get(uf) || doCache(uf));
  useEffect(() => {
    let vivo = true;
    setLista(memoria.get(uf) || doCache(uf));
    carregarCidades(uf).then((l) => vivo && setLista(l)).catch(() => vivo && setLista(null));
    return () => { vivo = false; };
  }, [uf]);
  return lista;
}
