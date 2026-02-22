import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// ==========================================
// ESTILOS DEL PDF PREMIUM
// ==========================================
const styles = StyleSheet.create({
  page: { padding: 40, backgroundColor: '#FFFFFF', fontFamily: 'Helvetica' },
  header: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 2, borderBottomColor: '#10b981', paddingBottom: 10, marginBottom: 20 },
  logoText: { fontSize: 28, fontWeight: 'bold', color: '#0f172a' },
  logoAccent: { color: '#10b981' },
  title: { fontSize: 10, color: '#64748b', marginTop: 2, textTransform: 'uppercase', letterSpacing: 1 },
  clientInfo: { alignItems: 'flex-end' },
  label: { fontSize: 9, color: '#94a3b8', marginBottom: 2, textTransform: 'uppercase' },
  value: { fontSize: 11, fontWeight: 'bold', color: '#0f172a' },
  
  // Grid de 2 columnas para equilibrar el espacio
  grid: { flexDirection: 'row', gap: 20, marginBottom: 20 },
  col: { flex: 1 },

  // Cajas Principales
  scoreBox: { backgroundColor: '#0f172a', padding: 20, borderRadius: 10, alignItems: 'center', marginBottom: 20 },
  scoreLabel: { color: '#10b981', fontSize: 10, textTransform: 'uppercase', marginBottom: 5, letterSpacing: 2 },
  scoreValue: { color: '#FFFFFF', fontSize: 48, fontWeight: 'bold' },
  
  section: { marginBottom: 20, padding: 15, backgroundColor: '#f8fafc', borderRadius: 8, borderLeftWidth: 4, borderLeftColor: '#10b981' },
  sectionWarning: { borderLeftColor: '#f59e0b', backgroundColor: '#fffbeb' },
  sectionTitle: { fontSize: 12, fontWeight: 'bold', color: '#0f172a', marginBottom: 12, textTransform: 'uppercase' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  
  // Elementos de Barra de Progreso (Gráficas)
  progressContainer: { marginBottom: 10 },
  progressLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
  progressLabel: { fontSize: 9, color: '#475569', fontWeight: 'bold' },
  progressBarBg: { height: 6, backgroundColor: '#e2e8f0', borderRadius: 3, width: '100%' },
  progressBarFill: { height: '100%', backgroundColor: '#10b981', borderRadius: 3 },

  // Balas / Listas
  bulletRow: { flexDirection: 'row', marginBottom: 6, paddingRight: 10 },
  bullet: { fontSize: 10, color: '#10b981', marginRight: 5, fontWeight: 'bold' },
  bulletText: { fontSize: 10, color: '#334155', lineHeight: 1.4 },
  
  // Footer
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, textAlign: 'center', color: '#94a3b8', fontSize: 8, borderTopWidth: 1, borderTopColor: '#e2e8f0', paddingTop: 10 }
});

// ==========================================
// SUBCOMPONENTE: BARRA DE PROGRESO
// ==========================================
const ProgressBar = ({ label, score }: { label: string, score: number }) => (
  <View style={styles.progressContainer}>
    <View style={styles.progressLabelRow}>
      <Text style={styles.progressLabel}>{label}</Text>
      <Text style={styles.progressLabel}>{score}/10</Text>
    </View>
    <View style={styles.progressBarBg}>
      <View style={[styles.progressBarFill, { width: `${score * 10}%` }]} />
    </View>
  </View>
);

// ==========================================
// ESTRUCTURA DEL DOCUMENTO
// ==========================================
export const PdfReport = ({ formData, result, userName }: any) => {
  // Cálculos de alto impacto para el reporte:
  const maxRevenue = formData.capacityPerDay * formData.ticketAvg * formData.operatingDays;
  const currentRevenue = maxRevenue * (formData.occupancy / 100);
  const moneyLeftOnTable = maxRevenue - currentRevenue;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* 1. ENCABEZADO */}
        <View style={styles.header}>
          <View>
            <Text style={styles.logoText}>FACTI<Text style={styles.logoAccent}>RAM</Text></Text>
            <Text style={styles.title}>Reporte de Auditoría Estratégica</Text>
          </View>
          <View style={styles.clientInfo}>
            <Text style={styles.label}>Auditoría para:</Text>
            <Text style={styles.value}>{userName || 'Negocio Confidencial'}</Text>
            <Text style={styles.label}>{new Date().toLocaleDateString()}</Text>
          </View>
        </View>

        {/* 2. CALIFICACIÓN GLOBAL */}
        <View style={styles.scoreBox}>
          <Text style={styles.scoreLabel}>Índice de Salud del Negocio</Text>
          <Text style={styles.scoreValue}>{result.finalScore} / 100</Text>
        </View>

        <View style={styles.grid}>
          {/* COLUMNA IZQUIERDA */}
          <View style={styles.col}>
            {/* FINANZAS */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Resumen Financiero Mensual</Text>
              <View style={styles.row}>
                <Text style={styles.label}>Utilidad Neta Real:</Text>
                <Text style={[styles.value, { color: result.netProfit < 0 ? '#ef4444' : '#10b981' }]}>
                  ${result.netProfit.toLocaleString()}
                </Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Punto de Equilibrio:</Text>
                <Text style={styles.value}>${result.breakEvenPoint?.toLocaleString() || '0'}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Gastos Fijos:</Text>
                <Text style={styles.value}>${formData.fixedCosts.toLocaleString()}</Text>
              </View>
            </View>

            {/* EFICIENCIA Y CAPACIDAD (El dato que duele) */}
            <View style={[styles.section, styles.sectionWarning]}>
              <Text style={styles.sectionTitle}>Fuga de Capital (Eficiencia)</Text>
              <View style={styles.row}>
                <Text style={styles.label}>Ocupación Actual:</Text>
                <Text style={styles.value}>{formData.occupancy}%</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Ingreso Actual Estimado:</Text>
                <Text style={styles.value}>${currentRevenue.toLocaleString()}</Text>
              </View>
              <View style={{ marginTop: 8, borderTopWidth: 1, borderTopColor: '#fde68a', paddingTop: 8 }}>
                <Text style={[styles.label, { color: '#d97706' }]}>Dinero "Sobre la mesa" por falta de ventas:</Text>
                <Text style={[styles.value, { color: '#ef4444', fontSize: 14 }]}>
                  -${moneyLeftOnTable.toLocaleString()} mensuales
                </Text>
              </View>
            </View>
          </View>

          {/* COLUMNA DERECHA */}
          <View style={styles.col}>
            {/* MERCADO (Nuestras gráficas simuladas) */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Análisis de Competitividad</Text>
              <ProgressBar label="Visibilidad Local" score={formData.visibilityScore} />
              <ProgressBar label="Fuerza y Presencia Digital" score={formData.digitalScore} />
              <ProgressBar label="Diferenciación de Marca" score={formData.differentiation} />
              <ProgressBar label="Nivel frente a Competencia" score={formData.competitionScore} />
            </View>
          </View>
        </View>

        {/* 3. PLAN DE ACCIÓN (Semillas base) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Plan de Acción Recomendado</Text>
          
          <View style={styles.bulletRow}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              <Text style={{ fontWeight: 'bold' }}>Costos Operativos:</Text> Tus costos de materiales están al {formData.costDirectPercent}%. Es vital auditar a tus proveedores o ajustar precios para no erosionar tus ganancias.
            </Text>
          </View>

          <View style={styles.bulletRow}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              <Text style={{ fontWeight: 'bold' }}>Expansión de Mercado:</Text> Actualmente estás dejando de ganar ${moneyLeftOnTable.toLocaleString()} al mes por capacidad ociosa. Debes invertir urgentemente tus ${formData.marketingSpend.toLocaleString()} de publicidad en estrategias de adquisición directa.
            </Text>
          </View>

          <View style={styles.bulletRow}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              <Text style={{ fontWeight: 'bold' }}>Blindaje Financiero:</Text> Tienes un Sueldo Ideal de ${formData.desiredSalary.toLocaleString()}. Para garantizarlo sin ahogar el negocio, tu meta de ventas mensuales debe superar siempre tu Punto de Equilibrio de ${result.breakEvenPoint?.toLocaleString()}.
            </Text>
          </View>
        </View>

        {/* 4. NOTA AL PIE */}
        <Text style={styles.footer}>
          Este documento confidencial fue generado automáticamente por el motor analítico de FACTIRAM el {new Date().toLocaleDateString()}. 
          Los datos reflejan una auditoría basada en la información proporcionada por el usuario.
        </Text>
        
      </Page>
    </Document>
  );
};