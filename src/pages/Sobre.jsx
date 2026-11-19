import React, { useState } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import PlataformaIcon from "@/components/PlataformaIcon";
import SuporteForm from "@/components/SuporteForm";
import {
  CalendarDays,
  Repeat,
  Store,
  Clapperboard,
  Lightbulb,
  Mail,
  Linkedin,
  ArrowRight,
  Dice5,
  GraduationCap,
} from "lucide-react";

const PILARES = [
  {
    icon: Repeat,
    titulo: "Encontros semanais",
    texto:
      "Toda semana tem mesa montada em algum canto do DF. Reunimos os encontros fixos — com dia, horário e local — para você saber onde jogar hoje, amanhã ou no sábado. Muitos são abertos: é só aparecer.",
    to: "/eventos",
    link: "Ver a programação",
  },
  {
    icon: CalendarDays,
    titulo: "Eventos especiais",
    texto:
      "Campeonatos, feiras, acampamentos e lançamentos com data marcada. Quando tem inscrição, você confirma presença aqui mesmo ou pelo link do organizador.",
    to: "/eventos",
    link: "Ver os eventos",
  },
  {
    icon: Store,
    titulo: "As casas de jogos",
    texto:
      "Luderias, cafés, bares e lojas especializadas de Brasília, com endereço, mapa, contato e a agenda de cada espaço. Siga as suas favoritas e receba aviso quando publicarem um evento novo.",
    to: "/lojas",
    link: "Conhecer os espaços",
  },
  {
    icon: Clapperboard,
    titulo: "Os influenciadores",
    texto:
      "Quem faz conteúdo de board game no DF tem espaço aqui: reviews, partidas, unboxings e os rolês da comunidade, com vídeos do YouTube, TikTok e Instagram para assistir no site ou abrir no app.",
    to: "/influencers",
    link: "Ver os influenciadores",
  },
  {
    icon: GraduationCap,
    titulo: "Monitores de jogos",
    texto:
      "Pessoas que ensinam e conduzem partidas. Dá para ver estilos, jogos, bairros, valor mínimo por hora, avaliações e a agenda, e pedir um horário. O valor é combinado direto com a pessoa.",
    to: "/monitores",
    link: "Ver os monitores",
  },
];

// Foto em moldura de polaroide inclinada; sem foto (ou se não carregar), mostra as iniciais.
function FotoEquipe({ src, iniciais, nome, posicao = "50% 30%", inclinacao }) {
  const [erro, setErro] = useState(false);
  return (
    <div className={`w-32 sm:w-36 rounded-2xl bg-white p-1.5 pb-6 shadow-[0_20px_45px_-12px_rgba(0,0,0,0.7)] ${inclinacao} transition-transform duration-300 hover:rotate-0 hover:scale-105`}>
      <div className="aspect-[4/5] rounded-xl overflow-hidden bg-accent">
        {src && !erro ? (
          <img src={src} alt={`Foto de ${nome}`} loading="lazy" decoding="async" onError={() => setErro(true)} className="w-full h-full object-cover" style={{ objectPosition: posicao }} />
        ) : (
          <span className="grid place-items-center w-full h-full font-display font-900 text-4xl text-accent-foreground">{iniciais}</span>
        )}
      </div>
    </div>
  );
}

export default function Sobre() {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-12 sm:py-16">
        <span className="inline-block px-3 py-1 rounded-full text-xs font-600 bg-accent text-accent-foreground mb-4">
          Sobre
        </span>
        <h1 className="font-display font-700 text-3xl sm:text-4xl mb-4">
          O ponto de encontro do board game em Brasília
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          O <strong>eventosboardgame.com</strong> nasceu de uma vontade simples: que ninguém em Brasília
          deixe de jogar por não saber onde tem mesa. Aqui você encontra os encontros semanais, os eventos
          especiais, as casas de jogos e os influenciadores que movimentam a comunidade do DF — tudo num
          lugar só, de graça.
        </p>

        <section className="mt-12">
          <h2 className="font-display font-700 text-2xl mb-6">O que você encontra aqui</h2>
          <div className="space-y-4">
            {PILARES.map(({ icon: Icon, titulo, texto, to, link }) => (
              <div key={titulo} className="flex gap-4 bg-card border border-border rounded-xl p-5 card-shadow">
                <div className="shrink-0 grid place-items-center w-11 h-11 rounded-lg bg-accent/20 text-accent-ink">
                  <Icon className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-600 mb-1">{titulo}</h3>
                  <p className="text-sm text-muted-foreground">{texto}</p>
                  <Link to={to} className="inline-flex items-center gap-1 mt-2 py-1 text-sm font-600 text-primary dark:text-accent hover:underline">
                    {link} <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            ))}
            <div className="flex gap-4 rounded-xl border border-dashed border-border p-5">
              <div className="shrink-0 grid place-items-center w-11 h-11 rounded-lg bg-primary/10 text-primary dark:text-accent">
                <Lightbulb className="w-5 h-5" aria-hidden="true" />
              </div>
              <div>
                <h3 className="font-600 mb-1">Feito pela comunidade</h3>
                <p className="text-sm text-muted-foreground">
                  Organiza encontros ou tem um espaço? Cadastre grátis. Sabe de um evento que não está aqui?
                  Cadastre o evento sem precisar de conta.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-14">
          <h2 className="font-display font-700 text-2xl mb-2">Quem faz</h2>
          <p className="text-muted-foreground mb-6">
            O site foi criado e é mantido por <strong className="text-foreground">Rodrigo Carvalho</strong> e{" "}
            <strong className="text-foreground">Felipe Vilela</strong>, sócios fundadores e jogadores de Brasília.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <article className="relative overflow-hidden rounded-2xl bg-board text-white p-6">
              <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-accent/20 blur-2xl" aria-hidden="true" />
              <div className="relative">
                <FotoEquipe src="/equipe/rodrigo.jpg" iniciais="RC" nome="Rodrigo Carvalho" posicao="50% 45%" inclinacao="rotate-3" />
                <h3 className="mt-4 font-display font-700 text-xl">Rodrigo Carvalho</h3>
                <p className="text-xs font-700 uppercase tracking-[0.2em] text-accent">Sócio fundador · influenciador</p>
                <p className="mt-3 text-sm text-white/80 leading-relaxed">
                  31 anos, de Brasília, cristão e entusiasta criador de conteúdo de board games no @uehrodrigo.
                  O Rodrigo é a cara da comunidade nas redes: leva as mesas de Brasília para o
                  Instagram. Sócio fundador do site, é ele quem aproxima jogadores, casas e
                  organizadores — e garante que sempre tenha alguém novo chegando na mesa. Também é o testador
                  oficial do site e a fonte das grandes ideias: muita coisa que você usa aqui nasceu de uma
                  sugestão dele.
                </p>
                <div className="mt-4">
                  <Button asChild size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90 font-600">
                    <a href="https://instagram.com/uehrodrigo" target="_blank" rel="noreferrer">
                      <PlataformaIcon platform="instagram" className="w-4 h-4 mr-1.5" /> @uehrodrigo
                    </a>
                  </Button>
                </div>
              </div>
            </article>
            <article className="relative overflow-hidden rounded-2xl bg-board text-white p-6">
              <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-accent/20 blur-2xl" aria-hidden="true" />
              <div className="relative">
                <FotoEquipe src="/equipe/felipe.jpg" iniciais="FV" nome="Felipe Vilela" posicao="50% 50%" inclinacao="-rotate-3" />
                <h3 className="mt-4 font-display font-700 text-xl">Felipe Vilela</h3>
                <p className="text-xs font-700 uppercase tracking-[0.2em] text-accent">Sócio fundador · desenvolvimento</p>
                <p className="mt-3 text-sm text-white/80 leading-relaxed">
                  40 anos, de Brasília, cristão e amante de board game. É quem tira as ideias do papel e
                  escreve o código do site: junta a paixão pelos jogos com a tecnologia para facilitar a vida
                  de quem quer jogar em Brasília — também está por trás do Mercado BG, o marketplace da comunidade.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button asChild variant="outline" size="sm" className="bg-transparent border-white/30 text-white hover:bg-white/10 hover:text-white">
                    <a href="mailto:felipevap@gmail.com"><Mail className="w-4 h-4 mr-1.5" aria-hidden="true" /> E-mail</a>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="bg-transparent border-white/30 text-white hover:bg-white/10 hover:text-white">
                    <a href="https://www.linkedin.com/in/felipevap/" target="_blank" rel="noreferrer"><Linkedin className="w-4 h-4 mr-1.5" aria-hidden="true" /> LinkedIn</a>
                  </Button>
                </div>
              </div>
            </article>
          </div>
        </section>

        <section className="mt-14" id="suporte">
          <h2 className="font-display font-700 text-2xl mb-2">Suporte</h2>
          <p className="text-muted-foreground mb-6">
            Encontrou um problema, tem uma dúvida ou uma sugestão? Escreva para a gente — a equipe lê todas as mensagens.
          </p>
          <SuporteForm />
        </section>

        <div className="mt-12 text-center">
          <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Link to="/eventos"><Dice5 className="w-4 h-4 mr-1.5" aria-hidden="true" /> Bora jogar <ArrowRight className="w-4 h-4 ml-1.5" aria-hidden="true" /></Link>
          </Button>
        </div>
      </div>
    </Layout>
  );
}
