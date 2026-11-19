import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import Layout from "@/components/Layout";
import LogoSpinner from "@/components/LogoSpinner";
import SemAcesso from "@/components/SemAcesso";
import GaleriaUpload from "@/components/GaleriaUpload";
import EditorMateria from "@/components/EditorMateria";
import MateriaCorpo from "@/components/MateriaCorpo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";
import { listarTudo } from "@/lib/paginar";
import RegiaoFields from "@/components/RegiaoFields";
import { buscarPorSlugOuId, slugify, eventoPath } from "@/lib/slug";
import { materiaPath, nomePublico, podeEditarMateria, salvarMateria, validarMateria } from "@/lib/materias";
import { dataFinal, isEventoPassado } from "@/lib/eventStatus";
import { ArrowLeft } from "lucide-react";

const VAZIO = {
  titulo: "",
  subtitulo: "",
  corpo: "",
  galeria: [],
  evento_id: "",
  evento_slug: "",
  evento_titulo: "",
  data_evento: "",
  estado: "DF",
  cidade: "Brasília",
  tags: [],
};

export default function MateriaForm() {
  const { id, slug } = useParams();
  const { pathname } = useLocation();
  const nova = pathname.endsWith("/materias/nova") || id === "nova";
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const admin = user?.role === "admin";
  const [form, setForm] = useState(VAZIO);
  const [registroId, setRegistroId] = useState(nova ? "" : (id && id !== "nova" ? id : ""));
  const [slugSalvo, setSlugSalvo] = useState("");
  const [statusAtual, setStatusAtual] = useState("rascunho");
  const [ocultaAdmin, setOcultaAdmin] = useState(false);
  const [autorNome, setAutorNome] = useState("");
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(!nova);
  const [semPermissao, setSemPermissao] = useState(false);
  const [naoAchei, setNaoAchei] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const envios = useRef(0);
  const marcarEnvio = (ativo) => {
    envios.current = Math.max(0, envios.current + (ativo ? 1 : -1));
    setOcupado(envios.current > 0);
  };
  const [preview, setPreview] = useState(false);
  const [tagTexto, setTagTexto] = useState("");
  const [confirmar, setConfirmar] = useState(false);
  const [erros, setErros] = useState([]);

  useEffect(() => {
    let ativo = true;
    listarTudo(
      base44.entities.Programacao,
      { status: "approved" },
      {
        sort: "-event_date",
        limit: 100,
        maxPaginas: 4,
        fields: ["title", "slug", "event_date", "event_end_date", "start_time", "end_time", "recurrence_type", "estado", "cidade"],
      }
    )
      .then((itens) => {
        if (!ativo) return;
        const passados = itens
          .filter((evento) => isEventoPassado(evento))
          .sort((a, b) => String(dataFinal(b) || "").localeCompare(String(dataFinal(a) || "")));
        setEventos(passados.slice(0, 200));
      })
      .catch(() => {});
    return () => { ativo = false; };
  }, []);

  useEffect(() => {
    if (nova) return;
    let ativo = true;
    const chave = slug || id;
    const buscar = slug ? buscarPorSlugOuId(base44.entities.Materia, slug) : base44.entities.Materia.get(chave);
    Promise.resolve(buscar)
      .then((materia) => {
        if (!ativo) return;
        if (!materia || materia.excluida === true) {
          setNaoAchei(true);
          return;
        }
        if (!podeEditarMateria(materia, user)) {
          setSemPermissao(true);
          return;
        }
        setRegistroId(materia.id);
        setForm({
          titulo: materia.titulo || "",
          subtitulo: materia.subtitulo || "",
          corpo: materia.corpo || "",
          galeria: Array.isArray(materia.galeria) ? materia.galeria : [],
          evento_id: materia.evento_id || "",
          evento_slug: materia.evento_slug || "",
          evento_titulo: materia.evento_titulo || "",
          data_evento: materia.data_evento || "",
          estado: materia.estado || "DF",
          cidade: materia.cidade || "",
          tags: Array.isArray(materia.tags) ? materia.tags : [],
        });
        setSlugSalvo(materia.slug || "");
        setStatusAtual(materia.status || "rascunho");
        setOcultaAdmin(materia.oculta_admin === true);
        setAutorNome(materia.autor_nome || materia.autor || "");
      })
      .catch(() => { if (ativo) setNaoAchei(true); })
      .finally(() => { if (ativo) setLoading(false); });
    return () => { ativo = false; };
  }, [admin, id, nova, slug, user]);

  const slugPrevisto = slugSalvo || slugify(form.titulo) || "materia";
  const set = (campo, valor) => setForm((atual) => ({ ...atual, [campo]: valor }));
  const nome = autorNome || nomePublico(user);
  const bloqueada = !nova && !admin && (statusAtual === "oculta" || ocultaAdmin);

  const escolherEvento = (eventoId) => {
    const evento = eventos.find((item) => item.id === eventoId);
    setForm((atual) => ({
      ...atual,
      evento_id: evento?.id || "",
      evento_slug: evento?.slug || "",
      evento_titulo: evento?.title || "",
      data_evento: atual.data_evento || (evento ? dataFinal(evento) || "" : ""),
      estado: evento?.estado || atual.estado,
      cidade: evento?.cidade || atual.cidade,
    }));
  };

  const adicionarTag = () => {
    const partes = tagTexto.split(",").map((item) => item.trim()).filter(Boolean);
    if (!partes.length) return;
    setForm((atual) => {
      const vistas = new Set(atual.tags.map((tag) => tag.toLocaleLowerCase("pt-BR")));
      const tags = [...atual.tags];
      partes.forEach((tag) => {
        if (tags.length >= 8 || vistas.has(tag.toLocaleLowerCase("pt-BR"))) return;
        vistas.add(tag.toLocaleLowerCase("pt-BR"));
        tags.push(tag);
      });
      return { ...atual, tags };
    });
    setTagTexto("");
  };

  const salvar = async (status) => {
    const checagem = validarMateria({ ...form, status });
    if (!checagem.ok) {
      setErros(checagem.erros);
      return;
    }
    setErros([]);
    setSalvando(true);
    try {
      const resposta = await salvarMateria({ ...checagem.materia, id: nova ? undefined : registroId });
      const salva = resposta.materia;
      toast({ title: status === "publicada" ? "Matéria publicada" : status === "oculta" ? "Matéria oculta" : "Rascunho salvo" });
      if (status === "publicada" && salva) navigate(materiaPath(salva));
      else navigate("/materias/minhas");
    } catch (err) {
      setErros([err.message || "Não foi possível salvar."]);
    } finally {
      setSalvando(false);
    }
  };

  const excluir = async () => {
    setSalvando(true);
    try {
      await salvarMateria({ excluir: true, id: registroId });
      toast({ title: "Matéria excluída" });
      navigate("/materias/minhas");
    } catch (err) {
      setErros([err.message || "Não foi possível excluir."]);
      setSalvando(false);
    }
  };

  const eventoAtual = useMemo(
    () => eventos.find((evento) => evento.id === form.evento_id),
    [eventos, form.evento_id]
  );

  if (!user) {
    return (
      <Layout>
        <div className="mx-auto max-w-3xl px-4 py-10">
          <SemAcesso titulo="Entre para escrever" texto="A matéria fica no seu nome depois do login." />
        </div>
      </Layout>
    );
  }

  if (loading) {
    return <Layout><LogoSpinner label="Carregando matéria…" className="py-28" /></Layout>;
  }

  if (semPermissao) {
    return (
      <Layout>
        <div className="mx-auto max-w-3xl px-4 py-10">
          <SemAcesso titulo="Esta matéria é de outra pessoa" texto="Você pode editar as suas em Minhas matérias. A administração edita qualquer uma." />
        </div>
      </Layout>
    );
  }

  if (naoAchei) {
    return (
      <Layout>
        <div className="mx-auto max-w-3xl px-4 py-10">
          <SemAcesso naoEncontrado />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <form className="mx-auto max-w-3xl px-4 py-8 sm:py-12" onSubmit={(event) => event.preventDefault()}>
        <Link to="/materias/minhas" className="mb-5 inline-flex min-h-11 items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Minhas matérias
        </Link>
        <h1 className="mb-2 font-display text-3xl font-700">{nova ? "Nova matéria" : "Editar matéria"}</h1>
        {bloqueada && (
          <p className="mb-4 rounded-xl border border-accent/40 bg-accent/15 px-4 py-3 text-sm font-600" role="status">
            Matéria oculta pela moderação
          </p>
        )}
        <p className="mb-6 text-sm text-muted-foreground">Publica no ato, no nome de <span className="font-600 text-foreground">{nome}</span>. Dá para deixar como rascunho.</p>

        <div className="space-y-5">
          <div>
            <Label htmlFor="materia-titulo">Título</Label>
            <Input id="materia-titulo" value={form.titulo} onChange={(event) => set("titulo", event.target.value)} maxLength={140} required className="mt-1.5" />
            <p className="mt-1.5 text-sm text-muted-foreground">
              Endereço: <span className="font-600 text-foreground">/materias/{slugPrevisto}</span>
              {slugSalvo ? " — fica fixo depois de criada, para os links não quebrarem." : " — gerado a partir do título."}
            </p>
          </div>

          <div>
            <Label htmlFor="materia-resumo">Resumo</Label>
            <Textarea id="materia-resumo" value={form.subtitulo} onChange={(event) => set("subtitulo", event.target.value)} maxLength={300} className="mt-1.5" placeholder="Uma ou duas frases para a listagem e o compartilhamento." />
          </div>

          <div>
            <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
              <Label id="materia-corpo">Texto</Label>
              <div className="flex rounded-lg border border-border p-0.5" role="group" aria-label="Modo do texto">
                <button type="button" aria-pressed={!preview} onClick={() => setPreview(false)} className={`min-h-11 rounded-md px-3 text-sm font-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${preview ? "text-muted-foreground" : "bg-primary text-primary-foreground"}`}>Escrever</button>
                <button type="button" aria-pressed={preview} onClick={() => setPreview(true)} className={`min-h-11 rounded-md px-3 text-sm font-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${preview ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>Pré-visualizar</button>
              </div>
            </div>
            {preview ? (
              <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
                <MateriaCorpo texto={form.corpo} />
              </div>
            ) : (
              <EditorMateria id="materia-corpo" value={form.corpo} onChange={(html) => set("corpo", html)} />
            )}
          </div>

          <GaleriaUpload fotos={form.galeria} onChange={(galeria) => set("galeria", galeria)} onBusyChange={marcarEnvio} />

          <div>
            <Label htmlFor="materia-evento">Evento relacionado (opcional)</Label>
            <select
              id="materia-evento"
              value={form.evento_id}
              onChange={(event) => escolherEvento(event.target.value)}
              className="mt-1.5 flex h-11 w-full rounded-md border border-input bg-transparent px-3 text-base lg:h-9 lg:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">Nenhum evento</option>
              {form.evento_id && !eventoAtual && (
                <option value={form.evento_id}>{form.evento_titulo || "Evento já vinculado"}</option>
              )}
              {eventos.map((evento) => (
                <option key={evento.id} value={evento.id}>
                  {evento.title}{dataFinal(evento) ? ` · ${dataFinal(evento)}` : ""}
                </option>
              ))}
            </select>
            {form.evento_id && (
              <p className="mt-1.5 text-sm">
                <Link to={eventoPath({ slug: form.evento_slug, id: form.evento_id })} className="font-600 text-primary underline underline-offset-2 dark:text-accent">
                  Abrir o evento
                </Link>
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="materia-data">Data do evento</Label>
              <Input id="materia-data" type="date" value={form.data_evento} onChange={(event) => set("data_evento", event.target.value)} className="mt-1.5" />
            </div>
          </div>
          <RegiaoFields
            idPrefix="materia"
            estado={form.estado}
            cidade={form.cidade}
            onChange={(parte) => setForm((atual) => ({ ...atual, ...parte }))}
          />

          <div>
            <Label htmlFor="materia-tag">Tags</Label>
            <div className="mt-1.5 flex gap-2">
              <Input
                id="materia-tag"
                value={tagTexto}
                onChange={(event) => setTagTexto(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    adicionarTag();
                  }
                }}
                placeholder="Separe por vírgula"
              />
              <Button type="button" variant="outline" className="min-h-11 shrink-0" onClick={adicionarTag}>Adicionar</Button>
            </div>
            {form.tags.length > 0 && (
              <ul className="mt-2 flex flex-wrap gap-2">
                {form.tags.map((tag) => (
                  <li key={tag}>
                    <button type="button" onClick={() => set("tags", form.tags.filter((item) => item !== tag))} className="inline-flex min-h-11 items-center rounded-full bg-accent/20 px-3 text-sm font-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                      {tag} <span className="sr-only"> — remover</span> <span aria-hidden="true" className="ml-1">×</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {erros.length > 0 && (
          <ul role="alert" className="mt-6 space-y-1 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
            {erros.map((erro) => <li key={erro}>{erro}</li>)}
          </ul>
        )}

        <div className="mt-8 flex flex-wrap gap-3">
          <Button type="button" variant="outline" className="min-h-11" disabled={salvando || ocupado} onClick={() => salvar("rascunho")}>
            Salvar rascunho
          </Button>
          {!bloqueada && (
            <Button type="button" className="min-h-11 font-600" disabled={salvando || ocupado} onClick={() => salvar("publicada")}>
              {salvando ? "Salvando…" : "Publicar"}
            </Button>
          )}
          {!nova && (
            <Button type="button" variant="outline" className="min-h-11" disabled={salvando || ocupado} onClick={() => salvar("oculta")}>
              Ocultar
            </Button>
          )}
          {!nova && (
            <Button type="button" variant="destructive" className="min-h-11" disabled={salvando} onClick={() => setConfirmar(true)}>
              Excluir
            </Button>
          )}
        </div>
      </form>

      <AlertDialog open={confirmar} onOpenChange={setConfirmar}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir esta matéria?</AlertDialogTitle>
            <AlertDialogDescription>Ela sai do site e não dá para desfazer.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="min-h-11">Cancelar</AlertDialogCancel>
            <AlertDialogAction className="min-h-11 bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={excluir}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
