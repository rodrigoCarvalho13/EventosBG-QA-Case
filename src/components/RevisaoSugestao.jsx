import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, X } from "lucide-react";

// Barra fixa no rodapé da tela: o admin aprova ou rejeita (com motivo opcional)
// sem precisar rolar a página de detalhe.
export default function RevisaoSugestao({ titulo, reviewing, onReview }) {
  const [motivo, setMotivo] = useState("");

  return (
    <div
      role="region"
      aria-label="Revisar sugestão"
      data-testid="revisar-sugestao"
      className="fixed bottom-0 inset-x-0 z-40 border-t border-border bg-card shadow-lg"
    >
      <div className="max-w-4xl mx-auto px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1">
          <label htmlFor="motivo-rejeicao" className="sr-only">
            Motivo da rejeição (opcional)
          </label>
          <Input
            id="motivo-rejeicao"
            name="motivo-rejeicao"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Motivo da rejeição (opcional)"
            maxLength={300}
          />
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            onClick={() => onReview("approved")}
            disabled={reviewing}
            aria-label={`Aprovar sugestão ${titulo}`}
            data-testid="aprovar-sugestao"
            className="flex-1 sm:flex-none bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Check className="w-4 h-4 mr-1.5" aria-hidden="true" /> Aprovar
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => onReview("rejected", motivo)}
            disabled={reviewing}
            aria-label={`Rejeitar sugestão ${titulo}`}
            data-testid="rejeitar-sugestao"
            className="flex-1 sm:flex-none text-destructive border-destructive/40 hover:bg-destructive/10"
          >
            <X className="w-4 h-4 mr-1.5" aria-hidden="true" /> Rejeitar
          </Button>
        </div>
      </div>
    </div>
  );
}