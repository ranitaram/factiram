import { differenceInDays, isBefore, } from "date-fns";

// ── TIPOS ────────────────────────────────────────────────

export type EstadoAcceso = "ACTIVO" | "TRIAL" | "BLOQUEADO";

export type CausaBloqueo = "MENSUALIDAD_VENCIDA" | "TRIAL_VENCIDO";

export type ResultadoAcceso =
  | { estado: "ACTIVO" }
  | { estado: "TRIAL"; diasRestantes: number }
  | { estado: "BLOQUEADO"; causa: CausaBloqueo };

// ── VALIDACIÓN DE ACCESO ─────────────────────────────────
// Jerarquía estricta — no cambiar el orden de validación.
// En cuanto setupPagado = true, trialStartedAt queda invalidado.

export type SuscripcionData = {
  setupPagado: boolean;
  trialStartedAt: Date;
  proximoPagoAt: Date | null;
};

export function validarAcceso(suscripcion: SuscripcionData): ResultadoAcceso {
  const ahora = new Date();

  // PRIORIDAD 1 y 2 — cliente que ha pagado
  // trialStartedAt se ignora completamente
  if (suscripcion.setupPagado) {
    if (!suscripcion.proximoPagoAt) {
      // Recién activado sin fecha de vencimiento — dar acceso
      return { estado: "ACTIVO" };
    }
    if (isBefore(ahora, suscripcion.proximoPagoAt)) {
      return { estado: "ACTIVO" };
    }
    return { estado: "BLOQUEADO", causa: "MENSUALIDAD_VENCIDA" };
  }

  // PRIORIDAD 3 y 4 — cliente en trial, nunca ha pagado
  const diasDesdeTrial = differenceInDays(ahora, suscripcion.trialStartedAt);
  if (diasDesdeTrial <= 7) {
    return { estado: "TRIAL", diasRestantes: 7 - diasDesdeTrial };
  }

  return { estado: "BLOQUEADO", causa: "TRIAL_VENCIDO" };
}

// ── MENSAJES DE BLOQUEO ──────────────────────────────────

export function getMensajeBloqueo(causa: CausaBloqueo): {
  titulo: string;
  subtitulo: string;
} {
  if (causa === "MENSUALIDAD_VENCIDA") {
    return {
      titulo: "Tu acceso está pausado.",
      subtitulo:
        "Tu mensualidad venció. Contacta a tu asesor para continuar.",
    };
  }
  return {
    titulo: "Tus 7 días de prueba terminaron.",
    subtitulo:
      "Habla con tu asesor para activar tu acceso completo.",
  };
}

// ── HELPER PARA ADMIN ────────────────────────────────────
// Calcula días para vencimiento — usado en el panel de Ramses

export type EstadoSemaforo = "VERDE" | "AMARILLO" | "ROJO";

export function getSemaforoAdmin(suscripcion: SuscripcionData): {
  semaforo: EstadoSemaforo;
  mensaje: string;
} {
  const ahora = new Date();

  if (!suscripcion.setupPagado) {
    const dias = differenceInDays(ahora, suscripcion.trialStartedAt);
    if (dias > 7) {
      return { semaforo: "ROJO", mensaje: "Trial vencido" };
    }
    return {
      semaforo: "AMARILLO",
      mensaje: `Trial — ${7 - dias} día(s) restante(s)`,
    };
  }

  if (!suscripcion.proximoPagoAt) {
    return { semaforo: "VERDE", mensaje: "Activo" };
  }

  const diasParaVencer = differenceInDays(suscripcion.proximoPagoAt, ahora);

  if (diasParaVencer < 0) {
    return { semaforo: "ROJO", mensaje: "Vencido" };
  }
  if (diasParaVencer <= 3) {
    return {
      semaforo: "AMARILLO",
      mensaje: `Vence en ${diasParaVencer} día(s)`,
    };
  }
  return {
    semaforo: "VERDE",
    mensaje: `Vigente — vence en ${diasParaVencer} días`,
  };
}