import SigaNos from "@/components/SigaNos";
import { useSeo, seoEvento } from "@/lib/seo";
import { buscarPorSlugOuId, slugDoRegistro } from "@/lib/slug";
import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import Layout from "@/components/Layout";
import LogoSpinner from "@/components/LogoSpinner";
import { useGoBack } from "@/hooks/use-go-back";
import MapView from "@/components/MapView";
import InscricaoSection from "@/components/InscricaoSection";
import VouBotao from "@/components/VouBotao";
import DestaqueAdmin from "@/components/DestaqueAdmin";
import SeguirButton from "@/components/SeguirButton";
import ShareButtons from "@/components/ShareButtons";
import PerguntasSection from "@/components/PerguntasSection";
import TagBadges from "@/components/TagBadges";
import { entradaTexto, publicoLabel, alimentacaoLabel } from "@/lib/eventoInfo";
import GalleryCarousel from "@/components/GalleryCarousel";
import { resolverArte } from "@/components/ArteEvento";
import { LogoMark } from "@/components/Logo";
import Lightbox from "@/components/Lightbox";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import StatusBadge from "@/components/StatusBadge";
import RevisaoSugestao from "@/components/RevisaoSugestao";
import {
  Clock,
  Calendar,
  Repeat,
  MapPin,
  Store,
  Pencil,
  ArrowLeft,
  Phone,
  Mail,
  Images,
  ExternalLink,
  Newspaper,
} from "lucide-react";
import { partesContato } from "@/lib/eventoInfo";
import { dataFinal, formatarPeriodo, isEventoPassado } from "@/lib/eventStatus";
import { materiaPath, materiaPublicada } from "@/lib/materias";
import { imagemOtimizada } from "@/lib/imagemOtimizada";

const dayLabels = {
  domingo: "Domingo",
  segunda: "Segunda-feira",
  terca: "Terça-feira",
  quarta: "Quarta-feira",
  quinta: "Quinta-feira",
  sexta: "Sexta-feira",
  sabado: "Sábado",
};

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  const s = d.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function dataEvento(evento) {
  const ini = formatDate(evento.event_date);
  const fim = dataFinal(evento);
  if (!ini) return "";
  if (!fim || fim === evento.event_date) return ini;
  return `${ini} a ${formatDate(fim)}`;
}

export default function EventoDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const goBack = useGoBack("/eventos");
  const { user } = useAuth();
  const { toast } = useToast();
  const [evento, setEvento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [reviewing, setReviewing] = useState(false);
  const [fotoAberta, setFotoAberta] = useState(null);
  const [enderecoLoja, setEnderecoLoja] = useState("");
  const [materiaDoEvento, setMateriaDoEvento] = useState(null);
  const pedido = useRef(0);

  const loadEvento = async (eventId) => {
    const atual = ++pedido.current;
    setLoading(true);
    setNotFound(false);
    setErrorMsg("");
    setEnderecoLoja("");
    try {
      const e = await buscarPorSlugOuId(base44.entities.Programacao, eventId);
      if (atual !== pedido.current) return;
      if (e.slug && e.slug !== eventId) {
        navigate(`/eventos/${e.slug}`, { replace: true });
        return;
      }
      setEvento(e);
      const semCartaz = !e.photo_url && !(Array.isArray(e.gallery) && e.gallery.some(Boolean));
      if (e.loja_id && (!String(e.address || "").trim() || semCartaz || !e.loja_slug)) {
        try {
          const loja = await base44.entities.Loja.get(e.loja_id);
          if (atual !== pedido.current) return;
          if (loja?.address && !String(e.address || "").trim()) setEnderecoLoja(loja.address);
          setEvento((prev) => (prev ? {
            ...prev,
            loja_slug: prev.loja_slug || loja?.slug,
            loja_photo: prev.loja_photo || (semCartaz ? loja?.photo_url : "") || prev.loja_photo,
            loja_name: prev.loja_name || loja?.name,
          } : prev));
        } catch {
          // O evento segue visível mesmo sem o endereço da loja.
        }
      }
      if (atual === pedido.current) setLoading(false);
    } catch (err) {
      if (atual !== pedido.current) return;
      setErrorMsg(err?.message || String(err));
      setNotFound(true);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvento(id);
  }, [id]);

  useEffect(() => {
    if (!evento?.id || !isEventoPassado(evento)) {
      setMateriaDoEvento(null);
      return;
    }
    let ativo = true;
    const campos = ["titulo", "slug", "status", "publicada", "evento_id", "evento_slug"];
    const escolher = (pagina) => (pagina?.items || []).find((item) => materiaPublicada(item) && item.slug) || null;
    (async () => {
      try {
        const porId = await base44.entities.Materia.filter({ publicada: true, evento_id: evento.id }, { limit: 5, fields: campos });
        let achada = escolher(porId);
        if (!achada && evento.slug) {
          const porSlug = await base44.entities.Materia.filter({ publicada: true, evento_slug: evento.slug }, { limit: 5, fields: campos });
          achada = escolher(porSlug);
        }
        if (ativo) setMateriaDoEvento(achada);
      } catch {
        if (ativo) setMateriaDoEvento(null);
      }
    })();
    return () => { ativo = false; };
  }, [evento]);

  useSeo(notFound ? { title: "Página não encontrada", noindex: true } : evento ? seoEvento(evento) : null);

  const canEdit = user && evento && (evento.created_by_id === user.id || user.role === "admin");
  const isAdmin = user?.role === "admin";
  const isFixa = evento?.recurrence_type === "fixa";
  const arte = evento ? resolverArte(evento) : null;
  // Sem cartaz próprio, a foto do espaço (muitas vezes a programação da semana inteira)
  // não vira a imagem principal: ela fica numa miniatura ao lado do nome do espaço.
  const heroMarca = !!arte && (arte.marca || arte.daLoja);

  const review = async (status, motivo = "") => {
    setReviewing(true);
    try {
      const reason = status === "rejected" ? motivo.trim() : "";
      const payload = reason ? { status, rejection_reason: reason } : { status };
      if (status === "approved" && !evento.slug) payload.slug = await slugDoRegistro(base44.entities.Programacao, evento.title, evento, "evento");
      await base44.entities.Programacao.update(evento.id, payload);
      setEvento((e) => ({ ...e, ...payload }));
      toast({
        title: status === "approved" ? "Sugestão aprovada" : "Sugestão rejeitada",
        description:
          status === "approved"
            ? "O evento agora aparece no hub."
            : "A sugestão foi rejeitada.",
      });
    } catch (err) {
      toast({
        title: "Erro ao atualizar",
        description: err?.message || "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setReviewing(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <LogoSpinner label="Carregando evento…" className="py-28" />
      </Layout>
    );
  }

  if (notFound || !evento) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <h1 className="font-display font-700 text-2xl mb-2">Evento não encontrado</h1>
          <p className="text-muted-foreground mb-2">Ele pode ter sido removido ou o link está errado.</p>
          {errorMsg && <p className="text-xs text-muted-foreground mb-4">{errorMsg}</p>}
          <div className="flex justify-center gap-3">
            <Button onClick={() => loadEvento(id)} variant="outline">Tentar novamente</Button>
            <Button asChild><Link to="/eventos">Voltar para programação</Link></Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={`max-w-4xl mx-auto px-4 py-8 sm:py-12 ${isAdmin && evento.status === "pending" ? "pb-40 sm:pb-28" : ""}`}>
        <button
          onClick={goBack}
          className="inline-flex items-center gap-1.5 py-2 -my-2 text-sm text-muted-foreground hover:text-foreground mb-5"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>

        {isAdmin && evento.status === "rejected" && (
          <div className="mb-5 rounded-2xl bg-muted border border-border p-4 flex flex-wrap items-center gap-2">
            <StatusBadge status="rejected" />
            <span className="text-sm text-muted-foreground">
              {evento.rejection_reason ? `Motivo: ${evento.rejection_reason}` : "Sugestão rejeitada."}
            </span>
          </div>
        )}

        <div className="rounded-2xl overflow-hidden bg-card border border-border card-shadow">
          <div className={`relative bg-board ${heroMarca ? "aspect-[16/7] sm:aspect-[16/6]" : ""}`}>
            {heroMarca ? (
              <div className="w-full h-full grid place-items-center">
                <LogoMark className="w-20 h-20 sm:w-24 sm:h-24" title={arte.marca ? arte.alt : `Logo do eventosboardgame.com no lugar do cartaz de ${evento.title}`} />
              </div>
            ) : (
              <button type="button" onClick={() => setFotoAberta(0)} className="block w-full cursor-zoom-in bg-board" aria-label="Ampliar foto">
                <img
                  {...imagemOtimizada(arte.url, { width: 1200, height: 1200, larguras: [480, 720, 960, 1200] })}
                  sizes="(min-width: 1024px) 896px, 100vw"
                  fetchPriority={evento.photo_url ? "high" : "low"}
                  alt={arte.alt}
                  loading={evento.photo_url ? "eager" : "lazy"}
                  className="block w-full h-auto max-h-[70vh] object-contain mx-auto"
                  decoding="async"
                />
              </button>
            )}
          </div>
          <div className="p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-600 mb-3 ${
                    isFixa ? "bg-primary/10 text-primary dark:text-foreground" : "bg-accent/25 text-foreground"
                  }`}
                >
                  {isFixa ? <Repeat className="w-3.5 h-3.5" /> : <Calendar className="w-3.5 h-3.5" />}
                  {isFixa ? `Toda ${dayLabels[evento.day_of_week] || ""}` : "Evento"}
                </span>
                <h1 className="font-display font-700 text-3xl sm:text-4xl">{evento.title}</h1>
                {!isFixa && (dataEvento(evento) || formatarPeriodo(evento)) && (
                  <p className="mt-3 flex items-start gap-2 text-base font-600">
                    <Calendar className="w-4 h-4 mt-1 shrink-0 text-primary" aria-hidden="true" />
                    <span>{dataEvento(evento) || formatarPeriodo(evento)}</span>
                  </p>
                )}
              </div>
              {canEdit && (
                <Button asChild variant="outline">
                  <Link to={`/painel/eventos/${evento.id}`}>
                    <Pencil className="w-4 h-4 mr-1.5" /> Editar
                </Link>
                </Button>
              )}
            </div>

            {(evento.start_time || evento.end_time) && (
              <p className="flex items-center gap-2 text-muted-foreground mt-2">
                <Clock className="w-4 h-4" />
                {evento.start_time}{evento.end_time ? ` – ${evento.end_time}` : ""}
                {!isFixa && dataFinal(evento) !== evento.event_date ? " (todos os dias)" : ""}
              </p>
            )}

            {evento.description && (
              <p className="mt-5 text-foreground/90 leading-relaxed whitespace-pre-wrap">{evento.description}</p>
            )}

            {materiaDoEvento && (
              <Link
                to={materiaPath(materiaDoEvento)}
                className="mt-5 flex items-center gap-3 rounded-2xl border border-accent/40 bg-accent/10 p-4 hover:bg-accent/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Newspaper className="h-5 w-5 shrink-0 text-accent-ink" aria-hidden="true" />
                <span>
                  <span className="block font-display text-lg font-700">Leia a matéria sobre este evento</span>
                  {materiaDoEvento.titulo && <span className="block text-sm text-muted-foreground">{materiaDoEvento.titulo}</span>}
                </span>
              </Link>
            )}

            {(entradaTexto(evento) || evento.publico || evento.alimentacao?.length > 0) && (
              <dl className="mt-5 grid sm:grid-cols-3 gap-3">
                {entradaTexto(evento) && (
                  <div className="rounded-xl border border-border p-3">
                    <dt className="text-xs font-600 uppercase tracking-wide text-muted-foreground">Entrada</dt>
                    <dd className="font-600 mt-0.5">{entradaTexto(evento)}</dd>
                  </div>
                )}
                {evento.publico && (
                  <div className="rounded-xl border border-border p-3">
                    <dt className="text-xs font-600 uppercase tracking-wide text-muted-foreground">Público</dt>
                    <dd className="font-600 mt-0.5">{publicoLabel(evento.publico)}</dd>
                  </div>
                )}
                {evento.alimentacao?.length > 0 && (
                  <div className="rounded-xl border border-border p-3">
                    <dt className="text-xs font-600 uppercase tracking-wide text-muted-foreground">Alimentação</dt>
                    <dd className="font-600 mt-0.5">{evento.alimentacao.map(alimentacaoLabel).filter(Boolean).join(" · ")}</dd>
                  </div>
                )}
              </dl>
            )}
            <TagBadges tags={evento.tags} className="mt-4" />

            {evento.status === "approved" && <VouBotao evento={evento} />}

            {evento.gallery?.length > 0 && (
              <div className="mt-6">
                <h2 className="font-display font-700 text-lg flex items-center gap-2 mb-3">
                  <Images className="w-5 h-5 text-primary" /> Fotos
                </h2>
                <GalleryCarousel images={evento.gallery} alt={evento.title} onOpen={(k) => setFotoAberta(k + (evento.photo_url ? 1 : 0))} />
              </div>
            )}

            <div className="mt-6 space-y-3">
              {evento.loja_name && (
                <div className="flex items-center gap-2.5">
                  <Store className="w-4 h-4 text-primary shrink-0" />
                  <Link to={`/lojas/${evento.loja_slug || evento.loja_id}`} className="text-sm hover:underline font-500">
                    {evento.loja_name}
                  </Link>
                  {arte?.daLoja && (
                    <button type="button" onClick={() => setFotoAberta(0)} className="ml-auto shrink-0 rounded-lg overflow-hidden border border-border bg-white" aria-label={`Ampliar foto de ${evento.loja_name}`}>
                      <img {...imagemOtimizada(arte.url, { width: 96, height: 96, crop: true })} alt={arte.alt} loading="lazy" decoding="async" className="block w-12 h-12 object-cover" />
                    </button>
                  )}
                </div>
              )}
              {evento.loja_id && (
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-border p-3">
                  <p className="flex-1 min-w-[12rem] text-sm text-muted-foreground">
                    Siga {evento.loja_name || "o organizador"} e receba os próximos eventos por e-mail e notificação.
                  </p>
                  <SeguirButton lojaId={evento.loja_id} />
                </div>
              )}
              {evento.location_name && (
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-sm">{evento.location_name}</span>
                </div>
              )}
              {(evento.address || enderecoLoja) && (evento.address || enderecoLoja).trim().toLowerCase() !== (evento.location_name || "").trim().toLowerCase() && (
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                  <span className="text-sm">{evento.address || enderecoLoja}</span>
                </div>
              )}
              {evento.contact && (
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-sm">
                    {partesContato(evento.contact).map((p, i) =>
                      typeof p === "string" ? (
                        <React.Fragment key={i}>{p}</React.Fragment>
                      ) : (
                        <a key={i} href={p.href} target="_blank" rel="noopener noreferrer" className="font-600 text-primary dark:text-accent hover:underline">
                          {p.label}
                        </a>
                      )
                    )}
                  </span>
                </div>
              )}
              {evento.email && (
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-primary shrink-0" />
                  <a href={`mailto:${evento.email}`} className="text-sm hover:underline">{evento.email}</a>
                </div>
              )}
            </div>

            <SigaNos item={evento} className="mt-6" />

            <div className="mt-6">
              <ShareButtons title={evento.title} url={`${window.location.origin}/functions/previaEvento?slug=${encodeURIComponent(evento.slug || evento.id)}`} />
            </div>

            {evento.status === "approved" && (evento.tem_inscricao === false ? (
              <p className="mt-6 rounded-2xl border border-border bg-muted/40 p-4 text-sm">
                <span className="font-600">Sem inscrição:</span> é só aparecer no local.
              </p>
            ) : evento.inscricao_tipo === "link" && evento.inscricao_link ? (
              <div className="mt-6 p-5 rounded-2xl bg-accent/10 border border-accent/30">
                <h2 className="font-display font-700 text-lg">Inscrição</h2>
                <p className="mt-1 text-sm text-muted-foreground">A inscrição deste evento é feita numa página externa.</p>
                <a
                  href={evento.inscricao_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-primary text-primary-foreground px-4 py-2.5 text-sm font-600 hover:bg-primary/90"
                >
                  Fazer inscrição <ExternalLink className="w-4 h-4" aria-hidden="true" />
                </a>
              </div>
            ) : (
              <InscricaoSection eventoId={evento.id} />
            ))}

            {evento.status === "approved" && <PerguntasSection tipo="evento" alvo={evento} />}

            {typeof evento.latitude === "number" && typeof evento.longitude === "number" && (
              <div className="mt-6">
                <MapView latitude={evento.latitude} longitude={evento.longitude} name={evento.title} address={evento.address} />
              </div>
            )}

          </div>
        </div>
      </div>

      {isAdmin && evento.status === "approved" && <DestaqueAdmin eventoId={evento.id} />}

      {isAdmin && evento.status === "pending" && (
        <RevisaoSugestao titulo={evento.title} reviewing={reviewing} onReview={review} />
      )}
      {fotoAberta !== null && (
        <Lightbox
          images={[...new Set([evento.photo_url, ...(evento.gallery || []), arte && !arte.marca ? arte.url : ""].filter(Boolean))]}
          index={fotoAberta}
          alt={evento.title}
          onClose={() => setFotoAberta(null)}
        />
      )}
    </Layout>
  );
}