import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import Layout from "@/components/Layout";
import EventoCard from "@/components/EventoCard";
import { Button } from "@/components/ui/button";
import { BellRing, CalendarDays, Store } from "lucide-react";
import { listarTudo, listarPorIds } from "@/lib/paginar";
import { comFotoDaLoja } from "@/components/ArteEvento";
import { ordenarPorProximaData, proximaOcorrencia } from "@/lib/eventStatus";
import { lojaPath } from "@/lib/slug";

// Feed de quem a pessoa segue: os lugares e grupos e os próximos eventos deles.
export default function Seguindo() {
  const { user, isAuthenticated, isLoadingAuth } = useAuth();
  const [lojas, setLojas] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return undefined;
    }
    let ativo = true;
    setLoading(true);
    (async () => {
      try {
        const seguidos = await listarTudo(base44.entities.Seguindo, { created_by_id: user.id }, { limit: 200 });
        const ids = seguidos.map((s) => s.loja_id);
        const [ls, es] = await Promise.all([
          listarPorIds(base44.entities.Loja, "id", ids, { fields: ["name", "slug", "type", "photo_url", "neighborhood", "cidade", "estado", "status"] }),
          listarPorIds(base44.entities.Programacao, "loja_id", ids, { limit: 200 }),
        ]);
        if (!ativo) return;
        const aprovadas = ls.filter((l) => l.status === "approved");
        const fotos = new Map(aprovadas.filter((l) => l.photo_url).map((l) => [l.id, l.photo_url]));
        setLojas(aprovadas.sort((a, b) => (a.name || "").localeCompare(b.name || "", "pt-BR")));
        setEventos(
          ordenarPorProximaData(
            es
              .filter((e) => e.status === "approved")
              .map((e) => ({ ...comFotoDaLoja(e, fotos), _prox: proximaOcorrencia(e) }))
              .filter((e) => e._prox)
          )
        );
      } catch (e) {
        if (ativo) { setLojas([]); setEventos([]); }
      } finally {
        if (ativo) setLoading(false);
      }
    })();
    return () => { ativo = false; };
  }, [user]);

  const vazio = useMemo(() => !loading && lojas.length === 0, [loading, lojas]);

  return (
    <Layout>
      <section className="max-w-6xl mx-auto px-4 pt-10 pb-4">
        <p className="text-xs font-700 uppercase tracking-[0.2em] text-accent-ink mb-2">Seguindo</p>
        <h1 className="font-display font-700 text-3xl sm:text-4xl tracking-tight">Os eventos de quem você segue</h1>
        <p className="text-muted-foreground mt-2 max-w-xl">
          Siga lojas, espaços de jogos e grupos para ver aqui os próximos encontros deles. Quando sair evento novo, você recebe por e-mail e notificação.
        </p>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-6">
        {!isLoadingAuth && !isAuthenticated ? (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center">
            <BellRing className="mx-auto mb-3 h-8 w-8 text-accent-ink" aria-hidden="true" />
            <p className="mx-auto max-w-md text-muted-foreground">Entre na sua conta para seguir lugares e grupos e montar a sua agenda.</p>
            <Button asChild className="mt-4 h-11 min-h-11 font-600">
              <Link to="/login?returnTo=%2Fseguindo">Entrar</Link>
            </Button>
          </div>
        ) : loading || isLoadingAuth ? (
          <ul aria-hidden="true" className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => <li key={i} className="h-72 rounded-2xl bg-muted animate-pulse" />)}
          </ul>
        ) : vazio ? (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center">
            <Store className="mx-auto mb-3 h-8 w-8 text-accent-ink" aria-hidden="true" />
            <p className="mx-auto max-w-md text-muted-foreground">
              Você ainda não segue ninguém. Abra a página de um lugar ou grupo e toque em <strong>Seguir</strong>.
            </p>
            <Button asChild className="mt-4 h-11 min-h-11 font-600">
              <Link to="/lojas">Ver lugares e grupos</Link>
            </Button>
          </div>
        ) : (
          <>
            <h2 className="font-display font-700 text-xl mb-3">Você segue</h2>
            <ul className="flex flex-wrap gap-2 mb-10">
              {lojas.map((l) => (
                <li key={l.id}>
                  <Link
                    to={lojaPath(l)}
                    className="inline-flex items-center gap-2 min-h-11 rounded-full border border-border bg-card pl-1.5 pr-4 py-1.5 text-sm font-600 hover:border-primary/40"
                  >
                    {l.photo_url ? (
                      <img src={l.photo_url} alt="" loading="lazy" className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <span className="grid place-items-center w-8 h-8 rounded-full bg-muted"><Store className="w-4 h-4" aria-hidden="true" /></span>
                    )}
                    {l.name}
                  </Link>
                </li>
              ))}
            </ul>
            <h2 className="font-display font-700 text-xl mb-3">Próximos eventos</h2>
            {eventos.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground">
                <CalendarDays className="w-8 h-8 mx-auto mb-2 text-accent-ink" aria-hidden="true" />
                Nenhum evento marcado por quem você segue. Quando sair um novo, você fica sabendo.
              </div>
            ) : (
              <ul aria-label="Próximos eventos de quem você segue" className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {eventos.map((e) => (
                  <li key={e.id} className="min-w-0"><EventoCard evento={e} /></li>
                ))}
              </ul>
            )}
          </>
        )}
      </section>
    </Layout>
  );
}
