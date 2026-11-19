import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Check, Hand, Loader2, Users } from "lucide-react";
import { diaDaPresenca, rotuloDia } from "@/lib/presencas";

// Botão "Vou!": mostra quantas pessoas confirmaram a próxima ocorrência e ajuda a fechar mesa.
export default function VouBotao({ evento }) {
  const { user } = useAuth();
  const location = useLocation();
  const dia = diaDaPresenca(evento);
  const [total, setTotal] = useState(0);
  const [minha, setMinha] = useState(null);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!dia) return undefined;
    let ativo = true;
    setLoading(true);
    const filtro = { evento_id: evento.id, data: dia };
    Promise.all([
      base44.entities.Presenca.count(filtro),
      user ? base44.entities.Presenca.filter({ ...filtro, created_by_id: user.id }, { limit: 1 }) : null,
    ])
      .then(([n, meu]) => {
        if (!ativo) return;
        setTotal(n || 0);
        setMinha(meu?.items?.[0]?.id || null);
      })
      .catch(() => {})
      .finally(() => ativo && setLoading(false));
    return () => { ativo = false; };
  }, [evento.id, dia, user]);

  if (!dia) return null;

  const alternar = async () => {
    if (!user || salvando) return;
    setSalvando(true);
    try {
      if (minha) {
        await base44.entities.Presenca.delete(minha);
        setMinha(null);
        setTotal((n) => Math.max(0, n - 1));
      } else {
        const nova = await base44.entities.Presenca.create({ evento_id: evento.id, data: dia });
        setMinha(nova.id);
        setTotal((n) => n + 1);
      }
    } catch (e) {
    } finally {
      setSalvando(false);
    }
  };

  const quando = rotuloDia(dia);
  const resumo = loading
    ? "Carregando…"
    : total === 0
      ? `Ninguém confirmou ainda ${quando.para}. Seja a primeira pessoa!`
      : `${total} ${total === 1 ? "pessoa vai" : "pessoas vão"} ${quando.em}${minha ? ", incluindo você" : ""}.`;

  return (
    <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <span className="grid place-items-center w-11 h-11 rounded-xl bg-accent/25 text-accent-ink shrink-0">
          <Users className="w-5 h-5" aria-hidden="true" />
        </span>
        <p className="text-sm" aria-live="polite">
          <span className="block font-display font-700 text-lg leading-tight">Quem vai?</span>
          <span className="text-muted-foreground">{resumo}</span>
        </p>
      </div>
      {user ? (
        <Button
          onClick={alternar}
          disabled={salvando || loading}
          aria-pressed={!!minha}
          variant={minha ? "secondary" : "default"}
          className="h-11 min-h-11 px-5 font-700 shrink-0"
        >
          {salvando ? (
            <Loader2 className="w-4 h-4 mr-1.5 animate-spin" aria-hidden="true" />
          ) : minha ? (
            <Check className="w-4 h-4 mr-1.5" aria-hidden="true" />
          ) : (
            <Hand className="w-4 h-4 mr-1.5" aria-hidden="true" />
          )}
          {minha ? "Eu vou" : "Vou!"}
        </Button>
      ) : (
        <Button asChild className="h-11 min-h-11 px-5 font-700 shrink-0">
          <Link to={`/login?returnTo=${encodeURIComponent(location.pathname)}`}>
            <Hand className="w-4 h-4 mr-1.5" aria-hidden="true" /> Vou!
          </Link>
        </Button>
      )}
    </div>
  );
}
