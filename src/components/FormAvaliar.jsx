import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import EstrelasNota from "@/components/EstrelasNota";
import { invocar } from "@/lib/monitoresApi";
import { CRITERIOS_AVALIACAO, validarAvaliacao } from "@/lib/monitores";
import { Loader2 } from "lucide-react";

export default function FormAvaliar({ reservaId, onFeito }) {
  const [criterios, setCriterios] = useState({});
  const [comentario, setComentario] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  const enviar = async (e) => {
    e.preventDefault();
    const checagem = validarAvaliacao({ criterios, comentario });
    if (!checagem.ok) {
      setErro(checagem.erros[0]);
      return;
    }
    setEnviando(true);
    setErro("");
    try {
      const data = await invocar("avaliarMonitor", { reserva_id: reservaId, criterios, comentario });
      onFeito?.(data);
    } catch (err) {
      setErro(err?.message || "Não foi possível enviar a avaliação.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <form onSubmit={enviar} className="space-y-4 rounded-xl border border-border bg-muted/40 p-4">
      <fieldset className="space-y-2">
        <legend className="text-sm font-600">Como foi o atendimento? Toque nas estrelas de cada item.</legend>
        {CRITERIOS_AVALIACAO.map((c) => (
          <div key={c.id} className="flex flex-wrap items-center justify-between gap-x-3">
            <div className="min-w-0">
              <p className="text-sm font-600">{c.label}</p>
              <p className="text-xs text-muted-foreground">{c.dica}</p>
            </div>
            <EstrelasNota
              value={criterios[c.id] || 0}
              onChange={(n) => setCriterios((atual) => ({ ...atual, [c.id]: n }))}
              label={`${c.label}: nota`}
            />
          </div>
        ))}
      </fieldset>
      <div className="space-y-1.5">
        <Label htmlFor={`comentario-${reservaId}`}>Observações (opcional)</Label>
        <Textarea
          id={`comentario-${reservaId}`}
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          maxLength={1000}
          placeholder="Um elogio ou um conselho para o monitor melhorar."
        />
      </div>
      {erro && <p role="alert" className="text-sm text-destructive">{erro}</p>}
      <Button type="submit" disabled={enviando} className="w-full sm:w-auto">
        {enviando ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : null}
        Publicar avaliação
      </Button>
    </form>
  );
}
