"use client";

import Link from "next/link";
import { ArrowRight, BarChart3, ShieldCheck, Zap, Star, CheckCircle2, TrendingUp } from "lucide-react";
import PricingTable from "@/components/PricingTable"; // <-- Importamos tu nueva tabla

export default function LandingPage() {
  return (
    <div className="space-y-32 pb-20">
      
      {/* 1. HERO SECTION (El gancho principal) */}
      <section className="text-center space-y-8 pt-10 md:pt-20">
        <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest border border-emerald-100">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          Motor predictivo actualizado (v2.0)
        </div>
        
        <h1 className="text-5xl md:text-7xl font-black text-midnight tracking-tighter uppercase leading-[0.9]">
          Descubre si tu negocio es <br className="hidden md:block" />
          <span className="text-emerald-pro italic">una mina de oro o una fuga de dinero.</span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto font-medium">
          Auditoría estratégica en menos de 3 minutos. Identifica cuánto dinero estás dejando sobre la mesa y obtén un plan de acción en PDF basado en datos reales.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
          <Link href="/audit" className="bg-emerald-pro text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-emerald-500/30 flex items-center justify-center gap-3">
            Iniciar Auditoría Gratuita <ArrowRight className="w-5 h-5" />
          </Link>
          <a href="#como-funciona" className="bg-white text-midnight border-2 border-slate-100 px-10 py-5 rounded-2xl font-black uppercase tracking-widest hover:border-slate-300 transition-all flex items-center justify-center">
            Ver Ejemplo
          </a>
        </div>
      </section>

      {/* 2. CÓMO FUNCIONA (Los 3 pasos) */}
      <section id="como-funciona" className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-black text-midnight uppercase tracking-tighter italic">¿Cómo funciona FACTIRAM?</h2>
          <p className="text-slate-400 mt-2 font-bold uppercase text-[10px] tracking-widest">Tecnología al servicio de tu rentabilidad</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: BarChart3, title: "1. Ingresa tus Números", desc: "Responde preguntas clave sobre tus costos, ventas y mercado en nuestro formulario guiado." },
            { icon: Zap, title: "2. La IA Analiza", desc: "Nuestro motor cruza tus datos con benchmarks de la industria para detectar cuellos de botella." },
            { icon: ShieldCheck, title: "3. Recibe tu Reporte", desc: "Descarga un PDF detallado con tu índice de salud, utilidad real y un plan de acción." }
          ].map((step, i) => (
            <div key={i} className="bg-white p-8 rounded-4xl border border-slate-100 shadow-xl relative overflow-hidden group hover:border-emerald-200 transition-all">
              <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-6 group-hover:scale-110 transition-transform">
                <step.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-midnight mb-3">{step.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. TESTIMONIOS (Social Proof) */}
      <section className="bg-midnight -mx-6 px-6 py-24 md:py-32 rounded-[3rem] md:rounded-[4rem]">
        <div className="max-w-5xl mx-auto text-center space-y-16">
          <div>
            <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic">Resultados que hablan solos</h2>
            <p className="text-emerald-pro mt-2 font-bold uppercase text-[10px] tracking-widest">Lo que dicen nuestros usuarios</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 text-left">
            {[
              { name: "Roberto M.", role: "Dueño de Restaurante", text: "El PDF me hizo ver que mi platillo estrella en realidad me estaba haciendo perder dinero por los costos ocultos. Ajusté precios y subí mi ganancia un 22%." },
              { name: "Ana G.", role: "Agencia de Marketing", text: "Creía que necesitaba más clientes, pero la auditoría demostró que mi problema era la capacidad ociosa. El reporte es oro puro." }
            ].map((t, i) => (
              <div key={i} className="bg-slate-800/50 p-8 rounded-4xl border border-slate-700">
                <div className="flex text-emerald-400 mb-4">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                </div>
                <p className="text-slate-300 italic mb-6">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-pro rounded-full flex items-center justify-center font-black text-white">{t.name[0]}</div>
                  <div>
                    <h4 className="text-white font-bold text-sm">{t.name}</h4>
                    <span className="text-slate-400 text-[10px] uppercase">{t.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. PLANES DE INTERVENCIÓN (La oferta técnica) */}
      {/* 🚨 Aquí insertamos el componente que creamos hoy */}
      <PricingTable />

      {/* 5. PREGUNTAS FRECUENTES (Objeciones) */}
      <section className="max-w-3xl mx-auto px-6">
        <h2 className="text-3xl font-black text-center text-midnight uppercase tracking-tighter italic mb-12">Dudas Rápidas</h2>
        <div className="space-y-4">
          {[
            { q: "¿Es realmente gratis?", a: "Sí. La auditoría y la descarga del reporte PDF son 100% gratuitos. Nuestro objetivo es aportar valor real a tu negocio desde el día uno." },
            { q: "¿Mis datos financieros están seguros?", a: "Absolutamente. Utilizamos tecnología en la nube cifrada y nunca compartiremos tus números exactos con terceros." },
            { q: "¿Para qué industrias funciona?", a: "Alimentos y Bebidas, Servicios Profesionales, Venta de Productos (Retail) y Servicios Técnicos u Oficios." },
            { q: "¿Qué incluye la asesoría personalizada?", a: "Nuestros planes de 14 y 28 días son intervenciones técnicas donde auditamos tu evidencia digital para corregir márgenes y flujo de caja." }
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

      {/* 6. CALL TO ACTION FINAL */}
      <section className="text-center pb-10 px-6">
        <div className="bg-emerald-50 border border-emerald-100 p-12 rounded-[3rem] max-w-4xl mx-auto">
          <TrendingUp className="w-16 h-16 text-emerald-pro mx-auto mb-6" />
          <h2 className="text-4xl font-black text-midnight tracking-tighter uppercase italic mb-6">Deja de adivinar el futuro de tu empresa</h2>
          <Link href="/audit" className="inline-flex bg-midnight text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl">
            Comenzar mi Auditoría Ahora
          </Link>
        </div>
      </section>

    </div>
  );
}