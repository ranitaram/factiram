import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'; // Importamos Image

const styles = StyleSheet.create({
  page: { padding: 45, backgroundColor: '#FFFFFF', fontFamily: 'Helvetica' },
  
  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  logoText: { fontSize: 22, fontWeight: 'bold', color: '#0f172a' },
  logoAccent: { color: '#10b981' },
  
  // Hero: Score y Gráfica
  heroContainer: { flexDirection: 'row', gap: 15, marginBottom: 25 },
  scoreCard: { flex: 1, backgroundColor: '#0f172a', borderRadius: 10, padding: 15, alignItems: 'center' },
  scoreValue: { color: '#10b981', fontSize: 36, fontWeight: 'bold' },
  scoreLabel: { color: '#f8fafc', fontSize: 8, textTransform: 'uppercase', marginTop: 4 },

  chartCard: { flex: 2, backgroundColor: '#f8fafc', borderRadius: 10, padding: 15 },
  chartTitle: { fontSize: 8, fontWeight: 'bold', color: '#64748b', marginBottom: 8, textTransform: 'uppercase' },
  barWrapper: { marginBottom: 8 },
  barLabels: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
  barText: { fontSize: 7, color: '#475569' },
  barFull: { height: 8, backgroundColor: '#e2e8f0', borderRadius: 4, width: '100%', overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4 },

  // Diagnóstico
  sectionTitle: { fontSize: 11, fontWeight: 'bold', color: '#0f172a', marginBottom: 12, borderLeft: '3pt solid #10b981', paddingLeft: 8 },
  messageRow: { flexDirection: 'row', marginBottom: 10 },
  messageDot: { width: 6, height: 6, borderRadius: 3, marginTop: 3, marginRight: 8 },
  messageContent: { flex: 1 },
  messageTitle: { fontSize: 9, fontWeight: 'bold', color: '#0f172a' },
  messageBody: { fontSize: 8, color: '#475569', lineHeight: 1.3 },

  // CALL TO ACTION (EL QR)
  ctaSection: { marginTop: 20, paddingTop: 15, borderTop: '1pt solid #e2e8f0', flexDirection: 'row', alignItems: 'center', gap: 20 },
  qrCode: { width: 80, height: 80 },
  ctaTextWrapper: { flex: 1 },
  ctaTitle: { fontSize: 12, fontWeight: 'bold', color: '#0f172a', marginBottom: 4 },
  ctaDesc: { fontSize: 9, color: '#64748b', lineHeight: 1.4 },
  
  footer: { position: 'absolute', bottom: 30, left: 45, right: 45, textAlign: 'center', fontSize: 7, color: '#94a3b8' }
});

export const PdfReport = ({ formData, result, userName, messages }: any) => {
  const phoneNumber = "523114000046"; // TU TELÉFONO REAL AQUÍ
  const waMessage = `Hola Ramsés, terminé mi auditoría en FACTIRAM con un score de ${result.finalScore}/100 y necesito asesoría para mi negocio.`;
  const waUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(waMessage)}`;
  
  // API gratuita para generar el QR
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(waUrl)}`;

  const goal = formData.desiredSalary || 1;
  const current = result.netProfit || 0;
  const currentWidth = Math.min(Math.max((current / goal) * 100, 5), 100);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.logoText}>FACTI<Text style={styles.logoAccent}>RAM</Text></Text>
            <Text style={{ fontSize: 9, color: '#94a3b8' }}>Auditoría Estratégica</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontSize: 10, fontWeight: 'bold' }}>{userName}</Text>
            <Text style={{ fontSize: 8, color: '#94a3b8' }}>{new Date().toLocaleDateString()}</Text>
          </View>
        </View>

        {/* Hero */}
        <View style={styles.heroContainer}>
          <View style={styles.scoreCard}>
            <Text style={styles.scoreValue}>{result.finalScore}</Text>
            <Text style={styles.scoreLabel}>Health Score</Text>
          </View>
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Comparativa de Rentabilidad</Text>
            <View style={styles.barWrapper}>
              <View style={styles.barLabels}><Text style={styles.barText}>Meta de Sueldo</Text><Text style={styles.barText}>${goal.toLocaleString()}</Text></View>
              <View style={styles.barFull}><View style={{ ...styles.barFill, width: '100%', backgroundColor: '#64748b' }} /></View>
            </View>
            <View style={styles.barWrapper}>
              <View style={styles.barLabels}><Text style={styles.barText}>Utilidad Actual</Text><Text style={styles.barText}>${current.toLocaleString()}</Text></View>
              <View style={styles.barFull}><View style={{ ...styles.barFill, width: `${currentWidth}%`, backgroundColor: current >= goal ? '#10b981' : '#ef4444' }} /></View>
            </View>
          </View>
        </View>

        {/* Diagnóstico */}
        <Text style={styles.sectionTitle}>Hallazgos Críticos</Text>
        {messages?.slice(0, 5).map((msg: any, i: number) => {
          const [title, ...bodyParts] = msg.message.split(':');
          return (
            <View key={i} style={styles.messageRow}>
              <View style={[styles.messageDot, { backgroundColor: msg.color === 'RED' ? '#ef4444' : '#f59e0b' }]} />
              <View style={styles.messageContent}>
                <Text style={styles.messageTitle}>{title}</Text>
                <Text style={styles.messageBody}>{bodyParts.join(':')}</Text>
              </View>
            </View>
          );
        })}

        {/* CALL TO ACTION CON QR */}
        <View style={styles.ctaSection}>
          <Image src={qrUrl} style={styles.qrCode} />
          <View style={styles.ctaTextWrapper}>
            <Text style={styles.ctaTitle}>¿Quieres mejorar estos números?</Text>
            <Text style={styles.ctaDesc}>
              Escanea el código QR para agendar una sesión de consultoría personalizada. 
              Analizaremos tu caso para encontrar fugas de capital y optimizar tu rentabilidad hoy mismo.
            </Text>
          </View>
        </View>

        <Text style={styles.footer}>Documento generado por FACTIRAM.com - Consultoría Estratégica Automatizada</Text>
      </Page>
    </Document>
  );
};