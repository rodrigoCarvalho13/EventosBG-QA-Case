import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import Layout from "@/components/Layout";
import {
  CalendarDays,
  Coffee,
  ShoppingBag,
  ArrowRight,
  Lightbulb,
  CheckCircle2,
  UserRound,
  Users,
  BookOpen,
  GraduationCap,
  Megaphone,
  FlaskConical,
} from "lucide-react";

// Página única de "quero divulgar": a pessoa escolhe o que quer cadastrar
// e cai direto no formulário certo (passando pelo login quando precisa).
const opcoes = [
  {
    id: "evento",
    icon: CalendarDays,
    title: "Um evento",
    text: "Mesa semanal, campeonato, feira, acampamento, lançamento ou maratona de jogos.",
    to: "/painel/eventos/novo",
    cta: "Cadastrar evento",
  },
  {
    id: "luderia",
    icon: Coffee,
    title: "Meu espaço de jogos ou café",
    text: "Lugar com acervo para jogar: espaço de jogos, café ou bar.",
    to: "/painel/lojas/nova?tipo=luderia",
    cta: "Cadastrar espaço",
  },
  {
    id: "loja",
    icon: ShoppingBag,
    title: "Minha loja",
    text: "Loja que vende ou aluga jogos de tabuleiro em Brasília.",
    to: "/painel/lojas/nova?tipo=loja",
    cta: "Cadastrar loja",
  },
  {
    id: "organizador",
    icon: Users,
    title: "Meu grupo",
    text: "Organiza eventos (encontros, acampamentos, campeonatos), mas não tem loja nem espaço próprio. Depois, cadastre cada evento do grupo.",
    to: "/painel/lojas/nova?tipo=organizador",
    cta: "Cadastrar meu grupo",
  },
  {
    id: "editora",
    icon: BookOpen,
    title: "Minha editora",
    text: "Publica jogos (inclusive print and play). Tenha uma página com todas as informações e os produtos que estão à venda.",
    to: "/painel/lojas/nova?tipo=editora",
    cta: "Cadastrar editora",
  },
  {
    id: "monitor",
    icon: GraduationCap,
    title: "Sou monitor de jogos",
    text: "Ensina ou conduz partidas. Informe o valor mínimo por hora e os bairros que atende.",
    to: "/painel/monitor",
    cta: "Criar meu perfil",
  },
  {
    id: "procuro",
    icon: Megaphone,
    title: "Procuro alguém ou algo",
    text: "Gente para jogar, um grupo, testadores do seu protótipo, parceria para criar um jogo ou aquele jogo esgotado.",
    to: "/painel/procuro/novo",
    cta: "Anunciar o que procuro",
  },
  {
    id: "testador",
    icon: FlaskConical,
    title: "Sou testador de jogos",
    text: "Testa protótipos de outras pessoas. Conte os jogos que já testou e os tipos de que mais gosta.",
    to: "/painel/testador",
    cta: "Criar meu perfil",
  },
];

const passos = [
  { title: "Escolha o que divulgar", text: "Evento, espaço, loja, grupo, editora, monitor, testador ou um anúncio Procuro." },
  { title: "Entre com sua conta", text: "Google ou e-mail, leva um minuto." },
  { title: "Preencha e publique", text: "Aparece no site na hora e você edita quando quiser." },
];

export default function Cadastrar() {
  const { isAuthenticated } = useAuth();
  const destino = (to) => (isAuthenticated ? to : `/login?returnTo=${encodeURIComponent(to)}`);

  return (
    <Layout>
      <section className="bg-board text-white">
        <div className="max-w-5xl mx-auto px-4 py-12 sm:py-16">
          <p className="text-xs font-700 uppercase tracking-[0.2em] text-accent mb-3">Divulgue grátis</p>
          <h1 className="font-display font-900 text-4xl sm:text-5xl tracking-tight text-balance">
            O que você quer cadastrar?
          </h1>
          <p className="mt-4 text-lg text-white/75 max-w-2xl">
            Coloque seu evento, espaço de jogos ou loja na agenda de board games de Brasília e
            seja encontrado por quem quer jogar.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 -mt-8 sm:-mt-10">
        <div className="grid sm:grid-cols-2 gap-4">
          {opcoes.map(({ id, icon: Icon, title, text, to, cta }) => (
            <Link
              key={id}
              to={destino(to)}
              className="group flex flex-col rounded-2xl bg-card border border-border p-6 card-shadow hover:-translate-y-0.5 hover:border-accent transition-all"
            >
              <span className="grid place-items-center w-12 h-12 rounded-xl bg-accent/15 text-accent-ink mb-4">
                <Icon className="w-6 h-6" aria-hidden="true" />
              </span>
              <span className="font-display font-700 text-xl">{title}</span>
              <span className="mt-1.5 text-sm text-muted-foreground flex-1">{text}</span>
              <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-600 text-primary dark:text-accent">
                {cta}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-5 rounded-2xl bg-muted/50 border border-border p-5 text-sm">
          <p className="font-600 mb-1">Na dúvida entre evento e grupo?</p>
          <p className="text-muted-foreground">
            O <strong className="text-foreground">evento</strong> é o que acontece numa data ou toda semana, como um
            acampamento, um campeonato ou uma mesa fixa. O <strong className="text-foreground">grupo</strong> é quem organiza
            esses eventos e não tem loja nem espaço próprio. Exemplo: o grupo cadastra a si mesmo uma vez e depois
            cadastra cada acampamento como evento.
          </p>
        </div>

        <div className="mt-5 flex flex-col sm:flex-row sm:items-center gap-3 rounded-2xl border border-dashed border-border bg-muted/40 p-5">
          <Lightbulb className="w-6 h-6 text-accent-ink shrink-0" aria-hidden="true" />
          <p className="text-sm text-muted-foreground flex-1">
            <span className="font-600 text-foreground">Sabe de um evento que não está aqui?</span>{" "}
            Cadastre sem precisar de conta.
          </p>
          <Link to="/sugerir" className="inline-flex items-center gap-1.5 py-2 text-sm font-600 text-primary dark:text-accent hover:underline shrink-0">
            Cadastrar evento <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>

        <section className="mt-14 mb-4">
          <h2 className="font-display font-700 text-2xl mb-6">Como funciona</h2>
          <ol className="grid sm:grid-cols-3 gap-4">
            {passos.map((p, i) => (
              <li key={p.title} className="flex gap-3">
                <span className="grid place-items-center w-9 h-9 shrink-0 rounded-full bg-primary text-primary-foreground font-display font-700">
                  {i + 1}
                </span>
                <span>
                  <span className="block font-600">{p.title}</span>
                  <span className="text-sm text-muted-foreground">{p.text}</span>
                </span>
              </li>
            ))}
          </ol>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-accent-ink" aria-hidden="true" /> Gratuito
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-accent-ink" aria-hidden="true" /> Inscrições e vagas para eventos
            </span>
            {isAuthenticated && (
              <Link to="/painel" className="inline-flex items-center gap-1.5 font-600 text-primary dark:text-accent hover:underline">
                <UserRound className="w-4 h-4" aria-hidden="true" /> Ver o que já cadastrei
              </Link>
            )}
          </div>
        </section>
      </div>
    </Layout>
  );
}
