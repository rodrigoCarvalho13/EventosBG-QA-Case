import { isEventoPassado, ordenarPorProximaData } from "@/lib/eventStatus";
import { formatarPreco } from "@/lib/eventoInfo";
import { imagemOtimizada } from "@/lib/imagemOtimizada";
import EditoraArt from "@/components/EditoraArt";
import SigaNos from "@/components/SigaNos";
import { useSeo, seoLoja } from "@/lib/seo";
import { buscarPorSlugOuId } from "@/lib/slug";
import { whatsappLink, normalizeUrl } from "@/lib/eventoInfo";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import Layout from "@/components/Layout";
import { useGoBack } from "@/hooks/use-go-back";
import MapView from "@/components/MapView";
import EventoCard from "@/components/EventoCard";
import ComentariosSection from "@/components/ComentariosSection";
import PerguntasSection from "@/components/PerguntasSection";
import TagBadges from "@/components/TagBadges";
import GalleryCarousel from "@/components/GalleryCarousel";
import Lightbox from "@/components/Lightbox";
import SeguirButton from "@/components/SeguirButton";
import AcervoLoja from "@/components/AcervoLoja";
import LancamentosEditora from "@/components/LancamentosEditora";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Phone,
  Mail,
  Pencil,
  ArrowLeft,
  CalendarDays,
  Store,
  Images,
  MessageCircle,
  ShoppingBag,
  ExternalLink,
} from "lucide-react";

const typeLabels = {
  luderia: "Espaço de jogos",
  loja: "Loja",
  cafe: "Café",
  bar: "Bar",
  espaco: "Outro espaço",
  organizador: "Grupo",
  editora: "Editora",
};

export default function LojaDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const goBack = useGoBack("/lojas");
  const { user } = useAuth();
  const [loja, setLoja] = useState(null);
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [fotoAberta, setFotoAberta] = useState(null);

  useEffect(() => {
    let ativo = true;
    setLoading(true);
    setNotFound(false);
    setLoja(null);
    setEventos([]);
    (async () => {
      try {
        // O endereço pode ser o slug (/lojas/ludoverso-delas) ou, nos links antigos, o id.
        const l = await buscarPorSlugOuId(base44.entities.Loja, id);
        if (!ativo) return;
        if (!l?.id) throw new Error("not found");
        if (l.slug && l.slug !== id) {
          navigate(`/lojas/${l.slug}`, { replace: true });
          return;
        }
        setLoja(l);
        const evPage = await base44.entities.Programacao.filter(
          { loja_id: l.id, status: "approved" },
          { sort: "-created_date", limit: 50 }
        );
        if (!ativo) return;
        // Só o que ainda vai acontecer. Eventos únicos já encerrados saem da vitrine;
        // os semanais continuam, porque se repetem.
        setEventos(
          ordenarPorProximaData(
            (evPage.items || [])
              .filter((e) => !isEventoPassado(e))
              .map((e) => (e.photo_url || !l.photo_url ? e : { ...e, loja_photo: l.photo_url }))
          )
        );
        setLoading(false);
      } catch (e) {
        if (!ativo) return;
        setNotFound(true);
        setLoading(false);
      }
    })();
    return () => { ativo = false; };
  }, [id, navigate]);

  useSeo(notFound ? { title: "Página não encontrada", noindex: true } : loja ? seoLoja(loja) : null);

  const produtos = (loja?.produtos || []).filter((p) => p?.name?.trim());
  const canEdit = user && loja && (loja.created_by_id === user.id || user.role === "admin");

  if (loading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12" aria-busy="true" aria-live="polite">
          <span className="sr-only">Carregando espaço…</span>
          <div className="h-5 w-24 rounded bg-muted animate-pulse mb-5" />
          <div className="rounded-2xl overflow-hidden bg-card border border-border">
            <div className="h-64 sm:h-80 lg:h-96 bg-muted animate-pulse" />
            <div className="p-6 sm:p-8 space-y-3">
              <div className="h-5 w-28 rounded-full bg-muted animate-pulse" />
              <div className="h-9 w-2/3 max-w-sm rounded bg-muted animate-pulse" />
              <div className="h-4 w-40 rounded bg-muted animate-pulse" />
              <div className="h-4 w-full rounded bg-muted animate-pulse" />
              <div className="h-4 w-5/6 rounded bg-muted animate-pulse" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (notFound || !loja) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <h1 className="font-display font-700 text-2xl mb-2">Loja não encontrada</h1>
          <p className="text-muted-foreground mb-4">Ela pode ter sido removida ou o link está errado.</p>
          <Button asChild><Link to="/lojas">Voltar para lojas</Link></Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        <button
          onClick={goBack}
          className="inline-flex items-center gap-1.5 py-2 -my-2 text-sm text-muted-foreground hover:text-foreground mb-5"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>

        <div className="rounded-2xl overflow-hidden bg-card border border-border card-shadow">
          <div className={`relative bg-muted ${loja.photo_url ? "h-64 sm:h-80 lg:h-96" : "aspect-[16/9]"}`}>
            {loja.photo_url ? (
              // Caixa de altura padrão; a foto aparece inteira (object-contain), sem esticar nem cortar.
              <button type="button" onClick={() => setFotoAberta(0)} className="block w-full h-full cursor-zoom-in" aria-label="Ampliar foto">
                <img
                  {...imagemOtimizada(loja.photo_url, { width: 1200, height: 1200 })}
                  sizes="(min-width: 1024px) 896px, 100vw"
                  fetchPriority="high"
                  alt={loja.name}
                  className="block w-full h-full object-contain"
                  decoding="async"
                />
              </button>
            ) : loja.type === "editora" ? (
              <div className="w-full h-full bg-board grid place-items-center">
                <EditoraArt className="h-5/6 text-accent/70" />
              </div>
            ) : (
              <div className="w-full h-full dice-pattern grid place-items-center">
                <Store className="w-16 h-16 text-primary/30" />
              </div>
            )}
          </div>
          <div className="p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <span className="inline-block px-2.5 py-1 rounded-full text-xs font-600 bg-accent text-accent-foreground mb-2">
                  {typeLabels[loja.type] || "Loja"}
                </span>
                <h1 className="font-display font-700 text-3xl sm:text-4xl">{loja.name}</h1>
                {loja.neighborhood && (
                  <p className="flex items-center gap-1.5 text-muted-foreground mt-1.5">
                    <MapPin className="w-4 h-4" /> {loja.neighborhood}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <SeguirButton lojaId={loja.id} />
                {canEdit && (
                  <Button asChild variant="outline">
                    <Link to={`/painel/lojas/${loja.id}`}>
                      <Pencil className="w-4 h-4 mr-1.5" /> Editar
                    </Link>
                  </Button>
                )}
              </div>
            </div>

            {loja.description && (
              <p className="mt-5 text-foreground/90 leading-relaxed whitespace-pre-wrap">{loja.description}</p>
            )}

            <TagBadges tags={loja.tags} className="mt-4" />

            <div className="mt-6 grid sm:grid-cols-2 gap-4">
              {loja.address && (
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                  <span className="text-sm">{loja.address}</span>
                </div>
              )}
              {whatsappLink(loja.whatsapp) && (
                <a
                  href={whatsappLink(loja.whatsapp, `Olá! Vi o ${loja.name} no eventosboardgame.com e queria mais informações.`)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 w-full sm:w-auto min-h-[48px] px-5 rounded-xl bg-[#1f7a4d] text-white font-600 hover:bg-[#19643f] transition-colors"
                >
                  <MessageCircle className="w-5 h-5" aria-hidden="true" />
                  Chamar no WhatsApp
                </a>
              )}
              {loja.phone && (
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-primary shrink-0" />
                  <a href={`tel:${loja.phone}`} className="text-sm hover:underline">{loja.phone}</a>
                </div>
              )}
              {loja.email && (
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-primary shrink-0" />
                  <a href={`mailto:${loja.email}`} className="text-sm hover:underline">{loja.email}</a>
                </div>
              )}
            </div>

            <SigaNos item={loja} className="mt-6" />

            {typeof loja.latitude === "number" && typeof loja.longitude === "number" && (
              <div className="mt-6">
                <MapView latitude={loja.latitude} longitude={loja.longitude} name={loja.name} address={loja.address} />
              </div>
            )}
          </div>
        </div>

        {loja.gallery?.length > 0 && (
          <div className="mt-10">
            <h2 className="font-display font-700 text-2xl flex items-center gap-2 mb-4">
              <Images className="w-6 h-6 text-primary" /> Ambiente
            </h2>
            <GalleryCarousel images={loja.gallery} alt={loja.name} onOpen={(k) => setFotoAberta(k + (loja.photo_url ? 1 : 0))} />
          </div>
        )}

        <AcervoLoja jogos={loja.acervo} />

        {loja.type === "editora" && <LancamentosEditora editoraId={loja.id} />}

        {produtos.length > 0 && (
          <div className="mt-10">
            <h2 className="font-display font-700 text-2xl flex items-center gap-2 mb-4">
              <ShoppingBag className="w-6 h-6 text-primary" /> Produtos à venda
            </h2>
            <div
              className={
                produtos.length === 1
                  ? "grid grid-cols-1 gap-5"
                  : produtos.length === 2
                    ? "grid grid-cols-1 sm:grid-cols-2 gap-5"
                    : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
              }
            >
              {produtos.map((p, i) => {
                const link = normalizeUrl(p.link);
                const unico = produtos.length === 1;
                return (
                  <article
                    key={i}
                    className={`group flex overflow-hidden rounded-2xl bg-card border border-border card-shadow transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:border-primary/30 ${
                      unico ? "flex-col md:flex-row" : "flex-col"
                    }`}
                  >
                    {p.photo_url && (
                      <div className={`relative bg-white dark:bg-muted/40 grid place-items-center overflow-hidden ${unico ? "md:w-1/2 aspect-[4/3] md:aspect-auto md:min-h-[320px]" : "aspect-[4/3]"}`}>
                        <img
                          {...imagemOtimizada(p.photo_url, { width: 640, height: 640 })}
                          sizes="(min-width: 768px) 480px, 100vw"
                          alt={p.name}
                          loading="lazy"
                          decoding="async"
                          className="absolute inset-0 w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-[1.03]"
                        />
                      </div>
                    )}
                    <div className={`flex flex-col flex-1 p-5 ${unico ? "md:p-8 md:justify-center" : ""}`}>
                      <div className="px-[5px] flex flex-col flex-1">
                        <h3 className={`font-display font-700 leading-tight ${unico ? "text-2xl" : "text-lg"}`}>{p.name}</h3>
                        {p.price && (
                          <p className={`mt-2 font-display font-700 text-primary dark:text-accent ${unico ? "text-3xl" : "text-xl"}`}>{formatarPreco(p.price)}</p>
                        )}
                        {p.description && (
                          <p className="mt-3 text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap flex-1">{p.description}</p>
                        )}
                        {link && (
                          <Button asChild size="lg" className={`mt-5 w-full ${unico ? "md:w-auto md:self-start md:px-8" : ""}`}>
                            <a href={link} target="_blank" rel="noreferrer noopener">
                              Comprar <ExternalLink className="w-4 h-4 ml-1.5" aria-hidden="true" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}

        {!(loja.type === "editora" && eventos.length === 0) && (
        <div className="mt-10">
          <h2 className="font-display font-700 text-2xl flex items-center gap-2 mb-4">
            <CalendarDays className="w-6 h-6 text-primary" /> Programação
          </h2>
          {eventos.length === 0 ? (
            <p className="text-muted-foreground">Esta loja ainda não cadastrou programações.</p>
          ) : (
            <div className="space-y-3">
              {eventos.map((e) => (
                <EventoCard key={e.id} evento={e} largo />
              ))}
            </div>
          )}
        </div>
        )}

        {loja.status === "approved" && <PerguntasSection tipo="loja" alvo={loja} />}

        <ComentariosSection lojaId={loja.id} lojaName={loja.name} />
      </div>
      {fotoAberta !== null && (
        <Lightbox
          images={[loja.photo_url, ...(loja.gallery || [])].filter(Boolean)}
          index={fotoAberta}
          alt={loja.name}
          onClose={() => setFotoAberta(null)}
        />
      )}
    </Layout>
  );
}