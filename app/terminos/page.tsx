export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto py-10 md:py-20">
      <h1 className="text-4xl font-black text-midnight mb-8 uppercase italic tracking-tighter">
        Términos y <span className="text-emerald-pro">Condiciones</span>
      </h1>

      <div className="prose prose-slate lg:prose-lg space-y-6 text-slate-600 font-medium leading-relaxed">
        <p><strong>Última actualización: 30 de Junio de 2026</strong></p>

        <p>Al utilizar FACTIRAM, usted acepta los siguientes términos:</p>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-midnight uppercase">1. Naturaleza del Servicio</h2>
          <p>FACTIRAM es una plataforma integral que ofrece tres servicios principales:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Diagnóstico Estratégico:</strong> Herramienta de simulación y análisis basada en modelos matemáticos. Los resultados y el reporte PDF generado son de carácter informativo y educativo.</li>
            <li><strong>Control Financiero en Tiempo Real:</strong> Dashboard que le permite registrar y visualizar sus ventas, gastos y efectivo diario para mantener el control de su negocio.</li>
            <li><strong>Comparador de Precios (Abastos):</strong> Plataforma pública para consultar y comparar precios de insumos entre proveedores locales de Tepic.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-midnight uppercase">2. Deslinde de Responsabilidad</h2>
          <p>Los cálculos del diagnóstico dependen totalmente de la veracidad de los datos ingresados por el usuario. FACTIRAM no garantiza resultados financieros específicos ni se hace responsable por decisiones empresariales tomadas con base en estos reportes.</p>
          <p>Los precios mostrados en el comparador de insumos se recopilan de fuentes públicas y reportes de usuarios. FACTIRAM procura mantener esta información actualizada, pero los precios finales son los establecidos por cada proveedor al momento de la compra.</p>
          <p>Se recomienda consultar con un contador o asesor financiero profesional antes de realizar cambios estructurales en su negocio.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-midnight uppercase">3. Propiedad Intelectual</h2>
          <p>El diseño, el motor de cálculo, los algoritmos de diagnóstico, la plataforma de control financiero y el comparador de precios son propiedad exclusiva de FACTIRAM. El usuario tiene derecho a utilizar su panel personal y descargar sus reportes, pero no a comercializar la metodología o los datos de la plataforma.</p>
          <p>Los precios reportados por los usuarios en el comparador están sujetos a verificación por parte del administrador antes de ser publicados.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-midnight uppercase">4. Uso de la Cuenta</h2>
          <p>FACTIRAM cuenta con dos roles de acceso:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Dueño:</strong> Acceso completo al panel financiero, configuración del negocio y administración de productos y precios en el comparador.</li>
            <li><strong>Cajero:</strong> Acceso limitado al registro diario de ventas y gastos, sin acceso a configuración ni datos históricos del negocio.</li>
          </ul>
          <p>El acceso es personal a través de Google Auth. El usuario es responsable de mantener la seguridad de su cuenta y de los datos ingresados. Las sesiones de cajero expiran automáticamente al cerrar el navegador.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-midnight uppercase">5. Uso del Comparador de Precios</h2>
          <p>El comparador de precios es de acceso público. Los usuarios pueden:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Buscar y comparar precios de insumos sin necesidad de registro.</li>
            <li>Reportar precios observados en proveedores locales (requiere sesión activa de FACTIRAM).</li>
            <li>Contactar a los proveedores directamente a través de los enlaces de WhatsApp proporcionados.</li>
          </ul>
          <p>FACTIRAM se reserva el derecho de moderar y rechazar precios reportados que considere incorrectos o malintencionados.</p>
        </section>
      </div>
    </div>
  );
}
