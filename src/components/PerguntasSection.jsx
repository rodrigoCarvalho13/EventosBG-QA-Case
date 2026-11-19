import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { pedirPermissaoNotificacao } from "@/lib/onesignal";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessagesSquare, Loader2, Reply, Trash2, BadgeCheck } from "lucide-react";

// Perguntas e respostas no estilo dos comentários do YouTube: perguntas em
// cima, respostas recuadas logo abaixo. Em evento, mostra as perguntas dele;
// em loja/grupo, funciona como fórum e junta as perguntas dos seus eventos.
function quando(iso) {
  if (!iso) return "";
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 60) return "agora";
  if (s < 3600) return `há ${Math.floor(s / 60)} min`;
  if (s < 86400) return `há ${Math.floor(s / 3600)} h`;
  if (s < 86400 * 30) return `há ${Math.floor(s / 86400)} dia${s >= 86400 * 2 ? "s" : ""}`;
  return new Date(iso).toLocaleDateString("pt-BR");
}

function Inicial({ nome, destaque }) {
  return (
    <span
      aria-hidden="true"
      className={`grid place-items-center w-9 h-9 shrink-0 rounded-full font-700 text-sm ${destaque ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}
    >
      {(nome || "?").trim().charAt(0).toUpperCase()}
    </span>
  );
}

function Caixa({ id, placeholder, rotulo, onEnviar, onCancelar, autoFocus }) {
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const enviar = async (e) => {
    e.preventDefault();
    if (!texto.trim()) return;
    setEnviando(true);
    setErro("");
    try {
      await onEnviar(texto.trim());
      setTexto("");
    } catch (err) {
      setErro(err.message || "Não foi possível enviar. Tente de novo.");
    } finally {
      setEnviando(false);
    }
  };
  return (
    <form onSubmit={enviar} className="space-y-2">
      <label htmlFor={id} className="sr-only">{rotulo}</label>
      <Textarea id={id} value={texto} onChange={(e) => setTexto(e.target.value)} placeholder={placeholder} rows={2} maxLength={2000} autoFocus={autoFocus} />
      {erro && <p role="alert" className="text-sm text-destructive">{erro}</p>}
      <div className="flex gap-2 justify-end">
        {onCancelar && (
          <Button type="button" variant="ghost" size="sm" onClick={onCancelar}>Cancelar</Button>
        )}
        <Button type="submit" size="sm" disabled={enviando || !texto.trim()}>
          {enviando && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" aria-hidden="true" />}
          {rotulo}
        </Button>
      </div>
    </form>
  );
}

function Item({ p, podeApagar, onApagar, mostrarAlvo, children, acoes }) {
  return (
    <div className="flex gap-3">
      <Inicial nome={p.autor_nome} destaque={p.do_organizador} />
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm">
          <span className="font-600">{p.autor_nome}</span>
          {p.do_organizador && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary dark:text-accent px-2 py-0.5 text-xs font-600">
              <BadgeCheck className="w-3.5 h-3.5" aria-hidden="true" /> Organizador
            </span>
          )}
          <span className="text-xs text-muted-foreground">{quando(p.created_date)}</span>
        </div>
        {mostrarAlvo && p.alvo_tipo === "evento" && (
          <Link to={`/eventos/${p.alvo_id}`} className="text-xs text-primary dark:text-accent hover:underline">
            sobre o evento {p.alvo_titulo}
          </Link>
        )}
        <p className="mt-1 text-sm whitespace-pre-line break-words">{p.texto}</p>
        <div className="mt-1 flex items-center gap-1">
          {acoes}
          {podeApagar && (
            <Button type="button" variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground" onClick={() => onApagar(p)}>
              <Trash2 className="w-4 h-4 mr-1" aria-hidden="true" /> Apagar
            </Button>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}

export default function PerguntasSection({ tipo, alvo }) {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(true);
  const [respondendo, setRespondendo] = useState(null);

  const ehForum = tipo === "loja";
  const filtro = ehForum ? { loja_id: alvo.id } : { alvo_tipo: "evento", alvo_id: alvo.id };

  const load = async () => {
    try {
      const res = await base44.entities.Pergunta.filter(filtro, { sort: "-created_date", limit: 200 });
      setLista(res.items || res || []);
    } catch {
      setLista([]);
    } finally {
      setLoading(false);
    }
  };

  // Link dos avisos (#perguntas-titulo): rola até a seção depois de carregar.
  useEffect(() => {
    if (!loading && location.hash === "#perguntas-titulo") {
      document.getElementById("perguntas-titulo")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [loading, location.hash]);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alvo.id, tipo]);

  const enviar = async (texto, parent_id) => {
    let data;
    try {
      const res = await base44.functions.invoke("enviarPergunta", { alvo_tipo: tipo, alvo_id: alvo.id, parent_id, texto });
      data = res?.data ?? res;
    } catch (err) {
      throw new Error(err?.response?.data?.error || err?.data?.error || "Não foi possível enviar. Tente de novo.");
    }
    if (data?.error) throw new Error(data.error);
    setRespondendo(null);
    // Para receber o aviso de resposta também no navegador, se a pessoa permitir.
    pedirPermissaoNotificacao();
    await load();
  };

  const apagar = async (p) => {
    if (!window.confirm(p.parent_id ? "Apagar esta resposta?" : "Apagar esta pergunta e as respostas dela?")) return;
    const filhos = p.parent_id ? [] : lista.filter((x) => x.parent_id === p.id);
    await Promise.all([p, ...filhos].map((x) => base44.entities.Pergunta.delete(x.id).catch(() => {})));
    await load();
  };

  const podeApagar = (p) => !!user && (user.role === "admin" || p.autor_id === user.id || p.alvo_owner_id === user.id);
  const perguntas = lista
    .filter((p) => !p.parent_id)
    .sort((a, b) => (b.created_date || "").localeCompare(a.created_date || ""));
  const respostasDe = (id) =>
    lista.filter((p) => p.parent_id === id).sort((a, b) => (a.created_date || "").localeCompare(b.created_date || ""));
  const loginLink = `/login?returnTo=${encodeURIComponent(location.pathname)}`;

  return (
    <section className="mt-10" aria-labelledby="perguntas-titulo">
      <div className="flex items-center gap-2 mb-4">
        <MessagesSquare className="w-6 h-6 text-primary" aria-hidden="true" />
        <h2 id="perguntas-titulo" className="font-display font-700 text-2xl">
          {ehForum ? "Fórum de perguntas" : "Perguntas"}
          {perguntas.length > 0 && <span className="text-muted-foreground font-500 text-lg"> · {perguntas.length}</span>}
        </h2>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        {ehForum
          ? "Tire dúvidas com quem organiza. Aqui também aparecem as perguntas feitas nos eventos."
          : "Tem alguma dúvida sobre o evento? Pergunte e o organizador responde aqui."}
      </p>

      <div className="rounded-2xl border border-border bg-card p-4 card-shadow mb-6">
        {isAuthenticated ? (
          <Caixa id="nova-pergunta" placeholder="Escreva sua pergunta…" rotulo="Perguntar" onEnviar={(t) => enviar(t)} />
        ) : (
          <p className="text-sm">
            <Link to={loginLink} className="font-600 text-primary dark:text-accent hover:underline">Entre na sua conta</Link>{" "}
            para fazer uma pergunta ou responder.
          </p>
        )}
      </div>

      {loading ? (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> Carregando perguntas…
        </p>
      ) : perguntas.length === 0 ? (
        <p className="text-sm text-muted-foreground bg-muted/40 rounded-lg p-6 text-center">
          Ainda não há perguntas. Seja a primeira pessoa a perguntar!
        </p>
      ) : (
        <ul className="space-y-6">
          {perguntas.map((p) => {
            const respostas = respostasDe(p.id);
            return (
              <li key={p.id}>
                <Item
                  p={p}
                  mostrarAlvo={ehForum}
                  podeApagar={podeApagar(p)}
                  onApagar={apagar}
                  acoes={
                    isAuthenticated && (
                      <Button type="button" variant="ghost" size="sm" className="h-8 px-2" onClick={() => setRespondendo(p.id)} aria-label={`Responder ${p.autor_nome}`}>
                        <Reply className="w-4 h-4 mr-1" aria-hidden="true" /> Responder
                      </Button>
                    )
                  }
                >
                  {(respostas.length > 0 || respondendo === p.id) && (
                    <div className="mt-3 space-y-4 border-l-2 border-border pl-4">
                      {respostas.map((r) => (
                        <Item
                          key={r.id}
                          p={r}
                          podeApagar={podeApagar(r)}
                          onApagar={apagar}
                          acoes={
                            isAuthenticated && (
                              <Button type="button" variant="ghost" size="sm" className="h-8 px-2" onClick={() => setRespondendo(p.id)} aria-label={`Responder ${r.autor_nome}`}>
                                <Reply className="w-4 h-4 mr-1" aria-hidden="true" /> Responder
                              </Button>
                            )
                          }
                        />
                      ))}
                      {respondendo === p.id && (
                        <Caixa
                          id={`resp-${p.id}`}
                          placeholder={`Responder a ${p.autor_nome}…`}
                          rotulo="Responder"
                          autoFocus
                          onEnviar={(t) => enviar(t, p.id)}
                          onCancelar={() => setRespondendo(null)}
                        />
                      )}
                    </div>
                  )}
                </Item>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
