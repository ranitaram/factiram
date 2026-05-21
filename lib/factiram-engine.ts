import { Decimal } from "decimal.js";

Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

// ── TIPOS DE ENTRADA ────────────────────────────────────

export type ProductoInput = {
  id: string;
  nombre: string;
  costoCompra: number;
  precioVenta: number;
  piezasDia: number;
};

export type CostoFijoInput = {
  categoria: string;
  monto: number;
};

export type FactiramInput = {
  productos: ProductoInput[];
  costosFijos: CostoFijoInput[];
  diasLaborales: number;

  piezasVendidasHoy: number;
  efectivoHoy: number;
  inversionMercancia: number;

  gastosHoy?: number;
};

// ── TIPOS DE SALIDA ─────────────────────────────────────

export type FactiramOutput = {
  metaDiaria: number;
  perdidaDiaria: number;

  estadoDia: "GANANCIA" | "JUSTO" | "PERDIDA";

  recuperacion: {
    porcentaje: number;
    recuperado: number;
    faltante: number;
  };

  utilidadMes: number;
  dineroCalle: number;
  puntoEquilibrio: number;
  ventasMes: number;
  totalCostosFijos: number;

  productoEstrella: string;
  productoDebil: string;

  negocioEnPerdida: boolean;
  sinVentasHoy: boolean;

  flujoRealHoy: number;
};

// ── MOTOR CENTRAL ───────────────────────────────────────

export function calcularFactiram(input: FactiramInput): FactiramOutput {
  const {
    productos,
    costosFijos,
    diasLaborales,
    piezasVendidasHoy,
    efectivoHoy,
    inversionMercancia,
    gastosHoy = 0,
  } = input;

  const dias = new Decimal(diasLaborales > 0 ? diasLaborales : 26);

  // ── 1. Costos fijos ─────────────────────────
  const totalCostosFijos = costosFijos.reduce(
    (acc, c) => acc.add(new Decimal(c.monto)),
    new Decimal(0)
  );

  const costosPorDia = totalCostosFijos.div(dias);

  // ── 2. Ganancia ponderada ───────────────────
  const totalPiezasDia = productos.reduce(
    (acc, p) => acc.add(new Decimal(p.piezasDia)),
    new Decimal(0)
  );

  const sumaGananciaPonderada = productos.reduce((acc, p) => {
    const ganancia = new Decimal(p.precioVenta).sub(p.costoCompra);
    return acc.add(ganancia.mul(new Decimal(p.piezasDia)));
  }, new Decimal(0));

  const gananciaPonderada = totalPiezasDia.gt(0)
    ? sumaGananciaPonderada.div(totalPiezasDia)
    : new Decimal(0);

  // ── 3. Meta diaria ──────────────────────────
  const metaDiaria = gananciaPonderada.gt(0)
    ? totalCostosFijos.div(dias).div(gananciaPonderada).ceil().toNumber()
    : 0;

  // ── 4. GANANCIA REAL DEL DÍA ────────────────
  const flujoRealHoy = new Decimal(efectivoHoy)
    .sub(new Decimal(gastosHoy));

  const gananciaHoy = gananciaPonderada.mul(
    new Decimal(piezasVendidasHoy)
  );

  // 🔥 pérdida real considerando TODO
  const perdidaDiaria = costosPorDia
    .add(new Decimal(gastosHoy))
    .sub(gananciaHoy)
    .toNumber();

  // ── 5. ESTADO DEL DÍA (CORREGIDO) ───────────
  let estadoDia: "GANANCIA" | "JUSTO" | "PERDIDA";

  const utilidadRealHoy = flujoRealHoy.sub(costosPorDia);

  if (utilidadRealHoy.gt(0)) {
    estadoDia = "GANANCIA";
  } else if (utilidadRealHoy.gt(costosPorDia.neg().mul(0.3))) {
    estadoDia = "JUSTO";
  } else {
    estadoDia = "PERDIDA";
  }

  // ── 6. Recuperación REAL ────────────────────
  // inversionMercancia puede llegar como 0, negativo, NaN o undefined si el
  // dueño aún no lo capturó. Saneamos antes de operar para no propagar NaN.
  const inversionNum = Number(inversionMercancia);
  const inversion = new Decimal(
    Number.isFinite(inversionNum) && inversionNum > 0 ? inversionNum : 0
  );

  // Si el flujo del día es negativo (más gastos que cobros) no tiene sentido
  // restarlo a la inversión: no estás "des-recuperando" mercancía.
  const recuperado = Decimal.max(0, flujoRealHoy);

  const porcentaje = inversion.gt(0)
    ? Math.min(100, recuperado.div(inversion).mul(100).toNumber())
    : 0;

  const faltante = inversion.gt(0)
    ? Math.max(0, inversion.sub(recuperado).toNumber())
    : 0;

  // ── 7. Resumen mensual ──────────────────────
  const gananciaBrutaMes = productos.reduce((acc, p) => {
    const ganancia = new Decimal(p.precioVenta).sub(p.costoCompra);
    return acc.add(
      ganancia.mul(new Decimal(p.piezasDia)).mul(dias)
    );
  }, new Decimal(0));

  const utilidadMes = gananciaBrutaMes
    .sub(totalCostosFijos)
    .toNumber();

  const ventasMes = totalPiezasDia.mul(dias).toNumber();

  const puntoEquilibrio = gananciaPonderada.gt(0)
    ? totalCostosFijos.div(gananciaPonderada).ceil().toNumber()
    : 0;

  // ── 8. Dinero en calle ───────────
  const precioPromedio = totalPiezasDia.gt(0)
    ? productos
        .reduce((acc, p) => {
          return acc.add(
            new Decimal(p.precioVenta).mul(
              new Decimal(p.piezasDia)
            )
          );
        }, new Decimal(0))
        .div(totalPiezasDia)
    : new Decimal(0);

  const ingresoEstimadoHoy = precioPromedio.mul(
    new Decimal(piezasVendidasHoy)
  );

  const dineroCalle = Math.max(
    0,
    ingresoEstimadoHoy.sub(new Decimal(efectivoHoy)).toNumber()
  );

  // ── 9. Insights ─────────────────────────────
  let productoEstrella = "—";
  let productoDebil = "—";

  if (productos.length > 0) {
    const ordenados = [...productos].sort(
      (a, b) => b.piezasDia - a.piezasDia
    );

    productoEstrella = ordenados[0].nombre;
    productoDebil = ordenados[ordenados.length - 1].nombre;
  }

  // ── 10. Flags ───────────────────────────────
  const negocioEnPerdida = utilidadMes < 0;
  const sinVentasHoy = piezasVendidasHoy === 0;

  return {
    metaDiaria,
    perdidaDiaria,
    estadoDia,
    recuperacion: {
      porcentaje: Math.min(100, porcentaje),
      recuperado: recuperado.toNumber(),
      faltante,
    },
    utilidadMes,
    dineroCalle,
    puntoEquilibrio,
    ventasMes,
    totalCostosFijos: totalCostosFijos.toNumber(),
    productoEstrella,
    productoDebil,
    negocioEnPerdida,
    sinVentasHoy,
    flujoRealHoy: flujoRealHoy.toNumber(),
    
  };
  
}
// ── PREDICCIÓN DEL DÍA ──────────────────────────────────
// Exportada separada para no contaminar el output principal

export type PrediccionDia = {
  proyeccionPiezas: number;       // cuántas piezas terminará vendiendo hoy
  proyeccionFlujo: number;        // flujo real proyectado al cierre
  mensajeAlerta: string;          // mensaje directo para el cajero
  nivelAlerta: "BIEN" | "RIESGO" | "MAL";
};

export function calcularPrediccion(
  input: FactiramInput,
  horaActual: number  // 0-23
): PrediccionDia {
  const {
    productos,
    costosFijos,
    diasLaborales,
    piezasVendidasHoy,
    efectivoHoy,
    gastosHoy = 0,
  } = input;

  const dias = new Decimal(diasLaborales > 0 ? diasLaborales : 26);

  const totalCostosFijos = costosFijos.reduce(
    (acc, c) => acc.add(new Decimal(c.monto)),
    new Decimal(0)
  );
  const costosPorDia = totalCostosFijos.div(dias).toNumber();

  const totalPiezasDia = productos.reduce(
    (acc, p) => acc.add(new Decimal(p.piezasDia)),
    new Decimal(0)
  );
  const sumaGananciaPonderada = productos.reduce((acc, p) => {
    const ganancia = new Decimal(p.precioVenta).sub(p.costoCompra);
    return acc.add(ganancia.mul(new Decimal(p.piezasDia)));
  }, new Decimal(0));
  const gananciaPonderada = totalPiezasDia.gt(0)
    ? sumaGananciaPonderada.div(totalPiezasDia).toNumber()
    : 0;

  const HORA_INICIO = 9;
  const HORA_CIERRE = 20;
  const horasTotales = HORA_CIERRE - HORA_INICIO; // 11 horas

  // Limitar al rango de la jornada laboral
  const horasTranscurridas = Math.max(0.5, Math.min(horasTotales, horaActual - HORA_INICIO));
  const horasRestantes = Math.max(0, HORA_CIERRE - horaActual);

  // Meta diaria mínima para cubrir costos
  const metaDiaria = gananciaPonderada > 0
    ? Math.ceil(costosPorDia / gananciaPonderada)
    : 0;

  // ── Proyección con suavizado por confianza ─────────────────
  // Problema sin suavizado: a las 10am (1h trabajada, 10h restantes),
  // vender 1 pieza da ritmoActual=1, proyección=1+1×10=11 (10x amplificación).
  // Con confianza progresiva: en las primeras horas se blend con el ritmo
  // esperado según la meta, eliminando la amplificación artificial.

  // Ritmo que necesitas para llegar a la meta (base estable)
  const ritmoEsperado = horasTotales > 0 ? metaDiaria / horasTotales : 0;

  // Ritmo real observado hasta ahora
  const ritmoReal = piezasVendidasHoy / horasTranscurridas;

  // Confianza en el ritmo real: sube progresivamente a lo largo de las primeras 3 horas.
  // Con < 1h de datos usamos casi solo el ritmo esperado; con 3h+ confiamos en el real.
  const confianza = Math.min(1, horasTranscurridas / 3);

  const ritmoBlended = ritmoEsperado * (1 - confianza) + ritmoReal * confianza;

  const proyeccionPiezas = Math.max(
    piezasVendidasHoy,
    Math.round(piezasVendidasHoy + ritmoBlended * horasRestantes)
  );

  // ── Flujo proyectado ────────────────────────────────────────
  // Coherente con la proyección de piezas: mismo número de piezas, mismo
  // ticket promedio que el cajero está cobrando hoy.
  //
  // Bug que esto resuelve: extrapolar `efectivoHoy / horasTranscurridas * horasTotales`
  // a las primeras horas amplifica una venta puntual a la jornada completa.
  // Ej: $65 en 0.5h producía $1,430 proyectados — absurdo y desconectado de
  // las piezas proyectadas (~6).
  const precioPromedioConfig = totalPiezasDia.gt(0)
    ? productos.reduce((acc, p) => acc + p.precioVenta * p.piezasDia, 0) / totalPiezasDia.toNumber()
    : 0;

  // Ticket real cobrado por pieza HOY. Si aún no hay ventas, asumimos cobro
  // al precio promedio configurado, descontando 20% por fiado.
  const efectivoPorPieza = piezasVendidasHoy > 0
    ? efectivoHoy / piezasVendidasHoy
    : precioPromedioConfig * 0.8;

  const ingresoBrutoEstimado = proyeccionPiezas * efectivoPorPieza;
  const proyeccionFlujo = ingresoBrutoEstimado - gastosHoy - costosPorDia;

  // ── Nivel de alerta ─────────────────────────────────────────
  const porcentajeAvance = metaDiaria > 0 ? (piezasVendidasHoy / metaDiaria) * 100 : 100;
  const progresoEsperado = (horasTranscurridas / horasTotales) * 100;

  let nivelAlerta: "BIEN" | "RIESGO" | "MAL";
  let mensajeAlerta: string;

  if (porcentajeAvance >= progresoEsperado * 0.9) {
    nivelAlerta = "BIEN";
    mensajeAlerta = `Buen ritmo. Si sigues así, terminarás con ${proyeccionPiezas} piezas vendidas.`;
  } else if (porcentajeAvance >= progresoEsperado * 0.6) {
    nivelAlerta = "RIESGO";
    mensajeAlerta = `Vas por debajo del ritmo. Necesitas acelerar o hoy cierras en pérdida.`;
  } else {
    nivelAlerta = "MAL";
    const piezasFaltantes = Math.max(0, metaDiaria - proyeccionPiezas);
    mensajeAlerta = `Hoy será un día en pérdida. Te faltan ${piezasFaltantes} piezas para solo no perder.`;
  }

  return {
    proyeccionPiezas,
    proyeccionFlujo,
    mensajeAlerta,
    nivelAlerta,
  };
}