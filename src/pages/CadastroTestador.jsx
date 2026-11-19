import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import Layout from "@/components/Layout";
import LogoSpinner from "@/components/LogoSpinner";
import RegiaoFields from "@/components/RegiaoFields";
import TagInput from "@/components/TagInput";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { getEstadoAtual, getEstadoInfo } from "@/lib/regiao";
import { CONTATOS, MODALIDADES_PROCURA } from "@/lib/procuro";
import { EXPERIENCIAS, TIPOS_JOGO, testadorPath } from "@/lib/testadores";
import { ArrowLeft, Loader2, Trash2 } from "lucide-react";

const selectClass = "h-11 w-full rounded-md border border-input bg-background px-3 text-base lg:text-sm";
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const vazio = () => {
  const estado = getEstadoAtual();
  return {
    nome: "", bio: "", jogos_testados: [], tipos_jogo: [], experiencia: "iniciante", modalidade: "presencial",
    estado, cidade: getEstadoInfo(estado).cidadePadrao,
    contato_tipo: "instagram", contato: "", status: "ativo",
  };
};

// Cada pessoa tem um único perfil de testador: aqui ela cria ou edita o seu.
export default function CadastroTestador() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [data, setData] = useState(vazio);
  const [id, setId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    base44.entities.Testador.filter({ created_by_id: user.id }, { limit: 1 })
      .then((page) => {
        const existente = (page.items || [])[0];
        if (existente) { setId(existente.id); setData({ ...vazio(), ...existente }); }
        else setData((d) => ({ ...d, nome: user.full_name?.split(" ")[0] || "" }));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const set = (k, v) => setData((d) => ({ ...d, [k]: v }));
  const contatoInfo = CONTATOS.find((x) => x.value === data.contato_tipo);
  const online = data.modalidade === "online";
  const alternarTipo = (t) =>
    set("tipos_jogo", data.tipos_jogo.includes(t) ? data.tipos_jogo.filter((x) => x !== t) : [...data.tipos_jogo, t]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nome = data.nome.trim();
    const contato = data.contato.trim();
    if (!nome) return setError("Diga como quer ser chamado.");
    if (!contato) return setError("Informe como os criadores falam com você.");
    if (data.contato_tipo === "email" && !EMAIL.test(contato)) return setError("Informe um e-mail válido.");
    if (data.contato_tipo === "whatsapp" && contato.replace(/\D/g, "").length < 10) return setError("Informe o WhatsApp com DDD.");
    setError("");
    setSaving(true);
    try {
      const payload = { ...data, nome, contato, bio: data.bio.trim() };
      const saved = id ? await base44.entities.Testador.update(id, payload) : await base44.entities.Testador.create(payload);
      navigate(testadorPath(saved));
    } catch (err) {
      setError("Não foi possível salvar o perfil. Tente de novo.");
      setSaving(false);
    }
  };

  const remover = async () => {
    if (!id || !window.confirm("Remover seu perfil de testador?")) return;
    try {
      await base44.entities.Testador.delete(id);
      navigate("/testadores");
    } catch (e) {
      toast({ title: "Não foi possível remover o perfil.", variant: "destructive" });
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-10 sm:py-14 pb-28">
        <Link to="/testadores" className="inline-flex items-center gap-1.5 py-2 -my-2 text-sm text-muted-foreground hover:text-foreground mb-5">
          <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Testadores
        </Link>
        <h1 className="font-display font-700 text-3xl mb-1">{id ? "Editar perfil de testador" : "Quero ser testador"}</h1>
        <p className="text-muted-foreground mb-8">Grátis. Criadores de jogos encontram você pela lista e combinam as sessões de teste.</p>

        {loading ? (
          <LogoSpinner />
        ) : (
          <form onSubmit={handleSubmit} className="rounded-2xl bg-card border border-border card-shadow p-5 sm:p-8 space-y-6">
            <div className="space-y-1.5">
              <Label htmlFor="ts-nome">Seu nome no perfil *</Label>
              <Input id="ts-nome" value={data.nome} onChange={(e) => set("nome", e.target.value)} maxLength={60} required className="h-11" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ts-bio">Sobre você</Label>
              <Textarea id="ts-bio" rows={4} value={data.bio} onChange={(e) => set("bio", e.target.value)} maxLength={800} placeholder="Há quanto tempo joga, como dá retorno, dias em que costuma ter tempo…" />
            </div>

            <fieldset>
              <legend className="text-sm font-600 mb-2">Tipos de jogo que gosta de testar</legend>
              <div className="flex flex-wrap gap-2">
                {TIPOS_JOGO.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => alternarTipo(t)}
                    aria-pressed={data.tipos_jogo.includes(t)}
                    className={`min-h-11 rounded-full border px-4 text-sm font-600 transition-colors ${
                      data.tipos_jogo.includes(t) ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </fieldset>

            <TagInput
              id="ts-jogos"
              label="Jogos que já testou"
              value={data.jogos_testados}
              onChange={(v) => set("jogos_testados", v)}
              suggestions={[]}
              placeholder="Nome do jogo e Enter. Pode colar uma lista."
            />

            <div className="space-y-1.5">
              <Label htmlFor="ts-exp">Experiência com testes</Label>
              <select id="ts-exp" value={data.experiencia} onChange={(e) => set("experiencia", e.target.value)} className={selectClass}>
                {EXPERIENCIAS.map((x) => <option key={x.value} value={x.value}>{x.label}: {x.texto}</option>)}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ts-mod">Onde testa</Label>
              <select id="ts-mod" value={data.modalidade} onChange={(e) => set("modalidade", e.target.value)} className={selectClass}>
                {MODALIDADES_PROCURA.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>
            {!online && <RegiaoFields idPrefix="ts" estado={data.estado} cidade={data.cidade} onChange={(r) => setData((d) => ({ ...d, ...r }))} />}

            <div className="grid gap-4 sm:grid-cols-[minmax(0,12rem)_minmax(0,1fr)]">
              <div className="space-y-1.5">
                <Label htmlFor="ts-ct">Contato por *</Label>
                <select id="ts-ct" value={data.contato_tipo} onChange={(e) => set("contato_tipo", e.target.value)} className={selectClass}>
                  {CONTATOS.map((x) => <option key={x.value} value={x.value}>{x.label}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ts-contato">{contatoInfo?.label} *</Label>
                <Input
                  id="ts-contato"
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
            <p className="-mt-3 text-xs text-muted-foreground">O contato fica público no perfil. Prefira Instagram, Telegram ou um e-mail que você use para isso.</p>

            <label className="flex items-start gap-3 rounded-xl border border-border p-3 cursor-pointer">
              <input
                type="checkbox"
                checked={data.status === "ativo"}
                onChange={(e) => set("status", e.target.checked ? "ativo" : "pausado")}
                className="mt-1 h-5 w-5"
              />
              <span>
                <span className="block text-sm font-700">Disponível para testes</span>
                <span className="block text-xs text-muted-foreground">Desmarque para sumir da lista sem apagar o perfil.</span>
              </span>
            </label>

            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}

            <Button type="submit" size="lg" disabled={saving} className="w-full h-12">
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />}
              {id ? "Salvar alterações" : "Publicar meu perfil"}
            </Button>
            {id && (
              <Button type="button" variant="ghost" onClick={remover} className="w-full h-11 text-destructive">
                <Trash2 className="w-4 h-4 mr-1.5" aria-hidden="true" /> Remover meu perfil
              </Button>
            )}
          </form>
        )}
      </div>
    </Layout>
  );
}
