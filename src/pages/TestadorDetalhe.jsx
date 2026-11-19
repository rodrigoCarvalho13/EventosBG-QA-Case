import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import Layout from "@/components/Layout";
import LogoSpinner from "@/components/LogoSpinner";
import ShareButtons from "@/components/ShareButtons";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Dices, FlaskConical, Globe, MapPin, MessageCircle, Pencil, Copy, Check } from "lucide-react";
import { CONTATOS, linkContato, rotuloModalidadeProcura } from "@/lib/procuro";
import { MENSAGEM_CONTATO, rotuloExperiencia } from "@/lib/testadores";
import { podeEditar } from "@/lib/permissoes";
import { useSeo } from "@/lib/seo";

export default function TestadorDetalhe() {
  const { id } = useParams();
  const { user } = useAuth();
  const [t, setT] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    base44.entities.Testador.get(id).then(setT).catch(() => setT(null)).finally(() => setLoading(false));
  }, [id]);

  useSeo(t ? { title: `Testador: ${t.nome}`, description: t.bio || "Perfil de testador de jogos de tabuleiro", path: `/testadores/${id}`, noindex: t.status !== "ativo" } : null);

  if (loading) return <Layout><LogoSpinner /></Layout>;
  if (!t) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <h1 className="font-display font-700 text-2xl mb-2">Perfil não encontrado</h1>
          <p className="text-muted-foreground mb-6">Talvez a pessoa tenha pausado ou removido o perfil.</p>
          <Button asChild><Link to="/testadores">Ver os testadores</Link></Button>
        </div>
      </Layout>
    );
  }

  const link = linkContato(t, MENSAGEM_CONTATO);
  const rotuloContato = CONTATOS.find((x) => x.value === t.contato_tipo)?.label || "Contato";
  const pausado = t.status !== "ativo";
  const copiar = async () => {
    try { await navigator.clipboard.writeText(t.contato); setCopiado(true); setTimeout(() => setCopiado(false), 2000); } catch (e) {}
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
        <Link to="/testadores" className="inline-flex items-center gap-1.5 py-2 -my-2 text-sm text-muted-foreground hover:text-foreground mb-5">
          <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Testadores
        </Link>
        <article className="rounded-3xl bg-card border border-border card-shadow p-6 sm:p-8">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/20 text-accent-ink px-3 py-1 text-xs font-700 uppercase tracking-[0.12em]">
              <FlaskConical className="w-3.5 h-3.5" aria-hidden="true" /> {rotuloExperiencia(t.experiencia) || "Testador"}
            </span>
            {podeEditar(user, t) && (
              <Button asChild variant="outline" size="sm">
                <Link to="/painel/testador"><Pencil className="w-4 h-4 mr-1.5" aria-hidden="true" /> Editar</Link>
              </Button>
            )}
          </div>
          <h1 className="mt-3 font-display font-700 text-2xl sm:text-3xl break-words">{t.nome}</h1>
          {pausado && <p className="mt-3 rounded-xl bg-muted px-3 py-2 text-sm font-600">Este perfil está pausado e não aparece na lista.</p>}

          <div className="mt-4 flex flex-wrap gap-2 text-sm">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1">
              {t.modalidade === "online" ? <Globe className="w-4 h-4" aria-hidden="true" /> : <MapPin className="w-4 h-4" aria-hidden="true" />}
              {t.modalidade === "online" ? "Online" : [t.cidade, t.estado].filter(Boolean).join(" · ") || rotuloModalidadeProcura(t.modalidade)}
            </span>
            {t.modalidade === "tanto_faz" && <span className="rounded-full border border-border px-3 py-1">Presencial ou online</span>}
          </div>

          {t.bio && <p className="mt-5 whitespace-pre-wrap leading-relaxed break-words">{t.bio}</p>}

          {(t.tipos_jogo || []).length > 0 && (
            <section className="mt-6">
              <h2 className="text-sm font-700 mb-2">Gosta de testar</h2>
              <div className="flex flex-wrap gap-1.5">
                {t.tipos_jogo.map((x) => <span key={x} className="rounded-full bg-primary/10 text-primary text-sm font-600 px-3 py-1">{x}</span>)}
              </div>
            </section>
          )}

          {(t.jogos_testados || []).length > 0 && (
            <section className="mt-6">
              <h2 className="text-sm font-700 mb-2">Jogos que já testou</h2>
              <ul className="flex flex-wrap gap-2">
                {t.jogos_testados.map((j) => (
                  <li key={j} className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-sm font-600 break-words">
                    <Dices className="w-4 h-4" aria-hidden="true" /> {j}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {!pausado && (
            <div className="mt-6 rounded-2xl bg-primary/5 border border-primary/20 p-4">
              <p className="text-sm font-700">Convidar para testar pelo {rotuloContato}</p>
              <p className="mt-0.5 text-sm text-muted-foreground break-all">{t.contato}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {link && (
                  <Button asChild className="h-11 font-700">
                    <a href={link} target="_blank" rel="noopener noreferrer"><MessageCircle className="w-4 h-4 mr-1.5" aria-hidden="true" /> Falar com {t.nome}</a>
                  </Button>
                )}
                <Button variant="outline" className="h-11" onClick={copiar}>
                  {copiado ? <Check className="w-4 h-4 mr-1.5" aria-hidden="true" /> : <Copy className="w-4 h-4 mr-1.5" aria-hidden="true" />}
                  {copiado ? "Copiado" : "Copiar contato"}
                </Button>
              </div>
            </div>
          )}
          <div className="mt-6"><ShareButtons title={`Testador: ${t.nome}`} /></div>
          <p className="mt-6 text-xs text-muted-foreground">
            Dica: combine a primeira sessão num espaço de jogos ou café.
          </p>
        </article>
      </div>
    </Layout>
  );
}
