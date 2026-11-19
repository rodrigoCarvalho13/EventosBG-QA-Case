import React, { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Dices, Search } from "lucide-react";
import { casa } from "@/lib/busca";

const VISIVEIS = 24;

// Jogos que o espaço tem para jogar no local, com busca quando a lista é grande.
export default function AcervoLoja({ jogos }) {
  const [termo, setTermo] = useState("");
  const [todos, setTodos] = useState(false);
  const lista = useMemo(
    () => [...(jogos || [])].filter(Boolean).sort((a, b) => a.localeCompare(b, "pt-BR")),
    [jogos]
  );
  const filtrados = useMemo(() => lista.filter((j) => casa(termo, j)), [lista, termo]);
  if (lista.length === 0) return null;
  const visiveis = todos || termo ? filtrados : filtrados.slice(0, VISIVEIS);

  return (
    <div className="mt-10">
      <h2 className="font-display font-700 text-2xl flex items-center gap-2 mb-1">
        <Dices className="w-6 h-6 text-primary" aria-hidden="true" /> Acervo para jogar
      </h2>
      <p className="text-sm text-muted-foreground mb-4">
        {lista.length} {lista.length === 1 ? "jogo disponível" : "jogos disponíveis"} para jogar no local.
      </p>
      {lista.length > 12 && (
        <div className="relative max-w-sm mb-4">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            value={termo}
            onChange={(e) => setTermo(e.target.value)}
            placeholder="Tem o jogo que você quer?"
            aria-label="Buscar no acervo"
            className="pl-9 h-11"
          />
        </div>
      )}
      {filtrados.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum jogo com esse nome no acervo.</p>
      ) : (
        <ul className="flex flex-wrap gap-2" aria-label="Jogos do acervo">
          {visiveis.map((j) => (
            <li key={j} className="rounded-full border border-border bg-card px-3 py-1.5 text-sm font-500">{j}</li>
          ))}
        </ul>
      )}
      {!todos && !termo && filtrados.length > VISIVEIS && (
        <button
          type="button"
          onClick={() => setTodos(true)}
          className="mt-3 min-h-11 text-sm font-600 text-primary dark:text-accent hover:underline"
        >
          Ver os {filtrados.length} jogos
        </button>
      )}
    </div>
  );
}
