import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import Layout from "@/components/Layout";
import LogoSpinner from "@/components/LogoSpinner";
import RegiaoFields from "@/components/RegiaoFields";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { listarTudo, listarPorIds } from "@/lib/paginar";
import { eventoPath } from "@/lib/slug";
import { diaISO } from "@/lib/presencas";
import { getEstadoAtual, getEstadoInfo } from "@/lib/regiao";
import { BellRing, CalendarCheck, CalendarDays, Dices, GraduationCap, Heart, Loader2, Star, UserRound, X } from "lucide-react";

const dataBR = (iso) => {
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short", year: "numeric" }).replace(/\./g, "");
};

function Numero({ icon: Icon, valor, rotulo, to }) {
  const corpo = (
    <>
      <Icon className="w-5 h-5 text-accent-ink" aria-hidden="true" />
      <span className="block font-display font-700 text-2xl mt-1">{valor}</span>
      <span className="block text-xs text-muted-foreground">{rotulo}</span>
    </>
  );
  const cls = "rounded-2xl border border-border bg-card p-4";
  return to ? <Link to={to} className={`${cls} hover:border-primary/40`}>{corpo}</Link> : <div className={cls}>{corpo}</div>;
}

// Perfil do jogador: jogos favoritos, eventos que marcou "Vou!", monitores avaliados e quem segue.
export default function Perfil() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [perfil, setPerfil] = useState(null);
  const [form, setForm] = useState(null);
  const [novoJogo, setNovoJogo] = useState("");
  const [presencas, setPresencas] = useState([]);
  const [eventos, setEventos] = useState(new Map());
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [seguindo, setSeguindo] = useState(0);
  const [curtidas, setCurtidas] = useState(0);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!user) return undefined;
    let ativo = true;
    (async () => {
      const seguro = (p, padrao) => p.catch(() => padrao);
      const [perfis, pres, reservas, nSeg, nCurt] = await Promise.all([
        seguro(base44.entities.PerfilJogador.filter({ created_by_id: user.id }, { limit: 1 }).then((p) => p.items || []), []),
        seguro(listarTudo(base44.entities.Presenca, { created_by_id: user.id }, { sort: "-data", limit: 200 }), []),
        seguro(listarTudo(base44.entities.ReservaMonitor, { cliente_id: user.id, status: "finalizada" }, { limit: 100 }), []),
        seguro(base44.entities.Seguindo.count({ created_by_id: user.id }), 0),
        seguro(base44.entities.Curtida.count({ created_by_id: user.id }), 0),
      ]);
      const [evs, avs] = await Promise.all([
        seguro(listarPorIds(base44.entities.Programacao, "id", pres.map((p) => p.evento_id), { fields: ["title", "slug", "loja_name", "location_name", "start_time"] }), []),
        seguro(listarPorIds(base44.entities.AvaliacaoMonitor, "reserva_id", reservas.map((r) => r.id), { fields: ["reserva_id", "nota", "comentario"] }), []),
      ]);
      if (!ativo) return;
      const p = perfis[0] || null;
      const estado = p?.estado || getEstadoAtual();
      setPerfil(p);
      setForm({
        apelido: p?.apelido || user.full_name?.split(" ")[0] || "",
        bio: p?.bio || "",
        jogos_favoritos: p?.jogos_favoritos || [],
        estado,
        cidade: p?.cidade || getEstadoInfo(estado).cidadePadrao,
      });
      setPresencas(pres);
      setEventos(new Map(evs.map((e) => [e.id, e])));
      const porReserva = new Map(reservas.map((r) => [r.id, r]));
      setAvaliacoes(avs.map((a) => ({ ...a, reserva: porReserva.get(a.reserva_id) })).filter((a) => a.reserva));
      setSeguindo(nSeg || 0);
      setCurtidas(nCurt || 0);
      setLoading(false);
    })();
    return () => { ativo = false; };
  }, [user]);

  const hoje = diaISO(new Date());
  const { fui, vou } = useMemo(() => {
    const comEvento = presencas.filter((p) => eventos.has(p.evento_id));
    return {
      fui: comEvento.filter((p) => p.data < hoje).sort((a, b) => b.data.localeCompare(a.data)),
      vou: comEvento.filter((p) => p.data >= hoje).sort((a, b) => a.data.localeCompare(b.data)),
    };
  }, [presencas, eventos, hoje]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const addJogo = () => {
    const j = novoJogo.trim();
    if (!j) return;
    if (!form.jogos_favoritos.some((x) => x.toLowerCase() === j.toLowerCase())) set("jogos_favoritos", [...form.jogos_favoritos, j].slice(0, 30));
    setNovoJogo("");
  };

  const salvar = async (e) => {
    e.preventDefault();
    setSalvando(true);
    try {
      const payload = { ...form, apelido: form.apelido.trim(), bio: form.bio.trim() };
      const salvo = perfil ? await base44.entities.PerfilJogador.update(perfil.id, payload) : await base44.entities.PerfilJogador.create(payload);
      setPerfil(salvo);
      toast({ title: "Perfil salvo" });
    } catch (err) {
      toast({ title: "Não foi possível salvar o perfil", variant: "destructive" });
    } finally {
      setSalvando(false);
    }
  };

  const linhaEvento = (p) => {
    const ev = eventos.get(p.evento_id);
    return (
      <li key={p.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
        <CalendarDays className="w-4 h-4 text-accent-ink shrink-0" aria-hidden="true" />
        <span className="flex-1 min-w-0">
          <Link to={eventoPath(ev)} className="block font-600 truncate hover:underline">{ev.title}</Link>
          <span className="block text-xs text-muted-foreground truncate">
            {dataBR(p.data)}{ev.loja_name || ev.location_name ? ` · ${ev.loja_name || ev.location_name}` : ""}
          </span>
        </span>
      </li>
    );
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-10 sm:py-14">
        <p className="text-xs font-700 uppercase tracking-[0.2em] text-accent-ink mb-2">Meu perfil</p>
        <h1 className="font-display font-700 text-3xl sm:text-4xl tracking-tight flex items-center gap-3">
          <span className="grid place-items-center w-12 h-12 rounded-full bg-accent/25 text-accent-ink shrink-0">
            <UserRound className="w-6 h-6" aria-hidden="true" />
          </span>
          {form?.apelido || "Jogador"}
        </h1>

        {loading || !form ? (
          <LogoSpinner />
        ) : (
          <>
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Numero icon={CalendarCheck} valor={fui.length} rotulo={fui.length === 1 ? "evento que fui" : "eventos que fui"} />
              <Numero icon={GraduationCap} valor={avaliacoes.length} rotulo={avaliacoes.length === 1 ? "monitor avaliado" : "monitores avaliados"} to="/painel/reservas" />
              <Numero icon={BellRing} valor={seguindo} rotulo="lugares e grupos que sigo" to="/seguindo" />
              <Numero icon={Heart} valor={curtidas} rotulo="curtidas" />
            </div>

            <form onSubmit={salvar} className="mt-8 rounded-2xl bg-card border border-border card-shadow p-6 space-y-5">
              <h2 className="font-display font-700 text-xl">Sobre mim</h2>
              <div className="space-y-1.5">
                <Label htmlFor="pf-apelido">Como quer ser chamado</Label>
                <Input id="pf-apelido" value={form.apelido} onChange={(e) => set("apelido", e.target.value)} maxLength={60} />
              </div>
              <RegiaoFields idPrefix="pf" estado={form.estado} cidade={form.cidade} onChange={(r) => setForm((f) => ({ ...f, ...r }))} />
              <div className="space-y-1.5">
                <Label htmlFor="pf-bio">Sobre você</Label>
                <Textarea id="pf-bio" rows={3} value={form.bio} onChange={(e) => set("bio", e.target.value)} maxLength={500} placeholder="Que tipo de jogo você curte? Joga desde quando?" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pf-jogo">Jogos favoritos</Label>
                <div className="flex gap-2">
                  <Input
                    id="pf-jogo"
                    value={novoJogo}
                    onChange={(e) => setNovoJogo(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addJogo(); } }}
                    placeholder="Ex.: Cascadia"
                    maxLength={80}
                    className="h-11"
                  />
                  <Button type="button" variant="outline" onClick={addJogo} className="h-11">Adicionar</Button>
                </div>
                {form.jogos_favoritos.length > 0 && (
                  <ul className="flex flex-wrap gap-2 pt-2" aria-label="Jogos favoritos">
                    {form.jogos_favoritos.map((j) => (
                      <li key={j} className="inline-flex items-center gap-1 rounded-full bg-accent/20 pl-3 pr-1 py-1 text-sm font-600">
                        <Dices className="w-3.5 h-3.5" aria-hidden="true" /> {j}
                        <button
                          type="button"
                          onClick={() => set("jogos_favoritos", form.jogos_favoritos.filter((x) => x !== j))}
                          aria-label={`Tirar ${j}`}
                          className="grid place-items-center w-7 h-7 rounded-full hover:bg-accent/30"
                        >
                          <X className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <p className="text-xs text-muted-foreground">Seu perfil é só seu: ninguém mais vê estes dados.</p>
              <Button type="submit" disabled={salvando} className="h-11">
                {salvando && <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />}
                Salvar perfil
              </Button>
            </form>

            <section className="mt-10">
              <h2 className="font-display font-700 text-xl mb-3">Vou nos próximos</h2>
              {vou.length === 0 ? (
                <p className="text-sm text-muted-foreground">Marque <strong>Vou!</strong> num evento da <Link to="/eventos" className="font-600 text-primary dark:text-accent hover:underline">agenda</Link> e ele aparece aqui.</p>
              ) : (
                <ul className="space-y-2">{vou.map(linhaEvento)}</ul>
              )}
            </section>

            <section className="mt-10">
              <h2 className="font-display font-700 text-xl mb-3">Eventos de que participei</h2>
              {fui.length === 0 ? (
                <p className="text-sm text-muted-foreground">Os eventos em que você marcou <strong>Vou!</strong> ficam guardados aqui depois que acontecem.</p>
              ) : (
                <ul className="space-y-2">{fui.map(linhaEvento)}</ul>
              )}
            </section>

            <section className="mt-10">
              <h2 className="font-display font-700 text-xl mb-3">Monitores que avaliei</h2>
              {avaliacoes.length === 0 ? (
                <p className="text-sm text-muted-foreground">Depois de uma mesa com <Link to="/monitores" className="font-600 text-primary dark:text-accent hover:underline">monitor</Link>, avalie em Minhas reservas e ela aparece aqui.</p>
              ) : (
                <ul className="space-y-2">
                  {avaliacoes.map((a) => (
                    <li key={a.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
                      <GraduationCap className="w-4 h-4 text-accent-ink shrink-0" aria-hidden="true" />
                      <span className="flex-1 min-w-0">
                        <Link to={`/monitores/${a.reserva.monitor_slug || a.reserva.monitor_id}`} className="block font-600 truncate hover:underline">{a.reserva.monitor_nome}</Link>
                        <span className="block text-xs text-muted-foreground truncate">
                          {a.reserva.jogo ? `${a.reserva.jogo} · ` : ""}{a.reserva.data ? dataBR(a.reserva.data) : ""}
                        </span>
                      </span>
                      <span className="inline-flex items-center gap-1 text-sm font-700" aria-label={`Nota ${a.nota} de 5`}>
                        <Star className="w-4 h-4 fill-accent text-accent" aria-hidden="true" /> {a.nota}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </div>
    </Layout>
  );
}
