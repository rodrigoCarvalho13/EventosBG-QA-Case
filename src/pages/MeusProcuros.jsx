import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import Layout from "@/components/Layout";
import LogoSpinner from "@/components/LogoSpinner";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { canal, procuraPath, quandoPostou, vencido } from "@/lib/procuro";
import { ArrowLeft, Megaphone, Pencil, Plus, Trash2 } from "lucide-react";

export default function MeusProcuros() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [itens, setItens] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        // Admin vê e modera todos; os demais só os próprios.
        const dono = user.role === "admin" ? {} : { created_by_id: user.id };
        const page = await base44.entities.Procura.filter(dono, { sort: "-created_date", limit: 500 });
        setItens(page.items || []);
      } catch (e) {
        // ignore
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const atualizar = async (p, dados, erro) => {
    try {
      const salvo = await base44.entities.Procura.update(p.id, dados);
      setItens((l) => l.map((x) => (x.id === p.id ? { ...x, ...salvo } : x)));
    } catch (e) {
      toast({ title: erro, variant: "destructive" });
    }
  };

  const excluir = async (id) => {
    if (!confirm("Excluir este anúncio?")) return;
    try {
      await base44.entities.Procura.delete(id);
      setItens((l) => l.filter((x) => x.id !== id));
    } catch (e) {
      toast({ title: "Não foi possível excluir o anúncio", variant: "destructive" });
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-10 sm:py-14">
        <Link to="/painel" className="inline-flex items-center gap-1.5 py-2 -my-2 text-sm text-muted-foreground hover:text-foreground mb-5">
          <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Painel
        </Link>
        <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
          <div>
            <h1 className="font-display font-700 text-3xl">Meus anúncios “Procuro”</h1>
            <p className="text-muted-foreground">Cada anúncio fica no ar por 60 dias. Renove se ainda estiver procurando.</p>
          </div>
          <Button asChild>
            <Link to="/painel/procuro/novo"><Plus className="w-4 h-4 mr-1.5" aria-hidden="true" /> Novo anúncio</Link>
          </Button>
        </div>

        {loading ? (
          <LogoSpinner />
        ) : itens.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border p-10 text-center text-muted-foreground">
            <Megaphone className="w-8 h-8 mx-auto mb-2 text-accent-ink" aria-hidden="true" />
            Você ainda não anunciou nada. <Link to="/procuro" className="font-600 text-primary dark:text-accent hover:underline">Veja como funciona</Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {itens.map((p) => {
              const expirou = p.status === "ativo" && vencido(p);
              return (
                <li key={p.id} className="rounded-2xl bg-card border border-border card-shadow p-4 flex flex-wrap items-center gap-3">
                  <div className="flex-1 min-w-[12rem]">
                    <Link to={procuraPath(p)} className="font-display font-700 text-lg hover:underline break-words">{p.titulo}</Link>
                    <p className="text-sm text-muted-foreground">
                      {canal(p.canal).curto} · {quandoPostou(p.renovado_em || p.created_date)} ·{" "}
                      <span className={p.status === "encerrado" || expirou ? "text-destructive font-600" : "text-primary dark:text-accent font-600"}>
                        {p.status === "encerrado" ? "Encerrado" : expirou ? "Expirado" : "No ar"}
                      </span>
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {(expirou || p.status === "encerrado") && (
                      <Button variant="outline" size="sm" onClick={() => atualizar(p, { status: "ativo", renovado_em: new Date().toISOString() }, "Não foi possível renovar")}>
                        Renovar
                      </Button>
                    )}
                    {p.status === "ativo" && !expirou && (
                      <Button variant="outline" size="sm" onClick={() => atualizar(p, { status: "encerrado" }, "Não foi possível encerrar")}>
                        Achei! Encerrar
                      </Button>
                    )}
                    <Button asChild variant="outline" size="icon" aria-label="Editar anúncio">
                      <Link to={`/painel/procuro/${p.id}`}><Pencil className="w-4 h-4" aria-hidden="true" /></Link>
                    </Button>
                    <Button variant="outline" size="icon" aria-label="Excluir anúncio" onClick={() => excluir(p.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" aria-hidden="true" />
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Layout>
  );
}
