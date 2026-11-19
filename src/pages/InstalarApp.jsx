import React, { useState } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Download, Share, SquarePlus, MoreVertical, Smartphone, Bell, Zap, Sparkles } from "lucide-react";
import { useInstalacao, instalar, ehIOS } from "@/lib/instalar";

const VANTAGENS = [
  { icon: Zap, titulo: "Abre direto", texto: "Ícone na tela inicial, em tela cheia, sem procurar no navegador." },
  { icon: Bell, titulo: "Avisos de eventos", texto: "Siga lugares e grupos e saiba quando sai evento novo." },
  { icon: Sparkles, titulo: "Leve", texto: "Não ocupa espaço como um app de loja e está sempre atualizado." },
];

function Passo({ n, icon: Icon, children }) {
  return (
    <li className="flex items-start gap-3">
      <span className="grid place-items-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-700 shrink-0">{n}</span>
      <span className="pt-1 text-sm">
        {children} {Icon && <Icon className="inline w-4 h-4 align-[-2px] text-accent-ink" aria-hidden="true" />}
      </span>
    </li>
  );
}

// Página "Instalar o app": instala com um toque quando o navegador deixa, ou ensina o passo a passo.
export default function InstalarApp() {
  const estado = useInstalacao();
  const [recusou, setRecusou] = useState(false);
  const ios = ehIOS();

  const aoInstalar = async () => {
    const ok = await instalar();
    if (!ok) setRecusou(true);
  };

  return (
    <Layout>
      <section className="max-w-3xl mx-auto px-4 pt-10 pb-6">
        <p className="text-xs font-700 uppercase tracking-[0.2em] text-accent-ink mb-2">App</p>
        <h1 className="font-display font-700 text-3xl sm:text-4xl tracking-tight">Leve a agenda no celular</h1>
        <p className="text-muted-foreground mt-2 max-w-xl">
          Instale o eventosboardgame.com como aplicativo: é grátis, não precisa de loja de apps e leva poucos segundos.
        </p>

        <div className="mt-6 rounded-2xl border border-border bg-card p-5 sm:p-6">
          {estado === "instalado" ? (
            <p className="flex items-center gap-2 font-600">
              <CheckCircle2 className="w-5 h-5 text-primary" aria-hidden="true" /> O app já está instalado neste aparelho.
            </p>
          ) : estado === "pronto" ? (
            <Button onClick={aoInstalar} size="lg" className="h-12 font-700">
              <Download className="w-5 h-5 mr-2" aria-hidden="true" /> Instalar o app
            </Button>
          ) : ios ? (
            <>
              <h2 className="font-display font-700 text-lg mb-3 flex items-center gap-2">
                <Smartphone className="w-5 h-5" aria-hidden="true" /> No iPhone ou iPad (Safari)
              </h2>
              <ol className="space-y-3">
                <Passo n={1} icon={Share}>Toque em <strong>Compartilhar</strong>, na barra do Safari</Passo>
                <Passo n={2} icon={SquarePlus}>Escolha <strong>Adicionar à Tela de Início</strong></Passo>
                <Passo n={3}>Toque em <strong>Adicionar</strong>. Pronto: o ícone aparece na tela inicial.</Passo>
              </ol>
            </>
          ) : (
            <>
              <h2 className="font-display font-700 text-lg mb-3 flex items-center gap-2">
                <Smartphone className="w-5 h-5" aria-hidden="true" /> No Android ou no computador (Chrome, Edge)
              </h2>
              <ol className="space-y-3">
                <Passo n={1} icon={MoreVertical}>Abra o <strong>menu</strong> do navegador</Passo>
                <Passo n={2}>Toque em <strong>Instalar app</strong> ou <strong>Adicionar à tela inicial</strong></Passo>
                <Passo n={3}>Confirme. O ícone aparece junto dos seus apps.</Passo>
              </ol>
              <p className="mt-4 text-xs text-muted-foreground">No iPhone, use o Safari: Compartilhar → Adicionar à Tela de Início.</p>
            </>
          )}
          {recusou && <p className="mt-3 text-sm text-muted-foreground">Sem problema. Dá para instalar depois pelo menu do navegador.</p>}
        </div>

        <ul className="mt-8 grid gap-4 sm:grid-cols-3">
          {VANTAGENS.map(({ icon: Icon, titulo, texto }) => (
            <li key={titulo} className="rounded-2xl border border-border p-4">
              <Icon className="w-5 h-5 text-accent-ink mb-2" aria-hidden="true" />
              <p className="font-700">{titulo}</p>
              <p className="text-sm text-muted-foreground mt-1">{texto}</p>
            </li>
          ))}
        </ul>
        <p className="mt-8 text-sm">
          <Link to="/" className="font-600 text-primary dark:text-accent hover:underline">Voltar para a agenda</Link>
        </p>
      </section>
    </Layout>
  );
}
