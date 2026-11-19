import { Link, useLocation } from "react-router-dom";
import { useSeo } from "@/lib/seo";
import { useAuth } from "@/lib/AuthContext";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { CalendarDays, Home, Store } from "lucide-react";

export default function PageNotFound() {
  const location = useLocation();
  const pageName = location.pathname.substring(1);
  const { isAuthenticated, user } = useAuth();
  useSeo({ title: "Página não encontrada", noindex: true });

  return (
    <Layout>
      <div className="max-w-lg mx-auto px-4 py-16 sm:py-24 text-center">
        <p className="font-display font-900 text-7xl sm:text-8xl text-primary/25 leading-none">404</p>
        <div className="h-0.5 w-16 bg-accent mx-auto mt-4" />
        <h1 className="mt-6 font-display font-700 text-2xl sm:text-3xl">Página não encontrada</h1>
        <p className="mt-3 text-muted-foreground leading-relaxed">
          A página <span className="font-600 text-foreground">"{pageName}"</span> não existe neste site.
        </p>

        {isAuthenticated && user?.role === "admin" && (
          <div className="mt-8 p-4 bg-accent/10 rounded-xl border border-accent/30 text-left">
            <p className="text-sm font-600">Aviso para admin</p>
            <p className="text-sm text-muted-foreground mt-1">Esta página ainda não foi criada.</p>
          </div>
        )}

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Link to="/">
              <Home className="w-4 h-4 mr-1.5" aria-hidden="true" /> Voltar ao início
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/eventos">
              <CalendarDays className="w-4 h-4 mr-1.5" aria-hidden="true" /> Agenda
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/lojas">
              <Store className="w-4 h-4 mr-1.5" aria-hidden="true" /> Lojas
            </Link>
          </Button>
        </div>
      </div>
    </Layout>
  );
}
