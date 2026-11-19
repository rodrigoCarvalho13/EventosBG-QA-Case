import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import Layout from "@/components/Layout";
import LogoSpinner from "@/components/LogoSpinner";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { listarTudo } from "@/lib/paginar";
import { CAMPOS_MATERIA_LISTA, formatarDataLonga, materiaExcluida, materiaPath, ordenarMaterias, salvarMateria } from "@/lib/materias";
import { Newspaper, Plus } from "lucide-react";

const ROTULO = { publicada: "Publicada", oculta: "Oculta", rascunho: "Rascunho" };

export default function MinhasMaterias() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [materias, setMaterias] = useState([]);
  const [loading, setLoading] = useState(true);

  const carregar = () => {
    if (!user?.id) return;
    setLoading(true);
    listarTudo(base44.entities.Materia, { owner_id: user.id }, { sort: "-created_date", limit: 50, fields: CAMPOS_MATERIA_LISTA })
      .then((itens) => setMaterias(ordenarMaterias(itens.filter((item) => !materiaExcluida(item)))))
      .catch(() => setMaterias([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { carregar(); }, [user?.id]);

  const excluir = async (materia) => {
    if (!window.confirm(`Excluir “${materia.titulo}”?`)) return;
    try {
      await salvarMateria({ excluir: true, id: materia.id });
      toast({ title: "Matéria excluída" });
      setMaterias((lista) => lista.filter((item) => item.id !== materia.id));
    } catch (err) {
      toast({ title: "Não foi possível excluir", description: err.message, variant: "destructive" });
    }
  };

  return (
    <Layout>
      <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
        <h1 className="mb-2 flex items-center gap-2.5 font-display text-3xl font-700 sm:text-4xl">
          <Newspaper className="h-8 w-8 text-primary" aria-hidden="true" /> Minhas matérias
        </h1>
        <p className="mb-6 text-muted-foreground">Rascunho e oculta ficam fora da listagem pública. Publicar coloca no ar na hora.</p>
        <Button asChild className="mb-6 min-h-11 font-600">
          <Link to="/materias/nova"><Plus className="mr-1.5 h-4 w-4" aria-hidden="true" /> Escrever matéria</Link>
        </Button>
        {loading ? (
          <LogoSpinner label="Carregando suas matérias…" />
        ) : materias.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center">
            <p className="text-muted-foreground">Você ainda não escreveu nenhuma matéria.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {materias.map((materia) => (
              <li key={materia.id} className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                  <p className="font-display text-lg font-700 break-words">{materia.titulo}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {ROTULO[materia.status] || "Rascunho"}
                    {formatarDataLonga(materia.data_evento || materia.publicada_em) ? ` · ${formatarDataLonga(materia.data_evento || materia.publicada_em)}` : ""}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {materia.status === "publicada" && (
                    <Button asChild variant="outline" className="min-h-11"><Link to={materiaPath(materia)}>Ver</Link></Button>
                  )}
                  <Button asChild className="min-h-11"><Link to={materia.slug ? `/materias/${materia.slug}/editar` : `/painel/materias/${materia.id}`}>Editar</Link></Button>
                  <Button type="button" variant="destructive" className="min-h-11" onClick={() => excluir(materia)}>Excluir</Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Layout>
  );
}
