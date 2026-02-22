import { PrismaClient, Prisma } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🚀 Sembrando la matriz completa de FACTIRAM (Blindada contra errores lógicos)...')

  await prisma.diagnosticMessage.deleteMany({})

  // Usamos el tipo estricto CreateManyInput para que TypeScript valide cada campo
  const messages: Prisma.DiagnosticMessageCreateManyInput[] = [
    /* =========================================================
       1. UNIVERSALES: RENTABILIDAD (El dinero) - COBERTURA 100%
    ========================================================= */
    { category: 'RENTABILIDAD', minScore: 0, maxScore: 40, color: 'RED', message: 'ALERTA ROJA: Tu rentabilidad neta es crítica. El modelo actual es insostenible y requiere una cirugía mayor en tu estructura de costos o un aumento drástico de tu ticket promedio.' },
    { category: 'RENTABILIDAD', minScore: 41, maxScore: 70, color: 'YELLOW', message: 'ZONA DE RIESGO: El negocio genera flujo, pero el margen de maniobra es muy estrecho. Un mes malo podría ponerte en aprietos. Necesitas optimizar el margen operativo para crear un colchón.' },
    { category: 'RENTABILIDAD', minScore: 71, maxScore: 100, color: 'GREEN', message: 'MODELO ESCALABLE: Tienes una estructura financiera sólida. Es el momento ideal para estandarizar procesos y buscar la expansión o sistematización.' },

    /* =========================================================
       2. UNIVERSALES: MERCADO Y COMPETENCIA - COBERTURA 100%
    ========================================================= */
    { category: 'MERCADO', minScore: 0, maxScore: 40, color: 'RED', message: 'MERCADO INVISIBLE: Tus clientes ideales no saben que existes o no perciben tu valor. Debes aplicar principios de psicología de ventas urgentes: ataca un punto de dolor específico en lugar de solo ofrecer características.' },
    { category: 'MERCADO', minScore: 41, maxScore: 70, color: 'YELLOW', message: 'COMPETENCIA DIRECTA: Eres una opción más en el mercado. Para no caer en una guerra de precios, debes fortalecer tu marca y mejorar tu visibilidad digital local.' },
    { category: 'MERCADO', minScore: 71, maxScore: 100, color: 'GREEN', message: 'DOMINIO DE NICHO: Tu propuesta de valor es clara y te diferencias bien de la competencia. Enfoca tus recursos en fidelizar clientes para aumentar el LTV (Life Time Value).' },

    /* =========================================================
       3. UNIVERSALES: OPERACIÓN Y CAPACIDAD - COBERTURA 100%
    ========================================================= */
    { category: 'OPERACION', minScore: 0, maxScore: 40, color: 'RED', message: 'CUELLO DE BOTELLA: Tu operación está saturada o mal calculada. Estás perdiendo clientes por falta de capacidad o lentitud en el servicio.' },
    { category: 'OPERACION', minScore: 41, maxScore: 70, color: 'YELLOW', message: 'ZONA DE AJUSTE OPERATIVO: Tu operación funciona, pero depende demasiado del esfuerzo humano o de ti como dueño. Sistematiza las tareas repetitivas para que el negocio pueda crecer sin que colapses.' }, // <-- ¡EL RANGO CORREGIDO!
    { category: 'OPERACION', minScore: 71, maxScore: 100, color: 'GREEN', message: 'OPERACIÓN FLUIDA: Tus procesos soportan bien la demanda actual. Tienes margen para inyectar capital en marketing sin que el servicio colapse.' },

    /* =========================================================
       4. TRIGGERS ESPECÍFICOS (Activan alarmas sin importar el rango)
    ========================================================= */
    { category: 'RENTABILIDAD', conditionKey: 'NEGATIVE_PROFIT', minScore: 0, maxScore: 100, color: 'RED', message: 'PÉRDIDA NETA DETECTADA: Tu operación está quemando efectivo mes a mes. Tus gastos superan ampliamente tus ingresos reales. Frena la fuga de capital ajustando precios o recortando fijos hoy.' },
    { category: 'RENTABILIDAD', conditionKey: 'NEGATIVE_MARGIN', minScore: 0, maxScore: 100, color: 'RED', message: 'MARGEN BRUTO INVIABLE: Estás vendiendo casi al costo. Cada nueva venta incrementa tu desgaste sin dejarte utilidad. Sube tus precios inmediatamente, estás subsidiando a tus clientes.' },
    { category: 'RENTABILIDAD', conditionKey: 'HIGH_FIXED_COSTS', minScore: 0, maxScore: 100, color: 'RED', message: 'GASTOS FIJOS ASFIXIANTES: El negocio trabaja solo para pagarle a los empleados, servicios y al casero, no para dejarte ganancias. Debes facturar mucho más rápido o mudarte a una estructura más ligera.' },
    { category: 'OPERACION', conditionKey: 'LOW_OCCUPANCY', minScore: 0, maxScore: 100, color: 'YELLOW', message: 'CAPACIDAD OCIOSA CRÍTICA: Tienes la infraestructura, pero te faltan clientes. La capacidad vacía es dinero que se evapora a diario. Tu prioridad número uno es marketing y adquisición.' },
    { category: 'MERCADO', conditionKey: 'POOR_DIGITAL_PRESENCE', minScore: 0, maxScore: 100, color: 'RED', message: 'APAGÓN DIGITAL: Hoy en día, si no tienes presencia sólida, tu negocio es un fantasma. Estás perdiendo docenas de clientes diarios frente a competidores que sí aparecen en las búsquedas.' },
    { category: 'RIESGO', conditionKey: 'BUSY_BUT_BROKE', minScore: 0, maxScore: 100, color: 'RED', message: 'SÍNDROME DEL NEGOCIO LLENO Y POBRE: Tienes buena ocupación, trabajas todo el día, pero no queda dinero a fin de mes. Tu modelo de precios está roto o hay una fuga silenciosa en tus costos.' },

    /* =========================================================
       5. SEGMENTACIÓN POR INDUSTRIA Y ESTATUS
    ========================================================= */
    { category: 'MERCADO', industry: 'TECNICO', status: 'EN_MARCHA', minScore: 0, maxScore: 100, color: 'YELLOW', message: 'SOPORTE Y TALLERES: Si ofreces servicios fuera de horario regular, debes aplicar una tarifa premium. No regales tu tiempo libre. Implementa pólizas de mantenimiento recurrente para dar estabilidad a tus ingresos.' },
    { category: 'OPERACION', industry: 'TECNICO', status: 'PROYECTO', minScore: 0, maxScore: 100, color: 'YELLOW', message: 'PROYECTO TÉCNICO: Define muy bien tu catálogo. Un especialista cobra el triple que un generalista. Cobra por lo que sabes resolver, no por las horas que tardas.' },
    { category: 'OPERACION', industry: 'SERVICIO', status: 'EN_MARCHA', minScore: 0, maxScore: 100, color: 'YELLOW', message: 'SERVICIOS PROFESIONALES: Tu techo de ingresos está topado por tus horas físicas. Considera implementar embudos digitales automatizados para captar prospectos y comienza a empaquetar tu conocimiento.' },
    { category: 'MERCADO', industry: 'SERVICIO', status: 'PROYECTO', minScore: 0, maxScore: 100, color: 'GREEN', message: 'NUEVO SERVICIO: Para ganar tracción inicial, no compitas por precio. Diseña una oferta irresistible enfocada en la transformación que logrará tu cliente. El mercado paga por resultados.' },
    { category: 'RENTABILIDAD', industry: 'COMIDA', status: 'EN_MARCHA', minScore: 0, maxScore: 100, color: 'RED', message: 'SECTOR ALIMENTOS: Tu Food Cost jamás debe exceder el 33%. Pesa tus mermas diariamente, estandariza recetas y audita a tus proveedores; ahí es donde los restaurantes sangran dinero.' },
    { category: 'OPERACION', industry: 'COMIDA', status: 'PROYECTO', minScore: 0, maxScore: 100, color: 'YELLOW', message: 'PROYECTO GASTRONÓMICO: Antes de gastar en remodelar un local, asegura la estandarización de tu producto estrella. Considera iniciar con un modelo Dark Kitchen para probar el mercado con riesgo bajo.' },
    { category: 'MERCADO', industry: 'RETAIL', status: 'EN_MARCHA', minScore: 0, maxScore: 100, color: 'YELLOW', message: 'COMERCIO RETAIL: Estás en un mercado agresivo. Si no creas una experiencia de compra única, el cliente se irá por la opción más barata en línea. Revisa tu rotación de inventario urgente.' },
    { category: 'RENTABILIDAD', industry: 'RETAIL', status: 'PROYECTO', minScore: 0, maxScore: 100, color: 'YELLOW', message: 'PROYECTO DE VENTAS: El flujo de caja lo es todo. Asegúrate de negociar términos de pago extendidos con proveedores y cobrar al contado a tus clientes. Controla tu inventario para no tener dinero estancado.' }
  ]

  // Ya no usamos "as any". Ahora es fuertemente tipado.
  await prisma.diagnosticMessage.createMany({
    data: messages
  })

  console.log(`✅ Éxito: ${messages.length} mensajes estratégicos sembrados en la base de datos de manera segura.`)
}

main()
  .catch((e) => {
    console.error('❌ Error en el seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })