"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  CheckCircle2, ShieldCheck, 
  Zap, FileText, Lock, Clock, ArrowRight 
} from "lucide-react";
import CheckoutButton from "@/components/CheckoutButton";

/* =========================================================
   SUBCOMPONENTE: CONTADOR DE TIEMPO (URGENCIA)
========================================================= */
const CountdownTimer = () => {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const target = new Date();
    target.setHours(target.getHours() + 24);

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = target.getTime() - now;

      setTimeLeft({
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex justify-center gap-4 mt-8">
      {[
        { label: "Hrs", val: timeLeft.hours },
        { label: "Min", val: timeLeft.minutes },
        { label: "Seg", val: timeLeft.seconds }
      ].map((t, i) => (
        <div key={i} className="text-center">
          <div className="bg-emerald-500 text-midnight w-12 h-12 md:w-16 md:h-16 rounded-2xl flex items-center justify-center text-xl md:text-2xl font-black italic shadow-lg shadow-emerald-500/20">
            {String(t.val).padStart(2, '0')}
          </div>
          <p className="text-[10px] font-black uppercase text-slate-500 mt-2 tracking-widest">{t.label}</p>
        </div>
      ))}
    </div>
  );
};

/* =========================================================
   COMPONENTE PRINCIPAL: LANDING PAGE
========================================================= */
export default function GuiaLanding() {
  const [email, setEmail] = useState("");

  return (
    <div className="min-h-screen bg-white text-midnight font-sans selection:bg-emerald-pro selection:text-midnight">
      
      {/* --- BANNER DE OFERTA TEMPORAL --- */}
      <div className="bg-emerald-pro py-2 text-center overflow-hidden">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-midnight animate-pulse">
          ⚡ OFERTA DE LANZAMIENTO: PRECIO ESPECIAL POR TIEMPO LIMITADO ⚡
        </p>
      </div>

      {/* --- HERO SECTION --- */}
      <section className="bg-midnight pt-16 pb-32 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-emerald-500/5 blur-[120px] rounded-full" />
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-8xl font-black text-white italic tracking-tighter uppercase leading-[0.85] mb-8"
          >
            Deja de jugar a la <span className="text-emerald-pro underline decoration-emerald-pro/30">Ruleta</span> con tu patrimonio
          </motion.h1>

          <p className="text-slate-400 font-bold text-lg md:text-xl max-w-2xl mx-auto mb-6">
            ¿Vendes mucho pero sientes que no te queda nada en la bolsa? Es hora de dejar de "adivinar" y empezar a controlar.
          </p>

          <CountdownTimer />
        </div>
      </section>

      {/* --- SECCIÓN MOCKUP Y GANCHO --- */}
      <section className="py-24 px-6 -mt-24">
        <div className="max-w-5xl mx-auto bg-white rounded-[3.5rem] shadow-2xl border border-slate-100 p-8 md:p-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            <motion.div 
              initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }}
              className="relative group"
            >
              <div className="absolute -inset-4 bg-emerald-500/10 rounded-[3rem] blur-2xl group-hover:bg-emerald-500/20 transition-all" />
              <img 
                src="images/Sistema-factiram-Mockups.png" 
                alt="Guía Maestra FACTIRAM Mockup"
                className="relative w-full h-auto rounded-4xl drop-shadow-[0_35px_35px_rgba(0,0,0,0.2)]"
              />
            </motion.div>

            <div className="space-y-8">
              <h2 className="text-4xl font-black text-midnight uppercase italic leading-none tracking-tighter">
                Operar sin números no es ser empresario, <span className="text-red-500 underline underline-offset-4">es un pasatiempo caro.</span>
              </h2>
              <p className="text-slate-500 font-medium text-lg leading-relaxed">
                Presentamos la <strong>Guía Maestra FACTIRAM</strong>: 51 páginas de pura estrategia técnica diseñada para dueños de negocios reales, no para contadores.
              </p>
              
              <div className="space-y-4 border-t pt-8">
                {["11 Capítulos Técnicos", "Metodología Aplicable en 30 min", "Acceso Vitalicio + Actualizaciones"].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-midnight font-black uppercase text-xs">
                    <CheckCircle2 className="w-5 h-5 text-emerald-pro" /> {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- BENEFICIOS --- */}
      <section className="py-24 bg-slate-50 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-center text-4xl font-black text-midnight uppercase italic mb-16 tracking-tight">
            Lo que vas a descubrir por solo <span className="text-emerald-pro">$199 MXN</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { t: "El Score FACTIRAM", d: "El termómetro exacto para saber si tu negocio es un tanque de guerra o un castillo de naipes." },
              { t: "Margen vs. Marcaje", d: "El error de cálculo que hace que el 80% de las PYMEs trabajen gratis sin saberlo." },
              { t: "Tu Punto de Equilibrio", d: "Descubre tu 'línea de vida' diaria para que nunca más te falte para la nómina." },
              { t: "Protocolo Grasa Cero", d: "Cómo amputar gastos innecesarios que están asfixiando tu utilidad hoy mismo." }
            ].map((item, i) => (
              <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 hover:border-emerald-pro transition-all group">
                <Zap className="w-6 h-6 text-emerald-pro mb-4 group-hover:scale-125 transition-transform" />
                <h4 className="font-black text-midnight uppercase text-sm mb-2">{item.t}</h4>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">{item.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- CTA FINAL (DARK BOX CORREGIDO) --- */}
      <section className="py-24 px-6 bg-midnight relative overflow-hidden text-center text-white">
        <div className="absolute top-0 left-0 w-full h-1 bg-emerald-pro" />
        
        <div className="max-w-4xl mx-auto space-y-10 relative z-10">
          <h2 className="text-5xl md:text-6xl font-black italic uppercase tracking-tighter">
            Consigue tu Guía de <br /><span className="text-emerald-pro">Rescate Financiero</span>
          </h2>
          <p className="text-slate-400 font-bold text-lg md:text-xl">
            Hoy puedes obtener la metodología profesional por menos de lo que cuesta una pizza. <strong>PDF de descarga inmediata.</strong>
          </p>

          <div className="bg-white/5 border border-white/10 p-8 md:p-12 rounded-[3rem] backdrop-blur-md">
             {/* Aumenté el max-w aquí para que en escritorio el botón respire */}
             <div className="max-w-xl mx-auto space-y-6">
                <input 
                  type="email" placeholder="Tu correo para enviarte la guía"
                  className="w-full p-6 bg-midnight border-2 border-slate-700 rounded-2xl font-bold text-white outline-none focus:border-emerald-pro transition-all text-center md:text-left"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                />
                
                {/* Contenedor del botón con ancho completo para evitar cortes */}
                <div className="w-full overflow-visible">
                  <CheckoutButton email={email} />
                </div>

                <div className="flex items-center justify-center gap-2 text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">
                  <Lock className="w-3 h-3" /> Pago 100% Seguro vía Mercado Pago
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* --- GARANTÍA & FOOTER --- */}
      <footer className="py-20 bg-white border-t border-slate-100 px-6 text-center">
        <div className="max-w-xl mx-auto space-y-6">
          <ShieldCheck className="w-16 h-16 text-midnight mx-auto" />
          <p className="text-slate-500 font-medium italic">
            "FACTIRAM no te da una opinión, te da un sistema." Si buscas claridad y poder sobre tu dinero, haz clic arriba.
          </p>
          <p className="text-[10px] font-black uppercase text-slate-300 tracking-[0.4em] pt-10">
            FACTIRAM © 2026 • TEPIC, NAYARIT
          </p>
        </div>
      </footer>
    </div>
  );
}