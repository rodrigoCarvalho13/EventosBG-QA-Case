import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import Layout from "@/components/Layout";
import LogoSpinner from "@/components/LogoSpinner";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { tipoLancamento, periodo } from "@/lib/lancamentos";
import { ArrowLeft, PackageOpen, Pencil, Plus, Trash2 } from "lucide-react";

export default function MeusLancamentos() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [itens, setItens] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        // Admin vê e gerencia todos; os demais só os que divulgaram.
        const dono = user.role === "admin" ? {} : { created_by_id: user.id };
        const page = await base44.entities.Lancamento.filter(dono, { sort: "-data_inicio", limit: 500 });
        setItens(page.items || []);
      } catch (e) {
        // ignore
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const alternar = async (l) => {
    const status = l.status === "rascunho" ? "publicado" : "rascunho";
    try {
      await base44.entities.Lancamento.update(l.id, { status });
      setItens((lista) => lista.map((x) => (x.id === l.id ? { ...x, status } : x)));
    } catch (e) {
      toast({ title: "Não foi possível atualizar o lançamento", variant: "destructive" });
    }
  };

  const excluir = async (id) => {
    if (!confirm("Excluir este lançamento?")) return;
    try {
      await base44.entities.Lancamento.delete(id);
      setItens((lista) => lista.filter((x) => x.id !== id));
    } catch (e) {
      toast({ title: "Não foi possível excluir o lançamento", variant: "destructive" });
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
            <h1 className="font-display font-700 text-3xl">Meus lançamentos</h1>
            <p className="text-muted-foreground">Divulgue pré-vendas, campanhas e jogos novos no calendário nacional.</p>
          </div>
          <Button asChild>
            <Link to="/painel/lancamentos/novo"><Plus className="w-4 h-4 mr-1.5" aria-hidden="true" /> Novo lançamento</Link>
          </Button>
        </div>

        {loading ? (
          <LogoSpinner />
        ) : itens.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border p-10 text-center text-muted-foreground">
            <PackageOpen className="w-8 h-8 mx-auto mb-2 text-accent-ink" aria-hidden="true" />
            Você ainda não divulgou nenhum lançamento.
          </div>
        ) : (
          <ul className="space-y-3">
            {itens.map((l) => (
              <li key={l.id} className="rounded-2xl bg-card border border-border card-shadow p-4 flex flex-wrap items-center gap-3">
                <div className="flex-1 min-w-[12rem]">
                  <p className="font-display font-700 text-lg">{l.titulo}</p>
                  <p className="text-sm text-muted-foreground">
                    {l.editora} · {tipoLancamento(l.tipo).label} · {periodo(l)} ·{" "}
                    <span className={l.status === "rascunho" ? "text-destructive font-600" : "text-primary dark:text-accent font-600"}>
                      {l.status === "rascunho" ? "Rascunho" : "Publicado"}
                    </span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => alternar(l)}>
                    {l.status === "rascunho" ? "Publicar" : "Despublicar"}
                  </Button>
                  <Button asChild variant="outline" size="icon" aria-label="Editar lançamento">
                    <Link to={`/painel/lancamentos/${l.id}`}><Pencil className="w-4 h-4" aria-hidden="true" /></Link>
                  </Button>
                  <Button variant="outline" size="icon" aria-label="Excluir lançamento" onClick={() => excluir(l.id)}>
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
