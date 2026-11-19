import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ESTADOS, getEstadoInfo } from "@/lib/regiao";
import { useCidades } from "@/lib/cidades";

const selectClass = "h-11 w-full rounded-md border border-input bg-background px-3 text-base lg:text-sm";

// Estado + cidade do cadastro (loja, evento ou criador). A cidade é escolhida entre as do estado.
export default function RegiaoFields({ idPrefix, estado, cidade, onChange }) {
  const info = getEstadoInfo(estado);
  const cidades = useCidades(info.sigla);
  // Garante que a cidade já salva apareça mesmo se a lista não a trouxer.
  const opcoes = cidades && cidade && !cidades.includes(cidade) ? [cidade, ...cidades] : cidades;
  return (
    <div className="grid sm:grid-cols-2 gap-4">
      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-estado`}>Estado</Label>
        <select
          id={`${idPrefix}-estado`}
          value={info.sigla}
          onChange={(e) => onChange({ estado: e.target.value, cidade: getEstadoInfo(e.target.value).cidadePadrao })}
          className={selectClass}
        >
          {ESTADOS.map((e) => (
            <option key={e.sigla} value={e.sigla}>{e.nome}</option>
          ))}
        </select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-cidade`}>Cidade</Label>
        {opcoes ? (
          <select
            id={`${idPrefix}-cidade`}
            value={cidade || info.cidadePadrao}
            onChange={(e) => onChange({ cidade: e.target.value })}
            className={selectClass}
          >
            {opcoes.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        ) : (
          <Input
            id={`${idPrefix}-cidade`}
            value={cidade}
            onChange={(e) => onChange({ cidade: e.target.value })}
            placeholder={`Ex. ${info.cidadePadrao}`}
          />
        )}
      </div>
    </div>
  );
}
