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
  const inversion = new Decimal(inversionMercancia);

  const recuperado = flujoRealHoy;

  const porcentaje = inversion.gt(0)
    ? recuperado.div(inversion).mul(100).toNumber()
    : 0;

  const faltante = Math.max(0, inversion.sub(recuperado).toNumber());

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

  // Horas hábiles asumidas: 9am a 8pm = 11 horas
  const HORA_INICIO = 9;
  const HORA_CIERRE = 20;
  const horasTranscurridas = Math.max(1, horaActual - HORA_INICIO);
  const horasRestantes = Math.max(0, HORA_CIERRE - horaActual);
  const horasTotales = HORA_CIERRE - HORA_INICIO;

  // Ritmo actual: piezas por hora
  const ritmoActual = piezasVendidasHoy / horasTranscurridas;

  // Proyección al cierre
  const proyeccionPiezas = Math.round(
    piezasVendidasHoy + ritmoActual * horasRestantes
  );

  // Flujo proyectado
  const precioPromedio = totalPiezasDia.gt(0)
    ? productos.reduce((acc, p) => {
        return acc + p.precioVenta * p.piezasDia;
      }, 0) / totalPiezasDia.toNumber()
    : 0;

  const efectivoProyectado = efectivoHoy > 0
    ? (efectivoHoy / horasTranscurridas) * horasTotales
    : proyeccionPiezas * precioPromedio * 0.8; // asume 80% cobrado en efectivo

  const proyeccionFlujo = efectivoProyectado - gastosHoy - costosPorDia;

  // Mensaje y nivel
  const metaDiaria = gananciaPonderada > 0
    ? Math.ceil(costosPorDia / gananciaPonderada)
    : 0;

  const porcentajeAvance = metaDiaria > 0
    ? (piezasVendidasHoy / metaDiaria) * 100
    : 0;

  // Progreso esperado según hora
  const progresoEsperado = ((horasTranscurridas / horasTotales) * 100);

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