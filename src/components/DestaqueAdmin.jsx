import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { diaISO } from "@/lib/presencas";

const PRAZOS = [7, 15, 30];

// Só admin: liga o plano Destaque de um evento por alguns dias.
export default function DestaqueAdmin({ eventoId }) {
  const [registro, setRegistro] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const hoje = diaISO(new Date());

  useEffect(() => {
    base44.entities.DestaqueEvento.filter({ evento_id: eventoId }, { limit: 1 })
      .then((p) => setRegistro(p.items?.[0] || null))
      .catch(() => {});
  }, [eventoId]);

  const ativo = registro && registro.ate >= hoje;

  const destacar = async (dias) => {
    const d = new Date();
    d.setDate(d.getDate() + dias);
    setSalvando(true);
    try {
      const ate = diaISO(d);
      setRegistro(registro
        ? await base44.entities.DestaqueEvento.update(registro.id, { ate })
        : await base44.entities.DestaqueEvento.create({ evento_id: eventoId, ate }));
    } finally {
      setSalvando(false);
    }
  };

  const remover = async () => {
    setSalvando(true);
    try {
      await base44.entities.DestaqueEvento.delete(registro.id);
      setRegistro(null);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 mt-6">
      <div className="rounded-2xl border border-accent/40 bg-accent/10 p-4 flex flex-wrap items-center gap-3">
        <Star className="w-5 h-5 text-accent-ink" aria-hidden="true" />
        <p className="flex-1 min-w-[12rem] text-sm">
          <span className="font-700">Plano Destaque (admin): </span>
          {ativo ? `em destaque até ${registro.ate.split("-").reverse().join("/")}.` : "este evento não está em destaque."}
        </p>
        {PRAZOS.map((n) => (
          <Button key={n} size="sm" variant="outline" disabled={salvando} onClick={() => destacar(n)}>{n} dias</Button>
        ))}
        {ativo && <Button size="sm" variant="ghost" disabled={salvando} onClick={remover}>Tirar</Button>}
      </div>
    </div>
  );
}
