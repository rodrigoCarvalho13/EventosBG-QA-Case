import React, { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

// Alterna claro/escuro. A escolha fica salva; sem escolha, abre no claro.
export default function ThemeToggle({ className = "" }) {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", dark ? "#0F1F17" : "#1D3E2D");
  }, [dark]);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      // sem storage: vale só nesta visita
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Usar tema claro" : "Usar tema escuro"}
      title={dark ? "Tema claro" : "Tema escuro"}
      className={`grid shrink-0 place-items-center w-11 h-11 lg:w-9 lg:h-9 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors ${className}`}
    >
      {dark ? <Sun className="w-5 h-5" aria-hidden="true" /> : <Moon className="w-5 h-5" aria-hidden="true" />}
    </button>
  );
}
