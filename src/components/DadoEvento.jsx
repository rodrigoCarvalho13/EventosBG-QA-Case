import React, { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Dices, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import EventoCard from "@/components/EventoCard";
import { haversine } from "@/lib/geo";

const RAIO_KM = 25;
const DIAS_PROXIMOS = 14;
const DURACAO_MS = 1500;
const PIPS = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] };
const faceAleatoria = () => 1 + Math.floor(Math.random() * 6);

function Dado({ face }) {
  return (
    <div className="grid h-20 w-20 grid-cols-3 grid-rows-3 gap-1 rounded-2xl bg-white p-3 shadow-xl ring-1 ring-black/10" aria-hidden="true">
      {[...Array(9)].map((_, i) => (
        <span key={i} className={`m-auto h-3.5 w-3.5 rounded-full ${PIPS[face].includes(i) ? "bg-[hsl(152_36%_16%)]" : "bg-transparent"}`} />
      ))}
    </div>
  );
}

function pegarLocalizacao() {
  return new Promise((resolve) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve(null),
      { timeout: 5000, maximumAge: 10 * 60 * 1000 }
    );
  });
}

// Sorteia entre os eventos perto de quem clicou; sem localização, usa a cidade escolhida (ou o estado todo).
export function sortearEvento(eventos, loc, escopoPadrao, ultimoId) {
  let pool = eventos;
  let escopo = escopoPadrao;
  let semPerto = false;
  if (loc) {
    const comDist = eventos
      .filter((e) => typeof e.latitude === "number" && typeof e.longitude === "number")
      .map((e) => ({ ...e, _dist: haversine(loc.lat, loc.lng, e.latitude, e.longitude) }));
    const perto = comDist.filter((e) => e._dist <= RAIO_KM);
    if (perto.length) {
      pool = perto;
      escopo = "perto de você";
    } else {
      semPerto = true;
    }
  }
  const limite = new Date();
  limite.setDate(limite.getDate() + DIAS_PROXIMOS);
  const logo = pool.filter((e) => e._prox && e._prox < limite);
  if (logo.length) pool = logo;
  const opcoes = pool.length > 1 ? pool.filter((e) => e.id !== ultimoId) : pool;
  if (!opcoes.length) return { evento: null, escopo, semPerto };
  return { evento: opcoes[Math.floor(Math.random() * opcoes.length)], escopo, semPerto };
}

export default function DadoEvento({ eventos, escopoPadrao }) {
  const reduzir = useReducedMotion();
  const [rolando, setRolando] = useState(false);
  const [face, setFace] = useState(5);
  const [resultado, setResultado] = useState(null);
  const [rodada, setRodada] = useState(0);
  const loc = useRef(null);
  const ultimo = useRef(null);
  const timer = useRef(null);

  useEffect(() => () => clearInterval(timer.current), []);

  const rolar = async () => {
    if (rolando) return;
    setRolando(true);
    setResultado(null);
    if (!reduzir) timer.current = setInterval(() => setFace(faceAleatoria()), 90);
    const [pos] = await Promise.all([
      loc.current ? Promise.resolve(loc.current) : pegarLocalizacao(),
      new Promise((r) => setTimeout(r, reduzir ? 300 : DURACAO_MS)),
    ]);
    clearInterval(timer.current);
    if (pos) loc.current = pos;
    const r = sortearEvento(eventos, pos, escopoPadrao, ultimo.current);
    ultimo.current = r.evento?.id ?? null;
    setFace(faceAleatoria());
    setResultado(r);
    setRodada((n) => n + 1);
    setRolando(false);
  };

  return (
    <section className="max-w-6xl mx-auto px-4 pt-16" aria-labelledby="dado-evento">
      <div className="relative overflow-hidden rounded-3xl bg-accent text-accent-foreground">
        <div className="absolute inset-0 dice-pattern opacity-20" aria-hidden="true" />
        <div className="relative grid gap-8 p-6 sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-8">
            <motion.div
              className="shrink-0"
              animate={rolando && !reduzir ? { rotate: [0, 200, 400, 560, 720], y: [0, -14, 0, -6, 0], scale: [1, 1.12, 1, 1.06, 1] } : { rotate: 0, y: 0, scale: 1 }}
              transition={{ duration: DURACAO_MS / 1000, ease: "easeInOut" }}
            >
              <Dado face={face} />
            </motion.div>
            <div>
              <h2 id="dado-evento" className="font-display font-700 text-2xl sm:text-3xl tracking-tight text-balance">
                Sem ideia do que fazer? Deixa o dado decidir.
              </h2>
              <p className="mt-2 max-w-md text-accent-foreground/80">
                Role o dado e descubra qual evento você vai. Ele sorteia um perto de você, ou da cidade escolhida.
              </p>
            </div>
          </div>
          <Button
            type="button"
            onClick={rolar}
            disabled={rolando}
            className="h-14 min-h-14 lg:h-14 w-full rounded-2xl bg-board px-8 text-base font-700 text-white hover:bg-board/90 lg:w-auto"
          >
            <Dices className="mr-2 h-5 w-5" aria-hidden="true" />
            {rolando ? "Rolando…" : resultado ? "Rolar de novo" : "Rolar o dado"}
          </Button>
        </div>
      </div>

      <div aria-live="polite" className="mt-6">
        {resultado && !resultado.evento && (
          <p className="rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground">
            O dado não achou nenhum evento marcado por enquanto. Tente de novo mais tarde ou veja a agenda completa.
          </p>
        )}
        {resultado?.evento && (
          <motion.div
            key={rodada}
            initial={reduzir ? false : { opacity: 0, y: 48, rotate: -8, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, rotate: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 160, damping: 14 }}
            className="mx-auto max-w-md"
          >
            <p className="mb-3 text-center text-sm font-600 text-muted-foreground">
              {resultado.semPerto
                ? `Nada por perto, então sorteei um evento ${resultado.escopo}.`
                : `O dado sorteou um evento ${resultado.escopo}.`}
            </p>
            <EventoCard evento={resultado.evento} />
            <div className="mt-3 flex justify-center">
              <Button type="button" variant="ghost" onClick={rolar} className="min-h-11 font-600">
                <RotateCcw className="mr-2 h-4 w-4" aria-hidden="true" /> Não curti, rola outro
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
