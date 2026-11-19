import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import Layout from "@/components/Layout";
import EventoForm from "@/components/EventoForm";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Lightbulb } from "lucide-react";

export default function SugerirEvento() {
  const navigate = useNavigate();
  const [done, setDone] = useState(false);

  const handleSubmit = async (data) => {
    if (!data.suggested_by_name?.trim() || !data.suggested_by_email?.trim()) {
      throw new Error("Informe seu nome e e-mail.");
    }
    const res = await base44.functions.invoke("sugerirEvento", data);
    if (res?.data?.error) throw new Error(res.data.error);
    setDone(true);
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-10 sm:py-14">
        <h1 className="font-display font-700 text-3xl mb-1 flex items-center gap-2.5">
          <Lightbulb className="w-8 h-8 text-accent-ink" aria-hidden="true" /> Cadastrar evento
        </h1>
        <p className="text-muted-foreground mb-8">
          Você não precisa de conta. Preencha as informações do evento.
        </p>

        {done ? (
          <div className="rounded-2xl bg-card border border-border card-shadow p-8 text-center">
            <CheckCircle2 className="w-14 h-14 text-primary mx-auto mb-4" />
            <h2 className="font-display font-700 text-2xl mb-2">Evento cadastrado!</h2>
            <p className="text-muted-foreground mb-6">
              Obrigado pela contribuição!
            </p>
            <div className="flex justify-center gap-3">
              <Button onClick={() => setDone(false)}>Cadastrar outro</Button>
              <Button asChild variant="outline"><Link to="/">Voltar ao início</Link></Button>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl bg-card border border-border card-shadow p-6 sm:p-8">
            <EventoForm onSubmit={handleSubmit} submitLabel="Cadastrar evento" isSuggestion />
          </div>
        )}
      </div>
    </Layout>
  );
}