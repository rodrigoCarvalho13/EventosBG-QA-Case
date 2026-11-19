import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Filtro de cidade do estado escolhido; some quando há uma cidade só.
export default function CidadeFilter({ cidades, value, onChange, className = "" }) {
  if (cidades.length < 2) return null;
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={`w-full sm:w-48 ${className}`} aria-label="Filtrar por cidade">
        <SelectValue placeholder="Cidade" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Todas as cidades</SelectItem>
        {cidades.map((c) => (
          <SelectItem key={c} value={c}>{c}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
