import React, { useEffect, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, UserPlus, CheckCircle2, Ticket } from "lucide-react";

export default function InscricaoSection({ eventoId }) {
  const [status, setStatus] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [form, setForm] = useState(() => {
    const q = new URLSearchParams(window.location.search);
    return {
      name: (q.get("nome") || "").trim(),
      email: (q.get("email") || "").trim(),
      phone: (q.get("telefone") || "").trim(),
      codigo: (q.get("codigo") || "").trim().toUpperCase(),
    };
  });
  const autoRef = useRef(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const loadStatus = async () => {
    try {
      const res = await base44.functions.invoke("statusInscricoesEvento", { evento_id: eventoId });
      setStatus(res.data);
    } catch {
      setStatus(null);
    } finally {
      setLoadingStatus(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, [eventoId]);

  // Link do e-mail com ?codigo=&nome=&email= inscreve direto, sem o participante digitar nada.
  useEffect(() => {
    if (autoRef.current || loadingStatus || !status) return;
    if (status.convite_obrigatorio && form.codigo && form.name && form.email) {
      autoRef.current = true;
      handleSubmit();
    }
  }, [loadingStatus, status]);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError("");
    if (!form.name.trim() || !form.email.trim()) {
      setError("Informe nome e e-mail.");
      return;
    }
    if (status?.convite_obrigatorio && !form.codigo.trim()) {
      setError("Informe o código do convite.");
      return;
    }
    setSubmitting(true);
    setResult(null);
    try {
      const res = await base44.functions.invoke("inscreverEvento", {
        evento_id: eventoId,
        name: form.name,
        email: form.email,
        phone: form.phone,
        codigo: form.codigo,
      });
      const data = res.data;
      if (data.ok) {
        setResult("ok");
        setForm({ name: "", email: "", phone: "", codigo: "" });
        loadStatus();
      } else if (data.duplicate) {
        setResult("duplicate");
      } else if (data.codigo_invalido) {
        setError("Código inválido ou já utilizado. Confira com o organizador.");
      } else if (data.full) {
        setResult("full");
      } else if (data.error) {
        setError(data.error);
      }
    } catch (err) {
      setError(err?.message || "Erro ao inscrever.");
    } finally {
      setSubmitting(false);
    }
  };

  const full = status?.has_vagas && status?.full;
  const capacityLabel = loadingStatus
    ? "Carregando status de inscrições"
    : status?.has_vagas
      ? full
        ? "Vagas esgotadas"
        : `${status.available} vaga${status.available === 1 ? "" : "s"} restante${status.available === 1 ? "" : "s"} de ${status.vagas}`
      : "Inscrições abertas — sem limite de vagas";

  return (
    <div
      className="mt-6 p-5 rounded-2xl bg-accent/10 border border-accent/30"
      data-has-vagas={status?.has_vagas ? "true" : "false"}
      aria-label={capacityLabel}
    >
      <div className="flex items-center gap-2 mb-1">
        <UserPlus className="w-5 h-5 text-accent-ink" />
        <h2 className="font-display font-700 text-lg">Inscrever-se</h2>
      </div>
      {loadingStatus ? (
        <p className="text-sm text-muted-foreground">Carregando…</p>
      ) : status?.has_vagas ? (
        <p className="text-sm text-muted-foreground">
          {full
            ? "Vagas esgotadas"
            : `${status.available} vaga${status.available === 1 ? "" : "s"} restante${status.available === 1 ? "" : "s"} de ${status.vagas}`}
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">
          Inscrições abertas
        </p>
      )}

      <div role="status" aria-live="polite">
        {result === "ok" && (
          <div className="mt-3 flex items-center gap-2 text-sm text-primary font-600">
            <CheckCircle2 className="w-4 h-4" aria-hidden="true" /> Inscrição confirmada! Até logo.
          </div>
        )}
        {result === "duplicate" && (
          <p className="mt-3 text-sm text-muted-foreground">Você já está inscrito neste evento.</p>
        )}
        {result === "full" && (
          <p className="mt-3 text-sm text-destructive">As vagas acabaram.</p>
        )}
      </div>

      {result !== "ok" && !full && (
        <form onSubmit={handleSubmit} className="mt-4 space-y-3" aria-label="Formulário de inscrição">
          <div className="space-y-1.5">
            <Label htmlFor="insc-nome">Nome *</Label>
            <Input data-testid="inputNome" id="insc-nome" name="name" autoComplete="name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="insc-email">E-mail *</Label>
            <Input data-testid="inputEmail" id="insc-email" name="email" type="email" autoComplete="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="insc-phone">Telefone (opcional)</Label>
            <Input data-testid="inputPhone" id="insc-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="(61) ..." />
          </div>
          {status?.convite_obrigatorio && (
            <div className="space-y-1.5">
              <Label htmlFor="insc-codigo">Código do convite *</Label>
              <Input id="insc-codigo" name="codigo" autoCapitalize="characters" autoComplete="off" value={form.codigo} onChange={(e) => setForm((f) => ({ ...f, codigo: e.target.value }))} placeholder="Código que você recebeu na compra" />
              <p className="text-xs text-muted-foreground flex items-center gap-1"><Ticket className="w-3 h-3" aria-hidden="true" /> Este evento tem convite pago: cada código vale uma inscrição.</p>
            </div>
          )}
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <Button type="submit" data-testid="SubmitButton" disabled={submitting} className="bg-primary text-primary-foreground hover:bg-primary/90">
            {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <UserPlus className="w-4 h-4 mr-2" />}
            Confirmar inscrição
          </Button>
        </form>
      )}
    </div>
  );
}