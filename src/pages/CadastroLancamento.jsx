import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import Layout from "@/components/Layout";
import LogoSpinner from "@/components/LogoSpinner";
import SemAcesso from "@/components/SemAcesso";
import ImageUpload from "@/components/ImageUpload";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { podeEditar } from "@/lib/permissoes";
import { TIPOS_LANCAMENTO } from "@/lib/lancamentos";
import { ArrowLeft, Loader2 } from "lucide-react";

const selectClass = "h-11 w-full rounded-md border border-input bg-background px-3 text-base lg:text-sm";

const vazio = () => ({
  titulo: "", editora: "", editora_id: "", tipo: "prevenda", data_inicio: "", data_fim: "",
  imagem_url: "", descricao: "", jogadores: "", duracao: "", preco: "", link: "", status: "publicado",
});

export default function CadastroLancamento() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEdit = id && id !== "novo";
  const [data, setData] = useState(vazio);
  const [original, setOriginal] = useState(null);
  const [editoras, setEditoras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [enviandoCapa, setEnviandoCapa] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const dono = user.role === "admin" ? {} : { created_by_id: user.id };
        const [lPage, item] = await Promise.all([
          base44.entities.Loja.filter({ ...dono, type: "editora" }, { sort: "name", limit: 200, fields: ["name"] }),
          isEdit ? base44.entities.Lancamento.get(id) : null,
        ]);
        const minhas = lPage.items || [];
        setEditoras(minhas);
        if (item?.id) {
          setOriginal(item);
          setData({ ...vazio(), ...item });
        } else if (minhas.length === 1) {
          setData((d) => ({ ...d, editora_id: minhas[0].id, editora: minhas[0].name }));
        }
      } catch (e) {
        // ignore
      } finally {
        setLoading(false);
      }
    })();
  }, [user, id]);

  const set = (k, v) => setData((d) => ({ ...d, [k]: v }));

  const escolherEditora = (editoraId) => {
    const ed = editoras.find((l) => l.id === editoraId);
    setData((d) => ({ ...d, editora_id: editoraId, editora: ed ? ed.name : d.editora }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const titulo = data.titulo.trim();
    const editora = data.editora.trim();
    if (!titulo || !editora) return setError("Informe o nome do jogo e a editora.");
    if (!data.data_inicio) return setError("Informe quando começa.");
    if (data.data_fim && data.data_fim < data.data_inicio) return setError("A data de fim não pode ser antes do início.");
    if (enviandoCapa) return setError("Aguarde terminar o envio da capa.");
    setError("");
    setSaving(true);
    try {
      const payload = { ...data, titulo, editora };
      if (isEdit) await base44.entities.Lancamento.update(id, payload);
      else await base44.entities.Lancamento.create(payload);
      navigate("/painel/lancamentos");
    } catch (err) {
      setError("Não foi possível salvar. Tente de novo.");
      setSaving(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-10 sm:py-14 pb-28">
        <Link to="/painel/lancamentos" className="inline-flex items-center gap-1.5 py-2 -my-2 text-sm text-muted-foreground hover:text-foreground mb-5">
          <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Meus lançamentos
        </Link>
        <h1 className="font-display font-700 text-3xl mb-1">{isEdit ? "Editar lançamento" : "Divulgar lançamento"}</h1>
        <p className="text-muted-foreground mb-8">Entra no calendário nacional de lançamentos assim que você salva.</p>

        {loading ? (
          <LogoSpinner />
        ) : isEdit && !original ? (
          <SemAcesso naoEncontrado />
        ) : isEdit && !podeEditar(user, original) ? (
          <SemAcesso />
        ) : (
          <form onSubmit={handleSubmit} className="rounded-2xl bg-card border border-border card-shadow p-6 sm:p-8 space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="lc-titulo">Nome do jogo *</Label>
              <Input id="lc-titulo" value={data.titulo} onChange={(e) => set("titulo", e.target.value)} maxLength={120} required />
            </div>

            {editoras.length > 0 && (
              <div className="space-y-1.5">
                <Label htmlFor="lc-editora-id">Editora cadastrada no site</Label>
                <select id="lc-editora-id" value={data.editora_id || ""} onChange={(e) => escolherEditora(e.target.value)} className={selectClass}>
                  <option value="">Nenhuma</option>
                  {editoras.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="lc-editora">Editora *</Label>
              <Input id="lc-editora" value={data.editora} onChange={(e) => set("editora", e.target.value)} maxLength={120} required />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="lc-tipo">Tipo</Label>
              <select id="lc-tipo" value={data.tipo} onChange={(e) => set("tipo", e.target.value)} className={selectClass}>
                {TIPOS_LANCAMENTO.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="lc-inicio">Começa em *</Label>
                <Input id="lc-inicio" type="date" value={data.data_inicio} onChange={(e) => set("data_inicio", e.target.value)} required className="h-11" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lc-fim">Termina em</Label>
                <Input id="lc-fim" type="date" value={data.data_fim} min={data.data_inicio || undefined} onChange={(e) => set("data_fim", e.target.value)} className="h-11" />
                <p className="text-xs text-muted-foreground">Fim da pré-venda ou da campanha.</p>
              </div>
            </div>

            <ImageUpload value={data.imagem_url} onChange={(v) => set("imagem_url", v)} onBusyChange={setEnviandoCapa} label="Capa do jogo" />

            <div className="space-y-1.5">
              <Label htmlFor="lc-desc">Sobre o jogo</Label>
              <Textarea id="lc-desc" rows={4} value={data.descricao} onChange={(e) => set("descricao", e.target.value)} placeholder="Tema, como se joga, para quem é." />
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="lc-jog">Jogadores</Label>
                <Input id="lc-jog" value={data.jogadores} onChange={(e) => set("jogadores", e.target.value)} placeholder="2 a 4" maxLength={30} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lc-dur">Duração</Label>
                <Input id="lc-dur" value={data.duracao} onChange={(e) => set("duracao", e.target.value)} placeholder="45 min" maxLength={30} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lc-preco">Preço</Label>
                <Input id="lc-preco" value={data.preco} onChange={(e) => set("preco", e.target.value)} placeholder="R$ 199,90" maxLength={40} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="lc-link">Link da pré-venda, campanha ou loja</Label>
              <Input id="lc-link" inputMode="url" value={data.link} onChange={(e) => set("link", e.target.value)} placeholder="https://" />
            </div>

            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}

            <Button type="submit" size="lg" disabled={saving || enviandoCapa} className="w-full">
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />}
              {isEdit ? "Salvar alterações" : "Publicar lançamento"}
            </Button>
          </form>
        )}
      </div>
    </Layout>
  );
}
