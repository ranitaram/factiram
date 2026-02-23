export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto py-10 md:py-20">
      <h1 className="text-4xl font-black text-midnight mb-8 uppercase italic tracking-tighter">
        Términos y <span className="text-emerald-pro">Condiciones</span>
      </h1>
      
      <div className="prose prose-slate lg:prose-lg space-y-6 text-slate-600 font-medium leading-relaxed">
        <p>Al utilizar FACTIRAM, usted acepta los siguientes términos:</p>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-midnight uppercase">1. Naturaleza del Servicio</h2>
          <p>FACTIRAM es una herramienta de simulación y análisis basada en modelos matemáticos. Los resultados y el reporte PDF generado son de carácter <strong>informativo y educativo</strong>.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-midnight uppercase">2. Deslinde de Responsabilidad</h2>
          <p>Los cálculos realizados dependen totalmente de la veracidad de los datos ingresados por el usuario. FACTIRAM no garantiza resultados financieros específicos ni se hace responsable por decisiones empresariales tomadas con base en este reporte.</p>
          <p>Se recomienda consultar con un contador o asesor financiero profesional antes de realizar cambios estructurales en su negocio.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-midnight uppercase">3. Propiedad Intelectual</h2>
          <p>El diseño, el motor de cálculo y los algoritmos de diagnóstico son propiedad exclusiva de FACTIRAM. El usuario tiene derecho a descargar y utilizar su reporte personal, pero no a comercializar la metodología de la herramienta.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-midnight uppercase">4. Uso de la Cuenta</h2>
          <p>El acceso es personal a través de Google. El usuario es responsable de mantener la seguridad de su cuenta y de los datos ingresados.</p>
        </section>
      </div>
    </div>
  );
}