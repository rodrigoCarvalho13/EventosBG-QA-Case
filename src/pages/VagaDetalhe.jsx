import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import Layout from "@/components/Layout";
import LogoSpinner from "@/components/LogoSpinner";
import PageNotFound from "@/lib/PageNotFound";
import { Button } from "@/components/ui/button";
import { useSeo, seoVaga } from "@/lib/seo";
import { cidadeDe, estadoDe } from "@/lib/regiao";
import { lojaPath } from "@/lib/slug";
import { mailtoCurriculo, rotuloContratacao, rotuloModalidade } from "@/lib/vagas";
import { ArrowLeft, Briefcase, Mail, MapPin, Store } from "lucide-react";

function Bloco({ titulo, texto }) {
  if (!texto) return null;
  return (
    <div className="mt-6">
      <h2 className="font-display font-700 text-lg mb-1.5">{titulo}</h2>
      <p className="whitespace-pre-line text-foreground/85 leading-relaxed">{texto}</p>
    </div>
  );
}

export default function VagaDetalhe() {
  const { id } = useParams();
  const [vaga, setVaga] = useState(null);
  const [loja, setLoja] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ativo = true;
    setLoading(true);
    (async () => {
      try {
        const v = await base44.entities.Vaga.get(id);
        if (!ativo) return;
        setVaga(v?.id ? v : null);
        if (v?.loja_id) {
          try {
            const l = await base44.entities.Loja.get(v.loja_id);
            if (ativo && l?.id) setLoja(l);
          } catch (e) {
            // a loja pode ter sido removida
          }
        }
      } catch (e) {
        if (ativo) setVaga(null);
      } finally {
        if (ativo) setLoading(false);
      }
    })();
    return () => { ativo = false; };
  }, [id]);

  useSeo(loading ? null : vaga ? seoVaga(vaga) : { title: "Página não encontrada", noindex: true });

  if (loading) return <Layout><LogoSpinner /></Layout>;
  if (!vaga) return <PageNotFound />;

  const encerrada = vaga.status === "encerrada";
  const selos = [rotuloContratacao(vaga.contratacao), rotuloModalidade(vaga.modalidade)].filter(Boolean);

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-10 sm:py-14">
        <Link to="/vagas" className="inline-flex items-center gap-1.5 py-2 -my-2 text-sm text-muted-foreground hover:text-foreground mb-5">
          <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Todas as vagas
        </Link>

        <div className="rounded-2xl bg-card border border-border card-shadow p-6 sm:p-8">
          <span className="grid place-items-center w-12 h-12 rounded-xl bg-accent/20 text-accent-ink mb-4">
            <Briefcase className="w-6 h-6" aria-hidden="true" />
          </span>
          <h1 className="font-display font-800 text-3xl leading-tight">{vaga.titulo}</h1>
          <p className="mt-1 text-lg text-muted-foreground">
            {loja ? <Link to={lojaPath(loja)} className="inline-flex items-center gap-1.5 hover:underline"><Store className="w-4 h-4" aria-hidden="true" />{vaga.empresa}</Link> : vaga.empresa}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
            <span className="inline-flex items-center gap-1 text-muted-foreground">
              <MapPin className="w-4 h-4" aria-hidden="true" /> {cidadeDe(vaga)} - {estadoDe(vaga)}
            </span>
            {selos.map((s) => <span key={s} className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-600 text-muted-foreground">{s}</span>)}
            {encerrada && <span className="rounded-full bg-destructive/15 px-2.5 py-0.5 text-xs font-600 text-destructive">Vaga encerrada</span>}
          </div>

          <Bloco titulo="Perfil buscado" texto={vaga.descricao} />
          <Bloco titulo="Requisitos" texto={vaga.requisitos} />
          <Bloco titulo="Salário e benefícios" texto={vaga.beneficios} />

          <div className="mt-8 rounded-xl bg-muted/60 p-4 sm:p-5">
            {encerrada ? (
              <p className="text-sm text-muted-foreground">Esta vaga não está mais recebendo currículos.</p>
            ) : (
              <>
                <p className="text-sm text-muted-foreground mb-3">
                  Envie seu currículo para <span className="font-600 text-foreground break-all">{vaga.email_curriculo}</span>
                </p>
                <Button asChild size="lg" className="w-full sm:w-auto">
                  <a href={mailtoCurriculo(vaga)}><Mail className="w-4 h-4 mr-1.5" aria-hidden="true" /> Enviar currículo</a>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
