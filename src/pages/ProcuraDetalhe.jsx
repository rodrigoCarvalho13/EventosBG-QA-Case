import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import Layout from "@/components/Layout";
import LogoSpinner from "@/components/LogoSpinner";
import ShareButtons from "@/components/ShareButtons";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Dices, Globe, MapPin, MessageCircle, Pencil, Copy, Check } from "lucide-react";
import { canal, CONTATOS, linkContato, quandoPostou, rotuloModalidadeProcura } from "@/lib/procuro";
import { podeEditar } from "@/lib/permissoes";
import { useSeo } from "@/lib/seo";

export default function ProcuraDetalhe() {
  const { id } = useParams();
  const { user } = useAuth();
  const [p, setP] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    base44.entities.Procura.get(id).then(setP).catch(() => setP(null)).finally(() => setLoading(false));
  }, [id]);

  useSeo(p ? { title: `Procuro: ${p.titulo}`, description: p.descricao || canal(p.canal).label, path: `/procuro/${id}`, noindex: p.status === "encerrado" } : null);

  if (loading) return <Layout><LogoSpinner /></Layout>;
  if (!p) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <h1 className="font-display font-700 text-2xl mb-2">Anúncio não encontrado</h1>
          <p className="text-muted-foreground mb-6">Talvez já tenha sido encerrado.</p>
          <Button asChild><Link to="/procuro">Ver os classificados</Link></Button>
        </div>
      </Layout>
    );
  }

  const c = canal(p.canal);
  const Icon = c.icon;
  const link = linkContato(p);
  const rotuloContato = CONTATOS.find((x) => x.value === p.contato_tipo)?.label || "Contato";
  const encerrado = p.status === "encerrado";
  const copiar = async () => {
    try { await navigator.clipboard.writeText(p.contato); setCopiado(true); setTimeout(() => setCopiado(false), 2000); } catch (e) {}
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
        <Link to={`/procuro?canal=${p.canal}`} className="inline-flex items-center gap-1.5 py-2 -my-2 text-sm text-muted-foreground hover:text-foreground mb-5">
          <ArrowLeft className="w-4 h-4" aria-hidden="true" /> {c.label}
        </Link>
        <article className="rounded-3xl bg-card border border-border card-shadow p-6 sm:p-8">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/20 text-accent-ink px-3 py-1 text-xs font-700 uppercase tracking-[0.12em]">
              <Icon className="w-3.5 h-3.5" aria-hidden="true" /> {c.label}
            </span>
            {podeEditar(user, p) && (
              <Button asChild variant="outline" size="sm">
                <Link to={`/painel/procuro/${p.id}`}><Pencil className="w-4 h-4 mr-1.5" aria-hidden="true" /> Editar</Link>
              </Button>
            )}
          </div>
          <h1 className="mt-3 font-display font-700 text-2xl sm:text-3xl break-words">{p.titulo}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{p.autor_nome ? `${p.autor_nome} · ` : ""}publicado {quandoPostou(p.created_date)}</p>
          {encerrado && <p className="mt-3 rounded-xl bg-muted px-3 py-2 text-sm font-600">Este anúncio foi encerrado.</p>}

          <div className="mt-4 flex flex-wrap gap-2 text-sm">
            {p.jogo && <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 font-600"><Dices className="w-4 h-4" aria-hidden="true" /> {p.jogo}</span>}
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1">
              {p.modalidade === "online" ? <Globe className="w-4 h-4" aria-hidden="true" /> : <MapPin className="w-4 h-4" aria-hidden="true" />}
              {p.modalidade === "online" ? "Online" : [p.bairro, p.cidade, p.estado].filter(Boolean).join(" · ") || rotuloModalidadeProcura(p.modalidade)}
            </span>
            {p.modalidade === "tanto_faz" && <span className="rounded-full border border-border px-3 py-1">Presencial ou online</span>}
          </div>

          {p.descricao && <p className="mt-5 whitespace-pre-wrap leading-relaxed break-words">{p.descricao}</p>}

          {!encerrado && (
            <div className="mt-6 rounded-2xl bg-primary/5 border border-primary/20 p-4">
              <p className="text-sm font-700">Responder pelo {rotuloContato}</p>
              <p className="mt-0.5 text-sm text-muted-foreground break-all">{p.contato}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {link && (
                  <Button asChild className="h-11 font-700">
                    <a href={link} target="_blank" rel="noopener noreferrer"><MessageCircle className="w-4 h-4 mr-1.5" aria-hidden="true" /> Falar com quem anunciou</a>
                  </Button>
                )}
                <Button variant="outline" className="h-11" onClick={copiar}>
                  {copiado ? <Check className="w-4 h-4 mr-1.5" aria-hidden="true" /> : <Copy className="w-4 h-4 mr-1.5" aria-hidden="true" />}
                  {copiado ? "Copiado" : "Copiar contato"}
                </Button>
              </div>
            </div>
          )}
          <div className="mt-6"><ShareButtons title={`Procuro: ${p.titulo}`} /></div>
          <p className="mt-6 text-xs text-muted-foreground">
            Dica: combine o primeiro encontro num espaço de jogos ou café. <Link to="/procuro#como-funciona" className="underline">Como funciona</Link>
          </p>
        </article>
      </div>
    </Layout>
  );
}
