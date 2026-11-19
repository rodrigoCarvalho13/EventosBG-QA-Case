import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star, Loader2, MessageSquare, CheckCircle2 } from "lucide-react";

function Stars({ value, onChange, size = 16 }) {
  const [hover, setHover] = useState(0);
  const active = hover || value;
  if (!onChange) {
    return (
      <div className="flex items-center gap-0.5" role="img" aria-label={`Nota ${value} de 5`}>
        {[1, 2, 3, 4, 5].map((n) => (
          <Star
            key={n}
            aria-hidden="true"
            style={{ width: size, height: size }}
            className={value >= n ? "fill-accent text-accent" : "text-muted-foreground"}
          />
        ))}
      </div>
    );
  }
  return (
    <div className="flex flex-wrap items-center gap-1" role="group" aria-label="Sua nota">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          aria-label={`${n} estrela${n > 1 ? "s" : ""}`}
          aria-pressed={value === n}
          key={n}
          type="button"
          disabled={!onChange}
          onMouseEnter={() => onChange && setHover(n)}
          onMouseLeave={() => onChange && setHover(0)}
          onClick={() => onChange && onChange(n)}
          className={`p-1 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${onChange ? "cursor-pointer hover:bg-accent/10" : "cursor-default"}`}
        >
          <Star
            aria-hidden="true"
            style={{ width: size, height: size }}
            className={active >= n ? "fill-accent text-accent" : "text-muted-foreground"}
          />
        </button>
      ))}
    </div>
  );
}

export default function ComentariosSection({ lojaId, lojaName }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", rating: 5, text: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await base44.entities.Comentario.filter(
        { loja_id: lojaId, status: "approved" },
        { sort: "-created_date", limit: 50 }
      );
      setComments(res.items || []);
    } catch (e) {
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [lojaId]);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Informe seu nome.");
      return;
    }
    setSubmitting(true);
    setError("");
    setSuccess(false);
    try {
      await base44.entities.Comentario.create({
        loja_id: lojaId,
        name: form.name.trim(),
        rating: form.rating,
        text: form.text.trim(),
      });
      setForm({ name: "", rating: 5, text: "" });
      setSuccess(true);
      await load();
    } catch (err) {
      setError("Não foi possível enviar o comentário. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  const avg = comments.length
    ? (comments.reduce((s, c) => s + (c.rating || 0), 0) / comments.length).toFixed(1)
    : null;

  return (
    <section className="mt-10">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="w-6 h-6 text-primary" />
        <h2 className="font-display font-700 text-2xl">
          Avaliações{lojaName ? ` — ${lojaName}` : ""}
        </h2>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 [&>*]:min-w-0">
        <form
          onSubmit={submit}
          className="bg-card border border-border rounded-lg p-5 card-shadow space-y-4 h-fit"
        >
          <h3 className="font-600">Deixe sua avaliação</h3>
          {success && (
            <div role="status" className="flex items-start gap-2 rounded-lg bg-primary/10 border border-primary/20 p-3 text-sm">
              <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" aria-hidden="true" />
              <span>
                Avaliação enviada com sucesso! Obrigado pelo feedback — ela já aparece na lista ao lado.
              </span>
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="rev-name">Seu nome *</Label>
            <Input
              id="rev-name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Como podemos te chamar?"
            />
          </div>
          <div className="space-y-1.5">
            <Label id="rev-rating-label">Sua nota</Label>
            <Stars value={form.rating} onChange={(n) => setForm({ ...form, rating: n })} size={34} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="rev-text">Comentário</Label>
            <Textarea
              id="rev-text"
              value={form.text}
              onChange={(e) => setForm({ ...form, text: e.target.value })}
              placeholder="Conte como foi sua experiência…"
              rows={3}
            />
          </div>
          {error && <p role="alert" className="text-sm text-destructive font-500">{error}</p>}
          <Button type="submit" disabled={submitting}>
            {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {submitting ? "Enviando…" : "Enviar avaliação"}
          </Button>
        </form>

        <div className="space-y-3">
          {loading ? (
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Loader2 className="w-4 h-4 animate-spin" /> Carregando avaliações…
            </div>
          ) : comments.length === 0 ? (
            <div className="text-sm text-muted-foreground bg-muted/40 rounded-lg p-6 text-center">
              Ainda não há avaliações. Seja o primeiro a avaliar!
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 text-sm">
                <Stars value={Math.round(avg)} size={16} />
                <span className="font-600">{avg}</span>
                <span className="text-muted-foreground">
                  · {comments.length} avaliação{comments.length > 1 ? "ões" : ""}
                </span>
              </div>
              {comments.map((c) => (
                <div
                  key={c.id}
                  className="bg-card border border-border rounded-lg p-4 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-600 text-sm">{c.name}</span>
                    <Stars value={c.rating || 0} size={14} />
                  </div>
                  {c.text && <p className="text-sm text-muted-foreground">{c.text}</p>}
                  {c.created_date && (
                    <span className="text-xs text-muted-foreground">
                      {new Date(c.created_date).toLocaleDateString("pt-BR")}
                    </span>
                  )}
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </section>
  );
}