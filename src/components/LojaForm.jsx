import RegiaoFields from "@/components/RegiaoFields";
import { estadoDe, cidadeDe, getEstadoAtual, getEstadoInfo } from "@/lib/regiao";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ImageUpload from "@/components/ImageUpload";
import TagInput from "@/components/TagInput";
import GalleryUpload from "@/components/GalleryUpload";
import MapPicker from "@/components/MapPicker";
import ProdutosEditor from "@/components/ProdutosEditor";
import { Loader2 } from "lucide-react";

const typeOptions = [
  { value: "luderia", label: "Espaço de jogos" },
  { value: "loja", label: "Loja" },
  { value: "cafe", label: "Café" },
  { value: "bar", label: "Bar" },
  { value: "espaco", label: "Outro espaço" },
  { value: "organizador", label: "Grupo" },
  { value: "editora", label: "Editora" },
];

const empty = {
  name: "",
  type: "luderia",
  description: "",
  photo_url: "",
  address: "",
  estado: "DF",
  cidade: "Brasília",
  neighborhood: "",
  phone: "",
  whatsapp: "",
  email: "",
  website: "",
  instagram: "",
  facebook: "",
  youtube: "",
  tiktok: "",
  tags: [],
  acervo: [],
  gallery: [],
  produtos: [],
  latitude: null,
  longitude: null,
};

// Uma linha por jogo, sem linhas vazias nem repetidos.
const limparAcervo = (lista) => {
  const vistos = new Set();
  return (lista || []).map((j) => j.trim()).filter((j) => {
    const k = j.toLowerCase();
    if (!j || vistos.has(k)) return false;
    vistos.add(k);
    return true;
  });
};

export default function LojaForm({ initialData, onSubmit, submitLabel = "Salvar" }) {
  const [data, setData] = useState(() => {
    const d = { ...empty, ...initialData };
    // Cadastro novo nasce no estado escolhido no topo; os antigos, sem estado, são do DF.
    const estado = initialData?.estado || (initialData?.id ? estadoDe(d) : getEstadoAtual());
    return { ...d, estado, cidade: initialData?.cidade || (initialData?.id ? cidadeDe(d) : getEstadoInfo(estado).cidadePadrao) };
  });
  const [saving, setSaving] = useState(false);
  // Envios de foto em andamento: não deixa salvar antes de terminarem.
  const [enviandoFotos, setEnviandoFotos] = useState({});
  const fotosPendentes = Object.values(enviandoFotos).some(Boolean);
  const marcarEnvio = (campo) => (ativo) => setEnviandoFotos((m) => ({ ...m, [campo]: ativo }));
  const [error, setError] = useState("");

  // Grupo e editora não precisam de endereço físico.
  const semEnderecoFixo = data.type === "organizador" || data.type === "editora";
  const ehEditora = data.type === "editora";

  const set = (k, v) => setData((d) => ({ ...d, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (fotosPendentes) {
      setError("Aguarde terminar o envio das fotos antes de salvar.");
      return;
    }
    if (!data.name.trim()) {
      setError("Informe o nome.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onSubmit({ ...data, acervo: limparAcervo(data.acervo) });
    } catch (err) {
      setError(err?.message || "Erro ao salvar.");
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="lj-nome">Nome *</Label>
          <Input id="lj-nome" value={data.name} onChange={(e) => set("name", e.target.value)} placeholder="Ex. Tabuleiro BSB" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lj-tipo">Tipo</Label>
          <Select value={data.type} onValueChange={(v) => set("type", v)}>
            <SelectTrigger id="lj-tipo" aria-label="Tipo"><SelectValue /></SelectTrigger>
            <SelectContent>
              {typeOptions.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <ImageUpload value={data.photo_url} onChange={(v) => set("photo_url", v)} onBusyChange={marcarEnvio("capa")} label="Foto da loja" />

      <GalleryUpload value={data.gallery} onChange={(v) => set("gallery", v)} onBusyChange={marcarEnvio("galeria")} label="Galeria do ambiente" />

      <div className="space-y-1.5">
        <Label htmlFor="lj-desc">Descrição</Label>
        <Textarea
          id="lj-desc"
          value={data.description}
          onChange={(e) => set("description", e.target.value)}
          rows={3}
          placeholder="Conte sobre o espaço, eventos que realiza, acervo, ambiente…"
        />
      </div>

      {ehEditora && (
        <ProdutosEditor value={data.produtos} onChange={(v) => set("produtos", v)} onBusyChange={marcarEnvio("produtos")} />
      )}

      {!ehEditora && (
        <div className="space-y-1.5">
          <Label htmlFor="lj-acervo">Acervo para jogar no local</Label>
          <Textarea
            id="lj-acervo"
            value={(data.acervo || []).join("\n")}
            onChange={(e) => set("acervo", e.target.value.split("\n"))}
            onBlur={() => set("acervo", limparAcervo(data.acervo))}
            rows={5}
            placeholder={"Um jogo por linha. Ex.:\nCatan\nTicket to Ride\nAzul"}
            aria-describedby="lj-acervo-ajuda"
          />
          <p id="lj-acervo-ajuda" className="text-xs text-muted-foreground">
            Quem procura um jogo encontra o seu espaço pela busca do site. {limparAcervo(data.acervo).length > 0 && `${limparAcervo(data.acervo).length} jogos.`}
          </p>
        </div>
      )}

      <TagInput value={data.tags} onChange={(v) => set("tags", v)} />

      <RegiaoFields idPrefix="lj" estado={data.estado} cidade={data.cidade} onChange={(v) => setData((d) => ({ ...d, ...v }))} />

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="lj-endereco">{semEnderecoFixo ? "Endereço (opcional)" : "Endereço"}</Label>
          <Input id="lj-endereco" value={data.address} onChange={(e) => set("address", e.target.value)} placeholder="Rua, número" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lj-bairro">Bairro</Label>
          <Input id="lj-bairro" value={data.neighborhood} onChange={(e) => set("neighborhood", e.target.value)} placeholder="Ex. Asa Sul" />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Localização (GPS)</Label>
        <MapPicker
          enderecoBusca={!data.address?.trim() ? "" : [data.address, data.neighborhood, data.cidade, data.estado].filter(Boolean).join(", ")}
          value={{ latitude: data.latitude, longitude: data.longitude }}
          onChange={(v) => setData((d) => ({ ...d, latitude: v.latitude, longitude: v.longitude }))}
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="lj-telefone">Telefone</Label>
          <Input id="lj-telefone" type="tel" inputMode="tel" autoComplete="tel" value={data.phone} onChange={(e) => set("phone", e.target.value)} placeholder="(61) …" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lj-whatsapp">WhatsApp do responsável</Label>
          <Input id="lj-whatsapp" type="tel" inputMode="tel" value={data.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} placeholder="(61) 9 …" />
          <p className="text-xs text-muted-foreground">Aparece como botão &quot;Chamar no WhatsApp&quot; na página do espaço.</p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lj-email">E-mail</Label>
          <Input id="lj-email" type="email" autoCapitalize="none" value={data.email} onChange={(e) => set("email", e.target.value)} />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="lj-website">Website</Label>
          <Input id="lj-website" inputMode="url" autoCapitalize="none" value={data.website} onChange={(e) => set("website", e.target.value)} placeholder="https://" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lj-insta">Instagram</Label>
          <Input id="lj-insta" autoCapitalize="none" value={data.instagram} onChange={(e) => set("instagram", e.target.value)} placeholder="@loja" />
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="lj-facebook">Facebook</Label>
          <Input id="lj-facebook" autoCapitalize="none" value={data.facebook || ""} onChange={(e) => set("facebook", e.target.value)} placeholder="link da página" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lj-youtube">YouTube</Label>
          <Input id="lj-youtube" autoCapitalize="none" value={data.youtube || ""} onChange={(e) => set("youtube", e.target.value)} placeholder="@canal" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lj-tiktok">TikTok</Label>
          <Input id="lj-tiktok" autoCapitalize="none" value={data.tiktok || ""} onChange={(e) => set("tiktok", e.target.value)} placeholder="@loja" />
        </div>
      </div>

      <div className="sticky bottom-0 z-10 -mx-6 px-6 py-3 bg-card/95 backdrop-blur border-t border-border sm:static sm:mx-0 sm:px-0 sm:py-0 sm:bg-transparent sm:border-0 sm:backdrop-blur-none space-y-2">
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}

      <Button type="submit" disabled={saving || fotosPendentes} className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90">
        {saving || fotosPendentes ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
        {fotosPendentes ? "Enviando fotos…" : submitLabel}
      </Button>
      </div>
    </form>
  );
}