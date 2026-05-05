# FACTIRAM — Manual de Identidad para Claude Code
> Lee este archivo COMPLETO antes de tocar cualquier archivo del proyecto.
> Versión: 4.0 | Última actualización: 2026

---

## 0. REGLAS OPERATIVAS — PRIORIDAD ABSOLUTA

**Estas reglas tienen prioridad sobre cualquier otra sección de este archivo.**
**Antes de escribir cualquier línea de código, lee esto.**

---

### 0.1 Contexto real
Fase de validación. Menos de 5 clientes. El sistema debe poder venderse y usarse en 7 días.
Objetivo: **VENTA + USO DIARIO**. No estamos optimizando para auditoría ni escalabilidad.

---

### 0.2 La pregunta obligatoria
Antes de implementar cualquier cosa, responde estas 3 preguntas:

> 1. ¿Esto es MVP o Fase 2?
> 2. ¿Impacta directamente la decisión diaria del cliente?
> 3. ¿Se puede simplificar más?

Si algo es Fase 2 → **DETENTE y pregunta**. No lo implementes.

---

### 0.3 Las tres capas — separación obligatoria

#### CAPA 1 — CLIENTE (Dashboard Dueño + Vista Cajero)
**SÍ incluir:**
- Ventas del día
- Efectivo vs fiado simple
- Costos fijos
- Productos
- Meta diaria
- Golpe emocional
- Resultado mensual (ganando o perdiendo)

**PROHIBIDO en esta capa:**
- Historial avanzado
- Queries complejas
- Reportes o tendencias
- Cálculos pesados en tiempo real

**Regla de rendimiento:** Todo lo que se renderiza aquí debe calcularse en menos de 100ms.

---

#### CAPA 2 — REGISTRO (Base de Datos)
**SÍ guardar:**
- Ventas con detalle
- Precio snapshot al momento de la venta
- Tipo de venta (EFECTIVO / FIADO)
- Estructura escalable para el futuro

**NO hacer todavía:**
- Optimizar para análisis complejos
- Índices para queries analíticas pesadas
- Relaciones que solo sirven para reportes de Fase 2

---

#### CAPA 3 — CONSULTOR (NO IMPLEMENTAR EN ESTA FASE)
Todo lo relacionado con diagnósticos avanzados, auditoría, historial analítico y métricas
de intervención va aquí.

**Formato obligatorio cuando detectes lógica de esta capa:**
```typescript
// FASE 2: esto se usará para diagnóstico avanzado de intervenciones ($10k-$27k)
// No implementar hasta tener clientes pagando
```
No escribas el código. Solo deja el comentario y sigue.

---

### 0.4 Simplificaciones MVP — no negociables

**FIADO — regla sin ambigüedad:**
- Registrar `tipo: FIADO` en `VentaDia`. Eso es todo.
- El dueño ve un número total: suma de ventas tipo FIADO del día/mes.
- `CobroFiado` existe en el schema como estructura para Fase 2, pero **NO se usa en MVP**.
  No construir UI de cobro, no incluir `CobroFiado` en ningún cálculo de la Capa Cliente.
- La fórmula de recuperación de inversión en MVP usa **solo efectivo del día**, no cobros.
- Comentario obligatorio donde esté `CobroFiado` en el código:
  ```typescript
  // FASE 2: CobroFiado — seguimiento de cobro de deudas individuales
  // En MVP solo registramos tipo FIADO en VentaDia, sin rastrear cobros
  ```

**SUSCRIPCIÓN — solo esto en MVP:**
- `trialStartedAt` — cuándo empezó la prueba
- `setupPagado` — booleano simple
- Bloqueo al día 8 si `setupPagado = false`

No implementar: Mercado Pago, estados de plan, automatizaciones, degradación de planes. Fase 2.

**RECUPERACIÓN DE INVERSIÓN — fórmula MVP:**
```
recuperado = efectivo_cobrado_hoy (campo directo del contador del día)
porcentaje = MIN(100, recuperado_acumulado_mes / inversionMercancia × 100)
```
Sin `CobroFiado`, sin queries complejas. Simple.

**RENDIMIENTO — regla de implementación:**
Los cálculos financieros NUNCA se hacen dentro de componentes React.
Todo cálculo vive en `lib/factiram-engine.ts` y se ejecuta en el servidor.
Los componentes solo reciben el resultado ya calculado como props.
Esto garantiza el límite de 100ms en render.

```typescript
// ✅ Correcto — componente recibe resultado calculado
export default function DashboardDueno({ metaDiaria, utilidadMes, ... }: DashboardProps) { ... }

// ❌ Incorrecto — componente calcula
export default function DashboardDueno({ productos, costos }: Props) {
  const meta = calcularMeta(productos, costos); // NUNCA aquí
}
```

**ALERTA DE ENGAGEMENT (hace el sistema adictivo):**
Si el dueño abre el dashboard y `ventas_hoy === 0` después de las 10am:
Mostrar banner agresivo: `"⚠️ Llevas el día sin registrar ventas. ¿Ya vendiste? Anótalo ahora."`
Esta lógica va en `DashboardDueno.tsx`, es una sola línea condicional. No es un sistema complejo.

---

### 0.5 Qué SÍ construir ahora (MVP completo)
- Autenticación clave 4 dígitos (dueño y cajero)
- Flujo trial 7 días + pantalla de bloqueo día 8
- Registro de ventas (efectivo / fiado simple)
- Costos fijos editables
- Tabla de productos con promedio ponderado
- Meta diaria + golpe emocional
- Resultado mensual: ganando o perdiendo
- Cerrar mes (snapshot simple)
- Vista cajero separada

### 0.6 Qué NO construir (Fase 2)
- Reportes de diagnóstico para intervenciones
- Historial analítico avanzado
- Cobro de fiado con seguimiento por cliente
- Queries de tendencias semana a semana
- Integración completa Mercado Pago
- Portal de administración de suscripciones
- Degradación automática de planes
- Reinicio automático de beneficios del plan $999

---

### 0.7 Diseño y borrador HTML — jerarquía de fuentes de verdad

**Esta sección resuelve el conflicto entre el HTML borrador y el repositorio.**

---

#### Las dos fuentes tienen roles distintos y NO intercambiables

| Fuente | Su único rol | Lo que NO define |
|--------|-------------|-----------------|
| `borrador.html` (raíz del proyecto) | Qué mostrar, en qué orden, qué lógica, qué estados | Diseño, estilos, colores, tipografía, estructura React |
| Repositorio (componentes existentes) | Cómo se ve todo visualmente | Qué datos mostrar ni en qué orden |

Tu trabajo al implementar es fusionar ambos: **estructura del borrador + diseño del repo**.

---

#### El HTML borrador NO define (aunque lo parezca)
- Estructura de componentes React
- Jerarquía de archivos o carpetas
- División de lógica entre componentes
- Clases Tailwind finales

**Solo define:**
- Qué secciones existen y en qué orden aparecen
- Qué estados visuales hay (rojo/verde, visible/oculto, etc.)
- Qué datos se muestran en cada sección

La implementación en React debe adaptarse a la arquitectura del repo, no al HTML.

---

#### Regla de diseño — ABSOLUTA

El diseño visual NO se decide durante la implementación.

```
❌ No escribir clases Tailwind arbitrarias que no estén en el repo
❌ No crear layouts nuevos sin base en lo existente
❌ No "mejorar" ni "modernizar" la UI
❌ No reinterpretar componentes existentes
❌ No copiar el HTML borrador como JSX final
✅ Si no existe un componente equivalente: créalo, pero heredando patrones del repo
✅ Nuevos componentes deben seguir la misma estructura, clases y convenciones que los existentes
```

Si algo no está claro en el diseño existente → **replica lo que ya existe, no inventes**.

---

#### Regla de implementación — OBLIGATORIA antes de escribir JSX

**Paso 1 — Auditoría de componentes (hacer SIEMPRE primero)**
Antes de crear cualquier componente, ejecuta:
```bash
# Ver todos los componentes existentes
find ./components -name "*.tsx" | head -50
find ./app -name "*.tsx" | head -50
```
Lee los componentes encontrados. Entiende qué patrones visuales ya existen.

**Paso 2 — Mapeo obligatorio**
Para cada sección del borrador HTML, identifica:
- ¿Existe un componente en el repo que sirva para esto?
- ¿Puedo reutilizarlo directamente?
- ¿Puedo adaptarlo sin cambiar su estructura visual?

**Paso 3 — Regla de decisión**
```
¿Existe componente similar?  Sí → reutilizarlo tal cual
¿Puedo adaptarlo?            Sí → adaptar sin inventar estilos nuevos
¿No existe nada similar?     → DETENTE y pregunta antes de crear
```

**Paso 4 — Si necesitas algo nuevo**
- Construirlo heredando clases, patrones y estructura de componentes existentes
- No escribir Tailwind arbitrario
- Preguntar primero si no tienes referencia clara

---

#### Antes de escribir cualquier componente, responde esto en voz alta
1. ¿Qué partes del borrador corresponden a `VistaCajero`?
2. ¿Qué partes corresponden a `DashboardDueno`?
3. ¿Qué componentes existentes del repo puedo reutilizar para cada sección?
4. ¿Hay alguna sección del borrador sin componente equivalente en el repo? (Si la hay → preguntar antes de implementar)

**No escribas código hasta responder estas 4 preguntas y haber ejecutado la auditoría de componentes.**

---

### 0.8 Mapeo del borrador HTML — referencia permanente

Este mapeo ya está resuelto. Claude Code NO necesita reinterpretarlo.

#### Secciones que van a VistaCajero (vista minimalista)
Del borrador, extraer SOLO:
- Alerta del día (rojo/verde): `#alertaDia`, `#alertaTitulo`, `#alertaSubtitulo`
- Meta diaria: `#metaDiaria` — número grande
- Contador de ventas: `#ventasHoyUI` + botones `+` y `−`
- Campo de efectivo cobrado hoy: `#efectivoHoy`
- Golpe emocional: `#perdidaDiaria`

El cajero NO ve: costos fijos, productos, recuperación de inversión, resumen mensual, historial, botones de cierre.

#### Secciones que van a DashboardDueno (en este orden exacto)
1. Header + fecha (`#fechaHoy`)
2. Alerta del día (`#alertaDia`)
3. Contador diario con golpe emocional + efectivo (`#perdidaDiaria`, `#ventasHoyUI`, `#efectivoHoy`)
4. Recuperación de inversión (`#inversionTotal`, `#barraProgreso`, `#recuperadoValor`, `#faltanteInversion`)
5. Costos fijos (`#diasLaborales`, `.costo-fijo`, `#totalFijos`)
6. Tabla de productos (`.product-row`, `.costo`, `.precio`, `.ventas`, `.ganancia-texto`)
7. Advertencia crítica (`#advertenciaSilenciosa`) — solo visible si pierde dinero
8. Resumen mensual (`#utilidadNeta`, `#dineroCalle`, `#puntoEquilibrio`, `#ventasMes`)
9. Acciones (`#accionBuena`, `#accionMala`, botones ¿Qué hago mañana? / Cerrar mes / PDF)
10. Historial (`#historialUI`) — solo visible después de cerrar mes
11. PantallaBloqueo — si trial expiró (no está en el borrador, construir desde cero respetando estilos del repo)

---

### 0.9 Arquitectura del motor central — REGLA TÉCNICA MÁS IMPORTANTE

**Si se viola esta sección, el proyecto tendrá bugs silenciosos muy difíciles de detectar.**

#### El problema que esta regla previene

Sin esta regla, Claude Code puede distribuir cálculos entre componentes:

```
CostosFijos.tsx    → calcula total de costos
Productos.tsx      → calcula ganancia promedio  
ResumenMensual.tsx → recalcula utilidad con su propia fórmula
MetaDiaria.tsx     → calcula punto de equilibrio de nuevo
```

Resultado: 4 versiones de la misma fórmula. Si cambias una, las otras no se actualizan.
La UI parece funcionar pero los números no concuerdan. Es un desastre silencioso.

---

#### REGLA — Un solo motor central (`factiram-engine.ts`)

**Todos los cálculos del sistema viven en una sola función pura.**
Si una fórmula existe en más de un lugar → es un bug, no una decisión de diseño.

```typescript
// lib/factiram-engine.ts

type FactiramInput = {
  productos:          Producto[]
  costosFijos:        CostoFijo[]
  diasLaborales:      number
  ventasHoy:          number
  efectivoHoy:        number
  inversionMercancia: number
}

type FactiramOutput = {
  metaDiaria:        number            // piezas mínimas para no perder hoy
  perdidaDiaria:     number            // dinero perdido si no vende nada hoy
  estadoDia:         'GANANCIA' | 'JUSTO' | 'PERDIDA'
  recuperacion: {
    porcentaje:      number
    recuperado:      number
    faltante:        number
  }
  utilidadMes:       number            // "Dinero que vas ganando"
  dineroCalle:       number            // fiado del día
  puntoEquilibrio:   number            // piezas/mes mínimas
  ventasMes:         number            // piezas proyectadas
  totalCostosFijos:  number
  productoEstrella:  string
  productoDebil:     string
  negocioEnPerdida:  boolean
  sinVentasHoy:      boolean           // para alerta de engagement
}

export function calcularFactiram(input: FactiramInput): FactiramOutput { ... }
```

#### REGLA DE CONSISTENCIA — un cambio dispara todo

Cuando el usuario modifica costos fijos, productos, ventas del día, o efectivo:
`calcularFactiram()` se ejecuta completo. Siempre. Sin excepción.
No existe "recalcular solo la meta". El engine recalcula TODO y todos los componentes reciben el output actualizado.

#### Flujo de datos — unidireccional

```
Usuario cambia un dato
      ↓
Estado global actualiza FactiramInput
      ↓
calcularFactiram(input) → FactiramOutput  ← UN SOLO LUGAR
      ↓
Todos los componentes reciben el output
      ↓
UI renderiza — sin calcular nada
```

#### Arquitectura de componentes — solo renderizan

```typescript
// ✅ CORRECTO
const resultado = calcularFactiram(input)
return (
  <>
    <ModuloDia             data={resultado} />
    <RecuperacionInversion data={resultado.recuperacion} />
    <TablaProductos        productos={input.productos} onCambio={actualizarInput} />
    <ResumenMensual        data={resultado} />
    <InsightsNegocio       data={resultado} />
  </>
)

// ❌ INCORRECTO — cada componente calcula por su cuenta
<CostosFijos onCalcular={(total) => setTotalFijos(total)} />
<Productos   onCalcular={(gan) => setGanancia(gan)} />
<Resumen     costos={totalFijos} ganancia={ganancia} />  // inconsistente garantizado
```

**Primera tarea antes de cualquier componente: diseñar `factiram-engine.ts` completo con inputs y outputs tipados. Sin el engine, no se escribe ningún componente.**

---

## 1. QUÉ ES FACTIRAM — LA JERARQUÍA REAL

FACTIRAM **no es una app**. Es una metodología de intervención técnica basada en evidencia
digital para recuperar el control del dinero y construir negocios rentables.

El Dashboard es el **termómetro**. FACTIRAM es el **hospital**.

### Dimensión 1 — Proceso de Construcción (Ingeniería de Negocios)
| Etapa | Precio | Qué incluye |
|-------|--------|-------------|
| Diagnóstico de Factibilidad | $1,000 MXN | Stress test de idea, punto de equilibrio teórico, análisis de mercado en Tepic |
| Ingeniería de Costos | $3,500 MXN | Arquitectura de precios con margen real, censo de gastos fijos, fondo de reserva |
| Ejecución y Blindaje | $5,500 MXN | Sistema de registro desde día 1, monitoreo de flujo, entrenamiento financiero |

### Dimensión 2 — Planes de Intervención (Clínica Financiera)
| Plan | Precio | Duración | Qué incluye |
|------|--------|----------|-------------|
| Emergencia | $10,000 MXN | 14 días | Protocolo "Grasa Cero", estrategia flash de efectivo |
| Estabilización | $18,000 MXN | 28 días | Auditoría de costos, mermas, manuales de delegación financiera |
| Salvamento | $27,000 MXN | — | Cirugía financiera total, blindaje de patrimonio, estrategia de escalabilidad |

### Dimensión 3 — Embudo de Conversión + Planes Recurrentes

#### Flujo de conversión (CRÍTICO — el sistema debe soportar esto técnicamente)
```
Llamada 30 min → Prueba Gratis 7 días → Bloqueo día 8 → Pago Setup $800 → Suscripción activa
```

1. **Prueba Gratis (días 1–7):** Cliente recibe su enlace y claves. Acceso completo sin pagar.
   El sistema registra `trialStartedAt` al crear el negocio.

2. **Bloqueo automático (día 8+):** Si `setupPagado = false` y han pasado > 7 días,
   el `page.tsx` raíz muestra pantalla de bloqueo en lugar del dashboard.
   Texto: "Tu período de prueba terminó. Contacta a tu asesor para activar tu acceso."

3. **Reactivación (Setup $800):** Al confirmar el pago en Mercado Pago, el sistema marca
   `setupPagado = true` y activa el plan seleccionado. El cliente entra sin fricción.

#### Planes recurrentes (post-setup)
| Plan | Precio | Incluye | Regla especial |
|------|--------|---------|----------------|
| Básico | $99/mes | Solo acceso al Dashboard | — |
| Acompañamiento | $399/mes | Dashboard + revisión técnica semanal + soporte WhatsApp | — |
| Gestión de Contenido | $999/mes | Dashboard + 15 diseños/mes + 1 video máx 60s | Beneficios NO acumulables. Si no se usan en el mes, se pierden. Sin excepciones. |
| Entrenamiento | $1,800 (un solo mes) | 4 clases de redes sociales (1/semana) + 15 diseños | Al terminar el mes, el cliente baja automáticamente al plan que elija. No se renueva. |

**Regla de caducidad del plan $999:** Los 15 diseños y el video son del mes en curso.
El campo `beneficiosUsadosMes` en la BD se reinicia a 0 el 1 de cada mes.
Si el cliente no usó sus diseños, no se acumulan para el siguiente mes. El sistema no guarda deuda de beneficios.

**Regla del plan $1,800 (Entrenamiento):** `planActual` debe cambiar automáticamente
a `BASICO` al cumplirse 30 días desde la activación de este plan. No se renueva nunca.
Mostrar aviso al dueño: "Tu mes de entrenamiento termina en X días. Elige tu próximo plan."

---

## 2. LENGUAJE OBLIGATORIO — REGLA #1

Nunca uses términos técnicos en la UI. Si lo haces, es un error.

| ❌ PROHIBIDO                  | ✅ USAR SIEMPRE                               |
|------------------------------|-----------------------------------------------|
| Utilidad Neta                | Dinero que vas ganando                        |
| Margen de Contribución       | Lo que te deja cada pieza                     |
| Cuentas por Cobrar           | Dinero en la calle (Fiado)                    |
| Punto de Equilibrio          | Meta de Supervivencia / Mínimo para no perder |
| Flujo de Efectivo            | Dinero real en tu bolsa                       |
| Costos Fijos                 | Lo que te cuesta existir cada mes             |
| Capital de Trabajo           | Tu lana para operar                           |
| EBITDA / KPI / ROI           | ❌ Nunca. Sin excepción.                       |
| Margen Bruto                 | Lo que ganas antes de pagar tus gastos        |
| Recuperación de Inversión    | Cuándo empiezas a ganar de verdad             |
| Período de prueba            | "Tus 7 días para conocer el sistema"          |
| Suscripción vencida          | "Tu acceso está pausado"                      |

Aplica en: UI, mensajes automáticos, textos visibles al cliente.
En código interno (TypeScript, Prisma, comentarios técnicos) sí usamos términos correctos.

---

## 3. STACK TECNOLÓGICO

```
Framework:     Next.js 14+ con TypeScript (App Router)
Backend:       Server Actions (cajero) + API Routes (dashboard dueño, tiempo real)
Base de datos: Neon (PostgreSQL serverless)
ORM:           Prisma
Auth:          NextAuth.js (Account, Session, VerificationToken, User ya implementados)
Validación:    Zod con .catch() para auto-corrección (patrón ya establecido en proyecto)
Pagos:         Mercado Pago (suscripción domiciliada + preferencias)
Decimales:     decimal.js (en uso — usar para TODOS los cálculos financieros)
Estilos:       Tailwind CSS
```

Nunca sugieras cambiar el stack. Si algo no es compatible, resuelve dentro de él.

---

## 4. DOS VISTAS — DUEÑO vs CAJERO

Son experiencias completamente distintas sobre la misma ruta base `[slug]`.
El componente raíz detecta el rol post-autenticación y renderiza condicionalmente.

### Lógica de acceso en page.tsx (orden de validación)
```
1. ¿Existe el slug? No → 404
2. ¿Autenticado? No → pantalla de login (clave 4 dígitos)
3. ¿setupPagado = false Y han pasado > 7 días desde trialStartedAt? → pantalla de bloqueo
4. ¿rol = CAJERO? → VistaCajero
5. ¿rol = DUENO? → DashboardDueno
```
Este orden es estricto. No cambiar la secuencia.

### Vista DUEÑO — Dashboard completo
El dueño monitorea desde cualquier dispositivo, incluso fuera del local.

**Secciones en orden de aparición:**
1. **Estado del día** — alerta semáforo (Ganancia / Justo / Pérdida)
2. **Golpe emocional** — "Si hoy no vendes nada, pierdes $X de tu bolsa" (rojo, prominente)
3. **Contador del día** — ventas hoy (+ / −) + campo de efectivo cobrado
4. **Recuperación de inversión** — barra de progreso + "$X faltan"
5. **Lo que te cuesta existir** — costos fijos editables (Renta, Luz/Agua, Internet, Sueldos, Publicidad, Otros)
6. **Tus productos** — tabla editable (nombre, costo, precio, pzas/día, ganancia x pieza, semáforo)
7. **Tu realidad al mes** — Dinero ganando | Fiado | Mínimo para no perder | Estás vendiendo
8. **¿Qué está pasando?** — producto estrella, producto que menos deja, acciones rápidas
9. **Advertencia crítica** — alerta roja si el negocio pierde dinero estructuralmente
10. **Botones** — ¿Qué hago mañana? / Cerrar mes / Descargar PDF
11. **Aviso de plan** — si plan = ENTRENAMIENTO, mostrar "Tu mes termina en X días"
12. **Historial** — resumen del mes pasado (visible después de "Cerrar mes")

**Acceso:** contraseña de 4 dígitos, hash bcrypt en BD.

### Vista CAJERO — Solo el contador
Empleado en punto de venta. Pantalla minimalista.

**Solo ve:**
- Número grande: "Necesitas vender X piezas hoy"
- Contador de ventas (+ y −)
- Campo: ¿cuánto cobré en efectivo hoy?
- Alerta simple: "Día de Ganancia" / "Te faltan X piezas"

**NO ve:** utilidades, costos fijos, historial, productos con costos, fiado acumulado,
estado de suscripción, configuración, ningún número que revele la estrategia financiera.

**Acceso:** clave separada del dueño, hash bcrypt. Sin permisos de configuración.

**Cálculo exacto de la vista cajero — sin ambigüedad:**
```
X (meta del día) = meta_diaria_total calculada en el servidor
                 = CEIL( total_costos_fijos / dias_laborales / ganancia_ponderada )

La vista cajero NO recalcula nada.
Recibe meta_diaria como prop ya calculada desde el servidor.
Recibe ventas_hoy del estado de la sesión.
Compara: ventas_hoy >= meta_diaria → "Día de Ganancia" | "Te faltan X piezas"

No hay cálculo por producto. No hay promedio. Solo: ¿llegaste a la meta o no?
```

---

## 5. ARQUITECTURA MULTI-TENANT

Raíz: modelo `Negocio`. Cada cliente = un tenant.

**Regla crítica de seguridad:**
Toda query DEBE incluir `where: { negocioId }`. Sin excepción.
Una query sin `negocioId` en el WHERE es un bug de seguridad.

### Jerarquía de datos
```
Negocio
├── suscripcion        trialStartedAt, setupPagado, planActual, planActivadoAt
├── usuarios[]         RolNegocio: DUENO | CAJERO
├── productos[]        costoCompra, precioVenta, piezasDia
├── costosFijos[]      CategoriaGasto, monto
├── ventasDia[]        cantidad, TipoVenta, precioUnitario (snapshot), cajeroId
└── cobros[]           CobroFiado — montoRecuperado, fechaCobro
```

---

## 6. MODELOS PRISMA

Agregar al `schema.prisma` sin modificar los modelos existentes:

```prisma
model Negocio {
  id                 String      @id @default(uuid())
  nombre             String
  slugUrl            String      @unique
  diasLaborales      Int         @default(26)
  inversionMercancia Decimal     @db.Decimal(12,2) @default(0)
  activo             Boolean     @default(true)
  createdAt          DateTime    @default(now())
  updatedAt          DateTime    @updatedAt

  // Relaciones
  suscripcion        Suscripcion?
  usuarios           UsuarioNegocio[]
  productos          Producto[]
  costosFijos        CostoFijo[]
  ventasDia          VentaDia[]
  cobros             CobroFiado[]

  @@index([slugUrl])
}

// Modelo de suscripción — MVP con control de acceso completo
model Suscripcion {
  id             String        @id @default(uuid())
  negocioId      String        @unique

  // Control de trial
  trialStartedAt DateTime      @default(now())
  setupPagado    Boolean       @default(false)

  // Control de pago mensual (MVP — Ramses activa manualmente)
  proximoPagoAt  DateTime?     // fecha límite de acceso pagado
  estadoMensual  EstadoAcceso  @default(TRIAL)

  // FASE 2: Mercado Pago, planes, beneficios acumulables
  // planActual       PlanFACTIRAM
  // mpSubscriptionId String?
  // mpStatus         String?

  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt

  negocio        Negocio       @relation(fields: [negocioId], references: [id], onDelete: Cascade)
}

enum EstadoAcceso {
  TRIAL      // prueba gratuita activa (días 1-7)
  VIGENTE    // pago registrado y dentro del período
  VENCIDO    // pago vencido (trial o mensualidad)
}

model UsuarioNegocio {
  id        String     @id @default(uuid())
  negocioId String
  nombre    String
  clave     String     // bcrypt hash — NUNCA texto plano
  rol       RolNegocio
  createdAt DateTime   @default(now())

  negocio   Negocio    @relation(fields: [negocioId], references: [id], onDelete: Cascade)
  ventas    VentaDia[]

  @@index([negocioId])
}

model Producto {
  id          String   @id @default(uuid())
  negocioId   String
  nombre      String
  costoCompra Decimal  @db.Decimal(12,2)
  precioVenta Decimal  @db.Decimal(12,2)
  piezasDia   Decimal  @db.Decimal(8,2) @default(0)
  activo      Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  negocio     Negocio  @relation(fields: [negocioId], references: [id], onDelete: Cascade)
  ventas      VentaDia[]

  @@index([negocioId])
}

model CostoFijo {
  id        String         @id @default(uuid())
  negocioId String
  categoria CategoriaGasto
  monto     Decimal        @db.Decimal(12,2)
  updatedAt DateTime       @updatedAt

  negocio   Negocio        @relation(fields: [negocioId], references: [id], onDelete: Cascade)

  @@index([negocioId])
}

model VentaDia {
  id             String         @id @default(uuid())
  negocioId      String
  productoId     String
  cajeroId       String
  cantidad       Int
  tipo           TipoVenta
  precioUnitario Decimal        @db.Decimal(12,2) // snapshot — no cambiar aunque suba el precio
  fecha          DateTime       @default(now())

  negocio        Negocio        @relation(fields: [negocioId], references: [id], onDelete: Cascade)
  producto       Producto       @relation(fields: [productoId], references: [id])
  cajero         UsuarioNegocio @relation(fields: [cajeroId], references: [id])
  cobros         CobroFiado[]

  @@index([negocioId, fecha])
  @@index([negocioId, tipo])
}

model CobroFiado {
  id              String   @id @default(uuid())
  negocioId       String
  ventaId         String
  montoRecuperado Decimal  @db.Decimal(12,2)
  fechaCobro      DateTime @default(now())

  negocio         Negocio  @relation(fields: [negocioId], references: [id], onDelete: Cascade)
  venta           VentaDia @relation(fields: [ventaId], references: [id])

  @@index([negocioId])
  @@index([ventaId])
}

// ── ENUMS ──────────────────────────────────────────────

enum RolNegocio {
  DUENO
  CAJERO
}

enum TipoVenta {
  EFECTIVO
  FIADO
}

enum CategoriaGasto {
  RENTA
  LUZ_AGUA
  INTERNET
  SUELDOS
  PUBLICIDAD
  OTROS
}

enum PlanFACTIRAM {
  BASICO           // $99/mes
  ACOMPANAMIENTO   // $399/mes
  GESTION          // $999/mes — beneficios caducan mensualmente
  ENTRENAMIENTO    // $1,800 — un solo mes, luego baja automáticamente
}
```

---

## 7. LÓGICA DE ACCESO Y PANEL DE ADMIN FACTIRAM

### 7.1 Jerarquía de validación — orden estricto, sin excepciones

La función `validarAcceso` verifica en este orden exacto. Si una condición se cumple, las siguientes no se evalúan.

| Prioridad | Estado | Condición técnica | Resultado en pantalla |
|-----------|--------|-------------------|----------------------|
| 1 | **Pagado y vigente** | `setupPagado === true` Y `fechaActual < proximoPagoAt` | DASHBOARD ACTIVO |
| 2 | **Mensualidad vencida** | `setupPagado === true` Y `fechaActual > proximoPagoAt` | BLOQUEO: "Tu mensualidad venció." |
| 3 | **En prueba** | `setupPagado === false` Y `diasDesdeTrial <= 7` | DASHBOARD ACTIVO (modo trial) |
| 4 | **Prueba vencida** | `setupPagado === false` Y `diasDesdeTrial > 7` | BLOQUEO: "Tu prueba de 7 días terminó." |

**Regla crítica anti-confusión:** En cuanto `setupPagado = true`, la fecha `trialStartedAt` queda completamente invalidada. El acceso depende ÚNICAMENTE de `proximoPagoAt`. Esta verificación va PRIMERO en el código.

```typescript
// lib/factiram-access.ts
export function validarAcceso(suscripcion: Suscripcion): 'ACTIVO' | 'BLOQUEADO' | 'TRIAL' {

  // PRIORIDAD 1 y 2: cliente que ha pagado — trial ignorado completamente
  if (suscripcion.setupPagado) {
    if (!suscripcion.proximoPagoAt) return 'ACTIVO' // recién activado, dar acceso
    return isBefore(new Date(), suscripcion.proximoPagoAt) ? 'ACTIVO' : 'BLOQUEADO'
  }

  // PRIORIDAD 3 y 4: cliente en trial — nunca ha pagado
  const diasDesdeTrial = differenceInDays(new Date(), suscripcion.trialStartedAt)
  return diasDesdeTrial <= 7 ? 'TRIAL' : 'BLOQUEADO'
}
```

### 7.2 Mensajes de bloqueo según causa

```typescript
// PantallaBloqueo recibe la causa para mostrar el mensaje correcto
type CausaBloqueo = 'MENSUALIDAD_VENCIDA' | 'TRIAL_VENCIDO'

// MENSUALIDAD_VENCIDA → "Tu mensualidad venció. Contacta a tu asesor para continuar."
// TRIAL_VENCIDO      → "Tus 7 días de prueba terminaron. Contacta a tu asesor."
// Ambos: NO mostrar precios. El asesor (Ramses) cierra en persona o por WhatsApp.
```

### 7.3 Orden de validación en page.tsx — no cambiar
```
1. ¿Existe el slug?                     No  → 404
2. ¿Autenticado?                        No  → pantalla login (clave 4 dígitos)
3. validarAcceso(suscripcion)           BLOQUEADO → PantallaBloqueo (con causa)
4. ¿rol = CAJERO?                       Sí  → VistaCajero
5. ¿rol = DUENO?                        Sí  → DashboardDueno
```

---

### 7.4 Server Action — activarMensualidad (el "botón mágico")

```typescript
// app/actions/admin.ts
"use server"

export async function activarMensualidad(negocioId: string) {
  const suscripcion = await prisma.suscripcion.findUnique({ where: { negocioId } })
  if (!suscripcion) throw new Error('Negocio no encontrado')

  const ahora = new Date()

  if (!suscripcion.setupPagado) {
    // Primera activación (pago del setup $800): activar y dar 30 días
    await prisma.suscripcion.update({
      where: { negocioId },
      data: {
        setupPagado:   true,
        estadoMensual: 'VIGENTE',
        proximoPagoAt: addDays(ahora, 30),
      }
    })
  } else {
    // Renovación mensual: sumar 30 días a la fecha actual de vencimiento
    const baseParaSumar = suscripcion.proximoPagoAt && isAfter(suscripcion.proximoPagoAt, ahora)
      ? suscripcion.proximoPagoAt  // si aún vigente, sumar desde ahí (no pierde días)
      : ahora                      // si ya venció, sumar desde hoy
    await prisma.suscripcion.update({
      where: { negocioId },
      data: {
        estadoMensual: 'VIGENTE',
        proximoPagoAt: addDays(baseParaSumar, 30),
      }
    })
  }
  revalidatePath('/admin-factiram')
}
```

---

### 7.5 Panel de Admin — `/admin-factiram` (solo para Ramses)

**Ruta oculta, protegida por clave maestra** (variable de entorno, no en BD).
No aparece en ningún menú. Solo Ramses conoce la URL.

**Qué muestra:**
- Lista de todos los clientes activos con nombre del negocio y slug
- Semáforo de estado por cliente:
  - 🟢 Verde — vigente, vence en más de 3 días
  - 🟡 Amarillo — vence en 3 días o menos → "Prepararse para cobrar"
  - 🔴 Rojo — vencido, acceso bloqueado
- Fecha exacta de vencimiento por cliente
- Botón: **"Registrar pago de mensualidad"** → llama a `activarMensualidad(negocioId)`
- Botón: **"Crear nuevo cliente"** → llama al script de onboarding

**Sección "Cobros del día"** (lo que Ramses ve cada mañana):
```
⚠️ Vencen hoy o mañana:
  - Diana Ropa (diana-ropa) — vence mañana
  - Boutique Gaby (boutique-gaby) — venció ayer [BLOQUEADO]
```

**Implementación técnica:**
```typescript
// app/admin-factiram/page.tsx
// Proteger con:
const CLAVE_ADMIN = process.env.ADMIN_SECRET // nunca en código, siempre en .env
// Verificar header o cookie antes de renderizar
// Si no autenticado → redirect('/') sin revelar que existe la ruta
```

**Lo que Ramses hace cada mañana:**
1. Abre `/admin-factiram` desde su celular
2. Ve la lista con semáforos
3. Contacta por WhatsApp a quien vence hoy
4. Cuando cae el depósito → pica "Registrar pago" → cliente reactiva en segundos

```typescript
// FASE 2: notificaciones automáticas por WhatsApp
// FASE 2: integración directa con Mercado Pago para activación sin intervención manual
```

---

### 7.6 Alertas para Ramses dentro del admin

Si un cliente tiene `proximoPagoAt` dentro de 3 días o menos:
```
⚠️ El acceso de [nombre negocio] vence en X días. Prepárate para cobrar.
```

Esta lógica es una query simple al cargar el panel:
```typescript
const porVencer = await prisma.suscripcion.findMany({
  where: {
    setupPagado: true,
    proximoPagoAt: { lte: addDays(new Date(), 3) }
  },
  include: { negocio: { select: { nombre: true, slugUrl: true } } }
})
```

---

## 8. LÓGICA FINANCIERA — FÓRMULAS EXACTAS

Siempre usar `decimal.js`. Nunca floats nativos en cálculos financieros.

### 8.1 Ganancia promedio ponderada (NO promedio simple)
```typescript
const totalPiezas = productos.reduce((s, p) => s.add(p.piezasDia), new Decimal(0));
const ganPonderada = productos.reduce((s, p) => {
  const gan = new Decimal(p.precioVenta).sub(p.costoCompra);
  return s.add(gan.mul(p.piezasDia));
}, new Decimal(0)).div(totalPiezas);
// ❌ NUNCA: (gan1 + gan2 + gan3) / 3
```

### 8.2 Meta de Supervivencia diaria
```
meta_diaria = CEIL( (total_costos_fijos / dias_laborales) / ganancia_ponderada )
```

### 8.3 Golpe emocional
```
perdida_hoy = (costos_fijos / dias_laborales) - (ventas_hoy × ganancia_ponderada)
```
Si > 0 → mostrar en rojo grande. Si ≤ 0 → el día ya está cubierto, mostrar en verde.

### 8.4 Fiado del día
```
precio_promedio = Σ(precioVenta_i × piezasDia_i) / totalPiezasDia
ingreso_estimado_hoy = precio_promedio × ventas_hoy
fiado_hoy = MAX(0, ingreso_estimado_hoy - efectivo_cobrado)
```

### 8.5 Recuperación de inversión
```
recuperado = Σ VentaDia EFECTIVO del mes + Σ CobroFiado del mes
porcentaje = MIN(100, recuperado / inversionMercancia × 100)
```
El fiado NO recupera inversión hasta cobrarse.

### 8.6 Dinero que vas ganando (mensual)
```
ganancia_bruta = Σ( ganancia_i × piezasDia_i × diasLaborales )
dinero_ganando = ganancia_bruta - total_costos_fijos
```

### 8.7 Advertencia crítica
Activar si `dinero_ganando < 0`.
Texto: "Con estos números tu negocio no va a durar. Estás perdiendo dinero cada mes."

---

## 9. ESTRUCTURA DE ARCHIVOS

```
app/
├── [slug]/
│   ├── page.tsx                    ← valida acceso → bloqueo | cajero | dueño
│   ├── components/
│   │   ├── DashboardDueno.tsx
│   │   ├── VistaCajero.tsx
│   │   └── PantallaBloqueo.tsx     ← se muestra al día 8 sin pago
│   └── config/
│       └── page.tsx                ← solo DUENO
├── api/
│   └── negocio/
│       └── [slug]/
│           └── dashboard/
│               └── route.ts        ← GET polling 30s (dueño remoto)
└── actions/
    ├── ventas.ts                   ← registrarVenta, cambiarContador
    ├── fiado.ts                    ← cobrarFiado, listarFiadoPendiente
    ├── config.ts                   ← actualizarProductos, actualizarCostos
    ├── mes.ts                      ← cerrarMes, generarSnapshotMensual
    └── suscripcion.ts              ← activarSetup, reiniciarBeneficios, verificarPlanEntrenamiento

lib/
├── factiram-engine.ts              ← lógica financiera (sin React, sin Prisma)
├── factiram-access.ts              ← validarAcceso, lógica de bloqueo y planes
├── factiram-config.ts              ← tipos y constantes del dominio
└── onboarding.ts                   ← script creación nuevo cliente (30 min)
```

---

## 10. ONBOARDING NUEVO CLIENTE — 30 MINUTOS

El script de onboarding ahora **marca automáticamente el inicio del período de prueba**.

```typescript
type NuevoClienteConfig = {
  nombreNegocio:      string;
  slugUrl:            string;       // ej: "diana-ropa"
  nombreDueno:        string;
  emailDueno:         string;
  claveDueno:         string;       // 4 dígitos → bcrypt antes de guardar
  claveEmpleado:      string;       // 4 dígitos → bcrypt antes de guardar
  diasLaborales:      number;
  inversionMercancia: number;
  productos: {
    nombre:      string;
    costoCompra: number;
    precioVenta: number;
    piezasDia:   number;
  }[];
  costosFijos: {
    categoria: CategoriaGasto;
    monto:     number;
  }[];
}

// El script crea en una sola prisma.$transaction:
// 1. Negocio con slugUrl
// 2. Suscripcion con trialStartedAt = now(), setupPagado = false
// 3. UsuarioNegocio DUENO con clave hasheada
// 4. UsuarioNegocio CAJERO con clave hasheada
// 5. Productos del cliente
// 6. CostosFijos del cliente
// Retorna: { url, claveDueno, claveEmpleado }
// Si algo falla → rollback completo. No queda nada a medias.
```

---

## 11. BUGS DEL BORRADOR HTML — NO REPRODUCIR

1. `gananciaPromedio = 75` → usar promedio ponderado real (sección 8.1)
2. `recuperado = ventasHoy * 100 * 15` → sin sentido, ver sección 8.5
3. Contraseña en texto plano `CLAVE_CORRECTA = "2402"` → bcrypt en BD
4. Campo `efectivoHoy` no conectado a lógica real → cada venta registra su tipo
5. Dashboard asume un solo producto → tabla multi-producto con ponderado
6. `fiadoH * diasLaborales` es proyección, no fiado real → sumar registros reales de BD

---

## 12. PATRONES DE CÓDIGO OBLIGATORIOS

```typescript
// Decimales — siempre
import { Decimal } from "decimal.js";
const gan = new Decimal(precio).sub(costo); // ✅
const gan = precio - costo;                 // ❌

// Seguridad — toda query con negocioId
await prisma.ventaDia.findMany({ where: { negocioId, fecha: ... } }); // ✅
await prisma.ventaDia.findMany({ where: { fecha: ... } });             // ❌ bug de seguridad

// Validación — patrón Zod del proyecto
const numericCoerce = z.coerce.number().catch(0);

// Server Actions — siempre revalidatePath al final
"use server"
```

---

## 13. PRIMERA INSTRUCCIÓN AL ABRIR CLAUDE CODE

```
"Lee CLAUDE.md completo. Luego explora la estructura del proyecto y el schema.prisma.

Antes de crear cualquier componente, haz esto en orden:
1. Dime qué modelos faltan en schema.prisma para FACTIRAM
2. Diseña lib/factiram-engine.ts completo con FactiramInput y FactiramOutput tipados
3. Una vez aprobado el engine, construye VistaCajero con datos mock — sin conectar BD todavía

No avances al paso 2 sin que yo apruebe el paso 1.
No avances al paso 3 sin que yo apruebe el paso 2."
```
