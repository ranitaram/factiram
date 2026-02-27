"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Zap, ShieldAlert, Rocket, MessageSquare, Clock } from "lucide-react";

export default function PricingTable() {
  const phoneNumber = "523114000046";

  const plans = [
    {
      name: "Emergencia",
      price: "$10,000",
      duration: "14 DÍAS",
      description: "Detén el deterioro de tu caja de forma inmediata.",
      features: [
        "Protocolo Grasa Cero",
        "Cálculo de Margen Real",
        "Separación Bancaria Obligatoria",
        "Punto de Equilibrio Diario",
        "Estrategia Flash de Efectivo"
      ],
      icon: <ShieldAlert className="w-6 h-6 text-red-500" />,
      highlight: false,
      waMessage: "¡Hola Ramsés! Me interesa el Plan de EMERGENCIA ($10,000 + IVA) de 14 días. Vengo de FACTIRAM."
    },
    {
      name: "Estabilización",
      price: "$18,000",
      duration: "28 DÍAS",
      description: "Orden estructural y disciplina financiera permanente.",
      features: [
        "Todo lo del plan Emergencia",
        "Auditoría de Costos y Mermas",
        "Optimización de Cartera de Clientes",
        "Manuales de Delegación Financiera",
        "Proyección de Caja a 6 Meses",
        "Fondo de Reserva Inicial"
      ],
      icon: <Zap className="w-6 h-6 text-emerald-pro" />,
      highlight: true,
      waMessage: "¡Hola Ramsés! Me interesa el Plan de ESTABILIZACIÓN ($18,000 + IVA) de 28 días. Vengo de FACTIRAM."
    },
    {
      name: "Salvamento",
      price: "$27,000",
      duration: "28 DÍAS",
      description: "Intervención profunda para rescatar tu patrimonio.",
      features: [
        "Cirugía Financiera Total",
        "Índice de Recuperación (IRI/IRF)",
        "Blindaje de Patrimonio Familiar",
        "Monitoreo de Evidencia Digital",
        "Soporte Prioritario Directo",
        "Estrategia de Escalabilidad Post-Crisis"
      ],
      icon: <Rocket className="w-6 h-6 text-blue-500" />,
      highlight: false,
      waMessage: "¡Hola Ramsés! Me interesa el Plan de SALVAMENTO ($27,000 + IVA) de 28 días. Vengo de FACTIRAM."
    }
  ];

  return (
    <section className="py-24 px-6 bg-slate-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-6xl font-black text-midnight uppercase italic tracking-tighter">
            Planes de <span className="text-emerald-pro">Intervención</span>
          </h2>
          <p className="text-slate-500 font-bold max-w-2xl mx-auto leading-relaxed">
            FACTIRAM no es asesoría externa; es una intervención técnica basada en evidencia digital para recuperar el control de tu dinero.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`relative bg-white rounded-[3.5rem] p-8 md:p-10 shadow-2xl flex flex-col border-2 transition-all ${
                plan.highlight 
                  ? "border-emerald-pro scale-105 z-10 ring-8 ring-emerald-500/5" 
                  : "border-transparent opacity-95 hover:opacity-100"
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-emerald-pro text-midnight text-[10px] font-black px-6 py-2 rounded-full tracking-[0.2em] uppercase">
                  Más Solicitado
                </div>
              )}

              <div className="mb-8">
                <div className="flex justify-between items-start mb-6">
                  <div className="bg-slate-50 w-12 h-12 rounded-2xl flex items-center justify-center">
                    {plan.icon}
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400 font-black text-[10px] uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-lg">
                    <Clock className="w-3 h-3" /> {plan.duration}
                  </div>
                </div>
                
                <h3 className="text-2xl font-black text-midnight uppercase italic">{plan.name}</h3>
                <div className="mt-2 flex flex-col">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-midnight">{plan.price}</span>
                    <span className="text-slate-400 font-bold text-xs uppercase">MXN</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">+ IVA</span>
                </div>
                <p className="text-slate-500 text-sm mt-6 font-medium leading-relaxed italic border-l-2 border-emerald-500/20 pl-4">
                  {plan.description}
                </p>
              </div>

              <div className="space-y-4 mb-12 grow">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Check className="w-4 h-4 text-emerald-pro shrink-0 mt-1" />
                    <span className="text-sm font-bold text-midnight leading-tight">{feature}</span>
                  </div>
                ))}
              </div>

              <a
                href={`https://wa.me/${phoneNumber}?text=${encodeURIComponent(plan.waMessage)}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full py-6 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all ${
                  plan.highlight 
                    ? "bg-midnight text-white shadow-xl hover:bg-slate-800" 
                    : "bg-slate-100 text-slate-500 hover:bg-midnight hover:text-white"
                }`}
              >
                <MessageSquare className="w-4 h-4 text-emerald-pro" />
                Solicitar Intervención
              </a>
            </motion.div>
          ))}
        </div>

        <div className="mt-20 text-center">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">
            Intervenciones 100% Online vía Evidencia Digital • FACTIRAM 2026
          </p>
        </div>
      </div>
    </section>
  );
}