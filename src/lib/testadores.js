// Área de testadores: pessoas que testam protótipos de jogos.
export const TIPOS_JOGO = [
  "Cartas", "Cooperativo", "Eurogame", "Família", "Festa", "Estratégia pesada", "Filler",
  "Dedução social", "Narrativo", "Wargame", "RPG", "Legacy", "Solo", "Infantil", "Dados", "Abstrato",
];

export const EXPERIENCIAS = [
  { value: "iniciante", label: "Iniciante", texto: "Testei poucos ou nenhum protótipo" },
  { value: "intermediario", label: "Intermediário", texto: "Já participei de várias sessões" },
  { value: "experiente", label: "Experiente", texto: "Testo com frequência e dou retorno detalhado" },
];
export const rotuloExperiencia = (v) => EXPERIENCIAS.find((e) => e.value === v)?.label || "";

export const testadorPath = (t) => `/testadores/${t.id}`;

export const MENSAGEM_CONTATO = "Oi! Vi seu perfil de testador no eventosboardgame.com.";
