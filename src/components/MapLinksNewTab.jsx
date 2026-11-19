import { useEffect } from "react";
import { useMap } from "react-leaflet";

// Os créditos do mapa (Leaflet / OpenStreetMap) abriam na mesma aba e tiravam
// a pessoa do site. Aqui eles passam a abrir em nova aba.
export default function MapLinksNewTab() {
  const map = useMap();
  useEffect(() => {
    map.attributionControl?.setPrefix(
      '<a href="https://leafletjs.com" target="_blank" rel="noreferrer">Leaflet</a>'
    );
  }, [map]);
  return null;
}
