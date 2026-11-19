import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Heart, Loader2 } from "lucide-react";

export default function CurtirMonitor({ monitorId, souDono = false }) {
  const { user } = useAuth();
  const location = useLocation();
  const [curtido, setCurtido] = useState(false);
  const [total, setTotal] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    let cancelado = false;
    (async () => {
      try {
        const [minha, quantidade] = await Promise.all([
          user
            ? base44.entities.CurtidaMonitor.filter({ monitor_id: monitorId, created_by_id: user.id }, { limit: 1 })
            : Promise.resolve({ items: [] }),
          base44.entities.CurtidaMonitor.count({ monitor_id: monitorId }),
        ]);
        if (cancelado) return;
        setCurtido((minha.items || []).length > 0);
        setTotal(quantidade);
      } catch {
        // sem contagem: o botão continua usável
      } finally {
        if (!cancelado) setCarregando(false);
      }
    })();
    return () => {
      cancelado = true;
    };
  }, [monitorId, user?.id]);

  const alternar = async () => {
    if (!user || enviando) return;
    setEnviando(true);
    try {
      const minhas = await base44.entities.CurtidaMonitor.filter({ monitor_id: monitorId, created_by_id: user.id }, { limit: 20 });
      const existentes = minhas.items || [];
      if (existentes.length) {
        for (const c of existentes) await base44.entities.CurtidaMonitor.delete(c.id);
        setCurtido(false);
        setTotal((t) => Math.max(0, t - existentes.length));
      } else {
        await base44.entities.CurtidaMonitor.create({ monitor_id: monitorId });
        setCurtido(true);
        setTotal((t) => t + 1);
      }
    } catch {
      // mantém o estado anterior
    } finally {
      setEnviando(false);
    }
  };

  const contagem = total > 0 ? <span className="ml-1.5 text-sm" aria-hidden="true">{total}</span> : null;
  const rotuloTotal = `${total} ${total === 1 ? "curtida" : "curtidas"}`;

  if (souDono) {
    return (
      <span className="inline-flex items-center min-h-11 text-sm text-muted-foreground" aria-label={rotuloTotal}>
        <Heart className="w-4 h-4 mr-1.5" aria-hidden="true" /> {rotuloTotal}
      </span>
    );
  }

  if (!user) {
    return (
      <Button asChild variant="outline" aria-label={`Curtir (${rotuloTotal}). Entre para curtir.`}>
        <Link to={`/login?returnTo=${encodeURIComponent(location.pathname)}`}>
          <Heart className="w-4 h-4 mr-1.5" aria-hidden="true" /> Curtir{contagem}
        </Link>
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={alternar}
      disabled={carregando || enviando}
      aria-pressed={curtido}
      aria-label={`${curtido ? "Descurtir" : "Curtir"} (${rotuloTotal})`}
      className={curtido ? "border-destructive/50 text-destructive" : ""}
    >
      {enviando ? (
        <Loader2 className="w-4 h-4 mr-1.5 animate-spin" aria-hidden="true" />
      ) : (
        <Heart className={`w-4 h-4 mr-1.5 ${curtido ? "fill-current" : ""}`} aria-hidden="true" />
      )}
      {curtido ? "Curtido" : "Curtir"}{contagem}
    </Button>
  );
}
