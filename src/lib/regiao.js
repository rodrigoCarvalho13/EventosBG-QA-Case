import { useSyncExternalStore } from "react";

// Todos os estados do Brasil. Dados antigos (sem `estado`) pertencem ao DF.
export const ESTADOS = [
  { sigla: "AC", nome: "Acre", cidadePadrao: "Rio Branco", rotulo: "Acre · AC", em: "no Acre" },
  { sigla: "AL", nome: "Alagoas", cidadePadrao: "Maceió", rotulo: "Alagoas · AL", em: "em Alagoas" },
  { sigla: "AP", nome: "Amapá", cidadePadrao: "Macapá", rotulo: "Amapá · AP", em: "no Amapá" },
  { sigla: "AM", nome: "Amazonas", cidadePadrao: "Manaus", rotulo: "Amazonas · AM", em: "no Amazonas" },
  { sigla: "BA", nome: "Bahia", cidadePadrao: "Salvador", rotulo: "Bahia · BA", em: "na Bahia" },
  { sigla: "CE", nome: "Ceará", cidadePadrao: "Fortaleza", rotulo: "Ceará · CE", em: "no Ceará" },
  { sigla: "DF", nome: "Distrito Federal", cidadePadrao: "Brasília", rotulo: "Brasília · DF", em: "em Brasília" },
  { sigla: "ES", nome: "Espírito Santo", cidadePadrao: "Vitória", rotulo: "Espírito Santo · ES", em: "no Espírito Santo" },
  { sigla: "GO", nome: "Goiás", cidadePadrao: "Goiânia", rotulo: "Goiás · GO", em: "em Goiás" },
  { sigla: "MA", nome: "Maranhão", cidadePadrao: "São Luís", rotulo: "Maranhão · MA", em: "no Maranhão" },
  { sigla: "MT", nome: "Mato Grosso", cidadePadrao: "Cuiabá", rotulo: "Mato Grosso · MT", em: "em Mato Grosso" },
  { sigla: "MS", nome: "Mato Grosso do Sul", cidadePadrao: "Campo Grande", rotulo: "Mato Grosso do Sul · MS", em: "em Mato Grosso do Sul" },
  { sigla: "MG", nome: "Minas Gerais", cidadePadrao: "Belo Horizonte", rotulo: "Minas Gerais · MG", em: "em Minas Gerais" },
  { sigla: "PA", nome: "Pará", cidadePadrao: "Belém", rotulo: "Pará · PA", em: "no Pará" },
  { sigla: "PB", nome: "Paraíba", cidadePadrao: "João Pessoa", rotulo: "Paraíba · PB", em: "na Paraíba" },
  { sigla: "PR", nome: "Paraná", cidadePadrao: "Curitiba", rotulo: "Paraná · PR", em: "no Paraná" },
  { sigla: "PE", nome: "Pernambuco", cidadePadrao: "Recife", rotulo: "Pernambuco · PE", em: "em Pernambuco" },
  { sigla: "PI", nome: "Piauí", cidadePadrao: "Teresina", rotulo: "Piauí · PI", em: "no Piauí" },
  { sigla: "RJ", nome: "Rio de Janeiro", cidadePadrao: "Rio de Janeiro", rotulo: "Rio de Janeiro · RJ", em: "no Rio de Janeiro" },
  { sigla: "RN", nome: "Rio Grande do Norte", cidadePadrao: "Natal", rotulo: "Rio Grande do Norte · RN", em: "no Rio Grande do Norte" },
  { sigla: "RS", nome: "Rio Grande do Sul", cidadePadrao: "Porto Alegre", rotulo: "Rio Grande do Sul · RS", em: "no Rio Grande do Sul" },
  { sigla: "RO", nome: "Rondônia", cidadePadrao: "Porto Velho", rotulo: "Rondônia · RO", em: "em Rondônia" },
  { sigla: "RR", nome: "Roraima", cidadePadrao: "Boa Vista", rotulo: "Roraima · RR", em: "em Roraima" },
  { sigla: "SC", nome: "Santa Catarina", cidadePadrao: "Florianópolis", rotulo: "Santa Catarina · SC", em: "em Santa Catarina" },
  { sigla: "SP", nome: "São Paulo", cidadePadrao: "São Paulo", rotulo: "São Paulo · SP", em: "em São Paulo" },
  { sigla: "SE", nome: "Sergipe", cidadePadrao: "Aracaju", rotulo: "Sergipe · SE", em: "em Sergipe" },
  { sigla: "TO", nome: "Tocantins", cidadePadrao: "Palmas", rotulo: "Tocantins · TO", em: "no Tocantins" },
];
export const ESTADO_PADRAO = "DF";
const CHAVE = "ebg:estado";

export const getEstadoInfo = (sigla) => ESTADOS.find((e) => e.sigla === sigla) || ESTADOS[0];
export const estadoDe = (item) => item?.estado || ESTADO_PADRAO;
export const cidadeDe = (item) => item?.cidade || getEstadoInfo(estadoDe(item)).cidadePadrao;

let atual = ESTADO_PADRAO;
try {
  const salvo = localStorage.getItem(CHAVE);
  if (ESTADOS.some((e) => e.sigla === salvo)) atual = salvo;
} catch (e) {}
const ouvintes = new Set();

export const getEstadoAtual = () => atual;

export function setEstado(sigla) {
  if (!ESTADOS.some((e) => e.sigla === sigla) || sigla === atual) return;
  atual = sigla;
  try { localStorage.setItem(CHAVE, sigla); } catch (e) {}
  ouvintes.forEach((fn) => fn());
}

const assinar = (fn) => { ouvintes.add(fn); return () => ouvintes.delete(fn); };

export function useEstado() {
  const sigla = useSyncExternalStore(assinar, () => atual, () => ESTADO_PADRAO);
  return { sigla, info: getEstadoInfo(sigla), setEstado };
}

// Filtro de consulta no servidor: no DF inclui também os cadastros antigos, sem estado.
export function filtroEstado(sigla) {
  return sigla === ESTADO_PADRAO
    ? { $or: [{ estado: ESTADO_PADRAO }, { estado: { $exists: false } }, { estado: "" }] }
    : { estado: sigla };
}

// Cidades presentes nos itens, para o filtro de cidade.
export const cidadesDe = (items) =>
  [...new Set(items.map(cidadeDe).filter(Boolean))].sort((a, b) => a.localeCompare(b, "pt-BR"));
