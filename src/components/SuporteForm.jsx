import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, Send } from "lucide-react";

export default function SuporteForm() {
  const [form, setForm] = useState({ nome: "", email: "", assunto: "", mensagem: "" });
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [enviado, setEnviado] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const enviar = async (e) => {
    e.preventDefault();
    setErro("");
    setEnviando(true);
    try {
      const res = await base44.functions.invoke("enviarSuporte", form);
      if (res?.data?.error) throw new Error(res.data.error);
      setEnviado(true);
      setForm({ nome: "", email: "", assunto: "", mensagem: "" });
    } catch (err) {
      setErro(err?.message || "Não foi possível enviar. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  };

  if (enviado) {
    return (
      <div className="rounded-2xl bg-card border border-border card-shadow p-8 text-center">
        <CheckCircle2 className="w-12 h-12 text-primary mx-auto mb-3" aria-hidden="true" />
        <h3 className="font-display font-700 text-xl mb-1">Mensagem enviada!</h3>
        <p className="text-muted-foreground mb-4">Obrigado. Vamos responder pelo e-mail informado.</p>
        <Button variant="outline" onClick={() => setEnviado(false)}>Enviar outra</Button>
      </div>
    );
  }

  return (
    <form onSubmit={enviar} className="rounded-2xl bg-card border border-border card-shadow p-5 space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="sup-nome">Nome</Label>
          <Input id="sup-nome" value={form.nome} onChange={set("nome")} required maxLength={120} autoComplete="name" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="sup-email">E-mail</Label>
          <Input id="sup-email" type="email" value={form.email} onChange={set("email")} required maxLength={200} autoComplete="email" />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="sup-assunto">Assunto</Label>
        <Input id="sup-assunto" value={form.assunto} onChange={set("assunto")} maxLength={200} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="sup-msg">Mensagem</Label>
        <Textarea id="sup-msg" rows={5} value={form.mensagem} onChange={set("mensagem")} required maxLength={4000} />
      </div>
      {erro && <p role="alert" className="text-sm text-destructive">{erro}</p>}
      <Button type="submit" disabled={enviando} className="bg-primary text-primary-foreground hover:bg-primary/90">
        <Send className="w-4 h-4 mr-1.5" aria-hidden="true" /> {enviando ? "Enviando…" : "Enviar mensagem"}
      </Button>
    </form>
  );
}
