import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import Layout from "@/components/Layout";
import LogoSpinner from "@/components/LogoSpinner";
import MateriaCard from "@/components/MateriaCard";
import MateriaCorpo from "@/components/MateriaCorpo";
import CarrosselMateria from "@/components/CarrosselMateria";
import DenunciarMateria from "@/components/DenunciarMateria";
import Lightbox from "@/components/Lightbox";
import ShareButtons from "@/components/ShareButtons";
import { Button } from "@/components/ui/button";
import { useGoBack } from "@/hooks/use-go-back";
import { useSeo, seoMateria } from "@/lib/seo";
import { buscarPorSlugOuId, eventoPath } from "@/lib/slug";
import { listarTudo } from "@/lib/paginar";
import {
  CAMPOS_MATERIA_LISTA,
  dataVisivel,
  formatarDataLonga,
  materiaExcluida,
  materiaPublicada,
  materiasRelacionadas,
  podeEditarMateria,
} from "@/lib/materias";
import { ArrowLeft, CalendarDays, MapPin, Pencil, UserRound } from "lucide-react";

export default function MateriaDetalhe() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const goBack = useGoBack("/materias");
  const { user } = useAuth();
  const [materia, setMateria] = useState(null);
  const [relacionadas, setRelacionadas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [foto, setFoto] = useState(null);
  const botaoFoto = React.useRef(null);

  useEffect(() => {
    let ativo = true;
    setLoading(true);
    setNotFound(false);
    setMateria(null);
    (async () => {
      try {
        const achada = await buscarPorSlugOuId(base44.entities.Materia, slug);
        if (!ativo) return;
        const podeVerOculta = podeEditarMateria(achada, user);
        if (!achada || materiaExcluida(achada) || (!materiaPublicada(achada) && !podeVerOculta)) {
          setNotFound(true);
          setLoading(false);
          return;
        }
        if (achada.slug && achada.slug !== slug) {
          navigate(`/materias/${achada.slug}`, { replace: true });
          return;
        }
        setMateria(achada);
        const lista = await listarTudo(
          base44.entities.Materia,
          { publicada: true },
          { sort: "-publicada_em", limit: 50, fields: CAMPOS_MATERIA_LISTA }
        ).catch(() => []);
        if (!ativo) return;
        setRelacionadas(materiasRelacionadas(lista, achada, 3));
        setLoading(false);
      } catch {
        if (!ativo) return;
        setNotFound(true);
        setLoading(false);
      }
    })();
    return () => { ativo = false; };
  }, [slug, user, navigate]);

  const rascunho = materia && !materiaPublicada(materia);
  const dono = podeEditarMateria(materia, user);
  useSeo(loading ? null : notFound || !materia
    ? { title: "Página não encontrada", noindex: true }
    : seoMateria(materia, { noindex: rascunho }));

  const fecharFoto = () => {
    setFoto(null);
    botaoFoto.current?.focus();
  };

  if (loading) {
    return (
      <Layout>
        <LogoSpinner label="Carregando matéria…" className="py-28" />
      </Layout>
    );
  }

  if (notFound || !materia) {
    return (
      <Layout>
        <div className="mx-auto max-w-3xl px-4 py-20 text-center">
          <h1 className="font-display text-2xl font-700">Matéria não encontrada</h1>
          <p className="mt-2 text-muted-foreground">Ela pode ter sido removida ou ainda estar em rascunho.</p>
          <Button asChild className="mt-6 min-h-11"><Link to="/materias">Ver matérias</Link></Button>
        </div>
      </Layout>
    );
  }

  const data = formatarDataLonga(dataVisivel(materia));
  const daGaleria = (materia.galeria || []).filter((fotoItem) => fotoItem?.url);
  const fotos = daGaleria.length ? daGaleria : (materia.capa_url ? [{ url: materia.capa_url, legenda: "" }] : []);
  const evento = materia.evento_titulo && (materia.evento_slug || materia.evento_id)
    ? { slug: materia.evento_slug, id: materia.evento_id, title: materia.evento_titulo }
    : null;

  return (
    <Layout>
      <article className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
        <button type="button" onClick={goBack} className="mb-5 inline-flex min-h-11 items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Voltar
        </button>

        {rascunho && (
          <p className="mb-4 rounded-xl border border-accent/40 bg-accent/15 px-4 py-3 text-sm font-600">
            {materia.status === "oculta" ? "Oculta: não aparece na listagem pública." : "Rascunho: só você e a administração veem esta matéria."}
          </p>
        )}

        <header>
          <h1 className="font-display text-3xl font-700 leading-tight tracking-tight sm:text-5xl">{materia.titulo}</h1>
          {materia.subtitulo && <p className="mt-4 text-lg text-muted-foreground">{materia.subtitulo}</p>}
          <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            {data && (
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4" aria-hidden="true" />
                <time dateTime={dataVisivel(materia)}>{data}</time>
              </span>
            )}
            {materia.cidade && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4" aria-hidden="true" />
                {materia.cidade}
              </span>
            )}
            {(materia.autor_nome || materia.autor) && (
              <span className="inline-flex items-center gap-1.5">
                <UserRound className="h-4 w-4" aria-hidden="true" />
                {materia.autor_nome || materia.autor}
              </span>
            )}
          </p>
          {evento && (
            <p className="mt-4">
              <Link to={eventoPath(evento)} className="inline-flex min-h-11 items-center font-600 text-primary underline underline-offset-2 hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:text-accent">
                Evento: {evento.title}
              </Link>
            </p>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            {dono && materia.id && (
              <Button asChild variant="outline" className="min-h-11">
                <Link to={materia.slug ? `/materias/${materia.slug}/editar` : `/painel/materias/${materia.id}`}><Pencil className="mr-1.5 h-4 w-4" aria-hidden="true" /> Editar</Link>
              </Button>
            )}
            <DenunciarMateria materia={materia} />
          </div>
        </header>

        <div className="mt-8">
          <MateriaCorpo texto={materia.corpo} />
        </div>

        {fotos.length > 0 && (
          <section className="mt-10" aria-labelledby="galeria-titulo">
            <h2 id="galeria-titulo" className="mb-4 font-display text-2xl font-700">Fotos</h2>
            <CarrosselMateria
              fotos={fotos}
              titulo={materia.titulo}
              ampliarRef={botaoFoto}
              onAmpliar={(indice) => setFoto(indice)}
            />
          </section>
        )}

        {(materia.tags || []).length > 0 && (
          <ul className="mt-8 flex flex-wrap gap-2" aria-label="Tags">
            {(materia.tags || []).map((tag) => (
              <li key={tag} className="rounded-full bg-accent/20 px-3 py-1 text-sm font-600">{tag}</li>
            ))}
          </ul>
        )}

        <div className="mt-8">
          <ShareButtons title={materia.titulo} />
        </div>
      </article>

      {relacionadas.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-12" aria-labelledby="relacionadas-titulo">
          <h2 id="relacionadas-titulo" className="mb-5 font-display text-2xl font-700 sm:text-3xl">Matérias relacionadas</h2>
          <ul className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {relacionadas.map((item) => (
              <li key={item.id || item.slug} className="min-w-0"><MateriaCard materia={item} /></li>
            ))}
          </ul>
        </section>
      )}

      {foto !== null && (
        <Lightbox
          images={fotos.map((item) => item.url)}
          legendas={fotos.map((item) => item.legenda || "")}
          index={foto}
          alt={materia.titulo}
          onClose={fecharFoto}
        />
      )}
    </Layout>
  );
}
