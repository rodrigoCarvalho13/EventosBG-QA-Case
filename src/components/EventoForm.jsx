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
import { Loader2, Repeat, Calendar, ArrowLeft, ArrowRight } from "lucide-react";
import ChoiceCards from "@/components/ChoiceCards";
import { PUBLICO, ENTRADA, ALIMENTACAO } from "@/lib/eventoInfo";

const dayOptions = [
  { value: "domingo", label: "Domingo" },
  { value: "segunda", label: "Segunda" },
  { value: "terca", label: "Terça" },
  { value: "quarta", label: "Quarta" },
  { value: "quinta", label: "Quinta" },
  { value: "sexta", label: "Sexta" },
  { value: "sabado", label: "Sábado" },
];

// No celular o formulário é dividido nestas etapas; da tela "sm" para cima aparece inteiro.
const ETAPAS = ["Quando e onde", "Para quem e quanto custa", "Detalhes", "Inscrição"];
const ehCelular = () => typeof window !== "undefined" && window.matchMedia?.("(max-width: 639px)").matches;

const empty = {
  title: "",
  description: "",
  photo_url: "",
  recurrence_type: "fixa",
  day_of_week: "",
  event_date: "",
  event_end_date: "",
  start_time: "",
  end_time: "",
  loja_id: "",
  loja_name: "",
  location_name: "",
  address: "",
  estado: "DF",
  cidade: "Brasília",
  neighborhood: "",
  latitude: null,
  longitude: null,
  contact: "",
  instagram: "",
  facebook: "",
  youtube: "",
  tiktok: "",
  website: "",
  email: "",
  tags: [],
  publico: "misto",
  entrada: "gratuito",
  valor: "",
  alimentacao: [],
  gallery: [],
  tem_inscricao: true,
  inscricao_tipo: "site",
  inscricao_link: "",
  convite_obrigatorio: false,
  has_vagas: false,
  vagas: "",
  suggested_by_name: "",
  suggested_by_email: "",
};

export default function EventoForm({
  initialData,
  onSubmit,
  submitLabel = "Salvar",
  lojas = [],
  isSuggestion = false,
  onSalvarLocalLoja,
}) {
  const [salvandoLoja, setSalvandoLoja] = useState(false);
  const [lojaSalva, setLojaSalva] = useState(false);
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
  const [etapa, setEtapa] = useState(0);
  const ultima = etapa === ETAPAS.length - 1;
  const irParaEtapa = (n) => {
    setError("");
    setEtapa(n);
    requestAnimationFrame(() => document.getElementById("ev-progresso")?.scrollIntoView({ block: "start" }));
  };
  // Cada bloco só aparece na etapa dele no celular; os campos seguem montados, então nada se perde.
  const bloco = (n) => (etapa === n ? "space-y-5" : "hidden sm:block sm:space-y-5");

  const set = (k, v) => setData((d) => ({ ...d, [k]: v }));
  const isFixa = data.recurrence_type === "fixa";

  const handleLoja = (lojaId) => {
    const loja = lojas.find((l) => l.id === lojaId);
    if (!loja) {
      set("loja_id", lojaId);
      return;
    }
    setData((d) => ({
      ...d,
      loja_id: lojaId,
      loja_name: loja.name,
      loja_slug: loja.slug || "",
      location_name: d.location_name || loja.name,
      address: d.address || loja.address || "",
      estado: loja.estado || d.estado,
      cidade: loja.cidade || d.cidade,
      neighborhood: d.neighborhood || loja.neighborhood || "",
      // A localização salva na loja vale sempre; sem ela, mantém o que já foi marcado.
      latitude: typeof loja.latitude === "number" && typeof loja.longitude === "number" ? loja.latitude : d.latitude,
      longitude: typeof loja.latitude === "number" && typeof loja.longitude === "number" ? loja.longitude : d.longitude,
    }));
    setLojaSalva(false);
  };

  const lojaSelecionada = lojas.find((l) => l.id === data.loja_id);
  const lojaTemPonto = typeof lojaSelecionada?.latitude === "number" && typeof lojaSelecionada?.longitude === "number";
  const temPonto = typeof data.latitude === "number" && typeof data.longitude === "number";
  const mostrarSalvarNaLoja = onSalvarLocalLoja && lojaSelecionada && !lojaTemPonto && temPonto && !lojaSalva;

  const salvarLocalNaLoja = async () => {
    setSalvandoLoja(true);
    try {
      await onSalvarLocalLoja(lojaSelecionada.id, { latitude: data.latitude, longitude: data.longitude });
      setLojaSalva(true);
    } catch {
      setError("Não foi possível salvar a localização na loja.");
    } finally {
      setSalvandoLoja(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Enter num campo antes da última etapa, no celular, avança em vez de enviar.
    if (ehCelular() && !ultima) {
      irParaEtapa(etapa + 1);
      return;
    }
    // Se faltar algo de uma etapa anterior, leva a pessoa até ela.
    const voltar = (n, msg) => {
      setError(msg);
      if (ehCelular()) setEtapa(n);
    };
    if (fotosPendentes) {
      setError("Aguarde terminar o envio das fotos antes de salvar.");
      return;
    }
    if (!data.title.trim()) {
      voltar(0, "Informe o título.");
      return;
    }
    if (isFixa && !data.day_of_week) {
      voltar(0, "Escolha o dia da semana.");
      return;
    }
    if (!isFixa && !data.event_date) {
      voltar(0, "Escolha a data do evento.");
      return;
    }
    if (!isFixa && data.event_end_date && data.event_end_date < data.event_date) {
      voltar(0, "A data final não pode ser antes da data de início.");
      return;
    }
    const inscricaoPorLink = data.tem_inscricao !== false && data.inscricao_tipo === "link";
    if (inscricaoPorLink && !/^https?:\/\/\S+\.\S+/.test((data.inscricao_link || "").trim())) {
      voltar(3, "Informe o link da inscrição (começando com https://).");
      return;
    }
    if (data.tem_inscricao !== false && !inscricaoPorLink && data.has_vagas && (!data.vagas || Number(data.vagas) < 1)) {
      voltar(3, "Informe o número de vagas.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload = { ...data };
      // Data final só vale para evento de data única e quando é depois do início.
      if (isFixa || !payload.event_end_date || payload.event_end_date <= payload.event_date) {
        payload.event_end_date = "";
      }
      // Sem inscrição (ex.: encontro semanal aberto): não há vagas a controlar.
      // Inscrição por link externo: as vagas são controladas no formulário de fora.
      if (payload.tem_inscricao === false || payload.inscricao_tipo === "link") {
        payload.has_vagas = false;
        payload.convite_obrigatorio = false;
      }
      if (payload.tem_inscricao === false || payload.inscricao_tipo !== "link") payload.inscricao_link = "";
      else payload.inscricao_link = payload.inscricao_link.trim();
      if (!payload.has_vagas) {
        delete payload.vagas;
      }
      await onSubmit(payload);
    } catch (err) {
      setError(err?.message || "Erro ao salvar.");
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 [&>*]:scroll-mt-20">
      <div id="ev-progresso" className="sm:hidden space-y-1.5">
        <div className="flex items-baseline justify-between gap-3 text-sm">
          <span className="font-700">{ETAPAS[etapa]}</span>
          <span className="text-muted-foreground">Etapa {etapa + 1} de {ETAPAS.length}</span>
        </div>
        <div
          role="progressbar"
          aria-label="Progresso do formulário"
          aria-valuemin={1}
          aria-valuemax={ETAPAS.length}
          aria-valuenow={etapa + 1}
          aria-valuetext={`Etapa ${etapa + 1} de ${ETAPAS.length}: ${ETAPAS[etapa]}`}
          className="h-2 rounded-full bg-muted overflow-hidden"
        >
          <div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${((etapa + 1) / ETAPAS.length) * 100}%` }} />
        </div>
      </div>

      <div className={bloco(0)}>
      <div className="space-y-1.5">
        <Label htmlFor="ev-title">Título *</Label>
        <Input id="ev-title" value={data.title} onChange={(e) => set("title", e.target.value)} placeholder="Ex. Noite de Party &amp; Ware" />
      </div>


      <div className="pt-2 border-t border-border mt-5">
        <h2 className="font-display font-700 text-lg">Quando e onde</h2>
        <p className="text-sm text-muted-foreground">O essencial para as pessoas encontrarem o evento.</p>
      </div>
      <ChoiceCards
        label="Recorrência"
        required
        value={data.recurrence_type}
        onChange={(v) => set("recurrence_type", v)}
        options={[
          { value: "fixa", label: "Fixa (semanal)", icon: Repeat },
          { value: "unica", label: "Data única", icon: Calendar },
        ]}
      />

      <div className="grid sm:grid-cols-2 gap-4">
        {isFixa ? (
          <div className="space-y-1.5">
            <Label htmlFor="ev-dia">Dia da semana *</Label>
            <Select value={data.day_of_week || undefined} onValueChange={(v) => set("day_of_week", v)}>
              <SelectTrigger id="ev-dia" aria-label="Dia da semana"><SelectValue placeholder="Selecione o dia" /></SelectTrigger>
              <SelectContent>
                {dayOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="ev-data">Data de início *</Label>
              <Input id="ev-data" type="date" value={data.event_date} onChange={(e) => set("event_date", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ev-data-fim">Data final</Label>
              <Input
                id="ev-data-fim"
                type="date"
                min={data.event_date || undefined}
                value={data.event_end_date || ""}
                onChange={(e) => set("event_end_date", e.target.value)}
                aria-describedby="ev-data-fim-dica"
              />
            </div>
            <p id="ev-data-fim-dica" className="col-span-2 -mt-1 text-xs text-muted-foreground">
              Opcional. Use para eventos de mais de um dia (ex.: acampamento de sexta a domingo). Em branco = só no dia de início.
            </p>
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="ev-inicio">Hora inicial</Label>
            <Input id="ev-inicio" type="time" value={data.start_time} onChange={(e) => set("start_time", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ev-fim">Hora final</Label>
            <Input id="ev-fim" type="time" value={data.end_time} onChange={(e) => set("end_time", e.target.value)} />
          </div>
        </div>
        {!isFixa && data.event_end_date && data.event_end_date > data.event_date && (
          <p className="text-xs text-muted-foreground">Esse horário vale para todos os dias do evento.</p>
        )}
      </div>

      {lojas.length > 0 && (
        <div className="space-y-1.5">
          <Label htmlFor="ev-loja">Loja / Espaço (opcional)</Label>
          <Select value={data.loja_id} onValueChange={handleLoja}>
            <SelectTrigger id="ev-loja" aria-label="Loja ou espaço"><SelectValue placeholder="Vincular a uma loja" /></SelectTrigger>
            <SelectContent>
              {lojas.map((l) => (
                <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="ev-local">Local</Label>
          <Input id="ev-local" value={data.location_name} onChange={(e) => set("location_name", e.target.value)} placeholder="Nome do local" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ev-endereco">Endereço</Label>
          <Input id="ev-endereco" value={data.address} onChange={(e) => set("address", e.target.value)} placeholder="Endereço completo" />
        </div>
      </div>

      <RegiaoFields idPrefix="ev" estado={data.estado} cidade={data.cidade} onChange={(v) => setData((d) => ({ ...d, ...v }))} />

      <div className="space-y-1.5">
        <Label htmlFor="ev-bairro">Bairro</Label>
        <Input id="ev-bairro" value={data.neighborhood} onChange={(e) => set("neighborhood", e.target.value)} placeholder="Ex. Asa Norte" />
      </div>

      <div className="space-y-1.5" id="gps-section">
        <Label htmlFor="map-toggle">Localização (GPS)</Label>
        <MapPicker
          value={{ latitude: data.latitude, longitude: data.longitude }}
          onChange={(v) => setData((d) => ({ ...d, latitude: v.latitude, longitude: v.longitude }))}
        />
        {lojaSelecionada && lojaTemPonto && (
          <p className="text-xs text-muted-foreground">Localização preenchida a partir da loja {lojaSelecionada.name}. Se precisar, ajuste no mapa.</p>
        )}
        {mostrarSalvarNaLoja && (
          <Button type="button" variant="outline" size="sm" onClick={salvarLocalNaLoja} disabled={salvandoLoja}>
            {salvandoLoja && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />}
            Salvar esta localização na loja {lojaSelecionada.name}
          </Button>
        )}
        {lojaSalva && <p className="text-xs text-muted-foreground">Localização salva na loja. Nos próximos eventos, basta escolher a loja.</p>}
      </div>

      </div>

      <div className={bloco(1)}>
      <div className="pt-2 border-t border-border">
        <h2 className="font-display font-700 text-lg">Para quem e quanto custa</h2>
        <p className="text-sm text-muted-foreground">Ajuda as pessoas a saberem se o evento é para elas.</p>
      </div>

      <ChoiceCards label="Público" value={data.publico} onChange={(v) => set("publico", v)} options={PUBLICO} columns={2} />

      <div className="space-y-3">
        <ChoiceCards label="Entrada" value={data.entrada} onChange={(v) => set("entrada", v)} options={ENTRADA} />
        {data.entrada === "pago" && (
          <div className="space-y-1.5">
            <Label htmlFor="ev-valor">Valor</Label>
            <Input
              id="ev-valor"
              inputMode="decimal"
              value={data.valor}
              onChange={(e) => set("valor", e.target.value)}
              placeholder="Ex. 20 ou 15 a 30 (com consumação)"
            />
          </div>
        )}
      </div>

      <fieldset className="space-y-1.5">
        <legend className="text-sm font-medium leading-none mb-1.5">Alimentação</legend>
        <div className="flex flex-wrap gap-2">
          {ALIMENTACAO.map((o) => {
            const on = (data.alimentacao || []).includes(o.value);
            return (
              <label
                key={o.value}
                className={`inline-flex items-center gap-2 px-3.5 min-h-[44px] rounded-full border-2 text-sm font-600 cursor-pointer select-none transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring ${
                  on ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:border-primary/40"
                }`}
              >
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={on}
                  onChange={() => {
                    const atual = data.alimentacao || [];
                    let prox = on ? atual.filter((x) => x !== o.value) : [...atual, o.value];
                    // "Sem alimentação" exclui as outras opções e vice-versa.
                    if (!on && o.value === "nao_tem") prox = ["nao_tem"];
                    else if (!on) prox = prox.filter((x) => x !== "nao_tem");
                    set("alimentacao", prox);
                  }}
                />
                {on ? "✓ " : ""}
                {o.label}
              </label>
            );
          })}
        </div>
      </fieldset>

      </div>

      <div className={bloco(2)}>
      <div className="pt-2 border-t border-border">
        <h2 className="font-display font-700 text-lg">Detalhes</h2>
        <p className="text-sm text-muted-foreground">Opcional — ajuda o evento a chamar atenção.</p>
      </div>
      <ImageUpload value={data.photo_url} onChange={(v) => set("photo_url", v)} onBusyChange={marcarEnvio("capa")} label="Foto do evento" />

      <GalleryUpload value={data.gallery} onChange={(v) => set("gallery", v)} onBusyChange={marcarEnvio("galeria")} label="Galeria do evento" hint="Adicione fotos de edições anteriores ou dos jogos. Elas aparecem em um carrossel na página do evento." />

      <div className="space-y-1.5">
        <Label htmlFor="ev-desc">Descrição</Label>
        <Textarea
          id="ev-desc"
          value={data.description}
          onChange={(e) => set("description", e.target.value)}
          rows={3}
          placeholder="O que vai rolar, jogos disponíveis, inscrições…"
        />
      </div>

      <TagInput value={data.tags} onChange={(v) => set("tags", v)} />

      <div className="space-y-1.5">
        <Label htmlFor="ev-contato">Contato</Label>
        <Input id="ev-contato" value={data.contact} onChange={(e) => set("contact", e.target.value)} placeholder="Telefone, link de inscrição…" />
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="ev-insta">Instagram</Label>
          <Input id="ev-insta" autoCapitalize="none" value={data.instagram} onChange={(e) => set("instagram", e.target.value)} placeholder="@evento" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ev-site">Site</Label>
          <Input id="ev-site" inputMode="url" autoCapitalize="none" value={data.website} onChange={(e) => set("website", e.target.value)} placeholder="https://" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ev-email">E-mail</Label>
          <Input id="ev-email" type="email" autoCapitalize="none" value={data.email} onChange={(e) => set("email", e.target.value)} placeholder="contato@" />
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="ev-facebook">Facebook</Label>
          <Input id="ev-facebook" autoCapitalize="none" value={data.facebook || ""} onChange={(e) => set("facebook", e.target.value)} placeholder="link da página" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ev-youtube">YouTube</Label>
          <Input id="ev-youtube" autoCapitalize="none" value={data.youtube || ""} onChange={(e) => set("youtube", e.target.value)} placeholder="@canal" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ev-tiktok">TikTok</Label>
          <Input id="ev-tiktok" autoCapitalize="none" value={data.tiktok || ""} onChange={(e) => set("tiktok", e.target.value)} placeholder="@evento" />
        </div>
      </div>

      </div>

      <div className={bloco(3)}>
      <div className="space-y-3 p-4 rounded-xl bg-muted/40 border border-border">
        <div>
          <span className="block text-sm font-600 mb-2">Inscrição</span>
          <div role="radiogroup" aria-label="Inscrição" className="grid grid-cols-2 gap-2">
            {[
              { v: true, t: "Com inscrição", d: "As pessoas confirmam presença pelo site." },
              { v: false, t: "Sem inscrição", d: "É só aparecer no local." },
            ].map((o) => {
              const on = (data.tem_inscricao !== false) === o.v;
              return (
                <button
                  key={o.t}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => set("tem_inscricao", o.v)}
                  className={`text-left rounded-lg border p-3 transition-colors ${on ? "border-primary bg-primary/10" : "border-border bg-card hover:bg-muted"}`}
                >
                  <span className="block text-sm font-600">{o.t}</span>
                  <span className="block text-xs text-muted-foreground">{o.d}</span>
                </button>
              );
            })}
          </div>
        </div>
        {data.tem_inscricao !== false && (
          <div>
            <span className="block text-sm font-600 mb-2">Onde a pessoa se inscreve</span>
            <div role="radiogroup" aria-label="Onde a pessoa se inscreve" className="grid grid-cols-2 gap-2">
              {[
                { v: "site", t: "Pelo site", d: "Você vê a lista de inscritos no seu painel." },
                { v: "link", t: "Link externo", d: "Formulário ou página de fora (Google Forms, Sympla…)." },
              ].map((o) => {
                const on = (data.inscricao_tipo || "site") === o.v;
                return (
                  <button
                    key={o.v}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => set("inscricao_tipo", o.v)}
                    className={`text-left rounded-lg border p-3 transition-colors ${on ? "border-primary bg-primary/10" : "border-border bg-card hover:bg-muted"}`}
                  >
                    <span className="block text-sm font-600">{o.t}</span>
                    <span className="block text-xs text-muted-foreground">{o.d}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
        {data.tem_inscricao !== false && data.inscricao_tipo === "link" && (
          <div className="space-y-1.5">
            <Label htmlFor="ev-insc-link">Link da inscrição *</Label>
            <Input
              id="ev-insc-link"
              inputMode="url"
              autoCapitalize="none"
              value={data.inscricao_link || ""}
              onChange={(e) => set("inscricao_link", e.target.value)}
              placeholder="https://forms.gle/…"
            />
          </div>
        )}
        {data.tem_inscricao !== false && data.inscricao_tipo !== "link" && (<>
        <label htmlFor="ev-has-vagas" className="flex items-center gap-2.5 cursor-pointer">
          <input
            id="ev-has-vagas"
            name="has_vagas"
            type="checkbox"
            checked={!!data.has_vagas}
            onChange={(e) => set("has_vagas", e.target.checked)}
            className="w-4 h-4 accent-primary"
          />
          <span className="text-sm font-600">Limitar vagas</span>
        </label>
        {data.has_vagas && (
          <div className="space-y-1.5">
            <Label htmlFor="ev-vagas">Número de vagas *</Label>
            <Input
              id="ev-vagas"
              type="number"
              min="1"
              value={data.vagas}
              onChange={(e) => set("vagas", e.target.value ? Number(e.target.value) : "")}
              placeholder="Ex. 20"
            />
          </div>
        )}
        <p className="text-xs text-muted-foreground">
          Se ativado, o evento mostra vagas restantes e bloqueia inscrições ao esgotar.
        </p>
        <label htmlFor="ev-convite" className="flex items-center gap-2.5 cursor-pointer">
          <input
            id="ev-convite"
            name="convite_obrigatorio"
            type="checkbox"
            checked={!!data.convite_obrigatorio}
            onChange={(e) => set("convite_obrigatorio", e.target.checked)}
            className="w-4 h-4 accent-primary"
          />
          <span className="text-sm font-600">Convite pago (exige código)</span>
        </label>
        <p className="text-xs text-muted-foreground">
          Só se inscreve quem tiver um código seu. Cada código vale uma vez. Depois de salvar, cadastre os códigos em Painel → Eventos → Códigos de convite.
        </p>
        </>)}
      </div>

      {isSuggestion && (
        <div className="grid sm:grid-cols-2 gap-4 mt-5 p-4 rounded-xl bg-accent/10 border border-accent/30">
          <div className="space-y-1.5">
            <Label htmlFor="ev-sug-nome">Seu nome *</Label>
            <Input id="ev-sug-nome" autoComplete="name" value={data.suggested_by_name} onChange={(e) => set("suggested_by_name", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ev-sug-email">Seu e-mail *</Label>
            <Input id="ev-sug-email" type="email" autoComplete="email" autoCapitalize="none" value={data.suggested_by_email} onChange={(e) => set("suggested_by_email", e.target.value)} />
          </div>
          <p className="text-xs text-muted-foreground sm:col-span-2">
            Não precisa de conta para cadastrar.
          </p>
        </div>
      )}

      {/* No celular o botão fica fixo no rodapé da tela, sempre à mão. */}
      </div>

      <div className="sticky bottom-0 z-10 -mx-6 px-6 py-3 bg-card/95 backdrop-blur border-t border-border sm:static sm:mx-0 sm:px-0 sm:py-0 sm:bg-transparent sm:border-0 sm:backdrop-blur-none space-y-2">
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-2">
        {etapa > 0 && (
          <Button type="button" variant="outline" onClick={() => irParaEtapa(etapa - 1)} className="sm:hidden">
            <ArrowLeft className="w-4 h-4 mr-1.5" aria-hidden="true" /> Voltar
          </Button>
        )}
        {!ultima && (
          <Button type="button" onClick={() => irParaEtapa(etapa + 1)} className="flex-1 sm:hidden bg-primary text-primary-foreground hover:bg-primary/90">
            Próxima etapa <ArrowRight className="w-4 h-4 ml-1.5" aria-hidden="true" />
          </Button>
        )}
        <Button type="submit" disabled={saving || fotosPendentes} aria-label={submitLabel} className={`${ultima ? "flex-1" : "hidden"} sm:inline-flex sm:flex-none sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90`}>
          {saving || fotosPendentes ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          {fotosPendentes ? "Enviando fotos…" : submitLabel}
        </Button>
      </div>
      </div>
    </form>
  );
}