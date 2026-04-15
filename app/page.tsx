"use client";

import Link from "next/link";
import { ArrowRight, BarChart3, ShieldCheck, Zap, Star, CheckCircle2, TrendingUp } from "lucide-react";
import PricingTableEtapas from "@/components/PricingTableEtapas";

export default function LandingPage() {
  return (
    <div className="space-y-32 pb-20">
      
      {/* 1. HERO */}
      <section className="text-center space-y-8 pt-10 md:pt-20">
        <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest border border-emerald-100">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          Motor FACTIRAM v2.0
        </div>
        
        <h1 className="text-5xl md:text-7xl font-black text-midnight tracking-tighter uppercase leading-[0.9]">
          Descubre si tu negocio genera utilidad real <br className="hidden md:block" />
          <span className="text-emerald-pro italic">o solo está moviendo dinero sin ganancias.</span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto font-medium">
          Diagnóstico de rentabilidad en menos de 3 minutos. Identifica fugas de dinero y obtén un plan claro basado en números reales.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
          <Link href="/audit" className="bg-emerald-pro text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-emerald-500/30 flex items-center justify-center gap-3">
            Iniciar Diagnóstico Gratuito <ArrowRight className="w-5 h-5" />
          </Link>
          <a href="#como-funciona" className="bg-white text-midnight border-2 border-slate-100 px-10 py-5 rounded-2xl font-black uppercase tracking-widest hover:border-slate-300 transition-all flex items-center justify-center">
            Ver Cómo Funciona
          </a>
        </div>
      </section>

      {/* 2. CÓMO FUNCIONA */}
      <section id="como-funciona" className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-black text-midnight uppercase tracking-tighter italic">
            Cómo funciona FACTIRAM
          </h2>
          <p className="text-slate-400 mt-2 font-bold uppercase text-[10px] tracking-widest">
            Datos reales, no suposiciones
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: BarChart3, title: "1. Ingresa tus números", desc: "Responde preguntas clave sobre ventas, costos y operación en un formulario guiado." },
            { icon: Zap, title: "2. El sistema analiza", desc: "El motor FACTIRAM cruza tus datos para detectar fugas de dinero y errores de margen." },
            { icon: ShieldCheck, title: "3. Recibe tu diagnóstico", desc: "Obtén un reporte con utilidad real, riesgos y acciones concretas para mejorar." }
          ].map((step, i) => (
            <div key={i} className="bg-white p-8 rounded-4xl border border-slate-100 shadow-xl">
              <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-6">
                <step.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-midnight mb-3">{step.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. TESTIMONIOS */}
      <section className="bg-midnight -mx-6 px-6 py-24 md:py-32 rounded-[3rem] md:rounded-[4rem]">
        <div className="max-w-5xl mx-auto text-center space-y-16">
          <div>
            <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic">
              Resultados reales
            </h2>
            <p className="text-emerald-pro mt-2 font-bold uppercase text-[10px] tracking-widest">
              Negocios que ya corrigieron su flujo
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 text-left">
            {[
              { name: "Roberto M.", role: "Restaurante", text: "El diagnóstico reveló que mi producto estrella me hacía perder dinero. Ajusté precios y subí utilidad." },
              { name: "Ana G.", role: "Servicios", text: "Pensaba que necesitaba más clientes, pero el problema era mi estructura de costos. Cambié eso y todo mejoró." }
            ].map((t, i) => (
              <div key={i} className="bg-slate-800/50 p-8 rounded-4xl border border-slate-700">
                <div className="flex text-emerald-400 mb-4">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                </div>
                <p className="text-slate-300 italic mb-6">"{t.text}"</p>
                <div>
                  <h4 className="text-white font-bold text-sm">{t.name}</h4>
                  <span className="text-slate-400 text-[10px] uppercase">{t.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. PUENTE */}
      <section className="text-center max-w-3xl mx-auto px-6">
        <p className="text-slate-500 font-medium leading-relaxed">
          No todos los negocios necesitan lo mismo.
        </p>
        <p className="text-midnight font-black text-lg mt-2">
          Por eso FACTIRAM trabaja por etapas: primero validamos, luego diseñamos y finalmente ejecutamos.
        </p>
      </section>

      {/* 5. ETAPAS */}
      <PricingTableEtapas/>

      {/* 6. FAQ */}
      <section className="max-w-3xl mx-auto px-6">
        <h2 className="text-3xl font-black text-center text-midnight uppercase tracking-tighter italic mb-12">
          Dudas frecuentes
        </h2>
        <div className="space-y-4">
          {[
            { q: "¿Es realmente gratis?", a: "Sí. El diagnóstico inicial es completamente gratuito y te muestra la realidad de tu negocio." },
            { q: "¿Mis datos están seguros?", a: "Sí. Tu información es privada y se utiliza únicamente para generar tu diagnóstico." },
            { q: "¿Para quién funciona?", a: "Negocios de alimentos, servicios, retail y oficios que quieren mejorar su rentabilidad." },
            { q: "¿Qué incluyen las intervenciones?", a: "Son procesos donde analizamos tu operación real y corregimos costos, márgenes y flujo con base en datos." }
          ].map((faq, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex gap-4">
              <CheckCircle2 className="w-6 h-6 text-emerald-pro shrink-0" />
              <div>
                <h4 className="font-black text-midnight text-sm uppercase mb-2">{faq.q}</h4>
                <p className="text-sm text-slate-500">{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. CTA FINAL */}
      <section className="text-center pb-10 px-6">
        <div className="bg-emerald-50 border border-emerald-100 p-12 rounded-[3rem] max-w-4xl mx-auto">
          <TrendingUp className="w-16 h-16 text-emerald-pro mx-auto mb-6" />
          <h2 className="text-4xl font-black text-midnight tracking-tighter uppercase italic mb-6">
            Deja de operar a ciegas
          </h2>
          <Link href="/audit" className="inline-flex bg-midnight text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl">
            Ver mi Diagnóstico Ahora
          </Link>
        </div>
      </section>

    </div>
  );
}