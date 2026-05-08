"use client";

import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  ShieldCheck,
  Zap,
  Star,
  CheckCircle2,
  TrendingUp,
  Store,
  Smartphone,
  Users,
  Clock3,
} from "lucide-react";

import PricingTablePlanes from "@/components/PricingTablePlanes";

export default function LandingPage() {
  return (
    <div className="space-y-32 pb-20">

      {/* 1. HERO */}
      <section className="text-center space-y-8 pt-10 md:pt-20 px-6">
        <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest border border-emerald-100">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          7 Días Gratis • FACTIRAM
        </div>

        <h1 className="text-5xl md:text-7xl font-black text-midnight tracking-tighter uppercase leading-[0.9]">
          Controla tu negocio
          <br className="hidden md:block" />
          <span className="text-emerald-pro italic">
            en tiempo real durante 7 días gratis
          </span>
        </h1>

        <p className="text-lg md:text-xl text-slate-500 max-w-3xl mx-auto font-medium leading-relaxed">
          FACTIRAM te muestra cuánto entra, cuánto sale y cuánto dinero realmente queda.
          Tu cajero registra movimientos y tú puedes supervisar todo desde cualquier lugar.
        </p>

        <div className="flex flex-wrap justify-center gap-3 text-xs font-black uppercase tracking-widest">
          <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl">
            Ventas en tiempo real
          </div>

          <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl">
            Gastos diarios
          </div>

          <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl">
            Control de efectivo
          </div>

          <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl">
            Acceso dueño y cajero
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
          <a
             href="https://wa.me/523318502310?text=%C2%A1Hola!%20Vengo%20de%20Factiram%20y%20me%20gustar%C3%ADa%20recibir%20m%C3%A1s%20informaci%C3%B3n%20sobre%20la%20prueba%20gratis."
          target="_blank"
          rel="noopener noreferrer"
          className="bg-emerald-pro text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-emerald-500/30 flex items-center justify-center gap-3"
          >
          Probar 7 Días Gratis <ArrowRight className="w-5 h-5" />
          </a>

          <a
            href="#como-funciona"
            className="bg-white text-midnight border-2 border-slate-100 px-10 py-5 rounded-2xl font-black uppercase tracking-widest hover:border-slate-300 transition-all flex items-center justify-center"
          >
            Ver Cómo Funciona
          </a>
        </div>
      </section>

      {/* 2. EXPLICACIÓN */}
      <section className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-8">

          <div className="bg-white border border-slate-100 rounded-4xl p-8 shadow-xl">
            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-6">
              <Store className="w-6 h-6" />
            </div>

            <h3 className="text-2xl font-black text-midnight uppercase mb-4">
              Vista Dueño
            </h3>

            <p className="text-slate-500 leading-relaxed mb-6">
              El dueño puede revisar ventas, gastos, efectivo y comportamiento
              financiero del negocio en tiempo real desde su celular.
            </p>

            <div className="space-y-3">
              {[
                "Supervisión remota del negocio",
                "Control de ingresos y gastos",
                "Visualización financiera diaria",
                "Detección rápida de problemas",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5" />
                  <span className="text-sm font-semibold text-slate-700">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-4xl p-8 shadow-xl">
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6">
              <Users className="w-6 h-6" />
            </div>

            <h3 className="text-2xl font-black text-midnight uppercase mb-4">
              Vista Cajero
            </h3>

            <p className="text-slate-500 leading-relaxed mb-6">
              El empleado o cajero registra ventas, gastos y efectivo fácilmente
              desde una pantalla rápida y sencilla.
            </p>

            <div className="space-y-3">
              {[
                "Registro simple de ventas",
                "Control diario de caja",
                "Registro de gastos rápidos",
                "Acceso independiente con clave",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-blue-500 mt-0.5" />
                  <span className="text-sm font-semibold text-slate-700">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* 3. CÓMO FUNCIONA */}
      <section id="como-funciona" className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-black text-midnight uppercase tracking-tighter italic">
            Cómo funciona FACTIRAM
          </h2>

          <p className="text-slate-400 mt-2 font-bold uppercase text-[10px] tracking-widest">
            Control financiero simple y en tiempo real
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: Smartphone,
              title: "1. Creamos tu acceso",
              desc: "Recibes un enlace personalizado con claves independientes para dueño y cajero.",
            },
            {
              icon: Zap,
              title: "2. Registran movimientos",
              desc: "Tu equipo registra ventas, gastos y efectivo desde cualquier celular.",
            },
            {
              icon: BarChart3,
              title: "3. Ves tu realidad",
              desc: "FACTIRAM convierte los movimientos del negocio en información clara para tomar decisiones.",
            },
          ].map((step, i) => (
            <div
              key={i}
              className="bg-white p-8 rounded-4xl border border-slate-100 shadow-xl"
            >
              <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-6">
                <step.icon className="w-6 h-6" />
              </div>

              <h3 className="text-xl font-black text-midnight mb-3">
                {step.title}
              </h3>

              <p className="text-sm text-slate-500 leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. BENEFICIOS */}
      <section className="bg-midnight -mx-6 px-6 py-24 md:py-32 rounded-[3rem] md:rounded-[4rem]">
        <div className="max-w-6xl mx-auto">

          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic">
              Lo que descubren los negocios
            </h2>

            <p className="text-emerald-pro mt-2 font-bold uppercase text-[10px] tracking-widest">
              En los primeros 7 días
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">

            <div className="bg-slate-800/50 border border-slate-700 rounded-4xl p-8">
              <Clock3 className="w-10 h-10 text-emerald-400 mb-5" />

              <h3 className="text-white font-black text-xl mb-3">
                Fugas de dinero
              </h3>

              <p className="text-slate-300 text-sm leading-relaxed">
                Muchos negocios venden todos los días pero nunca revisan cuánto dinero realmente desaparece.
              </p>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-4xl p-8">
              <ShieldCheck className="w-10 h-10 text-emerald-400 mb-5" />

              <h3 className="text-white font-black text-xl mb-3">
                Control real
              </h3>

              <p className="text-slate-300 text-sm leading-relaxed">
                Dueños y empleados trabajan con accesos separados y registros organizados.
              </p>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-4xl p-8">
              <TrendingUp className="w-10 h-10 text-emerald-400 mb-5" />

              <h3 className="text-white font-black text-xl mb-3">
                Decisiones rápidas
              </h3>

              <p className="text-slate-300 text-sm leading-relaxed">
                Detecta problemas antes de que afecten la caja del negocio.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 5. TESTIMONIOS */}
      <section className="max-w-5xl mx-auto px-6">
        <div className="text-center space-y-16">

          <div>
            <h2 className="text-3xl font-black text-midnight uppercase tracking-tighter italic">
              Resultados reales
            </h2>

            <p className="text-emerald-pro mt-2 font-bold uppercase text-[10px] tracking-widest">
              Negocios que ya comenzaron a controlar su dinero
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 text-left">
            {[
              {
                name: "Roberto M.",
                role: "Restaurante",
                text: "Descubrí que había días donde vendíamos mucho pero el efectivo no coincidía.",
              },
              {
                name: "Ana G.",
                role: "Boutique",
                text: "Ahora puedo revisar mi negocio aunque no esté físicamente en la tienda.",
              },
            ].map((t, i) => (
              <div
                key={i}
                className="bg-white p-8 rounded-4xl border border-slate-100 shadow-xl"
              >
                <div className="flex text-emerald-400 mb-4">
                  {[...Array(5)].map((_, index) => (
                    <Star key={index} className="w-4 h-4 fill-current" />
                  ))}
                </div>

                <p className="text-slate-500 italic mb-6">
                  "{t.text}"
                </p>

                <div>
                  <h4 className="text-midnight font-bold text-sm">
                    {t.name}
                  </h4>

                  <span className="text-slate-400 text-[10px] uppercase">
                    {t.role}
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 6. PLANES */}
      <PricingTablePlanes />

      {/* 7. FAQ */}
      <section className="max-w-3xl mx-auto px-6">
        <h2 className="text-3xl font-black text-center text-midnight uppercase tracking-tighter italic mb-12">
          Dudas frecuentes
        </h2>

        <div className="space-y-4">
          {[
            {
              q: "¿Los 7 días realmente son gratis?",
              a: "Sí. Puedes usar FACTIRAM durante 7 días sin pagar y sin compromiso.",
            },
            {
              q: "¿Necesito instalar algo?",
              a: "No. Todo funciona desde el navegador del celular o computadora.",
            },
            {
              q: "¿Puedo tener acceso para empleados?",
              a: "Sí. FACTIRAM genera claves independientes para dueño y cajero.",
            },
            {
              q: "¿Para qué negocios funciona?",
              a: "FACTIRAM está diseñado principalmente para boutiques, tiendas de ropa y negocios similares donde el control diario de ventas, gastos y efectivo es más importante que el manejo avanzado de inventario."
            }
          ].map((faq, i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex gap-4"
            >
              <CheckCircle2 className="w-6 h-6 text-emerald-pro shrink-0" />

              <div>
                <h4 className="font-black text-midnight text-sm uppercase mb-2">
                  {faq.q}
                </h4>

                <p className="text-sm text-slate-500">
                  {faq.a}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. CTA FINAL */}
      <section className="text-center pb-10 px-6">
        <div className="bg-emerald-50 border border-emerald-100 p-12 rounded-[3rem] max-w-4xl mx-auto">

          <TrendingUp className="w-16 h-16 text-emerald-pro mx-auto mb-6" />

          <h2 className="text-4xl font-black text-midnight tracking-tighter uppercase italic mb-6">
            Prueba FACTIRAM gratis durante 7 días
          </h2>

          <p className="text-slate-500 max-w-2xl mx-auto mb-8 leading-relaxed">
            Descubre cómo se mueve realmente el dinero de tu negocio antes de seguir operando a ciegas.
          </p>

          <a
            href="https://wa.me/523318502310?text=%C2%A1Hola!%20Vengo%20de%20Factiram%20y%20me%20gustar%C3%ADa%20recibir%20m%C3%A1s%20informaci%C3%B3n%20sobre%20la%20prueba%20gratis."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex bg-midnight text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl"
            >
            Empezar Prueba Gratis
          </a>
        </div>
      </section>

    </div>
  );
}