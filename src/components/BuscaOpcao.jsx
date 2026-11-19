import React, { useId, useMemo, useState } from "react";
import { semAcento } from "@/lib/monitores";

export default function BuscaOpcao({ id, rotulo, value, onChange, opcoes = [], placeholder = "Buscar…", vazio }) {
  const listId = useId();
  const [aberto, setAberto] = useState(false);
  const [texto, setTexto] = useState("");
  const [indice, setIndice] = useState(0);
  const busca = semAcento(texto);
  const lista = useMemo(() => {
    const filtradas = opcoes.filter((opcao) => !busca || semAcento(opcao).includes(busca));
    const itens = filtradas.slice(0, 60).map((opcao) => ({ valor: opcao, label: opcao }));
    return vazio ? [{ valor: "all", label: vazio }, ...itens] : itens;
  }, [opcoes, busca, vazio]);
  const mostrado = !value || value === "all" ? (vazio || placeholder) : value;

  const escolher = (valor) => {
    onChange(valor);
    setTexto("");
    setAberto(false);
  };

  const campo = "flex h-11 lg:h-9 w-full items-center rounded-md border border-input bg-transparent px-3 text-base lg:text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  return (
    <div className="relative">
      <label htmlFor={id} className="sr-only">{rotulo}</label>
      {aberto ? (
        <input
          id={id}
          value={texto}
          autoFocus
          placeholder={placeholder}
          role="combobox"
          aria-expanded="true"
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={lista[indice] ? `${listId}-${indice}` : undefined}
          onChange={(e) => { setTexto(e.target.value); setIndice(0); }}
          onBlur={() => setAberto(false)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setIndice((i) => Math.min(i + 1, Math.max(lista.length - 1, 0)));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setIndice((i) => Math.max(i - 1, 0));
            } else if (e.key === "Enter") {
              e.preventDefault();
              if (lista[indice]) escolher(lista[indice].valor);
            } else if (e.key === "Escape") {
              setAberto(false);
              setTexto("");
            }
          }}
          className={campo}
        />
      ) : (
        <button type="button" id={id} aria-haspopup="listbox" aria-expanded="false" onClick={() => { setAberto(true); setIndice(0); }} className={`${campo} text-left`}>
          <span className="truncate">{mostrado}</span>
        </button>
      )}
      {aberto && (
        <ul id={listId} role="listbox" aria-label={rotulo} className="absolute z-30 mt-1 max-h-64 w-full overflow-auto rounded-md border border-border bg-popover p-1 shadow-md">
          {lista.length === 0 ? (
            <li className="px-3 py-3 text-sm text-muted-foreground">Nenhum resultado</li>
          ) : lista.map((item, i) => (
            <li key={item.valor} id={`${listId}-${i}`} role="option" aria-selected={value === item.valor}>
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); escolher(item.valor); }}
                className={`flex min-h-11 w-full items-center rounded-md px-3 text-left text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${i === indice ? "bg-muted" : ""}`}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
