import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Check, CheckCircle2, Heart, Megaphone, Send, Star } from "lucide-react";

const PLANOS = [
  {
    id: "gratis",
    nome: "Grátis",
    preco: "Sempre",
    icon: Heart,
    para: "Para todo mundo",
    itens: [
      "Cadastro de lugar, grupo ou editora",
      "Eventos na agenda, no mapa e na busca",
      "Seguidores avisados de cada evento novo",
      "Vagas, lançamentos e acervo de jogos",
      "Botão Vou! e inscrições nos eventos",
    ],
  },
  {
    id: "destaque",
    nome: "Destaque",
    preco: "Por evento",
    icon: Megaphone,
    para: "Para encher a mesa de um evento",
    itens: [
      "Selo Destaque no card do evento",
      "Primeiro lugar no topo da página inicial",
      "Por 7, 15 ou 30 dias",
      "Divulgação nas redes do eventosBG",
    ],
    principal: true,
  },
  {
    id: "parceiro",
    nome: "Parceiro",
    preco: "Mensal",
    icon: Star,
    para: "Para lojas, luderias e cafés",
    itens: [
      "Selo Parceira no seu lugar",
      "Primeiro em Lugares e na página inicial",
      "Eventos do mês com destaque",
      "Matéria sobre o seu espaço",
    ],
  },
];

const vazio = { nome: "", email: "", plano: "destaque", item: "", mensagem: "" };

// Planos de destaque para lojas e eventos: o que paga o site para continuar grátis para quem joga.
export default function Anuncie() {
  const { user } = useAuth();
  const [form, setForm] = useState(() => ({ ...vazio, nome: user?.full_name || "", email: user?.email || "" }));
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [enviado, setEnviado] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const escolher = (plano) => {
    setForm((f) => ({ ...f, plano }));
    document.getElementById("quero-anunciar")?.scrollIntoView({ behavior: "smooth" });
  };

  const enviar = async (e) => {
    e.preventDefault();
    setErro("");
    setEnviando(true);
    try {
      const plano = PLANOS.find((p) => p.id === form.plano)?.nome || form.plano;
      const res = await base44.functions.invoke("enviarSuporte", {
        nome: form.nome,
        email: form.email,
        assunto: `Plano ${plano}${form.item.trim() ? `: ${form.item.trim()}` : ""}`,
        mensagem: `Plano: ${plano}\nLugar ou evento: ${form.item.trim() || "-"}\n\n${form.mensagem.trim() || "Quero saber mais."}`,
      });
      if (res?.data?.error) throw new Error(res.data.error);
      setEnviado(true);
    } catch (err) {
      setErro(err?.message || "Não foi possível enviar. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Layout>
      <section className="max-w-5xl mx-auto px-4 pt-10 pb-6">
        <p className="text-xs font-700 uppercase tracking-[0.2em] text-accent-ink mb-2">Anuncie</p>
        <h1 className="font-display font-700 text-3xl sm:text-4xl tracking-tight max-w-2xl">Coloque seu lugar e seus eventos em destaque</h1>
        <p className="text-muted-foreground mt-2 max-w-xl">
          Quem joga usa o site de graça, sempre. Os planos de destaque para lojas e eventos ajudam a manter isso, e fazem sua mesa encher.
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-4 pb-6">
        <ul className="grid gap-4 md:grid-cols-3">
          {PLANOS.map(({ id, nome, preco, icon: Icon, para, itens, principal }) => (
            <li
              key={id}
              className={`flex flex-col rounded-3xl p-6 ${principal ? "bg-board text-white shadow-xl md:-translate-y-2" : "bg-card border border-border card-shadow"}`}
            >
              <span className={`grid place-items-center w-11 h-11 rounded-xl ${principal ? "bg-accent text-accent-foreground" : "bg-accent/20 text-accent-ink"}`}>
                <Icon className="w-5 h-5" aria-hidden="true" />
              </span>
              <h2 className="mt-4 font-display font-700 text-2xl">{nome}</h2>
              <p className={`text-sm ${principal ? "text-white/70" : "text-muted-foreground"}`}>{para}</p>
              <p className={`mt-3 text-xs font-700 uppercase tracking-[0.15em] ${principal ? "text-accent" : "text-accent-ink"}`}>{preco}</p>
              <ul className="mt-4 space-y-2 flex-1">
                {itens.map((t) => (
                  <li key={t} className="flex items-start gap-2 text-sm">
                    <Check className={`w-4 h-4 mt-0.5 shrink-0 ${principal ? "text-accent" : "text-primary"}`} aria-hidden="true" /> {t}
                  </li>
                ))}
              </ul>
              {id === "gratis" ? (
                <Button asChild variant="outline" className="mt-6 h-11 font-600">
                  <Link to="/cadastrar">Cadastrar grátis</Link>
                </Button>
              ) : (
                <Button
                  onClick={() => escolher(id)}
                  className={`mt-6 h-11 font-700 ${principal ? "bg-accent text-accent-foreground hover:bg-accent/90" : ""}`}
                >
                  Quero o {nome}
                </Button>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section id="quero-anunciar" className="max-w-2xl mx-auto px-4 py-10 scroll-mt-24">
        <h2 className="font-display font-700 text-2xl mb-1">Fale com a gente</h2>
        <p className="text-muted-foreground mb-6">Conte o que quer destacar e respondemos com valores e datas.</p>
        {enviado ? (
          <div className="rounded-2xl bg-card border border-border card-shadow p-8 text-center">
            <CheckCircle2 className="w-12 h-12 text-primary mx-auto mb-3" aria-hidden="true" />
            <h3 className="font-display font-700 text-xl mb-1">Pedido enviado!</h3>
            <p className="text-muted-foreground">Vamos responder pelo e-mail informado.</p>
          </div>
        ) : (
          <form onSubmit={enviar} className="rounded-2xl bg-card border border-border card-shadow p-6 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="an-nome">Seu nome *</Label>
                <Input id="an-nome" value={form.nome} onChange={set("nome")} required maxLength={120} className="h-11" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="an-email">E-mail *</Label>
                <Input id="an-email" type="email" value={form.email} onChange={set("email")} required className="h-11" />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="an-plano">Plano</Label>
                <select id="an-plano" value={form.plano} onChange={set("plano")} className="h-11 w-full rounded-md border border-input bg-background px-3 text-base lg:text-sm">
                  {PLANOS.filter((p) => p.id !== "gratis").map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="an-item">Lugar ou evento</Label>
                <Input id="an-item" value={form.item} onChange={set("item")} maxLength={150} placeholder="Ex.: Noite de jogos de sexta" className="h-11" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="an-msg">Mensagem</Label>
              <Textarea id="an-msg" rows={4} value={form.mensagem} onChange={set("mensagem")} maxLength={3000} placeholder="Datas, cidade, WhatsApp para contato…" />
            </div>
            {erro && <p role="alert" className="text-sm text-destructive">{erro}</p>}
            <Button type="submit" disabled={enviando} className="h-11 font-700">
              <Send className="w-4 h-4 mr-1.5" aria-hidden="true" /> {enviando ? "Enviando…" : "Enviar pedido"}
            </Button>
          </form>
        )}
      </section>
    </Layout>
  );
}
