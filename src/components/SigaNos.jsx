import React from "react";
import { Globe, MessageCircle } from "lucide-react";
import PlataformaIcon from "@/components/PlataformaIcon";
import { linkPerfil } from "@/lib/videos";
import { normalizeUrl, whatsappLink } from "@/lib/eventoInfo";

const REDES = [
  ["instagram", "Instagram"],
  ["facebook", "Facebook"],
  ["youtube", "YouTube"],
  ["tiktok", "TikTok"],
];

// "Siga-nos": todas as redes que o organizador/loja preencheu no cadastro.
export default function SigaNos({ item, className = "" }) {
  const links = REDES.filter(([r]) => item[r]).map(([r, label]) => ({
    key: r,
    label,
    href: linkPerfil(r, item[r]),
    icon: <PlataformaIcon platform={r} className="w-4 h-4" />,
  }));
  if (whatsappLink(item.whatsapp)) {
    links.push({ key: "whatsapp", label: "WhatsApp", href: whatsappLink(item.whatsapp), icon: <MessageCircle className="w-4 h-4" aria-hidden="true" /> });
  }
  if (normalizeUrl(item.website)) {
    links.push({ key: "site", label: "Site", href: normalizeUrl(item.website), icon: <Globe className="w-4 h-4" aria-hidden="true" /> });
  }
  if (!links.length) return null;

  return (
    <section className={className} aria-labelledby="siga-nos">
      <h2 id="siga-nos" className="font-display text-lg font-700 mb-3">Siga-nos</h2>
      <div className="flex flex-wrap gap-2">
        {links.map((l) => (
          <a
            key={l.key}
            href={l.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 min-h-[44px] px-4 rounded-xl border border-border bg-card text-sm font-600 hover:bg-muted transition-colors"
          >
            <span className="text-primary dark:text-accent">{l.icon}</span>
            {l.label}
          </a>
        ))}
      </div>
    </section>
  );
}
