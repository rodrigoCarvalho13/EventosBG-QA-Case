import { Users, UsersRound, FlaskConical, PencilRuler, Dices, MessageCircleQuestion } from "lucide-react";
import { whatsappLink } from "@/lib/eventoInfo";

// Canais dos classificados "Procuro".
export const CANAIS = [
  { value: "jogadores", label: "Gente para jogar", curto: "Jogar", icon: Users, exemplo: "Procuro 2 pessoas para jogar Gloomhaven às quintas", texto: "Falta gente para fechar a mesa de um jogo." },
  { value: "grupo", label: "Grupo ou mesa fixa", curto: "Grupo", icon: UsersRound, exemplo: "Procuro grupo de euro pesado aos sábados", texto: "Quer entrar num grupo que joga com frequência." },
  { value: "playtest", label: "Testadores de protótipo", curto: "Playtest", icon: FlaskConical, exemplo: "Procuro testadores para meu jogo de cartas cooperativo", texto: "Tem um jogo em desenvolvimento e precisa de quem teste." },
  { value: "criacao", label: "Parceria para criar jogo", curto: "Criar jogo", icon: PencilRuler, exemplo: "Procuro ilustrador(a) para um jogo de festa", texto: "Designer, ilustração, regras, revisão, editora." },
  { value: "jogo", label: "Um jogo (comprar, trocar, emprestar)", curto: "Um jogo", icon: Dices, exemplo: "Procuro Brass: Birmingham usado", texto: "Procura um título para comprar, trocar ou pegar emprestado." },
  { value: "outro", label: "Outro", curto: "Outro", icon: MessageCircleQuestion, exemplo: "Procuro lugar para fazer um campeonato", texto: "Qualquer outra coisa do mundo dos jogos." },
];
export const canal = (v) => CANAIS.find((c) => c.value === v) || CANAIS[CANAIS.length - 1];

export const MODALIDADES_PROCURA = [
  { value: "presencial", label: "Presencial" },
  { value: "online", label: "Online" },
  { value: "tanto_faz", label: "Presencial ou online" },
];
export const rotuloModalidadeProcura = (v) => MODALIDADES_PROCURA.find((m) => m.value === v)?.label || "";

export const CONTATOS = [
  { value: "instagram", label: "Instagram", placeholder: "@seuperfil" },
  { value: "whatsapp", label: "WhatsApp", placeholder: "(61) 99999-9999" },
  { value: "email", label: "E-mail", placeholder: "voce@email.com" },
  { value: "telegram", label: "Telegram", placeholder: "@seuusuario" },
  { value: "discord", label: "Discord", placeholder: "seuusuario" },
];

// Anúncio vale por 60 dias; depois some da lista (o autor pode renovar).
export const VALIDADE_DIAS = 60;
export const vencido = (p, ref = new Date()) =>
  !!p.created_date && ref - new Date(p.renovado_em || p.created_date) > VALIDADE_DIAS * 86400000;

export const procuraPath = (p) => `/procuro/${p.id}`;

// Link para responder ao anúncio. Discord não tem link direto: devolve null e o usuário é mostrado.
export function linkContato(p, mensagem) {
  const c = String(p.contato || "").trim();
  if (!c) return null;
  const msg = mensagem || `Oi! Vi seu anúncio "${p.titulo}" no eventosboardgame.com.`;
  switch (p.contato_tipo) {
    case "whatsapp": return whatsappLink(c, msg);
    case "instagram": return `https://instagram.com/${c.replace(/^@/, "").replace(/^https?:\/\/(www\.)?instagram\.com\//, "").split(/[/?]/)[0]}`;
    case "email": return `mailto:${c}?subject=${encodeURIComponent(p.titulo ? `Procuro: ${p.titulo}` : "Contato pelo eventosboardgame.com")}&body=${encodeURIComponent(msg)}`;
    case "telegram": return `https://t.me/${c.replace(/^@/, "").replace(/^https?:\/\/t\.me\//, "")}`;
    default: return null;
  }
}

export function quandoPostou(iso, ref = new Date()) {
  if (!iso) return "";
  const dias = Math.floor((ref - new Date(iso)) / 86400000);
  if (dias <= 0) return "hoje";
  if (dias === 1) return "ontem";
  if (dias < 30) return `há ${dias} dias`;
  const meses = Math.floor(dias / 30);
  return meses === 1 ? "há 1 mês" : `há ${meses} meses`;
}
