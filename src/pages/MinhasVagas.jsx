import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import Layout from "@/components/Layout";
import LogoSpinner from "@/components/LogoSpinner";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { vagaPath } from "@/lib/vagas";
import { ArrowLeft, Briefcase, Pencil, Plus, Trash2 } from "lucide-react";

export default function MinhasVagas() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [vagas, setVagas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        // Admin vê e gerencia todas; os demais só as que anunciaram.
        const dono = user.role === "admin" ? {} : { created_by_id: user.id };
        const page = await base44.entities.Vaga.filter(dono, { sort: "-created_date", limit: 500 });
        setVagas(page.items || []);
      } catch (e) {
        // ignore
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const alternar = async (v) => {
    const status = v.status === "encerrada" ? "aberta" : "encerrada";
    try {
      await base44.entities.Vaga.update(v.id, { status });
      setVagas((l) => l.map((x) => (x.id === v.id ? { ...x, status } : x)));
    } catch (e) {
      toast({ title: "Não foi possível atualizar a vaga", variant: "destructive" });
    }
  };

  const excluir = async (id) => {
    if (!confirm("Excluir esta vaga?")) return;
    try {
      await base44.entities.Vaga.delete(id);
      setVagas((l) => l.filter((x) => x.id !== id));
    } catch (e) {
      toast({ title: "Não foi possível excluir a vaga", variant: "destructive" });
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-10 sm:py-14">
        <Link to="/painel" className="inline-flex items-center gap-1.5 py-2 -my-2 text-sm text-muted-foreground hover:text-foreground mb-5">
          <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Painel
        </Link>
        <div className="flex items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="font-display font-700 text-3xl">Minhas vagas</h1>
            <p className="text-muted-foreground">Anuncie o perfil que você procura e receba currículos por e-mail.</p>
          </div>
          <Button asChild>
            <Link to="/painel/vagas/nova"><Plus className="w-4 h-4 mr-1.5" aria-hidden="true" /> Nova vaga</Link>
          </Button>
        </div>

        {loading ? (
          <LogoSpinner />
        ) : vagas.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border p-10 text-center text-muted-foreground">
            <Briefcase className="w-8 h-8 mx-auto mb-2 text-accent-ink" aria-hidden="true" />
            Você ainda não anunciou nenhuma vaga.
          </div>
        ) : (
          <ul className="space-y-3">
            {vagas.map((v) => (
              <li key={v.id} className="rounded-2xl bg-card border border-border card-shadow p-4 flex flex-wrap items-center gap-3">
                <div className="flex-1 min-w-[12rem]">
                  <Link to={vagaPath(v)} className="font-display font-700 text-lg hover:underline">{v.titulo}</Link>
                  <p className="text-sm text-muted-foreground">
                    {v.empresa} ·{" "}
                    <span className={v.status === "encerrada" ? "text-destructive font-600" : "text-primary dark:text-accent font-600"}>
                      {v.status === "encerrada" ? "Encerrada" : "Aberta"}
                    </span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => alternar(v)}>
                    {v.status === "encerrada" ? "Reabrir" : "Encerrar"}
                  </Button>
                  <Button asChild variant="outline" size="icon" aria-label="Editar vaga">
                    <Link to={`/painel/vagas/${v.id}`}><Pencil className="w-4 h-4" aria-hidden="true" /></Link>
                  </Button>
                  <Button variant="outline" size="icon" aria-label="Excluir vaga" onClick={() => excluir(v.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" aria-hidden="true" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Layout>
  );
}
