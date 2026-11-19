import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { aplicarSeo, seoDoCaminho } from "@/lib/seo";

// Aplica o SEO das páginas de endereço fixo (Início, Programação, Lojas...) a cada troca de rota.
// As páginas de registro (evento, loja, podcast, influencer) definem o próprio SEO ao carregar.
export default function SeoRoutes() {
  const { pathname } = useLocation();
  useEffect(() => {
    const cfg = seoDoCaminho(pathname);
    if (cfg) aplicarSeo(cfg);
  }, [pathname]);
  return null;
}
