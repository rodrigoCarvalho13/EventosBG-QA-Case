import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { base44 } from "@/api/base44Client";
import Layout from "@/components/Layout";
import MapLinksNewTab from "@/components/MapLinksNewTab";
import { linksDeRota } from "@/components/MapView";
import { useEstado, filtroEstado } from "@/lib/regiao";
import { listarTudo } from "@/lib/paginar";
import { proximaOcorrencia } from "@/lib/eventStatus";
import { eventoPath, lojaPath } from "@/lib/slug";
import { Map as MapIcon } from "lucide-react";

const BRASIL = { centro: [-14.2, -51.9], zoom: 4 };
const COR = {
  lugar: { color: "hsl(152 32% 20%)", fillColor: "hsl(152 40% 38%)" },
  evento: { color: "hsl(30 70% 30%)", fillColor: "hsl(38 80% 50%)" },
};
const CAMADAS = [
  { id: "tudo", label: "Tudo" },
  { id: "lugar", label: "Lugares" },
  { id: "evento", label: "Eventos" },
];
const DIAS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
const temPonto = (x) => typeof x?.latitude === "number" && typeof x?.longitude === "number";
const quando = (d) => `${DIAS[d.getDay()]} ${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;

// Enquadra todos os pontos visíveis.
function Enquadrar({ pontos }) {
  const map = useMap();
  useEffect(() => {
    if (pontos.length === 0) map.setView(BRASIL.centro, BRASIL.zoom);
    else if (pontos.length === 1) map.setView(pontos[0], 14);
    else map.fitBounds(pontos, { padding: [32, 32], maxZoom: 15 });
  }, [map, pontos]);
  return null;
}

export default function Mapa() {
  const { sigla, info } = useEstado();
  const [brasil, setBrasil] = useState(false);
  const [camada, setCamada] = useState("tudo");
  const [lojas, setLojas] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ativo = true;
    setLoading(true);
    const filtro = { status: "approved", ...(brasil ? {} : filtroEstado(sigla)) };
    Promise.all([
      listarTudo(base44.entities.Loja, filtro, { limit: 200, fields: ["name", "slug", "type", "address", "neighborhood", "cidade", "latitude", "longitude"] }),
      listarTudo(base44.entities.Programacao, filtro, { limit: 200, fields: ["title", "slug", "loja_id", "loja_name", "location_name", "address", "latitude", "longitude", "recurrence_type", "day_of_week", "event_date", "event_end_date", "start_time"] }),
    ])
      .then(([ls, es]) => {
        if (!ativo) return;
        setLojas(ls);
        setEventos(es.map((e) => ({ ...e, _prox: proximaOcorrencia(e) })).filter((e) => e._prox));
      })
      .catch(() => { if (ativo) { setLojas([]); setEventos([]); } })
      .finally(() => ativo && setLoading(false));
    return () => { ativo = false; };
  }, [sigla, brasil]);

  // Evento sem coordenada própria usa a do lugar onde acontece.
  const marcadores = useMemo(() => {
    const porId = new Map(lojas.map((l) => [l.id, l]));
    const lista = [];
    if (camada !== "evento") {
      for (const l of lojas) if (temPonto(l)) lista.push({ tipo: "lugar", id: `l-${l.id}`, pos: [l.latitude, l.longitude], item: l });
    }
    if (camada !== "lugar") {
      for (const e of eventos) {
        const ponto = temPonto(e) ? e : porId.get(e.loja_id);
        if (temPonto(ponto)) lista.push({ tipo: "evento", id: `e-${e.id}`, pos: [ponto.latitude, ponto.longitude], item: e });
      }
    }
    return lista;
  }, [lojas, eventos, camada]);
  const pontos = useMemo(() => marcadores.map((m) => m.pos), [marcadores]);
  const nLugares = marcadores.filter((m) => m.tipo === "lugar").length;
  const nEventos = marcadores.length - nLugares;

  return (
    <Layout>
      <section className="max-w-6xl mx-auto px-4 pt-10 pb-4">
        <p className="text-xs font-700 uppercase tracking-[0.2em] text-accent-ink mb-2">Mapa</p>
        <h1 className="font-display font-700 text-3xl sm:text-4xl tracking-tight">Onde tem board game</h1>
        <p className="text-muted-foreground mt-2 max-w-xl">
          Lugares para jogar e comprar e os próximos eventos {brasil ? "do Brasil todo" : info.em || `em ${info.nome}`}, num mapa só. Toque num ponto para ver e traçar a rota.
        </p>
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-6">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div role="group" aria-label="O que mostrar" className="inline-flex rounded-xl border border-border bg-card p-1">
            {CAMADAS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCamada(c.id)}
                aria-pressed={camada === c.id}
                className={`min-h-11 px-4 rounded-lg text-sm font-600 transition-colors ${
                  camada === c.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
          <div role="group" aria-label="Abrangência" className="inline-flex rounded-xl border border-border bg-card p-1">
            {[{ v: false, label: info.sigla }, { v: true, label: "Brasil todo" }].map((o) => (
              <button
                key={String(o.v)}
                type="button"
                onClick={() => setBrasil(o.v)}
                aria-pressed={brasil === o.v}
                className={`min-h-11 px-4 rounded-lg text-sm font-600 transition-colors ${
                  brasil === o.v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {loading ? "Carregando…" : `${nLugares} ${nLugares === 1 ? "lugar" : "lugares"} · ${nEventos} ${nEventos === 1 ? "evento" : "eventos"}`}
          </p>
        </div>

        <div
          className="relative rounded-2xl overflow-hidden border border-border h-[65vh] min-h-[22rem]"
          role="region"
          aria-label="Mapa de lugares e eventos"
          aria-roledescription="mapa interativo"
        >
          <MapContainer center={BRASIL.centro} zoom={BRASIL.zoom} scrollWheelZoom className="w-full h-full">
            <MapLinksNewTab />
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
            <Enquadrar pontos={pontos} />
            {marcadores.map(({ tipo, id, pos, item }) => {
              const rota = linksDeRota(pos[0], pos[1]);
              return (
                <CircleMarker key={id} center={pos} radius={tipo === "evento" ? 8 : 10} pathOptions={{ ...COR[tipo], fillOpacity: 0.9, weight: 2 }}>
                  <Popup>
                    <span style={{ display: "block", fontSize: 11, textTransform: "uppercase", letterSpacing: ".08em", opacity: 0.7 }}>
                      {tipo === "evento" ? `Evento · ${quando(item._prox)}${item.start_time ? ` · ${item.start_time.slice(0, 5)}` : ""}` : "Lugar"}
                    </span>
                    <Link to={tipo === "evento" ? eventoPath(item) : lojaPath(item)} style={{ fontWeight: 700, fontSize: 15 }}>
                      {tipo === "evento" ? item.title : item.name}
                    </Link>
                    {tipo === "evento" && (item.loja_name || item.location_name) && <><br />{item.loja_name || item.location_name}</>}
                    {tipo === "lugar" && (item.neighborhood || item.cidade) && <><br />{item.neighborhood || item.cidade}</>}
                    <span style={{ display: "flex", gap: 8, marginTop: 8 }}>
                      <a href={rota.waze} target="_blank" rel="noreferrer">Waze</a>
                      <a href={rota.maps} target="_blank" rel="noreferrer">Google Maps</a>
                    </span>
                  </Popup>
                </CircleMarker>
              );
            })}
          </MapContainer>
          {!loading && marcadores.length === 0 && (
            <div className="absolute inset-x-4 bottom-4 z-[400] rounded-xl bg-card/95 border border-border p-4 text-sm text-center">
              <MapIcon className="w-5 h-5 mx-auto mb-1 text-accent-ink" aria-hidden="true" />
              Nada com localização por aqui ainda. Veja o <button type="button" className="font-600 underline" onClick={() => setBrasil(true)}>Brasil todo</button>.
            </div>
          )}
        </div>
        <p className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5"><span className="w-3 h-3 rounded-full" style={{ background: COR.lugar.fillColor }} aria-hidden="true" /> Lugares</span>
          <span className="inline-flex items-center gap-1.5"><span className="w-3 h-3 rounded-full" style={{ background: COR.evento.fillColor }} aria-hidden="true" /> Eventos</span>
        </p>
      </section>
    </Layout>
  );
}
