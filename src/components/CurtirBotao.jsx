import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Heart } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { alternarCurtida, assinarCurtidas, lerCurtidas, pedirCurtidas } from "@/lib/curtidas";

// Coração com a contagem de curtidas. Fica no canto do card, fora do link do card.
// O botão é pequeno; a área de toque (before:) continua com 44px para o dedo acertar.
export function CurtirBotao({ tipo, id, className = "" }) {
  const { user } = useAuth();
  const location = useLocation();
  const [, forcar] = useState(0);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (!id) return undefined;
    const sair = assinarCurtidas(tipo, id, () => forcar((n) => n + 1));
    pedirCurtidas(tipo, id, user?.id);
    forcar((n) => n + 1);
    return sair;
  }, [tipo, id, user?.id]);

  if (!id) return null;
  const e = lerCurtidas(tipo, id);
  const total = e?.total || 0;
  const curtido = !!e?.meu;
  const rotuloTotal = `${total} ${total === 1 ? "curtida" : "curtidas"}`;
  const visual = `inline-flex h-7 min-w-7 items-center justify-center gap-1 rounded-full bg-black/45 px-2 text-[11px] font-700 text-white backdrop-blur-sm transition-colors before:absolute before:-inset-2 before:content-[''] hover:bg-black/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${className}`;
  const conteudo = (
    <>
      <Heart className={`h-3.5 w-3.5 ${curtido ? "fill-red-500 text-red-500" : ""}`} aria-hidden="true" />
      {total > 0 && <span aria-hidden="true" className="tabular-nums">{total}</span>}
    </>
  );

  if (!user) {
    return (
      <Link to={`/login?returnTo=${encodeURIComponent(location.pathname)}`} className={visual} aria-label={`Curtir (${rotuloTotal}). Entre para curtir.`}>
        {conteudo}
      </Link>
    );
  }
  return (
    <button
      type="button"
      className={visual}
      disabled={enviando || !e}
      aria-pressed={curtido}
      aria-label={`${curtido ? "Descurtir" : "Curtir"} (${rotuloTotal})`}
      onClick={async () => {
        setEnviando(true);
        try {
          await alternarCurtida(tipo, id);
        } catch {
          // mantém o estado anterior
        } finally {
          setEnviando(false);
        }
      }}
    >
      {conteudo}
    </button>
  );
}

// Envolve um card e põe o coração no canto superior direito, fora do link do card.
export default function ComCurtir({ tipo, id, children, className = "h-full min-w-0", posicao = "top-2 right-2" }) {
  return (
    <div className={`relative ${className}`}>
      {children}
      <CurtirBotao tipo={tipo} id={id} className={`absolute ${posicao} z-10`} />
    </div>
  );
}
