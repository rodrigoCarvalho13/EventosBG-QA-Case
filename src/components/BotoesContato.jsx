import React from "react";
import { Button } from "@/components/ui/button";
import { contatoVisivel, linkInstagram, linkWhatsapp } from "@/lib/monitores";
import { Instagram, Mail, MessageCircle } from "lucide-react";

export default function BotoesContato({ contato }) {
  const c = contatoVisivel(contato);
  const zap = linkWhatsapp(c.whatsapp);
  const insta = c.instagram ? linkInstagram(c.instagram) : null;
  if (!zap && !insta && !c.email) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {zap && (
        <Button asChild variant="outline">
          <a href={zap} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="w-4 h-4" aria-hidden="true" /> WhatsApp
          </a>
        </Button>
      )}
      {insta && (
        <Button asChild variant="outline">
          <a href={insta} target="_blank" rel="noopener noreferrer">
            <Instagram className="w-4 h-4" aria-hidden="true" /> Instagram
          </a>
        </Button>
      )}
      {c.email && (
        <Button asChild variant="outline">
          <a href={`mailto:${c.email}`}>
            <Mail className="w-4 h-4" aria-hidden="true" /> E-mail
          </a>
        </Button>
      )}
    </div>
  );
}
