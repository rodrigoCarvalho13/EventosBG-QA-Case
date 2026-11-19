import React, { useEffect, useState } from "react";
import { slugDoRegistro, lojaPath } from "@/lib/slug";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import Layout from "@/components/Layout";
import LogoSpinner from "@/components/LogoSpinner";
import { useGoBack } from "@/hooks/use-go-back";
import LojaForm from "@/components/LojaForm";
import SemAcesso from "@/components/SemAcesso";
import { useAuth } from "@/lib/AuthContext";
import { podeEditar } from "@/lib/permissoes";
import { ArrowLeft } from "lucide-react";

export default function CadastroLoja() {
  const { id } = useParams();
  const navigate = useNavigate();
  const goBack = useGoBack("/painel");
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const isEdit = id && id !== "nova";
  const TIPOS = { loja: "loja", luderia: "espaço de jogos", organizador: "grupo", editora: "editora" };
  const tipo = TIPOS[searchParams.get("tipo")] ? searchParams.get("tipo") : "luderia";
  const nomeTipo = TIPOS[tipo];
  const [initial, setInitial] = useState(null);
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        const l = await base44.entities.Loja.get(id);
        setInitial(l);
      } catch (e) {
        setInitial({});
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleSubmit = async (data) => {
    // O endereço amigável nasce com o registro e não muda se o nome mudar (os links não quebram).
    const slug = await slugDoRegistro(base44.entities.Loja, data.name, initial, "loja");
    const payload = { ...data, slug, status: "approved" };
    let saved;
    if (isEdit) {
      saved = await base44.entities.Loja.update(id, payload);
    } else {
      saved = await base44.entities.Loja.create(payload);
    }
    navigate(lojaPath(saved));
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-10 sm:py-14">
        <button
          onClick={goBack}
          className="inline-flex items-center gap-1.5 py-2 -my-2 text-sm text-muted-foreground hover:text-foreground mb-5"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>
        <h1 className="font-display font-700 text-3xl mb-1">
          {isEdit ? "Editar cadastro" : `Cadastrar ${nomeTipo}`}
        </h1>
        <p className="text-muted-foreground mb-8">As informações ficam públicas assim que você salva.</p>

        {isEdit && loading ? (
          <LogoSpinner />
        ) : isEdit && !initial?.id ? (
          <SemAcesso naoEncontrado />
        ) : isEdit && !podeEditar(user, initial) ? (
          <SemAcesso />
        ) : (
          <div className="rounded-2xl bg-card border border-border card-shadow p-6 sm:p-8">
            <LojaForm
              initialData={isEdit ? initial || {} : { type: tipo }}
              onSubmit={handleSubmit}
              submitLabel={isEdit ? "Salvar alterações" : "Cadastrar"}
            />
          </div>
        )}
      </div>
    </Layout>
  );
}