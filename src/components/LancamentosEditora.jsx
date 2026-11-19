import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import LancamentoCard from "@/components/LancamentoCard";
import { PackageOpen } from "lucide-react";
import { ordenarLancamentos, situacao } from "@/lib/lancamentos";

// Lançamentos da editora na página dela: só o que está aberto ou vem por aí.
export default function LancamentosEditora({ editoraId }) {
  const [itens, setItens] = useState([]);

  useEffect(() => {
    let ativo = true;
    base44.entities.Lancamento.filter({ editora_id: editoraId, status: "publicado" }, { sort: "data_inicio", limit: 50 })
      .then((p) => ativo && setItens(ordenarLancamentos((p.items || []).filter((l) => situacao(l) !== "encerrado"))))
      .catch(() => ativo && setItens([]));
    return () => { ativo = false; };
  }, [editoraId]);

  if (itens.length === 0) return null;
  return (
    <div className="mt-10">
      <h2 className="font-display font-700 text-2xl flex items-center gap-2 mb-4">
        <PackageOpen className="w-6 h-6 text-primary" aria-hidden="true" /> Lançamentos e pré-vendas
      </h2>
      <ul className="space-y-3">
        {itens.map((l) => <li key={l.id}><LancamentoCard lancamento={l} /></li>)}
      </ul>
    </div>
  );
}
