import React from "react";
import { Megaphone, Search, MessageCircle, ShieldCheck } from "lucide-react";

const PASSOS = [
  { icon: Megaphone, titulo: "1. Anuncie o que procura", texto: "Escolha o canal, diga o jogo, a cidade (ou se é online) e como falar com você. É grátis." },
  { icon: Search, titulo: "2. Quem se interessa te acha", texto: "O anúncio aparece aqui, na busca do site e para quem filtra pela sua cidade." },
  { icon: MessageCircle, titulo: "3. A conversa é direta", texto: "A pessoa fala com você pelo contato que escolheu. Achou? Marque como encerrado." },
];

const DICAS = [
  "Prefira Instagram, Telegram ou e-mail como contato: ele fica público no anúncio.",
  "Primeiro encontro? Combine num espaço de jogos, café ou loja, não em casa.",
  "Em compra e troca, veja o jogo antes de pagar e desconfie de preço bom demais.",
  "Protótipo em teste: deixe claro se precisa de termo de confidencialidade.",
];

// Instruções dos classificados: como funciona e dicas de segurança.
export default function ComoFuncionaProcuro() {
  return (
    <section aria-labelledby="como-funciona" className="rounded-3xl bg-muted/50 border border-border p-5 sm:p-8">
      <h2 id="como-funciona" className="font-display font-700 text-2xl">Como funciona</h2>
      <ol className="mt-5 grid gap-4 md:grid-cols-3">
        {PASSOS.map(({ icon: Icon, titulo, texto }) => (
          <li key={titulo} className="rounded-2xl bg-card border border-border p-4">
            <Icon className="w-5 h-5 text-accent-ink" aria-hidden="true" />
            <p className="mt-2 font-700">{titulo}</p>
            <p className="mt-1 text-sm text-muted-foreground">{texto}</p>
          </li>
        ))}
      </ol>
      <h3 className="mt-6 font-display font-700 text-lg flex items-center gap-2">
        <ShieldCheck className="w-5 h-5 text-primary" aria-hidden="true" /> Dicas de segurança
      </h3>
      <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground list-disc pl-5">
        {DICAS.map((d) => <li key={d}>{d}</li>)}
      </ul>
      <p className="mt-4 text-xs text-muted-foreground">
        Os anúncios ficam no ar por 60 dias. Anúncio fora do tema, venda que não seja de jogos ou conteúdo ofensivo é removido.
      </p>
    </section>
  );
}
