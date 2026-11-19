import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import Layout from "@/components/Layout";
import LogoSpinner from "@/components/LogoSpinner";
import SemAcesso from "@/components/SemAcesso";
import { Button } from "@/components/ui/button";
import { listarTudo } from "@/lib/paginar";
import { CAMPOS_MATERIA_LISTA, formatarDataLonga, materiaExcluida, materiaPath, ordenarMaterias, salvarMateria } from "@/lib/materias";
import { Newspaper, Plus } from "lucide-react";

export default function PainelMaterias() {
  const { user } = useAuth();
  const [materias, setMaterias] = useState([]);
  const [denuncias, setDenuncias] = useState([]);
  const [loading, setLoading] = useState(true);
  const admin = user?.role === "admin";

  useEffect(() => {
    if (!admin) {
      setLoading(false);
      return;
    }
    let ativo = true;
    listarTudo(base44.entities.Materia, {}, { sort: "-created_date", limit: 50, fields: CAMPOS_MATERIA_LISTA })
      .then((itens) => { if (ativo) setMaterias(ordenarMaterias(itens.filter((item) => !materiaExcluida(item)))); })
      .catch(() => { if (ativo) setMaterias([]); })
      .finally(() => { if (ativo) setLoading(false); });
    listarTudo(base44.entities.DenunciaMateria, {}, { sort: "-created_date", limit: 50 })
      .then((itens) => { if (ativo) setDenuncias(itens || []); })
      .catch(() => { if (ativo) setDenuncias([]); });
    return () => { ativo = false; };
  }, [admin]);

  return (
    <Layout>
      <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
        <h1 className="mb-2 flex items-center gap-2.5 font-display text-3xl font-700 sm:text-4xl">
          <Newspaper className="h-8 w-8 text-primary" aria-hidden="true" /> Matérias
        </h1>
        {!admin ? (
          <SemAcesso
            titulo="Só a administração modera as matérias"
            texto="Qualquer pessoa logada escreve as suas. Aqui ficam todas as matérias e as denúncias."
          />
        ) : loading ? (
          <LogoSpinner label="Carregando matérias…" />
        ) : (
          <>
            <p className="mb-6 text-muted-foreground">Qualquer pessoa logada publica. Aqui você edita, oculta ou exclui qualquer matéria e vê as denúncias.</p>
            <Button asChild className="mb-6 min-h-11 font-600">
              <Link to="/materias/nova"><Plus className="mr-1.5 h-4 w-4" aria-hidden="true" /> Nova matéria</Link>
            </Button>
            {denuncias.length > 0 && (
              <section className="mb-8" aria-labelledby="denuncias-titulo">
                <h2 id="denuncias-titulo" className="mb-3 font-display text-xl font-700">Denúncias</h2>
                <ul className="space-y-2">
                  {denuncias.map((denuncia) => (
                    <li key={denuncia.id} className="rounded-xl border border-border bg-card p-3 text-sm">
                      <p className="font-600">{denuncia.motivo} · {denuncia.materia_titulo || "Matéria"}</p>
                      <p className="text-muted-foreground">{denuncia.autor_nome || "Alguém"}{denuncia.detalhe ? ` — ${denuncia.detalhe}` : ""}</p>
                      {denuncia.materia_slug && (
                        <Link to={`/materias/${denuncia.materia_slug}`} className="mt-1 inline-flex min-h-11 items-center font-600 text-primary underline dark:text-accent">Abrir matéria</Link>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {materias.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-10 text-center">
                <p className="text-muted-foreground">Nenhuma matéria ainda. A primeira entra no ar quando você publicar.</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {materias.map((materia) => (
                  <li key={materia.id || materia.slug} className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center">
                    <div className="min-w-0 flex-1">
                      <p className="font-display text-lg font-700 break-words">{materia.titulo}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {materia.status === "publicada" ? "Publicada" : materia.status === "oculta" ? "Oculta" : "Rascunho"}
                        {formatarDataLonga(materia.data_evento || materia.publicada_em) ? ` · ${formatarDataLonga(materia.data_evento || materia.publicada_em)}` : ""}
                        {materia.cidade ? ` · ${materia.cidade}` : ""}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {materia.status === "publicada" && (
                        <Button asChild variant="outline" className="min-h-11">
                          <Link to={materiaPath(materia)}>Ver</Link>
                        </Button>
                      )}
                      {materia.status === "publicada" && (
                        <Button type="button" variant="outline" className="min-h-11" onClick={() => salvarMateria({ ocultar: true, id: materia.id }).then(() => setMaterias((lista) => lista.map((item) => item.id === materia.id ? { ...item, status: "oculta", publicada: false } : item))).catch(() => {})}>
                          Ocultar
                        </Button>
                      )}
                      <Button asChild className="min-h-11">
                        <Link to={materia.slug ? `/materias/${materia.slug}/editar` : `/painel/materias/${materia.id}`}>Editar</Link>
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
