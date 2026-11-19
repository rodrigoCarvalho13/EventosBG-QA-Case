import React, { useEffect, useState } from "react";
import { slugDoRegistro, eventoPath } from "@/lib/slug";
import { useParams, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import Layout from "@/components/Layout";
import LogoSpinner from "@/components/LogoSpinner";
import { useGoBack } from "@/hooks/use-go-back";
import EventoForm from "@/components/EventoForm";
import SemAcesso from "@/components/SemAcesso";
import { podeEditar } from "@/lib/permissoes";
import { ArrowLeft } from "lucide-react";

export default function CadastroEvento() {
  const { id } = useParams();
  const navigate = useNavigate();
  const goBack = useGoBack("/painel");
  const { user } = useAuth();
  const isEdit = id && id !== "novo" && id !== "nova";
  const [initial, setInitial] = useState(null);
  const [lojas, setLojas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const lPage = await base44.entities.Loja.filter(
          user.role === "admin" ? {} : { created_by_id: user.id },
          { sort: "-created_date", limit: 500 }
        );
        setLojas(lPage.items || []);
        if (isEdit) {
          const e = await base44.entities.Programacao.get(id);
          setInitial(e);
        }
      } catch (err) {
        setInitial({});
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleSubmit = async (data) => {
    // O endereço amigável nasce com o registro e não muda se o título mudar (os links não quebram).
    const slug = await slugDoRegistro(base44.entities.Programacao, data.title, initial, "evento");
    const payload = { ...data, slug, status: "approved" };
    let saved;
    if (isEdit) {
      saved = await base44.entities.Programacao.update(id, payload);
    } else {
      saved = await base44.entities.Programacao.create(payload);
    }
    navigate(eventoPath(saved));
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
          {isEdit ? "Editar evento" : "Cadastrar evento"}
        </h1>
        <p className="text-muted-foreground mb-8">Cadastre uma mesa fixa ou um evento de data única.</p>

        {loading ? (
          <LogoSpinner />
        ) : isEdit && !initial?.id ? (
          <SemAcesso naoEncontrado />
        ) : isEdit && !podeEditar(user, initial) ? (
          <SemAcesso />
        ) : (
          <div className="rounded-2xl bg-card border border-border card-shadow p-6 sm:p-8">
            <EventoForm
              initialData={initial || {}}
              onSubmit={handleSubmit}
              submitLabel={isEdit ? "Salvar alterações" : "Cadastrar"}
              lojas={lojas}
              onSalvarLocalLoja={async (lojaId, ponto) => {
                await base44.entities.Loja.update(lojaId, ponto);
                setLojas((ls) => ls.map((l) => (l.id === lojaId ? { ...l, ...ponto } : l)));
              }}
            />
          </div>
        )}
      </div>
    </Layout>
  );
}