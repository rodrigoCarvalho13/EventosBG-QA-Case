import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, CalendarDays, Store, PlusCircle, UserRound } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";

// Barra de navegação fixa no rodapé, no celular (estilo app).
// Fica escondida nas telas de formulário, que têm o próprio botão fixo de salvar.
const ESCONDER_EM = [/^\/painel\/(eventos|lojas)\//, /^\/sugerir/, /^\/painel\/monitor$/, /^\/painel\/vagas\/.+/, /^\/painel\/materias\/.+/];

export default function BottomNav() {
  const { pathname } = useLocation();
  const { isAuthenticated } = useAuth();
  if (ESCONDER_EM.some((r) => r.test(pathname))) return null;

  const itens = [
    { to: "/", label: "Início", icon: Home, exact: true },
    { to: "/eventos", label: "Agenda", icon: CalendarDays },
    { to: "/cadastrar", label: "Cadastrar", icon: PlusCircle, destaque: true },
    { to: "/lojas", label: "Lugares", icon: Store },
    { to: isAuthenticated ? "/painel" : "/login", label: isAuthenticated ? "Painel" : "Entrar", icon: UserRound },
  ];
  const ativo = (i) => (i.exact ? pathname === i.to : pathname.startsWith(i.to));

  return (
    <nav
      aria-label="Navegação rápida"
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-card/90 backdrop-blur-lg border-t border-border pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="grid grid-cols-5">
        {itens.map((i) => {
          const on = ativo(i);
          const Icon = i.icon;
          return (
            <li key={i.label}>
              <Link
                to={i.to}
                aria-current={on ? "page" : undefined}
                className={`flex flex-col items-center justify-center gap-0.5 h-16 text-xs font-600 transition-colors ${
                  on ? "text-primary dark:text-accent" : "text-muted-foreground"
                }`}
              >
                {i.destaque ? (
                  <span className="grid place-items-center w-11 h-11 -mt-5 rounded-full bg-accent text-accent-foreground shadow-lg ring-4 ring-card">
                    <Icon className="w-6 h-6" aria-hidden="true" />
                  </span>
                ) : (
                  <span className={`grid place-items-center w-12 h-7 rounded-full transition-colors ${on ? "bg-primary/10 dark:bg-accent/15" : ""}`}>
                    <Icon className="w-5 h-5" aria-hidden="true" />
                  </span>
                )}
                {i.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export const temBottomNav = (pathname) => !ESCONDER_EM.some((r) => r.test(pathname));
