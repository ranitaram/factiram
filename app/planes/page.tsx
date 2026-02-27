"use client";

import PricingTable from "@/components/PricingTable";
import { motion } from "framer-motion";
import { ShieldCheck, MessageSquare, ArrowRight, Zap } from "lucide-react";
import Link from "next/link";

export default function PlanesPage() {
  return (
    <div className="min-h-screen bg-white">
      
      {/* --- HERO SECCION PLANES --- */}
      <section className="bg-midnight pt-24 pb-40 px-6 relative overflow-hidden">
        {/* Decoración de fondo */}
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px]" />
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-full mb-8"
          >
            <Zap className="w-3 h-3 text-emerald-pro" />
            <p className="text-emerald-pro font-black uppercase text-[10px] tracking-[0.2em]">
              Soluciones de Intervención Financiera
            </p>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-black text-white italic tracking-tighter uppercase leading-[0.9] mb-8"
          >
            Toma el control total <br />
            <span className="text-emerald-pro">de tus números</span>
          </motion.h1>

          <p className="text-slate-400 font-bold text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            No somos consultores de escritorio. Somos expertos en intervención que entran a las entrañas de tu negocio para rescatar tu utilidad.
          </p>
        </div>
      </section>

      {/* --- TABLA DE PRECIOS --- */}
      {/* El margen negativo -mt-24 hace que la tabla se encime un poco en el hero, viéndose muy moderno */}
      <div className="-mt-24 relative z-20 pb-20">
        <PricingTable />
      </div>

      {/* --- SECCIÓN DE CIERRE Y CONFIANZA --- */}
      <section className="py-24 px-6 bg-white border-t border-slate-100">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="bg-slate-50 w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto shadow-inner">
            <ShieldCheck className="w-10 h-10 text-midnight" />
          </div>
          
          <h2 className="text-3xl md:text-4xl font-black text-midnight uppercase italic tracking-tighter">
            ¿Aún no sabes por dónde empezar?
          </h2>
          
          <p className="text-slate-500 font-medium text-lg leading-relaxed max-w-2xl mx-auto">
            Te recomendamos iniciar con nuestra <strong>Auditoría Gratuita</strong>. En menos de 3 minutos obtendrás tu Score FACTIRAM y sabrás con precisión qué nivel de intervención requiere tu empresa.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <Link 
              href="/audit" 
              className="bg-midnight text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-slate-800 transition-all shadow-xl shadow-midnight/20"
            >
              Iniciar Auditoría Gratis <ArrowRight className="w-4 h-4 text-emerald-pro" />
            </Link>
            
            <a
              href="https://wa.me/523114000046?text=Hola%20Rams%C3%A9s!%20Tengo%20dudas%20sobre%20los%20planes%20de%20intervenci%C3%B33n.%20%C2%BFMe%20podr%C3%ADas%20asesorar?"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-midnight border-2 border-slate-100 px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:border-midnight transition-all"
            >
              <MessageSquare className="w-4 h-4 text-emerald-pro" /> Hablar con un Humano
            </a>
          </div>
        </div>
      </section>

      {/* --- FOOTER SIMPLE --- */}
      <footer className="py-12 bg-slate-50 text-center">
        <p className="text-[10px] font-black uppercase text-slate-300 tracking-[0.4em]">
          FACTIRAM © 2026 • TEPIC, NAYARIT • MÉXICO
        </p>
      </footer>

    </div>
  );
}