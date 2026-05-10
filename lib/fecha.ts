// Helpers de fecha con zona horaria de la Ciudad de México.
//
// El bug que esto resuelve: en Vercel el servidor corre en UTC, así que
// `startOfDay(new Date())` de date-fns devolvía 00:00 UTC. En CDMX (UTC-6)
// eso equivale a las 18:00 del día anterior, así que el rango "de hoy"
// arrastraba ~6 h del día previo y los registros se mezclaban entre días.
//
// Aquí calculamos el inicio/fin del día en CDMX y los expresamos como
// instantes UTC para usarlos en los `where` de Prisma.

const TZ = "America/Mexico_City";

// Devuelve el offset (en minutos) que tiene `tz` respecto a UTC en el momento
// `date`. Para CDMX es -360 (UTC-6) durante todo el año desde 2022.
function offsetMinutes(date: Date, tz: string): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const map: Record<string, number> = {};
  for (const p of dtf.formatToParts(date)) {
    if (p.type !== "literal") map[p.type] = parseInt(p.value, 10);
  }
  if (map.hour === 24) map.hour = 0;
  const asUTC = Date.UTC(
    map.year,
    map.month - 1,
    map.day,
    map.hour,
    map.minute,
    map.second
  );
  return Math.round((asUTC - date.getTime()) / 60000);
}

// Año/mes/día del calendario de CDMX para `date`.
function partesFechaMX(date: Date): { y: number; m: number; d: number } {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const [y, m, d] = fmt.format(date).split("-").map(Number);
  return { y, m, d };
}

// Instante UTC que corresponde a las 00:00:00.000 en CDMX del día calendario
// en que cae `now` en CDMX.
export function inicioDiaMX(now: Date = new Date()): Date {
  const { y, m, d } = partesFechaMX(now);
  const naive = Date.UTC(y, m - 1, d, 0, 0, 0, 0);
  const off = offsetMinutes(new Date(naive), TZ);
  return new Date(naive - off * 60000);
}

// Instante UTC que corresponde a las 23:59:59.999 en CDMX del día calendario
// en que cae `now` en CDMX.
export function finDiaMX(now: Date = new Date()): Date {
  return new Date(inicioDiaMX(now).getTime() + 24 * 60 * 60 * 1000 - 1);
}

// Para columnas Prisma `@db.Date` (sólo fecha). Devuelve UTC-medianoche del
// día calendario de CDMX, que es exactamente lo que Prisma escribe/lee para
// ese tipo. Usar siempre este helper como llave (`negocioId_fecha`) garantiza
// que escritura y lectura coinciden.
export function fechaDiaMX(now: Date = new Date()): Date {
  const { y, m, d } = partesFechaMX(now);
  return new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0));
}

export const TIMEZONE_MX = TZ;
