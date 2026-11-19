import React, { useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import MapLinksNewTab from "@/components/MapLinksNewTab";
import { LocateFixed, Map as MapIcon, Search, X } from "lucide-react";

const BSB_CENTER = [-15.7939, -47.8828];

function ClickHandler({ onClick }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng);
    },
  });
  return null;
}

export default function MapPicker({ value, onChange, enderecoBusca = "" }) {
  const [locating, setLocating] = useState(false);
  const [buscando, setBuscando] = useState(false);
  const [erroBusca, setErroBusca] = useState("");
  const [showMap, setShowMap] = useState(false);
  const lat = value?.latitude;
  const lng = value?.longitude;
  const hasPoint = typeof lat === "number" && typeof lng === "number";
  const center = hasPoint ? [lat, lng] : BSB_CENTER;

  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onChange({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const buscarEndereco = async () => {
    setErroBusca("");
    setBuscando(true);
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=br&q=${encodeURIComponent(enderecoBusca)}`;
      const res = await fetch(url, { headers: { "Accept-Language": "pt-BR" } });
      const [achado] = await res.json();
      if (!achado) {
        setErroBusca("Não achei esse endereço. Tente incluir bairro e cidade, ou marque no mapa.");
      } else {
        onChange({ latitude: parseFloat(achado.lat), longitude: parseFloat(achado.lon) });
        setShowMap(true);
      }
    } catch {
      setErroBusca("Não foi possível buscar o endereço agora. Marque no mapa.");
    } finally {
      setBuscando(false);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <button
          type="button"
          onClick={useMyLocation}
          disabled={locating}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-500 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
        >
          <LocateFixed className="w-4 h-4" aria-hidden="true" />
          {locating ? "Localizando…" : "Usar minha localização"}
        </button>
        {enderecoBusca.trim() && (
          <button
            type="button"
            onClick={buscarEndereco}
            disabled={buscando}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-500 border border-border bg-card hover:bg-muted disabled:opacity-60"
          >
            <Search className="w-4 h-4" aria-hidden="true" />
            {buscando ? "Buscando…" : "Buscar pelo endereço"}
          </button>
        )}
        <button
          type="button"
          id="map-toggle"
          aria-label="Selecionar no mapa"
          aria-expanded={showMap}
          onClick={() => setShowMap((v) => !v)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-500 border border-border bg-card hover:bg-muted"
        >
          {showMap ? <X className="w-4 h-4" aria-hidden="true" /> : <MapIcon className="w-4 h-4" aria-hidden="true" />}
          {showMap ? "Fechar mapa" : "Selecionar no mapa"}
        </button>
        {hasPoint && (
          <span className="text-xs text-muted-foreground font-mono" aria-label={`Coordenadas selecionadas: latitude ${lat.toFixed(5)}, longitude ${lng.toFixed(5)}`} data-testid="gps-coords">
            {lat.toFixed(5)}, {lng.toFixed(5)}
          </span>
        )}
      </div>
      {showMap && (
        <div className="rounded-xl overflow-hidden border border-border h-64 sm:h-72">
          <MapContainer key="map" center={center} zoom={12} scrollWheelZoom={false} className="w-full h-full">
            <MapLinksNewTab />
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap'
            />
            <ClickHandler onClick={(latlng) => onChange({ latitude: latlng.lat, longitude: latlng.lng })} />
            {hasPoint && (
              <CircleMarker center={[lat, lng]} radius={10} pathOptions={{ color: "hsl(152 32% 20%)", fillColor: "hsl(38 80% 50%)", fillOpacity: 0.9 }}>
                <Tooltip direction="top">Local selecionado</Tooltip>
              </CircleMarker>
            )}
          </MapContainer>
        </div>
      )}
      {erroBusca && <p className="mt-1.5 text-xs text-destructive" role="alert">{erroBusca}</p>}
      <p className="mt-1.5 text-xs text-muted-foreground">
        {showMap ? "Clique no mapa para marcar a localização exata." : "Use o GPS ou abra o mapa para marcar a localização exata."}
      </p>
    </div>
  );
}