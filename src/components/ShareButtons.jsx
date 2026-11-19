import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle, Facebook, Twitter, Link2, Check, Share2, Send, Instagram } from "lucide-react";

// `url` é o endereço compartilhado; sem ele vale a página atual. Eventos passam o endereço da
// função de prévia, que entrega ao WhatsApp e às redes o cartaz e o texto do evento.
export default function ShareButtons({ title, url: urlCompartilhada }) {
  const [copied, setCopied] = useState(false);
  const [igCopied, setIgCopied] = useState(false);
  const url = urlCompartilhada || (typeof window !== "undefined" ? window.location.href : "");
  const text = `${title} — eventosboardgame.com`;

  const share = (network) => {
    const u = encodeURIComponent(url);
    const t = encodeURIComponent(text);
    const links = {
      whatsapp: `https://wa.me/?text=${t}%20${u}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${u}`,
      twitter: `https://twitter.com/intent/tweet?text=${t}&url=${u}`,
    };
    window.open(links[network], "_blank", "noopener,noreferrer");
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {}
  };

  const shareInstagram = async () => {
    try {
      await navigator.clipboard.writeText(`${text} ${url}`);
      setIgCopied(true);
      setTimeout(() => setIgCopied(false), 3000);
      window.open("https://www.instagram.com", "_blank", "noopener,noreferrer");
    } catch (e) {
      window.open("https://www.instagram.com", "_blank", "noopener,noreferrer");
    }
  };

  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch (e) {}
    } else {
      copy();
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-600 text-muted-foreground flex items-center gap-1.5 mr-1">
        <Share2 className="w-4 h-4" /> Compartilhar:
      </span>
      <Button variant="outline" size="sm" onClick={() => share("whatsapp")} className="border-primary/30 hover:bg-primary/5">
        <MessageCircle className="w-4 h-4 mr-1.5 text-primary" /> WhatsApp
      </Button>
      <Button variant="outline" size="sm" onClick={shareInstagram} className="border-accent/40 hover:bg-accent/10">
        <Instagram className="w-4 h-4 mr-1.5 text-accent-ink" /> {igCopied ? "Cole no Instagram!" : "Instagram"}
      </Button>
      <Button variant="outline" size="sm" onClick={() => share("facebook")}>
        <Facebook className="w-4 h-4 mr-1.5" /> Facebook
      </Button>
      <Button variant="outline" size="sm" onClick={() => share("twitter")}>
        <Twitter className="w-4 h-4 mr-1.5" /> X
      </Button>
      <Button variant="outline" size="sm" onClick={nativeShare} className="sm:hidden">
        <Send className="w-4 h-4 mr-1.5" /> Outros
      </Button>
      <Button variant="outline" size="sm" onClick={copy}>
        {copied ? <Check className="w-4 h-4 mr-1.5 text-primary" /> : <Link2 className="w-4 h-4 mr-1.5" />}
        {copied ? "Copiado!" : "Copiar link"}
      </Button>
    </div>
  );
}