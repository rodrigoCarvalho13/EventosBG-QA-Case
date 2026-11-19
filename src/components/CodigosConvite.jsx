import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Ticket, Trash2 } from "lucide-react";

export default function CodigosConvite({ evento }) {
  const { toast } = useToast();
  const [codigos, setCodigos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [texto, setTexto] = useState("");
  const [salvando, setSalvando] = useState(false);

  const carregar = async () => {
    try {
      const page = await base44.entities.CodigoConvite.filter({ evento_id: evento.id }, { sort: "-created_date", limit: 1000 });
      setCodigos(page.items || []);
    } catch {
      setCodigos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregar();
  }, [evento.id]);

  const cadastrar = async (e) => {
    e.preventDefault();
    if (!texto.trim()) return;
    setSalvando(true);
    try {
      const res = await base44.functions.invoke("cadastrarCodigosConvite", { evento_id: evento.id, codigos: texto });
      const data = res.data || {};
      if (data.error) throw new Error(data.error);
      const repetidos = data.repetidos || [];
      toast({
        title: `${data.criados} código${data.criados === 1 ? "" : "s"} cadastrado${data.criados === 1 ? "" : "s"}`,
        description: repetidos.length ? `Já existiam e foram ignorados: ${repetidos.join(", ")}` : undefined,
      });
      setTexto("");
      carregar();
    } catch (err) {
      toast({ title: "Erro ao cadastrar", description: err?.response?.data?.error || err?.message || "Tente novamente.", variant: "destructive" });
    } finally {
      setSalvando(false);
    }
  };

  const remover = async (c) => {
    if (!confirm(`Remover o código ${c.codigo}?`)) return;
    try {
      await base44.functions.invoke("removerCodigoConvite", { id: c.id });
      setCodigos((list) => list.filter((x) => x.id !== c.id));
    } catch (err) {
      toast({ title: "Erro ao remover", description: err?.response?.data?.error || err?.message || "Tente novamente.", variant: "destructive" });
    }
  };

  const usados = codigos.filter((c) => c.usado).length;

  return (
    <div className="border-t border-border bg-muted/30 p-4" aria-label={`Códigos de convite de ${evento.title}`} data-testid={`codigos-convite-${evento.id}`}>
      <p className="text-xs font-600 text-muted-foreground mb-3 flex items-center gap-1.5">
        <Ticket className="w-3.5 h-3.5" aria-hidden="true" />
        Códigos de convite: {usados} usado{usados === 1 ? "" : "s"} de {codigos.length}
      </p>
      <form onSubmit={cadastrar} className="space-y-2 mb-4">
        <Label htmlFor={`codigos-${evento.id}`}>Adicionar códigos (um por linha)</Label>
        <Textarea id={`codigos-${evento.id}`} rows={4} value={texto} onChange={(e) => setTexto(e.target.value)} placeholder={"ABC123\nDEF456"} />
        <Button type="submit" size="sm" disabled={salvando || !texto.trim()} className="bg-primary text-primary-foreground hover:bg-primary/90">
          {salvando && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Cadastrar códigos
        </Button>
      </form>
      {loading ? (
        <p className="text-sm text-muted-foreground">Carregando…</p>
      ) : codigos.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum código cadastrado. Sem códigos, ninguém consegue se inscrever.</p>
      ) : (
        <ul className="space-y-1.5">
          {codigos.map((c) => (
            <li key={c.id} className="flex items-center justify-between gap-3 text-sm">
              <div className="min-w-0">
                <span className={`font-mono font-600 ${c.usado ? "line-through text-muted-foreground" : ""}`}>{c.codigo}</span>
                <span className="block text-xs text-muted-foreground truncate">
                  {c.usado ? `Usado por ${c.usado_por_nome || "—"} (${c.usado_por_email || "—"})` : "Disponível"}
                </span>
              </div>
              {!c.usado && (
                <Button variant="ghost" size="icon" onClick={() => remover(c)} aria-label={`Remover código ${c.codigo}`}>
                  <Trash2 className="w-4 h-4 text-destructive" aria-hidden="true" />
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
