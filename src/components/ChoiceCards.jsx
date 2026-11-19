import React, { useId } from "react";

// Opções em forma de cartão, feitas com <input type="radio"> nativo: funcionam
// igual em qualquer navegador (inclusive Safari do iPad/iPhone), com teclado e
// leitor de tela. O cartão inteiro é a área de toque.
export default function ChoiceCards({ label, value, onChange, options, columns = 2, required = false }) {
  const name = useId();
  const cols = { 2: "grid-cols-2", 3: "grid-cols-1 sm:grid-cols-3", 4: "grid-cols-2 sm:grid-cols-4" }[columns] || "grid-cols-2";
  return (
    <fieldset className="space-y-1.5">
      <legend className="text-sm font-medium leading-none mb-1.5">
        {label}
        {required ? " *" : ""}
      </legend>
      <div className={`grid ${cols} gap-3`}>
        {options.map(({ value: v, label: l, icon: Icon, hint }) => {
          const checked = value === v;
          return (
            <label
              key={v}
              className={`relative flex items-center gap-2 px-4 py-3 min-h-[48px] rounded-xl border-2 text-sm font-600 cursor-pointer select-none transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring ${
                checked ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:border-primary/40"
              }`}
            >
              <input
                type="radio"
                name={name}
                value={v}
                checked={checked}
                onChange={() => onChange(v)}
                className="sr-only"
              />
              {Icon && <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />}
              <span className="leading-tight">
                {l}
                {hint && <span className="block text-xs font-500 text-muted-foreground">{hint}</span>}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
