import React, { useId, useState } from "react";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { SUGGESTED_TAGS } from "@/lib/tags";

export default function TagInput({ id, value = [], onChange, label = "Tags / Temas", suggestions = SUGGESTED_TAGS, placeholder = "Digite e pressione Enter…" }) {
  const [text, setText] = useState("");
  const [indice, setIndice] = useState(0);
  const listId = useId();
  const inputId = id || `${listId}-campo`;
  const tags = Array.isArray(value) ? value : [];

  // Colar "A, B, C" ou uma lista com uma linha por item cria uma tag para cada item.
  const colar = (e) => {
    const colado = e.clipboardData?.getData("text") || "";
    if (!/[\n\r;,]/.test(colado)) return;
    e.preventDefault();
    const novas = [];
    for (const parte of colado.split(/[\n\r;,]+/)) {
      const limpa = parte.trim().replace(/^#/, "");
      if (limpa && ![...tags, ...novas].some((x) => x.toLowerCase() === limpa.toLowerCase())) novas.push(limpa);
    }
    if (novas.length) onChange([...tags, ...novas]);
    setText("");
  };

  const add = (t) => {
    const clean = String(t || "").trim().replace(/^#/, "");
    if (!clean) return;
    if (tags.some((x) => x.toLowerCase() === clean.toLowerCase())) return;
    onChange([...tags, clean]);
    setText("");
    setIndice(0);
  };

  const remove = (t) => onChange(tags.filter((x) => x !== t));

  const busca = text.trim().replace(/^#/, "");
  const buscaBaixa = busca.toLowerCase();
  const sugestoes = suggestions.filter(
    (s) => !tags.some((t) => t.toLowerCase() === s.toLowerCase()) && (!buscaBaixa || s.toLowerCase().includes(buscaBaixa))
  );
  const opcoes = [];
  if (busca && !tags.some((t) => t.toLowerCase() === buscaBaixa) && !suggestions.some((s) => s.toLowerCase() === buscaBaixa)) {
    opcoes.push({ valor: busca, label: `Adicionar “${busca}”` });
  }
  for (const s of (busca ? sugestoes.slice(0, 8) : [])) opcoes.push({ valor: s, label: s });
  const chips = busca ? [] : sugestoes.slice(0, 16);
  const ativo = opcoes[Math.min(indice, Math.max(opcoes.length - 1, 0))];

  const onKey = (e) => {
    if (e.key === "ArrowDown" && opcoes.length) {
      e.preventDefault();
      setIndice((i) => Math.min(i + 1, opcoes.length - 1));
    } else if (e.key === "ArrowUp" && opcoes.length) {
      e.preventDefault();
      setIndice((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      add(ativo?.valor || text);
    } else if (e.key === ",") {
      e.preventDefault();
      add(text);
    } else if (e.key === "Escape") {
      setText("");
    } else if (e.key === "Backspace" && !text && tags.length) {
      remove(tags[tags.length - 1]);
    }
  };

  return (
    <div className="space-y-1.5">
      <Label htmlFor={inputId}>{label}</Label>
      <div className="relative">
        <div className="flex flex-wrap gap-1.5 min-h-[2.75rem] rounded-md border border-input bg-transparent px-2 py-1.5 focus-within:ring-1 focus-within:ring-ring">
          {tags.map((t) => (
            <span
              key={t}
              className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary text-sm sm:text-xs font-600 pl-3 pr-1 py-0.5 sm:pl-2"
            >
              {t}
              <button type="button" onClick={() => remove(t)} className="grid place-items-center w-8 h-8 sm:w-5 sm:h-5 rounded-full hover:text-destructive hover:bg-destructive/10" aria-label={`Remover ${t}`}>
                <X className="w-3.5 h-3.5 sm:w-3 sm:h-3" aria-hidden="true" />
              </button>
            </span>
          ))}
          <input
            id={inputId}
            aria-label={label}
            value={text}
            role="combobox"
            aria-expanded={opcoes.length > 0}
            aria-controls={opcoes.length ? listId : undefined}
            aria-autocomplete="list"
            aria-activedescendant={ativo ? `${listId}-${Math.min(indice, opcoes.length - 1)}` : undefined}
            onChange={(e) => { setText(e.target.value); setIndice(0); }}
            onKeyDown={onKey}
            onPaste={colar}
            placeholder={tags.length ? "" : placeholder}
            className="flex-1 min-w-[8rem] min-h-11 bg-transparent text-base sm:text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        {opcoes.length > 0 && (
          <ul id={listId} role="listbox" aria-label={label} className="absolute z-30 mt-1 max-h-64 w-full overflow-auto rounded-md border border-border bg-popover p-1 shadow-md">
            {opcoes.map((opcao, i) => (
              <li key={opcao.label} id={`${listId}-${i}`} role="option" aria-selected={i === indice}>
                <button
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); add(opcao.valor); }}
                  className={`flex min-h-11 w-full items-center rounded-md px-3 text-left text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${i === indice ? "bg-muted" : ""}`}
                >
                  {opcao.label}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      {chips.length > 0 && (
        <div className="flex flex-wrap gap-2 sm:gap-1.5 pt-1">
          {chips.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => add(s)}
              className="min-h-11 sm:min-h-0 rounded-full border border-border text-sm sm:text-xs font-500 px-3 py-2 sm:px-2 sm:py-0.5 text-muted-foreground hover:border-primary/50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
