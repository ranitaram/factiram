import { PrismaClient, Prisma } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🚀 Sembrando cobertura total (Rango 1-100)...')

  await prisma.diagnosticMessage.deleteMany({})

  const messages: Prisma.DiagnosticMessageCreateInput[] = [
    /* =========================================================
       1. PARACAÍDAS UNIVERSALES (Garantizan que siempre haya texto)
    ========================================================= */
    {
      category: 'RENTABILIDAD',
      minScore: 0, maxScore: 40,
      message: 'ESTRUCTURA FRÁGIL: Tu rentabilidad neta es insuficiente. El modelo requiere una revisión profunda de costos o un aumento drástico de ticket promedio.',
      color: 'RED',
    },
    {
      category: 'RENTABILIDAD',
      minScore: 41, maxScore: 70,
      message: 'PUNTO DE EQUILIBRIO CERCANO: El negocio genera flujo pero es vulnerable. Necesitas optimizar el margen operativo para crear un colchón financiero.',
      color: 'YELLOW',
    },
    {
      category: 'RENTABILIDAD',
      minScore: 71, maxScore: 100,
      message: 'MODELO SALUDABLE: Tienes una estructura financiera sólida. Es el momento ideal para estandarizar y buscar escalabilidad.',
      color: 'GREEN',
    },

    /* =========================================================
       2. COBERTURA DE TRIGGERS ESPECÍFICOS (De tu engine.ts)
    ========================================================= */
    {
      category: 'OPERACION',
      conditionKey: 'ZERO_CAPACITY',
      minScore: 0, maxScore: 100,
      message: 'CAPACIDAD CERO: No puedes facturar si no tienes capacidad de atención. Define tus unidades de servicio o producción para activar el motor de ventas.',
      color: 'RED',
    },
    {
      category: 'RENTABILIDAD',
      conditionKey: 'NEGATIVE_MARGIN',
      minScore: 0, maxScore: 100,
      message: 'MARGEN INVIABLE: Estás vendiendo por debajo de tu costo. Cada nueva venta incrementa tu deuda. Detén la operación y ajusta precios.',
      color: 'RED',
    },
    {
      category: 'MERCADO',
      conditionKey: 'UNSUSTAINABLE_CAC',
      minScore: 0, maxScore: 100,
      message: 'ADQUISICIÓN TÓXICA: Estás pagando más por conseguir un cliente de lo que ese cliente te deja de beneficio. Revisa tu estrategia de pauta digital.',
      color: 'RED',
    },
    {
      category: 'RENTABILIDAD',
      conditionKey: 'HIGH_COSTS',
      minScore: 0, maxScore: 100,
      message: 'COSTOS FUERA DE CONTROL: Tus costos directos exceden el 60% de tus ingresos. Necesitas mejores proveedores o procesos más eficientes.',
      color: 'RED',
    },
    {
      category: 'MERCADO',
      conditionKey: 'COMMODITY_RISK',
      minScore: 0, maxScore: 100,
      message: 'RIESGO DE COMODITIZACIÓN: No se percibe una diferencia clara contra tu competencia. Eres vulnerable a guerras de precios.',
      color: 'YELLOW',
    },

    /* =========================================================
       3. SEGMENTACIÓN POR INDUSTRIA (Ejemplos base)
    ========================================================= */
    {
      category: 'RENTABILIDAD',
      industry: 'COMIDA',
      minScore: 0, maxScore: 100,
      message: 'SECTOR ALIMENTOS: Recuerda que tu Food Cost no debería exceder el 35%. Estandariza recetas para controlar tu utilidad.',
      color: 'YELLOW',
    },
    {
      category: 'MERCADO',
      industry: 'TECNICO',
      minScore: 0, maxScore: 100,
      message: 'SECTOR TÉCNICO: La especialización es tu mayor activo. Evita ser el "mil usos" y enfócate en un nicho de alto valor.',
      color: 'YELLOW',
    }
  ]

  await prisma.diagnosticMessage.createMany({
    data: messages as any
  })

  console.log(`✅ Éxito: ${messages.length} mensajes sembrados. Cobertura 1-100 garantizada.`)
}

main()
  .catch((e) => {
    console.error('❌ Error en el seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })