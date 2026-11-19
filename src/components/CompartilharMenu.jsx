import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Check, Facebook, Instagram, Link2, MessageCircle, Send, Share2, Twitter } from "lucide-react";

// Um único botão "Compartilhar" que abre as opções, no lugar de uma fileira de botões.
export default function CompartilharMenu({ title, className = "" }) {
  const [copiado, setCopiado] = useState(false);
  const url = typeof window !== "undefined" ? window.location.href : "";
  const texto = `${title} — eventosboardgame.com`;

  const abrir = (link) => window.open(link, "_blank", "noopener,noreferrer");
  const copiar = async (conteudo = url) => {
    try {
      await navigator.clipboard.writeText(conteudo);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // sem permissão para copiar: nada a fazer
    }
  };
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(texto);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="outline" className={className}>
          {copiado ? <Check className="w-4 h-4 mr-1.5 text-primary" aria-hidden="true" /> : <Share2 className="w-4 h-4 mr-1.5" aria-hidden="true" />}
          {copiado ? "Link copiado" : "Compartilhar"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-48">
        {typeof navigator !== "undefined" && navigator.share && (
          <DropdownMenuItem className="min-h-11" onSelect={() => navigator.share({ title, text: texto, url }).catch(() => {})}>
            <Send className="w-4 h-4 mr-2" aria-hidden="true" /> Enviar para…
          </DropdownMenuItem>
        )}
        <DropdownMenuItem className="min-h-11" onSelect={() => abrir(`https://wa.me/?text=${t}%20${u}`)}>
          <MessageCircle className="w-4 h-4 mr-2" aria-hidden="true" /> WhatsApp
        </DropdownMenuItem>
        <DropdownMenuItem
          className="min-h-11"
          onSelect={() => { copiar(`${texto} ${url}`); abrir("https://www.instagram.com"); }}
        >
          <Instagram className="w-4 h-4 mr-2" aria-hidden="true" /> Instagram (copia o link)
        </DropdownMenuItem>
        <DropdownMenuItem className="min-h-11" onSelect={() => abrir(`https://www.facebook.com/sharer/sharer.php?u=${u}`)}>
          <Facebook className="w-4 h-4 mr-2" aria-hidden="true" /> Facebook
        </DropdownMenuItem>
        <DropdownMenuItem className="min-h-11" onSelect={() => abrir(`https://twitter.com/intent/tweet?text=${t}&url=${u}`)}>
          <Twitter className="w-4 h-4 mr-2" aria-hidden="true" /> X
        </DropdownMenuItem>
        <DropdownMenuItem className="min-h-11" onSelect={() => copiar()}>
          <Link2 className="w-4 h-4 mr-2" aria-hidden="true" /> Copiar link
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
