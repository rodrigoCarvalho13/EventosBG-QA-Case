import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import Layout from "@/components/Layout";
import LogoSpinner from "@/components/LogoSpinner";
import ImageUpload from "@/components/ImageUpload";
import TagInput from "@/components/TagInput";
import RegiaoFields from "@/components/RegiaoFields";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { getEstadoAtual, getEstadoInfo } from "@/lib/regiao";
import { invocar } from "@/lib/monitoresApi";
import CalendarioMes from "@/components/CalendarioMes";
import { listarTudo } from "@/lib/paginar";
import { DIAS, fimDoHorario, ESTILOS_SUGERIDOS, GENEROS, JOGOS_SUGERIDOS, SERVICOS_SUGERIDOS, TIPOS_EVENTO_SUGERIDOS, aplicarFaixaDias, monitorPath, statusOcupaHorario, validarPerfil } from "@/lib/monitores";
import { GraduationCap, Loader2, Plus, Trash2 } from "lucide-react";

const selectClass = "flex h-11 w-full rounded-md border border-input bg-transparent px-3 text-base lg:text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

function localVazio() {
  const estado = getEstadoAtual();
  return { estado, cidade: getEstadoInfo(estado).cidadePadrao, bairro: "", local: "" };
}

function precoCampo(valor) {
  return valor > 0 ? String(valor).replace(".", ",") : "";
}

function formularioInicial(user) {
  return {
    name: user?.full_name || "",
    idade: "",
    genero: "",
    bio: "",
    photo_url: "",
    jogos: [],
    acervo_qtd: "",
    jogos_obs: "",
    estilos: [],
    servicos: [],
    tipos_evento: [],
    dias_bloqueados: [],
    dias_extras: [],
    preco_hora: "",
    locais: [localVazio()],
    whatsapp: "",
    instagram: "",
    email: user?.email || "",
    disponibilidade: [],
    publicado: true,
  };
}

export default function CadastroMonitor() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [monitor, setMonitor] = useState(null);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erros, setErros] = useState([]);
  const [ocupados, setOcupados] = useState([]);
  const [acaoDia, setAcaoDia] = useState("disponivel");

  useEffect(() => {
    if (!user) return;
    let vivo = true;
    (async () => {
      try {
        const page = await base44.entities.Monitor.filter({ owner_id: user.id }, { limit: 1 });
        const atual = (page.items || [])[0] || null;
        if (!vivo) return;
        setMonitor(atual);
        let contato = null;
        if (atual?.id) {
          const data = await invocar("lerContatoMonitor", { monitor_id: atual.id }).catch(() => null);
          if (vivo && data?.contato) contato = data.contato;
        }
        setForm(atual ? {
          name: atual.name || "",
          idade: atual.idade > 0 ? String(atual.idade) : "",
          genero: atual.genero || "",
          bio: atual.bio || "",
          photo_url: atual.photo_url || "",
          jogos: atual.jogos || [],
          acervo_qtd: atual.acervo_qtd > 0 ? String(atual.acervo_qtd) : "",
          jogos_obs: atual.jogos_obs || "",
          estilos: atual.estilos || [],
          servicos: atual.servicos || [],
          tipos_evento: atual.tipos_evento || [],
          dias_bloqueados: atual.dias_bloqueados || [],
          dias_extras: atual.dias_extras || [],
          preco_hora: precoCampo(atual.preco_hora),
          locais: atual.locais?.length ? atual.locais.map((l) => ({ bairro: "", local: "", ...l })) : [localVazio()],
          whatsapp: contato?.whatsapp || "",
          instagram: contato?.instagram || "",
          email: contato?.email || user.email || "",
          disponibilidade: atual.disponibilidade || [],
          publicado: atual.publicado !== false,
        } : formularioInicial(user));
      } catch {
        if (vivo) setForm(formularioInicial(user));
      } finally {
        if (vivo) setLoading(false);
      }
    })();
    return () => { vivo = false; };
  }, [user]);

  useEffect(() => {
    if (!monitor?.id || !user) return undefined;
    let vivo = true;
    listarTudo(base44.entities.ReservaMonitor, { monitor_id: monitor.id }, { limit: 100 })
      .then((itens) => {
        if (vivo) setOcupados(itens.filter((r) => statusOcupaHorario(r.status)));
      })
      .catch(() => { if (vivo) setOcupados([]); });
    return () => { vivo = false; };
  }, [monitor?.id, user]);

  const set = (chave, valor) => setForm((f) => ({ ...f, [chave]: valor }));

  const setLocal = (indice, parcial) => {
    setForm((f) => ({
      ...f,
      locais: f.locais.map((l, i) => (i === indice ? { ...l, ...parcial } : l)),
    }));
  };

  const blocosDoDia = (dia) => (form?.disponibilidade || []).map((b, indice) => ({ ...b, indice })).filter((b) => b.dia === dia);

  const alternarDia = (dia) => {
    setForm((f) => {
      const tem = f.disponibilidade.some((b) => b.dia === dia);
      return {
        ...f,
        disponibilidade: tem
          ? f.disponibilidade.filter((b) => b.dia !== dia)
          : [...f.disponibilidade, { dia, inicio: "19:00", horas: 3 }],
      };
    });
  };

  const setBloco = (indice, parcial) => {
    setForm((f) => ({
      ...f,
      disponibilidade: f.disponibilidade.map((b, i) => (i === indice ? { ...b, ...parcial } : b)),
    }));
  };

  const salvar = async (e) => {
    e.preventDefault();
    const checagem = validarPerfil(form);
    if (!checagem.ok) {
      setErros(checagem.erros);
      return;
    }
    setSalvando(true);
    setErros([]);
    try {
      const data = await invocar("salvarMonitor", { ...form, id: monitor?.id });
      const salvo = data.monitor;
      setMonitor(salvo);
      toast({ title: "Perfil salvo", description: salvo.publicado === false ? "Ele está oculto do catálogo." : "Ele já aparece em Monitores." });
      if (salvo.publicado !== false) navigate(monitorPath(salvo));
    } catch (err) {
      setErros(err?.erros || [err?.message || "Não foi possível salvar."]);
    } finally {
      setSalvando(false);
    }
  };

  const excluir = async () => {
    if (!monitor || !confirm("Excluir seu perfil de monitor? Se ainda houver reserva em andamento, o perfil só sai do catálogo. Reservas e avaliações antigas continuam no histórico.")) return;
    try {
      const data = await invocar("salvarMonitor", { excluir: true, id: monitor.id });
      if (data.despublicado) {
        setMonitor(data.monitor);
        setForm((f) => ({ ...f, publicado: false }));
        toast({ title: "Perfil oculto", description: "Há reservas em andamento, então ele saiu do catálogo e não foi apagado." });
        return;
      }
      toast({ title: "Perfil excluído" });
      navigate("/monitores");
    } catch (err) {
      toast({ title: "Não foi possível excluir", description: err?.message || "Tente novamente.", variant: "destructive" });
    }
  };

  if (loading || !form) return <Layout><LogoSpinner className="py-28" /></Layout>;

  return (
    <Layout>
      <form onSubmit={salvar} className="max-w-3xl mx-auto px-4 py-8 sm:py-12" noValidate>
        <p className="text-xs font-700 uppercase tracking-[0.2em] text-accent-ink mb-2">Monitores</p>
        <h1 className="font-display font-700 text-3xl sm:text-4xl flex items-center gap-2">
          <GraduationCap className="w-8 h-8 text-accent-ink" aria-hidden="true" />
          {monitor ? "Editar perfil" : "Cadastro de monitor"}
        </h1>
        <p className="text-muted-foreground mt-2 mb-8">
          Conte o que você ensina, quanto cobra e quando pode atender. O contato aparece após a confirmação da reserva, e o valor é combinado direto com quem contrata.
          {monitor?.slug && (
            <> <Link to={monitorPath(monitor)} className="font-600 text-primary dark:text-accent hover:underline">Ver perfil público</Link></>
          )}
        </p>

        {erros.length > 0 && (
          <div role="alert" className="mb-6 rounded-xl border border-destructive/40 bg-destructive/10 p-4">
            <p className="font-600 mb-1">Confira o formulário</p>
            <ul className="list-disc pl-5 text-sm space-y-1">
              {erros.map((erro) => <li key={erro}>{erro}</li>)}
            </ul>
          </div>
        )}

        <div className="space-y-8">
          <ImageUpload value={form.photo_url} onChange={(url) => set("photo_url", url)} label="Foto" enquadrar />

          <div className="space-y-1.5">
            <Label htmlFor="monitor-nome">Nome</Label>
            <Input id="monitor-nome" value={form.name} onChange={(e) => set("name", e.target.value)} required maxLength={80} autoComplete="name" />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="monitor-idade">Idade (opcional)</Label>
              <Input id="monitor-idade" inputMode="numeric" value={form.idade} onChange={(e) => set("idade", e.target.value)} placeholder="32" min={14} max={120} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="monitor-genero">Gênero (opcional)</Label>
              <select id="monitor-genero" value={form.genero} onChange={(e) => set("genero", e.target.value)} className={selectClass}>
                <option value="">Selecione</option>
                {GENEROS.map((g) => <option key={g.id} value={g.id}>{g.label}</option>)}
              </select>
            </div>
          </div>
          <p className="text-sm text-muted-foreground -mt-4">Idade e gênero só aparecem no perfil se você preencher. “Prefiro não informar” fica oculto.</p>

          <div className="space-y-1.5">
            <Label htmlFor="monitor-bio">Bio</Label>
            <Textarea id="monitor-bio" value={form.bio} onChange={(e) => set("bio", e.target.value)} required minLength={20} maxLength={2000} placeholder="Como você conduz a mesa, para quem ensina e que tipo de evento topa." />
          </div>

          <TagInput
            label="Estilos de jogo que você conhece"
            value={form.estilos}
            onChange={(estilos) => set("estilos", estilos)}
            suggestions={ESTILOS_SUGERIDOS}
            placeholder="Estratégia, party games, cooperativos…"
          />

          <TagInput
            id="monitor-jogos"
            label="Jogos que você sabe ensinar"
            value={form.jogos}
            onChange={(jogos) => set("jogos", jogos)}
            suggestions={JOGOS_SUGERIDOS}
            placeholder="Busque um jogo ou escreva o nome e pressione Enter…"
          />
          <p className="text-sm text-muted-foreground -mt-4">Dá para colar a lista inteira de uma vez (um jogo por linha ou separados por vírgula). Cabem até 1000 jogos.</p>

          <div className="grid sm:grid-cols-[12rem_minmax(0,1fr)] gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="monitor-acervo">Quantos jogos você conhece? (opcional)</Label>
              <Input id="monitor-acervo" inputMode="numeric" value={form.acervo_qtd} onChange={(e) => set("acervo_qtd", e.target.value.replace(/\D/g, ""))} placeholder="300" maxLength={5} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="monitor-jogos-obs">Observações sobre os jogos (opcional)</Label>
              <Textarea id="monitor-jogos-obs" value={form.jogos_obs} onChange={(e) => set("jogos_obs", e.target.value)} maxLength={600} placeholder="Ex.: tenho mais de 300 jogos em mãos; consulte os que não estão na lista." />
            </div>
          </div>

          <TagInput
            id="monitor-servicos"
            label="Tipo de serviço"
            value={form.servicos}
            onChange={(servicos) => set("servicos", servicos)}
            suggestions={SERVICOS_SUGERIDOS}
            placeholder="Monitor, consultor, professor…"
          />

          <TagInput
            id="monitor-eventos"
            label="Tipo de evento que atende"
            value={form.tipos_evento}
            onChange={(tipos) => set("tipos_evento", tipos)}
            suggestions={TIPOS_EVENTO_SUGERIDOS}
            placeholder="Particular, feira, corporativo, loja…"
          />

          <div className="space-y-1.5 max-w-xs">
            <Label htmlFor="preco-hora">Valor mínimo por hora (R$)</Label>
            <Input id="preco-hora" inputMode="decimal" value={form.preco_hora} onChange={(e) => set("preco_hora", e.target.value)} placeholder="80" required />
            <p className="text-sm text-muted-foreground">No perfil aparece como “a partir de”.</p>
          </div>

          <fieldset className="space-y-3">
            <legend className="text-sm font-600">Bairros e cidades</legend>
            {form.locais.map((local, i) => (
              <div key={i} className="rounded-xl border border-border p-4 space-y-3">
                <RegiaoFields
                  idPrefix={`monitor-local-${i}`}
                  estado={local.estado}
                  cidade={local.cidade}
                  onChange={(parcial) => setLocal(i, parcial)}
                />
                <div className="space-y-1.5">
                  <Label htmlFor={`monitor-bairro-${i}`}>Bairro</Label>
                  <Input
                    id={`monitor-bairro-${i}`}
                    value={local.bairro || ""}
                    onChange={(e) => setLocal(i, { bairro: e.target.value })}
                    placeholder="Asa Sul, Águas Claras…"
                    maxLength={80}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor={`monitor-lugar-${i}`}>Local (opcional)</Label>
                  <Input
                    id={`monitor-lugar-${i}`}
                    value={local.local || ""}
                    onChange={(e) => setLocal(i, { local: e.target.value })}
                    placeholder="Casa do cliente, luderia, evento…"
                    maxLength={120}
                  />
                </div>
                {form.locais.length > 1 && (
                  <Button type="button" variant="ghost" onClick={() => set("locais", form.locais.filter((_, idx) => idx !== i))}>
                    <Trash2 className="w-4 h-4" aria-hidden="true" /> Remover local
                  </Button>
                )}
              </div>
            ))}
            <Button type="button" variant="outline" onClick={() => set("locais", [...form.locais, localVazio()])}>
              <Plus className="w-4 h-4" aria-hidden="true" /> Adicionar local
            </Button>
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="text-sm font-600">Contato</legend>
            <p className="text-sm text-muted-foreground">Pelo menos um. O contato aparece após a confirmação da reserva. Não fica no catálogo nem no perfil público.</p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="monitor-zap">WhatsApp</Label>
                <Input id="monitor-zap" inputMode="tel" autoComplete="tel" value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} placeholder="61 99999-8888" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="monitor-ig">Instagram</Label>
                <Input id="monitor-ig" value={form.instagram} onChange={(e) => set("instagram", e.target.value)} placeholder="@seuuser" maxLength={80} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="monitor-email">E-mail</Label>
              <Input id="monitor-email" type="email" autoComplete="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
            </div>
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="text-sm font-600">Disponibilidade semanal</legend>
            <p className="text-sm text-muted-foreground">Essa grade se repete toda semana. No calendário você abre ou bloqueia datas específicas.</p>
            <ul className="space-y-3">
              {DIAS.map((dia) => {
                const blocos = blocosDoDia(dia.id);
                const ativo = blocos.length > 0;
                return (
                  <li key={dia.id} className="rounded-xl border border-border p-3 sm:p-4">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-600">{dia.label}</span>
                      <button
                        type="button"
                        aria-pressed={ativo}
                        onClick={() => alternarDia(dia.id)}
                        className={`min-h-11 px-3 rounded-lg text-sm font-600 border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                          ativo ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border"
                        }`}
                      >
                        {ativo ? "Atendo" : "Não atendo"}
                      </button>
                    </div>
                    {ativo && (
                      <div className="mt-3 space-y-3">
                        {blocos.map((bloco) => (
                          <div key={bloco.indice} className="grid grid-cols-2 sm:grid-cols-[1fr_1fr_auto] gap-3 items-end">
                            <div className="space-y-1.5">
                              <Label htmlFor={`ini-${bloco.indice}`}>Começa às</Label>
                              <input
                                id={`ini-${bloco.indice}`}
                                type="time"
                                value={bloco.inicio}
                                onChange={(e) => setBloco(bloco.indice, { inicio: e.target.value })}
                                className={selectClass}
                                required
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label htmlFor={`horas-${bloco.indice}`}>Durante quantas horas (período total)</Label>
                              <input
                                id={`horas-${bloco.indice}`}
                                type="number"
                                inputMode="decimal"
                                min="0.5"
                                max="12"
                                step="0.5"
                                value={bloco.horas}
                                onChange={(e) => setBloco(bloco.indice, { horas: e.target.value })}
                                className={selectClass}
                                required
                              />
                            </div>
                            {fimDoHorario(bloco.inicio, bloco.horas) && (
                              <p className="col-span-2 sm:col-span-3 text-sm text-muted-foreground -mt-1">
                                Atende das {bloco.inicio} às {fimDoHorario(bloco.inicio, bloco.horas)}. O cliente escolhe quantas horas quer dentro desse período.
                              </p>
                            )}
                            <Button type="button" variant="ghost" className="col-span-2 sm:col-span-1" onClick={() => set("disponibilidade", form.disponibilidade.filter((_, idx) => idx !== bloco.indice))} aria-label={`Remover horário de ${dia.label}`}>
                              <Trash2 className="w-4 h-4" aria-hidden="true" /> Remover
                            </Button>
                          </div>
                        ))}
                        <Button type="button" variant="outline" onClick={() => set("disponibilidade", [...form.disponibilidade, { dia: dia.id, inicio: "14:00", horas: 3 }])}>
                          <Plus className="w-4 h-4" aria-hidden="true" /> Outro horário neste dia
                        </Button>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="text-sm font-600">Calendário do mês</legend>
            <p className="text-sm text-muted-foreground">Toque ou arraste os dias para marcar disponível ou bloquear. Dias que já têm reserva ficam com o horário ocupado bloqueado; se não sobrar horário, o dia aparece como reservado.</p>
            <CalendarioMes
              modo="editar"
              acao={acaoDia}
              onAcaoChange={setAcaoDia}
              monitor={form}
              ocupados={ocupados}
              onFaixa={(datas) => setForm((f) => ({ ...f, ...aplicarFaixaDias(f, datas, acaoDia) }))}
            />
          </fieldset>

          <div className="flex items-center justify-between gap-3 min-h-11 rounded-xl border border-border px-4 py-3">
            <Label htmlFor="monitor-publicado">Perfil visível no catálogo</Label>
            <Switch id="monitor-publicado" checked={form.publicado} onCheckedChange={(v) => set("publicado", v)} aria-label="Perfil visível no catálogo" />
          </div>
        </div>

        <div className="sticky bottom-0 z-10 mt-8 -mx-4 px-4 py-3 bg-card/95 backdrop-blur border-t border-border flex flex-col sm:flex-row gap-2 sm:static sm:mx-0 sm:px-0 sm:py-0 sm:bg-transparent sm:border-0 sm:backdrop-blur-none pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:pb-0">
          <Button type="submit" disabled={salvando} className="w-full sm:w-auto">
            {salvando ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : null}
            Salvar perfil
          </Button>
          {monitor && (
            <Button type="button" variant="ghost" onClick={excluir} className="text-destructive">
              Excluir perfil
            </Button>
          )}
        </div>
      </form>
    </Layout>
  );
}
