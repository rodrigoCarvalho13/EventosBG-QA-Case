import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import Layout from "@/components/Layout";
import LogoSpinner from "@/components/LogoSpinner";
import SemAcesso from "@/components/SemAcesso";
import RegiaoFields from "@/components/RegiaoFields";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { podeEditar } from "@/lib/permissoes";
import { getEstadoAtual, getEstadoInfo } from "@/lib/regiao";
import { CANAIS, CONTATOS, MODALIDADES_PROCURA, canal as infoCanal, procuraPath } from "@/lib/procuro";
import { ArrowLeft, Loader2 } from "lucide-react";

const selectClass = "h-11 w-full rounded-md border border-input bg-background px-3 text-base lg:text-sm";
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const vazio = (canalInicial) => {
  const estado = getEstadoAtual();
  return {
    canal: CANAIS.some((c) => c.value === canalInicial) ? canalInicial : "jogadores",
    titulo: "", descricao: "", jogo: "", modalidade: "presencial",
    estado, cidade: getEstadoInfo(estado).cidadePadrao, bairro: "",
    autor_nome: "", contato_tipo: "instagram", contato: "", status: "ativo",
  };
};

export default function CadastroProcura() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEdit = id && id !== "novo";
  const [data, setData] = useState(() => vazio(params.get("canal")));
  const [original, setOriginal] = useState(null);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    if (!isEdit) {
      setData((d) => ({ ...d, autor_nome: d.autor_nome || user.full_name?.split(" ")[0] || "" }));
      return;
    }
    base44.entities.Procura.get(id)
      .then((item) => { setOriginal(item); setData({ ...vazio(), ...item }); })
      .catch(() => setOriginal(null))
      .finally(() => setLoading(false));
  }, [user, id, isEdit]);

  const set = (k, v) => setData((d) => ({ ...d, [k]: v }));
  const c = infoCanal(data.canal);
  const contatoInfo = CONTATOS.find((x) => x.value === data.contato_tipo);
  const online = data.modalidade === "online";

  const handleSubmit = async (e) => {
    e.preventDefault();
    const titulo = data.titulo.trim();
    const contato = data.contato.trim();
    if (!titulo) return setError("Diga em uma frase o que você procura.");
    if (!contato) return setError("Informe como as pessoas falam com você.");
    if (data.contato_tipo === "email" && !EMAIL.test(contato)) return setError("Informe um e-mail válido.");
    if (data.contato_tipo === "whatsapp" && contato.replace(/\D/g, "").length < 10) return setError("Informe o WhatsApp com DDD.");
    setError("");
    setSaving(true);
    try {
      const payload = { ...data, titulo, contato, descricao: data.descricao.trim(), jogo: data.jogo.trim(), autor_nome: data.autor_nome.trim(), bairro: online ? "" : data.bairro.trim() };
      const saved = isEdit ? await base44.entities.Procura.update(id, payload) : await base44.entities.Procura.create(payload);
      navigate(procuraPath(saved));
    } catch (err) {
      setError("Não foi possível salvar o anúncio. Tente de novo.");
      setSaving(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-10 sm:py-14 pb-28">
        <Link to="/procuro" className="inline-flex items-center gap-1.5 py-2 -my-2 text-sm text-muted-foreground hover:text-foreground mb-5">
          <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Procuro
        </Link>
        <h1 className="font-display font-700 text-3xl mb-1">{isEdit ? "Editar anúncio" : "Anunciar o que procuro"}</h1>
        <p className="text-muted-foreground mb-8">Grátis. Fica no ar por 60 dias assim que você publica.</p>

        {loading ? (
          <LogoSpinner />
        ) : isEdit && !original ? (
          <SemAcesso naoEncontrado />
        ) : isEdit && !podeEditar(user, original) ? (
          <SemAcesso />
        ) : (
          <form onSubmit={handleSubmit} className="rounded-2xl bg-card border border-border card-shadow p-5 sm:p-8 space-y-6">
            <fieldset>
              <legend className="text-sm font-600 mb-2">O que você procura? *</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {CANAIS.map(({ value, label, texto, icon: Icon }) => (
                  <label
                    key={value}
                    className={`flex items-start gap-3 rounded-xl border p-3 cursor-pointer transition-colors focus-within:ring-2 focus-within:ring-ring ${
                      data.canal === value ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                    }`}
                  >
                    <input type="radio" name="canal" value={value} checked={data.canal === value} onChange={() => set("canal", value)} className="sr-only" />
                    <Icon className="w-5 h-5 mt-0.5 text-accent-ink shrink-0" aria-hidden="true" />
                    <span className="min-w-0">
                      <span className="block text-sm font-700">{label}</span>
                      <span className="block text-xs text-muted-foreground">{texto}</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="space-y-1.5">
              <Label htmlFor="pr-titulo">Em uma frase *</Label>
              <Input id="pr-titulo" value={data.titulo} onChange={(e) => set("titulo", e.target.value)} placeholder={c.exemplo} maxLength={120} required className="h-11" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="pr-jogo">Jogo</Label>
              <Input id="pr-jogo" value={data.jogo} onChange={(e) => set("jogo", e.target.value)} placeholder="Opcional. Ex.: Terraforming Mars" maxLength={80} className="h-11" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="pr-desc">Detalhes</Label>
              <Textarea
                id="pr-desc"
                rows={5}
                value={data.descricao}
                onChange={(e) => set("descricao", e.target.value)}
                maxLength={1500}
                placeholder="Dia e horário, nível de experiência, quantas pessoas, o que já tem pronto do protótipo…"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="pr-mod">Onde</Label>
              <select id="pr-mod" value={data.modalidade} onChange={(e) => set("modalidade", e.target.value)} className={selectClass}>
                {MODALIDADES_PROCURA.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>
            {!online && (
              <>
                <RegiaoFields idPrefix="pr" estado={data.estado} cidade={data.cidade} onChange={(r) => setData((d) => ({ ...d, ...r }))} />
                <div className="space-y-1.5">
                  <Label htmlFor="pr-bairro">Bairro ou região</Label>
                  <Input id="pr-bairro" value={data.bairro} onChange={(e) => set("bairro", e.target.value)} placeholder="Opcional. Ex.: Asa Norte" maxLength={60} className="h-11" />
                </div>
              </>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="pr-nome">Seu nome no anúncio</Label>
              <Input id="pr-nome" value={data.autor_nome} onChange={(e) => set("autor_nome", e.target.value)} maxLength={60} className="h-11" />
            </div>

            <div className="grid gap-4 sm:grid-cols-[minmax(0,12rem)_minmax(0,1fr)]">
              <div className="space-y-1.5">
                <Label htmlFor="pr-ct">Contato por *</Label>
                <select id="pr-ct" value={data.contato_tipo} onChange={(e) => set("contato_tipo", e.target.value)} className={selectClass}>
                  {CONTATOS.map((x) => <option key={x.value} value={x.value}>{x.label}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pr-contato">{contatoInfo?.label} *</Label>
                <Input
                  id="pr-contato"
                  value={data.contato}
                  onChange={(e) => set("contato", e.target.value)}
                  placeholder={contatoInfo?.placeholder}
                  inputMode={data.contato_tipo === "whatsapp" ? "tel" : data.contato_tipo === "email" ? "email" : "text"}
                  maxLength={120}
                  required
                  className="h-11"
                />
              </div>
            </div>
            <p className="-mt-3 text-xs text-muted-foreground">O contato fica público no anúncio. Prefira Instagram, Telegram ou um e-mail que você use para isso.</p>

            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}

            <Button type="submit" size="lg" disabled={saving} className="w-full h-12">
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />}
              {isEdit ? "Salvar alterações" : "Publicar anúncio"}
            </Button>
          </form>
        )}
      </div>
    </Layout>
  );
}
