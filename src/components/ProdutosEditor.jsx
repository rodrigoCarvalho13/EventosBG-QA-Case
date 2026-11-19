import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import ImageUpload from "@/components/ImageUpload";
import { Plus, Trash2 } from "lucide-react";

// Lista de produtos à venda (página da editora): nome, foto, preço, descrição e link de compra.
export default function ProdutosEditor({ value, onChange, onBusyChange }) {
  const produtos = Array.isArray(value) ? value : [];
  // Cada produto manda o próprio "enviando foto"; só avisa o formulário quando algum está ativo.
  const ocupados = React.useRef({});
  const marcar = (i) => (ativo) => {
    ocupados.current[i] = ativo;
    onBusyChange?.(Object.values(ocupados.current).some(Boolean));
  };

  const mudar = (i, campo, v) => onChange(produtos.map((p, k) => (k === i ? { ...p, [campo]: v } : p)));
  const adicionar = () => onChange([...produtos, { name: "", description: "", photo_url: "", price: "", link: "" }]);
  const remover = (i) => {
    ocupados.current = {};
    onBusyChange?.(false);
    onChange(produtos.filter((_, k) => k !== i));
  };

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-600">Produtos à venda</p>
        <p className="text-xs text-muted-foreground">
          Jogos, expansões e outros itens que a editora vende. Aparecem em uma vitrine na sua página.
        </p>
      </div>

      {produtos.map((p, i) => (
        <div key={i} className="rounded-xl border border-border p-4 space-y-3 bg-muted/30">
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor={`pd-nome-${i}`}>Nome do produto</Label>
              <Input id={`pd-nome-${i}`} value={p.name || ""} onChange={(e) => mudar(i, "name", e.target.value)} placeholder="Ex. Jogo Print and Play" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`pd-preco-${i}`}>Preço</Label>
              <Input id={`pd-preco-${i}`} value={p.price || ""} onChange={(e) => mudar(i, "price", e.target.value)} placeholder="Ex. R$ 49,90" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`pd-desc-${i}`}>Descrição</Label>
            <Textarea id={`pd-desc-${i}`} rows={2} value={p.description || ""} onChange={(e) => mudar(i, "description", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`pd-link-${i}`}>Link para comprar</Label>
            <Input id={`pd-link-${i}`} inputMode="url" autoCapitalize="none" value={p.link || ""} onChange={(e) => mudar(i, "link", e.target.value)} placeholder="https://" />
          </div>
          <ImageUpload value={p.photo_url} onChange={(v) => mudar(i, "photo_url", v)} onBusyChange={marcar(i)} label="Foto do produto" />
          <Button type="button" variant="ghost" size="sm" onClick={() => remover(i)} className="text-destructive">
            <Trash2 className="w-4 h-4 mr-1.5" aria-hidden="true" /> Remover produto
          </Button>
        </div>
      ))}

      <Button type="button" variant="outline" onClick={adicionar}>
        <Plus className="w-4 h-4 mr-1.5" aria-hidden="true" /> Adicionar produto
      </Button>
    </div>
  );
}
