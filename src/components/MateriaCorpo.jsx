import React, { useMemo } from "react";
import DOMPurify from "dompurify";
import { filtrarEstilo, repararEntidades, TAGS_HTML } from "@/lib/materias";
import "./editorMateria.css";

let gancho = false;
function preparar() {
  if (gancho || typeof window === "undefined") return;
  gancho = true;
  DOMPurify.addHook("uponSanitizeAttribute", (node, data) => {
    if (data.attrName === "style") {
      data.attrValue = filtrarEstilo(data.attrValue);
      if (!data.attrValue) data.keepAttr = false;
    }
    if (data.attrName === "data-list") {
      if (!/^(bullet|ordered)$/.test(String(data.attrValue || ""))) data.keepAttr = false;
    }
    if (data.attrName === "class") {
      data.attrValue = String(data.attrValue || "")
        .split(/\s+/)
        .filter((item) => /^ql-(?:align-(?:center|right|justify)|size-(?:small|large|huge))$/.test(item))
        .join(" ");
      if (!data.attrValue) data.keepAttr = false;
    }
  });
  DOMPurify.addHook("afterSanitizeAttributes", (node) => {
    if (node.tagName !== "A") return;
    const href = node.getAttribute("href") || "";
    if (!/^https?:\/\//i.test(href) && !/^mailto:/i.test(href)) {
      node.removeAttribute("href");
      return;
    }
    if (/^https?:\/\//i.test(href)) {
      node.setAttribute("target", "_blank");
      node.setAttribute("rel", "noopener noreferrer nofollow");
    }
  });
}

export function htmlMateria(html) {
  preparar();
  return DOMPurify.sanitize(repararEntidades(html), {
    ALLOWED_TAGS: TAGS_HTML,
    ALLOWED_ATTR: ["href", "rel", "target", "class", "style", "data-list"],
    ALLOW_DATA_ATTR: false,
  });
}

export default function MateriaCorpo({ texto }) {
  const html = useMemo(() => htmlMateria(texto), [texto]);
  if (!html || !html.replace(/<[^>]+>/g, "").trim()) {
    return <p className="text-muted-foreground">O texto da matéria aparece aqui.</p>;
  }
  return <div className="materia-corpo max-w-none break-words leading-relaxed [&_p]:mb-4 [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-700 [&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:font-display [&_h3]:text-xl [&_h3]:font-700 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-5 [&_blockquote]:mb-4 [&_blockquote]:border-l-4 [&_blockquote]:border-accent [&_blockquote]:pl-4 [&_blockquote]:text-muted-foreground [&_a]:font-600 [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 dark:[&_a]:text-accent" dangerouslySetInnerHTML={{ __html: html }} />;
}
