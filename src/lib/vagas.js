export const CONTRATACOES = [
  { value: "clt", label: "CLT" },
  { value: "pj", label: "PJ" },
  { value: "estagio", label: "Estágio" },
  { value: "temporario", label: "Temporário" },
  { value: "freelancer", label: "Freelancer" },
  { value: "voluntario", label: "Voluntário" },
];

export const MODALIDADES = [
  { value: "presencial", label: "Presencial" },
  { value: "hibrido", label: "Híbrido" },
  { value: "remoto", label: "Remoto" },
];

export const rotuloContratacao = (v) => CONTRATACOES.find((c) => c.value === v)?.label || "";
export const rotuloModalidade = (v) => MODALIDADES.find((m) => m.value === v)?.label || "";

export const vagaPath = (v) => `/vagas/${v.id}`;

// Abre o e-mail já endereçado à loja, com o cargo no assunto.
export function mailtoCurriculo(vaga) {
  const assunto = `Currículo: ${vaga.titulo}`;
  const corpo = `Olá! Vi a vaga de ${vaga.titulo} em eventosboardgame.com e gostaria de me candidatar. Segue meu currículo em anexo.`;
  return `mailto:${vaga.email_curriculo}?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`;
}

// Link da página de vagas já filtrado, para compartilhar: /vagas?estado=SP&cidade=Campinas
export function vagasLink(estado, cidade) {
  const params = new URLSearchParams();
  if (estado) params.set("estado", estado);
  if (cidade) params.set("cidade", cidade);
  const q = params.toString();
  return q ? `/vagas?${q}` : "/vagas";
}
