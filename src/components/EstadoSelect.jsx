import React from "react";
import { MapPin } from "lucide-react";
import { ESTADOS, useEstado } from "@/lib/regiao";

export default function EstadoSelect({ className = "" }) {
  const { sigla, setEstado } = useEstado();
  return (
    <label className={`relative inline-flex items-center ${className}`}>
      <span className="sr-only">Estado</span>
      <MapPin className="w-4 h-4 absolute left-2.5 text-accent-ink pointer-events-none" aria-hidden="true" />
      <select
        title="Estado"
        value={sigla}
        onChange={(e) => setEstado(e.target.value)}
        className="h-11 lg:h-10 w-[4.75rem] appearance-none rounded-lg border border-border bg-card pl-8 pr-2 text-sm font-600 text-foreground cursor-pointer hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {ESTADOS.map((e) => (
          <option key={e.sigla} value={e.sigla}>{e.sigla}</option>
        ))}
      </select>
    </label>
  );
}
