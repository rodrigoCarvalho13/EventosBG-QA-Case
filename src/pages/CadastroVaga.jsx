import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
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
import { CONTRATACOES, MODALIDADES, vagaPath } from "@/lib/vagas";
import { ArrowLeft, Loader2 } from "lucide-react";

const selectClass = "h-11 w-full rounded-md border border-input bg-background px-3 text-base lg:text-sm";
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const vazia = () => {
  const estado = getEstadoAtual();
  return {
    titulo: "", empresa: "", loja_id: "", descricao: "", requisitos: "", beneficios: "",
    contratacao: "clt", modalidade: "presencial", estado, cidade: getEstadoInfo(estado).cidadePadrao,
    email_curriculo: "", status: "aberta",
  };
};

export default function CadastroVaga() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEdit = id && id !== "nova";
  const [data, setData] = useState(vazia);
  const [original, setOriginal] = useState(null);
  const [lojas, setLojas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const dono = user.role === "admin" ? {} : { created_by_id: user.id };
        const [lPage, vaga] = await Promise.all([
          base44.entities.Loja.filter(dono, { sort: "name", limit: 200, fields: ["name"] }),
          isEdit ? base44.entities.Vaga.get(id) : null,
        ]);
        setLojas(lPage.items || []);
        if (vaga?.id) {
          setOriginal(vaga);
          setData({ ...vazia(), ...vaga });
        }
      } catch (e) {
        // ignore
      } finally {
        setLoading(false);
      }
    })();
  }, [user, id]);

  const set = (k, v) => setData((d) => ({ ...d, [k]: v }));

  const escolherLoja = (lojaId) => {
    const loja = lojas.find((l) => l.id === lojaId);
    setData((d) => ({ ...d, loja_id: lojaId, empresa: loja && !d.empresa ? loja.name : d.empresa }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const titulo = data.titulo.trim();
    const empresa = data.empresa.trim();
    const email = data.email_curriculo.trim();
    if (!titulo || !empresa) return setError("Informe o cargo e o nome da loja.");
    if (!EMAIL.test(email)) return setError("Informe um e-mail válido para receber os currículos.");
    setError("");
    setSaving(true);
    try {
      const payload = { ...data, titulo, empresa, email_curriculo: email };
      const saved = isEdit ? await base44.entities.Vaga.update(id, payload) : await base44.entities.Vaga.create(payload);
      navigate(vagaPath(saved));
    } catch (err) {
      setError("Não foi possível salvar a vaga. Tente de novo.");
      setSaving(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-10 sm:py-14 pb-28">
        <Link to="/painel/vagas" className="inline-flex items-center gap-1.5 py-2 -my-2 text-sm text-muted-foreground hover:text-foreground mb-5">
          <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Minhas vagas
        </Link>
        <h1 className="font-display font-700 text-3xl mb-1">{isEdit ? "Editar vaga" : "Anunciar vaga"}</h1>
        <p className="text-muted-foreground mb-8">A vaga fica pública assim que você salva. Os currículos chegam no e-mail que você informar.</p>

        {loading ? (
          <LogoSpinner />
        ) : isEdit && !original ? (
          <SemAcesso naoEncontrado />
        ) : isEdit && !podeEditar(user, original) ? (
          <SemAcesso />
        ) : (
          <form onSubmit={handleSubmit} className="rounded-2xl bg-card border border-border card-shadow p-6 sm:p-8 space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="vaga-titulo">Cargo *</Label>
              <Input id="vaga-titulo" value={data.titulo} onChange={(e) => set("titulo", e.target.value)} placeholder="Ex.: Atendente / monitor de jogos" maxLength={120} required />
            </div>

            {lojas.length > 0 && (
              <div className="space-y-1.5">
                <Label htmlFor="vaga-loja">Loja cadastrada no site</Label>
                <select id="vaga-loja" value={data.loja_id || ""} onChange={(e) => escolherLoja(e.target.value)} className={selectClass}>
                  <option value="">Nenhuma</option>
                  {lojas.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="vaga-empresa">Nome da loja ou empresa *</Label>
              <Input id="vaga-empresa" value={data.empresa} onChange={(e) => set("empresa", e.target.value)} maxLength={120} required />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="vaga-contratacao">Tipo de contratação</Label>
                <select id="vaga-contratacao" value={data.contratacao} onChange={(e) => set("contratacao", e.target.value)} className={selectClass}>
                  {CONTRATACOES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="vaga-modalidade">Modalidade</Label>
                <select id="vaga-modalidade" value={data.modalidade} onChange={(e) => set("modalidade", e.target.value)} className={selectClass}>
                  {MODALIDADES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
              </div>
            </div>

            <RegiaoFields idPrefix="vaga" estado={data.estado} cidade={data.cidade} onChange={(r) => setData((d) => ({ ...d, ...r }))} />

            <div className="space-y-1.5">
              <Label htmlFor="vaga-descricao">Perfil buscado e atividades</Label>
              <Textarea id="vaga-descricao" rows={5} value={data.descricao} onChange={(e) => set("descricao", e.target.value)} placeholder="Quem você procura e o que a pessoa vai fazer no dia a dia." />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="vaga-requisitos">Requisitos</Label>
              <Textarea id="vaga-requisitos" rows={3} value={data.requisitos} onChange={(e) => set("requisitos", e.target.value)} placeholder="Experiência, disponibilidade, conhecimento de jogos…" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="vaga-beneficios">Salário e benefícios</Label>
              <Textarea id="vaga-beneficios" rows={3} value={data.beneficios} onChange={(e) => set("beneficios", e.target.value)} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="vaga-email">E-mail para enviar o currículo *</Label>
              <Input id="vaga-email" type="email" value={data.email_curriculo} onChange={(e) => set("email_curriculo", e.target.value)} placeholder="rh@sualoja.com.br" required />
              <p className="text-xs text-muted-foreground">Este e-mail aparece publicamente na vaga.</p>
            </div>

            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}

            <Button type="submit" size="lg" disabled={saving} className="w-full">
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />}
              {isEdit ? "Salvar alterações" : "Publicar vaga"}
            </Button>
          </form>
        )}
      </div>
    </Layout>
  );
}
