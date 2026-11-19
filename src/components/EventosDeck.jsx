import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { CalendarDays, MapPin, Repeat } from "lucide-react";
import { LogoMark } from "@/components/Logo";
import { resolverArte } from "@/components/ArteEvento";
import { eventoPath } from "@/lib/slug";
import { formatarPeriodo } from "@/lib/eventStatus";
import { imagemOtimizada } from "@/lib/imagemOtimizada";

const DIA = { domingo: "Domingo", segunda: "Segunda", terca: "Terça", quarta: "Quarta", quinta: "Quinta", sexta: "Sexta", sabado: "Sábado" };

const POSES = [
  { rotate: -3, x: 0, y: 0 },
  { rotate: 9, x: 44, y: 22 },
  { rotate: -13, x: -64, y: 42 },
  { rotate: 16, x: 80, y: 62 },
];

export default function EventosDeck({ eventos }) {
  const navigate = useNavigate();
  const reduzir = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [hover, setHover] = useState(false);
  const [foco, setFoco] = useState(false);
  const total = eventos.length;
  const pausado = hover || foco || reduzir;
  const ordem = eventos.map((e) => e.id).join("|");

  useEffect(() => {
    setIndex(0);
  }, [ordem]);

  useEffect(() => {
    if (total <= 1 || pausado) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % total), 5000);
    return () => clearInterval(id);
  }, [total, pausado]);

  if (total === 0) return null;

  const atual = Math.min(index, total - 1);

  return (
    <div
      className="relative h-[300px] sm:h-[380px] lg:h-[440px]"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setFoco(true)}
      onBlur={(ev) => {
        if (!ev.currentTarget.contains(ev.relatedTarget)) setFoco(false);
      }}
      role="region"
      aria-roledescription="carrossel"
      aria-label="Eventos em destaque"
    >
      {eventos.map((e, i) => {
        const offset = (i - atual + total) % total;
        const frente = offset === 0;
        const pose = POSES[Math.min(offset, POSES.length - 1)];
        const escondida = offset >= POSES.length;
        const isFixa = e.recurrence_type === "fixa";
        const arte = resolverArte(e);
        const nome = e.title?.trim() || "evento";
        return (
          <motion.button
            key={e.id}
            type="button"
            tabIndex={frente ? 0 : -1}
            aria-hidden={!frente}
            aria-label={`Abrir ${nome}`}
            onClick={() => (frente ? navigate(eventoPath(e)) : setIndex(i))}
            initial={false}
            animate={{
              rotate: pose.rotate,
              x: pose.x,
              y: pose.y,
              scale: frente ? 1 : Math.max(0.72, 0.88 - offset * 0.05),
              opacity: escondida ? 0 : frente ? 1 : Math.max(0.35, 0.8 - offset * 0.15),
              zIndex: total - offset,
            }}
            transition={{ duration: reduzir ? 0 : 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-x-0 mx-auto top-0 w-[190px] sm:w-[240px] lg:w-[290px] aspect-[3/4] rounded-[22px] overflow-hidden text-left text-white shadow-[0_30px_70px_-18px_rgba(0,0,0,0.65)] ring-1 ring-white/15"
          >
            {arte.marca ? (
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-700 via-emerald-800 to-zinc-900">
                <div className="absolute inset-0 dice-pattern opacity-40" />
                <div className="absolute inset-0 grid place-items-center">
                  <LogoMark className="w-16 h-16" title={arte.alt} />
                </div>
              </div>
            ) : (
              <img
                {...imagemOtimizada(arte.url, { width: 580, height: 774, crop: true, larguras: [190, 290, 380, 580] })}
                sizes="(min-width: 1024px) 290px, (min-width: 640px) 240px, 190px"
                alt={arte.alt}
                className="absolute inset-0 h-full w-full object-cover bg-white"
                loading={frente || offset === 1 ? "eager" : "lazy"}
                fetchPriority={frente ? "high" : undefined}
                decoding="async"
              />
            )}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/15 to-transparent" />
            <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-accent text-accent-foreground px-2.5 py-1 text-xs font-800 uppercase tracking-wider shadow-md">
              {isFixa ? <Repeat className="w-3 h-3" aria-hidden="true" /> : <CalendarDays className="w-3 h-3" aria-hidden="true" />}
              {isFixa ? `Toda ${DIA[e.day_of_week] || "semana"}` : formatarPeriodo(e)}
            </span>
            {frente && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: reduzir ? 0 : 0.4, delay: reduzir ? 0 : 0.2 }}
                className="absolute inset-x-0 bottom-0 p-4"
              >
                <p className="font-display font-800 text-lg leading-tight line-clamp-2">{e.title}</p>
                {(e.loja_name || e.location_name || e.start_time) && (
                  <p className="mt-1 flex items-center gap-1 truncate text-xs text-white/75">
                    <MapPin className="w-3 h-3 shrink-0" aria-hidden="true" />
                    <span className="truncate">{[e.start_time, e.loja_name || e.location_name].filter(Boolean).join(" · ")}</span>
                  </p>
                )}
                <span className="mt-3 inline-block rounded-full bg-white px-3 py-1 text-xs font-800 tracking-wider text-zinc-900">VER EVENTO</span>
              </motion.div>
            )}
          </motion.button>
        );
      })}

      {total > 1 && (
        <div className="absolute bottom-0 left-1/2 z-10 flex -translate-x-1/2">
          {eventos.map((e, i) => (
            <button
              key={e.id}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Mostrar ${e.title?.trim() || `evento ${i + 1}`}`}
              aria-current={i === atual ? "true" : undefined}
              className="grid h-11 w-11 place-items-center"
            >
              <span
                className={`h-1.5 rounded-full transition-all duration-300 ${i === atual ? "w-8 bg-accent" : "w-2 bg-white/40"}`}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
