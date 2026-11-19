import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { denunciarMateria, podeDenunciar } from "@/lib/materias";
import { Flag } from "lucide-react";

const MOTIVOS = ["Conteúdo ofensivo", "Spam", "Informação falsa", "Outro"];

export default function DenunciarMateria({ materia }) {
  const { user, isAuthenticated } = useAuth();
  const [aberto, setAberto] = useState(false);
  const [motivo, setMotivo] = useState(MOTIVOS[0]);
  const [detalhe, setDetalhe] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [aviso, setAviso] = useState("");
  const destino = `/login?returnTo=${encodeURIComponent(`/materias/${materia.slug || materia.id}`)}`;

  if (!podeDenunciar(materia)) return null;

  if (!isAuthenticated) {
    return (
      <Button asChild variant="outline" className="min-h-11">
        <Link to={destino}><Flag className="mr-1.5 h-4 w-4" aria-hidden="true" /> Denunciar</Link>
      </Button>
    );
  }

  const enviar = async () => {
    setEnviando(true);
    setAviso("");
    try {
      const resposta = await denunciarMateria({ materia_id: materia.id, motivo, detalhe });
      setAviso(resposta.jaRegistrada ? "Você já denunciou esta matéria." : "Denúncia enviada. A administração vai ver.");
      setAberto(false);
    } catch (err) {
      setAviso(err.message || "Não foi possível denunciar.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div>
      <Button type="button" variant="outline" className="min-h-11" onClick={() => setAberto((v) => !v)} aria-expanded={aberto}>
        <Flag className="mr-1.5 h-4 w-4" aria-hidden="true" /> Denunciar
      </Button>
      {aberto && (
        <form className="mt-3 space-y-3 rounded-xl border border-border p-4" onSubmit={(event) => { event.preventDefault(); enviar(); }}>
          <label htmlFor="denuncia-motivo" className="block text-sm font-600">Motivo</label>
          <select id="denuncia-motivo" value={motivo} onChange={(event) => setMotivo(event.target.value)} className="flex h-11 w-full rounded-md border border-input bg-transparent px-3 text-base lg:h-9 lg:text-sm">
            {MOTIVOS.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <label htmlFor="denuncia-detalhe" className="block text-sm font-600">Detalhe (opcional)</label>
          <textarea id="denuncia-detalhe" value={detalhe} maxLength={500} onChange={(event) => setDetalhe(event.target.value)} className="min-h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-base lg:text-sm" />
          <Button type="submit" className="min-h-11" disabled={enviando || !user}>{enviando ? "Enviando…" : "Enviar denúncia"}</Button>
        </form>
      )}
      {aviso && <p role="status" className="mt-2 text-sm text-muted-foreground">{aviso}</p>}
    </div>
  );
}
