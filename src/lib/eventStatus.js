// Último dia de um evento de data única: a data final, se houver e for
// depois da inicial; senão, o próprio dia.
export function dataFinal(evento) {
  const ini = evento?.event_date;
  const fim = evento?.event_end_date;
  return fim && ini && fim > ini ? fim : ini;
}

const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

// "15 de out." ou "15 a 17 de out." ou "30 de out. a 2 de nov."
export function formatarPeriodo(evento) {
  const ini = evento?.event_date;
  if (!ini) return "";
  const fim = dataFinal(evento);
  const [, m1, d1] = ini.split("-").map(Number);
  const [, m2, d2] = fim.split("-").map(Number);
  if (fim === ini) return `${d1} de ${MESES[m1 - 1]}.`;
  if (m1 === m2) return `${d1} a ${d2} de ${MESES[m1 - 1]}.`;
  return `${d1} de ${MESES[m1 - 1]}. a ${d2} de ${MESES[m2 - 1]}.`;
}

// Determina se um evento único já terminou há mais de 10 horas.
// Eventos fixos (semanais) nunca são considerados passados — eles se repetem.
export function isEventoPassado(evento, ref = new Date()) {
  if (!evento) return false;
  if (evento.recurrence_type === "fixa") return false;
  if (!evento.event_date) return false;
  const time = evento.end_time || evento.start_time || "23:59";
  const end = new Date(`${dataFinal(evento)}T${time}:00`);
  if (isNaN(end.getTime())) return false;
  const cutoff = new Date(end.getTime() + 10 * 60 * 60 * 1000);
  return ref.getTime() > cutoff.getTime();
}
const DIAS = ["domingo", "segunda", "terca", "quarta", "quinta", "sexta", "sabado"];

function inicioDoDia(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

// Data (meia-noite local) da próxima ocorrência do evento a partir de hoje,
// ou null se não houver. Eventos fixos ocorrem no próximo `day_of_week`.
export function proximaOcorrencia(evento, ref = new Date()) {
  if (!evento) return null;
  const hoje = inicioDoDia(ref);
  if (evento.recurrence_type === "fixa") {
    const alvo = DIAS.indexOf(evento.day_of_week);
    if (alvo < 0) return null;
    const d = new Date(hoje);
    d.setDate(d.getDate() + ((alvo - hoje.getDay() + 7) % 7));
    return d;
  }
  if (!evento.event_date || isEventoPassado(evento, ref)) return null;
  const d = new Date(`${evento.event_date}T00:00:00`);
  if (isNaN(d.getTime())) return null;
  // Eventos de vários dias já em andamento (ou que acabaram há menos de 10h)
  // contam como hoje.
  return d < hoje ? hoje : d;
}

function instanteProxima(evento, ref) {
  if (evento?._prox instanceof Date && !isNaN(evento._prox.getTime())) return evento._prox.getTime();
  const d = proximaOcorrencia(evento, ref);
  return d ? d.getTime() : null;
}

// Do mais próximo para o mais tarde. Recorrente entra pela próxima ocorrência.
// Sem próxima data (já encerrado ou sem dia), vai para o fim, do mais recente ao mais antigo.
export function ordenarPorProximaData(lista, ref = new Date()) {
  return [...(lista || [])].sort((a, b) => {
    const da = instanteProxima(a, ref);
    const db = instanteProxima(b, ref);
    if (da != null && db != null && da !== db) return da - db;
    if (da != null && db == null) return -1;
    if (da == null && db != null) return 1;
    if (da == null && db == null) {
      const porData = (b.event_date || "").localeCompare(a.event_date || "");
      if (porData) return porData;
    }
    return (a.start_time || "").localeCompare(b.start_time || "") || (a.title || "").localeCompare(b.title || "", "pt-BR");
  });
}
