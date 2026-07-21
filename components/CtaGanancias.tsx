import { MessageCircle, CheckCircle } from "lucide-react";

type Props = {
  productoNombre?: string;
};

export default function CtaGanancias({ productoNombre }: Props) {
  const mensaje = productoNombre
    ? `Hola, vi el precio del ${productoNombre} en factiram.com y me gustaría agendar una demostración gratuita para entender mejor las ganancias de mi negocio.`
    : `Hola, vi los precios en factiram.com y me gustaría agendar una demostración gratuita para entender mejor las ganancias de mi negocio.`;

  const waHref = `https://wa.me/523318502310?text=${encodeURIComponent(mensaje)}`;

  return (
    <div className="bg-emerald-50/50 border border-emerald-200 rounded-2xl p-6 md:p-8 shadow-sm">
      <p className="text-lg md:text-xl font-black text-midnight uppercase italic tracking-tighter mb-2">
        Ya sabes cuánto cuesta este producto hoy.
      </p>
      <p className="text-base md:text-lg font-bold text-emerald-700 mb-4">
        ¿Sabes si con ese costo tu negocio realmente está dejando ganancias?
      </p>
      <p className="text-sm text-slate-600 leading-relaxed mb-5">
        FACTIRAM analiza tus ventas, gastos e insumos para ayudarte a entender, de forma sencilla, si tu negocio está generando ganancias y cuánto necesitas vender cada día para alcanzar tus objetivos.
      </p>
      <ul className="space-y-2 mb-6">
        <li className="flex items-center gap-2 text-sm text-slate-700 font-medium">
          <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
          Calcula tu ganancia real.
        </li>
        <li className="flex items-center gap-2 text-sm text-slate-700 font-medium">
          <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
          Descubre cuánto necesitas vender cada día.
        </li>
        <li className="flex items-center gap-2 text-sm text-slate-700 font-medium">
          <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
          Toma mejores decisiones con información clara.
        </li>
      </ul>
      <a
        href={waHref}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3.5 rounded-xl font-black text-sm uppercase tracking-wider transition-all shadow-lg"
      >
        <MessageCircle className="w-5 h-5" />
        Agenda una demostración gratuita por WhatsApp
      </a>
    </div>
  );
}
