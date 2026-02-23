export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto py-10 md:py-20">
      <h1 className="text-4xl font-black text-midnight mb-8 uppercase italic tracking-tighter">
        Aviso de <span className="text-emerald-pro">Privacidad</span>
      </h1>
      
      <div className="prose prose-slate lg:prose-lg space-y-6 text-slate-600 font-medium leading-relaxed">
        <p><strong>Última actualización: 22 de Febrero de 2026</strong></p>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-midnight uppercase">1. Identidad y Domicilio</h2>
          <p>FACTIRAM, con domicilio en Tepic, Nayarit, es responsable del tratamiento de sus datos personales conforme a lo dispuesto por la Ley Federal de Protección de Datos Personales en Posesión de los Particulares.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-midnight uppercase">2. Datos que Recabamos</h2>
          <p>Para la prestación de nuestros servicios de auditoría estratégica, recabamos:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Datos de Identificación:</strong> Nombre y correo electrónico (vía Google Auth).</li>
            <li><strong>Datos de Negocio:</strong> Cifras financieras, costos, métricas de ocupación y proyecciones proporcionadas voluntariamente en el formulario.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-midnight uppercase">3. Finalidad del Tratamiento</h2>
          <p>Sus datos son utilizados exclusivamente para:
            <br />• Generar el reporte de diagnóstico en PDF.
            <br />• Guardar su historial de consultas en su panel privado.
            <br />• Mejorar el motor analítico de nuestra herramienta.
          </p>
          <p className="bg-emerald-50 p-4 border-l-4 border-emerald-500 italic">
            <strong>Nota:</strong> FACTIRAM no vende ni comparte sus datos financieros específicos con terceros. La información se utiliza de forma agregada y anónima para estadísticas generales.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-midnight uppercase">4. Derechos ARCO</h2>
          <p>Usted tiene derecho al Acceso, Rectificación, Cancelación u Oposición del manejo de sus datos. Puede solicitar la eliminación de su cuenta y historial enviando un correo a soporte@factiram.com.</p>
        </section>
      </div>
    </div>
  );
}