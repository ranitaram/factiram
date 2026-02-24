import { PrismaClient, Prisma } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🚀 Sembrando la matriz estratégica de FACTIRAM v2.0 (Nivel Consultoría Pro)...')

  await prisma.diagnosticMessage.deleteMany({})

  const messages: Prisma.DiagnosticMessageCreateManyInput[] = [
    /* =========================================================
       1. RENTABILIDAD: EVALUACIÓN DE SALUD FINANCIERA
    ========================================================= */
    { 
      category: 'RENTABILIDAD', minScore: 0, maxScore: 40, color: 'RED', 
      message: 'DIAGNÓSTICO CRÍTICO: Tu estructura financiera actual presenta una vulnerabilidad severa. La utilidad neta no justifica el riesgo operativo. Es imperativo ejecutar una reingeniería de costos y auditar el ticket promedio; de lo contrario, el negocio está consumiendo su propio capital de trabajo.' 
    },
    { 
      category: 'RENTABILIDAD', minScore: 41, maxScore: 70, color: 'YELLOW', 
      message: 'ESTABILIDAD COMPROMETIDA: El flujo de caja es positivo pero el margen de seguridad es mínimo. Un incremento ligero en costos fijos o una fluctuación estacional en las ventas podría eliminar tu ganancia. Debes optimizar el margen operativo para construir un fondo de reserva estratégica.' 
    },
    { 
      category: 'RENTABILIDAD', minScore: 71, maxScore: 100, color: 'GREEN', 
      message: 'FORTALEZA FINANCIERA: Tu modelo presenta una salud envidiable con márgenes superiores al promedio del sector. Tienes la solvencia necesaria para reinvertir en expansión o automatización sin comprometer la estabilidad del patrimonio.' 
    },

    /* =========================================================
       2. MERCADO: POSICIONAMIENTO Y VENTAJA COMPETITIVA
    ========================================================= */
    { 
      category: 'MERCADO', minScore: 0, maxScore: 40, color: 'RED', 
      message: 'VULNERABILIDAD DE MERCADO: Tu propuesta de valor es difusa y carece de diferenciación real. En el mercado actual, la invisibilidad es más cara que el mal marketing. Necesitas definir un nicho específico y atacar un "dolor" puntual para salir de la guerra de precios.' 
    },
    { 
      category: 'MERCADO', minScore: 41, maxScore: 70, color: 'YELLOW', 
      message: 'PRESENCIA ESTÁNDAR: El mercado te percibe como una opción viable pero sustituible. Tu crecimiento está limitado por la falta de una identidad de marca fuerte. Fortalecer tu reputación digital y programas de lealtad es clave para aumentar el valor de vida del cliente (LTV).' 
    },
    { 
      category: 'MERCADO', minScore: 71, maxScore: 100, color: 'GREEN', 
      message: 'LIDERAZGO DE NICHO: Posees una diferenciación clara que te protege de la competencia agresiva. Tu enfoque en el cliente ha creado una ventaja competitiva sostenible. Es momento de apalancar este posicionamiento para captar segmentos de mayor valor.' 
    },

    /* =========================================================
       3. OPERACIÓN: CAPACIDAD Y ESCALABILIDAD
    ========================================================= */
    { 
      category: 'OPERACION', minScore: 0, maxScore: 40, color: 'RED', 
      message: 'CRISIS OPERATIVA: Existen cuellos de botella críticos que están destruyendo la experiencia del cliente. La falta de procesos estandarizados genera reprocesos y mermas. Tu operación actual no soporta un incremento en la demanda sin colapsar.' 
    },
    { 
      category: 'OPERACION', minScore: 41, maxScore: 70, color: 'YELLOW', 
      message: 'LIMITACIÓN ESTRUCTURAL: El negocio opera correctamente pero depende excesivamente de la supervisión directa o del esfuerzo manual. Para escalar, debes transitar de un modelo "basado en personas" a uno "basado en sistemas" mediante la manualización de tareas repetitivas.' 
    },
    { 
      category: 'OPERACION', minScore: 71, maxScore: 100, color: 'GREEN', 
      message: 'EXCELENCIA OPERATIVA: Tus procesos son fluidos y cuentan con capacidad instalada para crecer. La infraestructura actual permite absorber un aumento en la carga de trabajo sin sacrificar la calidad del servicio ni aumentar proporcionalmente los costos fijos.' 
    },

    /* =========================================================
       4. TRIGGERS DE ALTO IMPACTO (DISPARADORES LÓGICOS)
    ========================================================= */
    { 
      category: 'RENTABILIDAD', conditionKey: 'NEGATIVE_PROFIT', minScore: 0, maxScore: 100, color: 'RED', 
      message: 'ALERTA DE INSOLVENCIA: El negocio está operando en pérdida neta. Por cada día que abres, estás destruyendo valor económico. Es urgente detener toda inversión no esencial y renegociar pasivos o elevar precios de inmediato.' 
    },
    { 
      category: 'RENTABILIDAD', conditionKey: 'NEGATIVE_MARGIN', minScore: 0, maxScore: 100, color: 'RED', 
      message: 'INVIABILIDAD DE MARGEN: Tu costo de ventas es superior o casi igual a tu precio de venta. Estás regalando tu trabajo y subsidiando el consumo de tus clientes. No es un problema de ventas, es un error fatal de costeo.' 
    },
    { 
      category: 'RENTABILIDAD', conditionKey: 'HIGH_FIXED_COSTS', minScore: 0, maxScore: 100, color: 'RED', 
      message: 'ESTRUCTURA DE COSTOS INFLEXIBLE: Tus costos fijos son desproporcionados para tu volumen de ventas actual. El negocio es un "elefante blanco" que requiere ventas masivas solo para cubrir la nómina y la renta. Considera un modelo de costos variables o una ubicación más eficiente.' 
    },
    { 
      category: 'RIESGO', conditionKey: 'BUSY_BUT_BROKE', minScore: 0, maxScore: 100, color: 'RED', 
      message: 'SÍNDROME DEL NEGOCIO AGOTADO Y POBRE: Detectamos una paradoja operativa peligrosa: tienes una ocupación envidiable pero una rentabilidad anémica. Estás trabajando para los proveedores y los empleados, no para ti. Urge un ajuste de precios premium o una limpieza de clientes de bajo margen.' 
    },
    { 
      category: 'MERCADO', conditionKey: 'POOR_DIGITAL_PRESENCE', minScore: 0, maxScore: 100, color: 'RED', 
      message: 'OBSOLESCENCIA DIGITAL: Tu negocio es invisible para el 80% del mercado moderno. La falta de una huella digital sólida permite que competidores con menos calidad pero mejor marketing te arrebaten cuota de mercado cada día.' 
    },
    { 
      category: 'RIESGO', conditionKey: 'UNSUSTAINABLE_CAC', minScore: 0, maxScore: 100, color: 'RED', 
      message: 'ADQUISICIÓN NO RENTABLE: El costo de conseguir un cliente nuevo es superior al beneficio que este deja en su primera compra (LTV). Tu estrategia de marketing está drenando la caja en lugar de alimentarla.' 
    },

    /* =========================================================
       5. ESPECIALIZACIÓN POR SECTOR (DETALLE NIVEL EXPERTO)
    ========================================================= */
    // --- COMIDA ---
    { 
      category: 'RENTABILIDAD', industry: 'COMIDA', status: 'EN_MARCHA', minScore: 0, maxScore: 100, color: 'RED', 
      message: 'GESTIÓN GASTRONÓMICA: En el sector alimentos, el centavo es la unidad de medida. Si tu Food Cost supera el 35%, estás en zona de peligro. Audita las recetas estándar y controla las mermas de cocina; ahí es donde se escapa tu utilidad.' 
    },
    { 
      category: 'OPERACION', industry: 'COMIDA', status: 'PROYECTO', minScore: 0, maxScore: 100, color: 'YELLOW', 
      message: 'LANZAMIENTO GASTRONÓMICO: Antes de invertir en decoración, asegura el "Kitchen Workflow". Un menú demasiado extenso matará tu eficiencia y aumentará tu inventario muerto. Especialízate en 5 platos estrella con alto margen.' 
    },

    // --- SERVICIO ---
    { 
      category: 'OPERACION', industry: 'SERVICIO', status: 'EN_MARCHA', minScore: 0, maxScore: 100, color: 'YELLOW', 
      message: 'LIMITACIÓN DE SERVICIOS: Tu principal activo es el tiempo, y es finito. Debes transitar de vender "horas" a vender "resultados" (paquetes cerrados). Esto te permitirá desvincular tus ingresos de tu presencia física.' 
    },

    // --- TÉCNICO (Como Ram Soporte Técnico) ---
    { 
      category: 'MERCADO', industry: 'TECNICO', status: 'EN_MARCHA', minScore: 0, maxScore: 100, color: 'GREEN', 
      message: 'ESPECIALIZACIÓN TÉCNICA: El mercado técnico premia la especialización. No seas el "todólogo". Posiciónate como el experto en soluciones críticas; un especialista puede cobrar hasta 4 veces más por la misma hora de trabajo que un técnico generalista.' 
    },

    // --- RETAIL ---
    { 
      category: 'RENTABILIDAD', industry: 'RETAIL', status: 'EN_MARCHA', minScore: 0, maxScore: 100, color: 'YELLOW', 
      message: 'EFICIENCIA DE INVENTARIO: En retail, el inventario es dinero estancado. Si un producto no rota en 90 días, te está costando dinero mantenerlo. Ejecuta estrategias de liquidación y reinvierte en productos de alta rotación (Fast-Moving Consumer Goods).' 
    }
  ]

  await prisma.diagnosticMessage.createMany({ data: messages })

  console.log(`✅ Éxito: ${messages.length} diagnósticos de alta precisión sembrados con éxito.`)
}

main()
  .catch((e) => { console.error('❌ Error fatal en el seed:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); })