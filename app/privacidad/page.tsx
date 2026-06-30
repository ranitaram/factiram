export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto py-10 md:py-20">
      <h1 className="text-4xl font-black text-midnight mb-8 uppercase italic tracking-tighter">
        Aviso de <span className="text-emerald-pro">Privacidad</span>
      </h1>

      <div className="prose prose-slate lg:prose-lg space-y-6 text-slate-600 font-medium leading-relaxed">
        <p><strong>Última actualización: 30 de Junio de 2026</strong></p>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-midnight uppercase">1. Identidad y Domicilio</h2>
          <p>FACTIRAM, con domicilio en Tepic, Nayarit, es responsable del tratamiento de sus datos personales conforme a lo dispuesto por la Ley Federal de Protección de Datos Personales en Posesión de los Particulares.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-midnight uppercase">2. Datos que Recabamos</h2>
          <p>Dependiendo del servicio que utilice, recabamos los siguientes datos:</p>

          <h3 className="text-lg font-bold text-midnight mt-4">a) Diagnóstico Estratégico</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Datos de Identificación:</strong> Nombre y correo electrónico (vía Google Auth).</li>
            <li><strong>Datos de Negocio:</strong> Cifras financieras, costos, métricas de ocupación y proyecciones proporcionadas voluntariamente en el formulario de auditoría.</li>
          </ul>

          <h3 className="text-lg font-bold text-midnight mt-4">b) Control Financiero en Tiempo Real</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Ventas y Gastos:</strong> Registro diario de ingresos, egresos y efectivo en caja.</li>
            <li><strong>Productos y Precios:</strong> Catálogo de productos, costos unitarios y precios de venta.</li>
            <li><strong>Información del Negocio:</strong> Nombre, dirección y horarios del establecimiento.</li>
          </ul>

          <h3 className="text-lg font-bold text-midnight mt-4">c) Comparador de Precios (Abastos)</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Búsquedas y Preferencias:</strong> Productos que busca, compara y agrega a su lista de compras.</li>
            <li><strong>Lista de Compras:</strong> Guardada localmente en su navegador (localStorage). No se almacena en nuestros servidores.</li>
            <li><strong>Identificador de Visitante:</strong> Un código único anónimo generado en su navegador para medir visitas y sesiones sin identificar a la persona.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-midnight uppercase">3. Finalidad del Tratamiento</h2>
          <p>Sus datos son utilizados exclusivamente para:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Generar el reporte de diagnóstico en PDF.</li>
            <li>Mostrar su dashboard financiero en tiempo real con ventas, gastos y efectivo.</li>
            <li>Comparar precios de insumos entre proveedores locales.</li>
            <li>Guardar su historial de consultas y reportes en su panel privado.</li>
            <li>Mejorar el motor analítico y la experiencia de la plataforma.</li>
            <li>Generar métricas anónimas de uso (visitantes únicos y sesiones).</li>
          </ul>
          <p className="bg-emerald-50 p-4 border-l-4 border-emerald-500 italic">
            <strong>Nota:</strong> FACTIRAM no vende ni comparte sus datos financieros específicos con terceros. La información se utiliza de forma agregada y anónima para estadísticas generales. La lista de compras del comparador de precios se almacena exclusamente en su navegador y puede ser eliminada en cualquier momento.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-midnight uppercase">4. Derechos ARCO</h2>
          <p>Usted tiene derecho al Acceso, Rectificación, Cancelación u Oposición del manejo de sus datos. Puede solicitar la eliminación de su cuenta y de toda su información enviando un correo a <strong>diagnosticofactiram@gmail.com</strong>.</p>
        </section>
      </div>
    </div>
  );
}
