import React from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import MapLinksNewTab from "@/components/MapLinksNewTab";
import { MapPin, Navigation } from "lucide-react";

// Links que abrem o app de navegação (ou o site, no computador) já com a rota.
export function linksDeRota(lat, lng) {
  return {
    waze: `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`,
    maps: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
  };
}

const botao =
  "inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-600 border border-border bg-card hover:border-accent transition-colors";

export default function MapView({ latitude, longitude, name, address }) {
  const hasPoint = typeof latitude === "number" && typeof longitude === "number";
  if (!hasPoint) return null;
  const rota = linksDeRota(latitude, longitude);
  return (
    <div>
    <div className="rounded-xl overflow-hidden border border-border h-64 sm:h-80" role="region" aria-label={`Mapa: ${name}${address ? ` — ${address}` : ""}`} aria-roledescription="mapa interativo">
      <MapContainer center={[latitude, longitude]} zoom={14} scrollWheelZoom={false} className="w-full h-full">
            <MapLinksNewTab />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap'
        />
        <CircleMarker
          center={[latitude, longitude]}
          radius={11}
          pathOptions={{ color: "hsl(152 32% 20%)", fillColor: "hsl(38 80% 50%)", fillOpacity: 0.9 }}
        >
          <Popup>
            <strong>{name}</strong>
            {address ? <><br />{address}</> : null}
            <span style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <a href={rota.waze} target="_blank" rel="noreferrer">Ir com Waze</a>
              <a href={rota.maps} target="_blank" rel="noreferrer">Google Maps</a>
            </span>
          </Popup>
        </CircleMarker>
      </MapContainer>
    </div>
    <div className="mt-2 grid grid-cols-2 gap-2">
      <a href={rota.waze} target="_blank" rel="noreferrer" className={botao}>
        <Navigation className="w-4 h-4" aria-hidden="true" /> Ir com Waze
      </a>
      <a href={rota.maps} target="_blank" rel="noreferrer" className={botao}>
        <MapPin className="w-4 h-4" aria-hidden="true" /> Google Maps
      </a>
    </div>
    </div>
  );
}