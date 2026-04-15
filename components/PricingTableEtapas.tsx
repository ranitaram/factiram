"use client";

import { motion } from "framer-motion";
import { Check, Search, Settings, ShieldCheck, MessageSquare } from "lucide-react";

export default function ProcessStages() {
  const phoneNumber = "523318502310";

  const stages = [
    {
      name: "Diagnóstico de Factibilidad",
      subtitle: "Stress Test",
      price: "$1,000",
      description: "Validamos si tu idea tiene viabilidad antes de que inviertas dinero real.",
      features: [
        "Evaluación con herramienta FACTIRAM",
        "Cálculo de Punto de Equilibrio Teórico",
        "Análisis Idea vs Mercado en Tepic",
        "Reporte de Viabilidad (Semáforo)"
      ],
      icon: <Search className="w-6 h-6 text-blue-500" />,
      highlight: false,
      waMessage: "Hola Ramsés, quiero iniciar con la ETAPA 1: Diagnóstico de Factibilidad ($1,000 MXN)."
    },
    {
      name: "Ingeniería de Costos",
      subtitle: "Planeación Operativa",
      price: "$3,500",
      description: "Diseñamos la estructura financiera para que tu negocio sea rentable desde el día 1.",
      features: [
        "Arquitectura de Precios con margen real",
        "Censo completo de gastos fijos",
        "Estimación de gastos variables",
        "Diseño de fondo de reserva (3 meses)"
      ],
      icon: <Settings className="w-6 h-6 text-emerald-500" />,
      highlight: true,
      waMessage: "Hola Ramsés, me interesa la ETAPA 2: Ingeniería de Costos ($3,500 MXN)."
    },
    {
      name: "Ejecución y Blindaje",
      subtitle: "Control de Flujo",
      price: "$5,500",
      description: "Acompañamiento real para que el dinero no se pierda y el negocio funcione.",
      features: [
        "Sistema de registro desde día 1",
        "Monitoreo de flujo de efectivo real",
        "Ajustes financieros inmediatos",
        "Entrenamiento para control financiero"
      ],
      icon: <ShieldCheck className="w-6 h-6 text-purple-500" />,
      highlight: false,
      waMessage: "Hola Ramsés, quiero la ETAPA 3: Ejecución y Blindaje ($5,500 MXN)."
    }
  ];

  return (
    <section className="py-24 px-6 bg-slate-50">
      <div className="max-w-6xl mx-auto">
        
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-6xl font-black text-slate-900 uppercase italic tracking-tighter">
            Proceso de <span className="text-emerald-500">Construcción</span>
          </h2>
          <p className="text-slate-500 font-bold max-w-2xl mx-auto leading-relaxed">
            No construimos negocios a ciegas. Cada etapa valida, diseña y ejecuta con números reales para evitar que pierdas dinero.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stages.map((stage, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`relative bg-white rounded-[3rem] p-8 shadow-xl flex flex-col border-2 ${
                stage.highlight 
                  ? "border-emerald-500 scale-105 z-10 ring-8 ring-emerald-500/10" 
                  : "border-transparent hover:shadow-2xl"
              }`}
            >
              {stage.highlight && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[10px] font-black px-6 py-2 rounded-full tracking-widest uppercase">
                  Etapa Clave
                </div>
              )}

              <div className="mb-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-slate-100 w-12 h-12 rounded-2xl flex items-center justify-center">
                    {stage.icon}
                  </div>
                </div>

                <h3 className="text-xl font-black text-slate-900 uppercase italic">
                  {stage.name}
                </h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                  {stage.subtitle}
                </p>

                <div className="mt-4">
                  <span className="text-3xl font-black text-slate-900">{stage.price}</span>
                  <span className="text-xs text-slate-400 font-bold ml-1">MXN</span>
                </div>

                <p className="text-slate-500 text-sm mt-4 leading-relaxed italic border-l-2 border-emerald-500/20 pl-4">
                  {stage.description}
                </p>
              </div>

              <div className="space-y-3 mb-10 grow">
                {stage.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Check className="w-4 h-4 text-emerald-500 mt-1" />
                    <span className="text-sm font-semibold text-slate-800">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              <a
                href={`https://wa.me/${phoneNumber}?text=${encodeURIComponent(stage.waMessage)}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full py-5 rounded-xl font-black uppercase text-xs flex items-center justify-center gap-2 transition-all ${
                  stage.highlight 
                    ? "bg-slate-900 text-white hover:bg-black" 
                    : "bg-slate-100 text-slate-600 hover:bg-slate-900 hover:text-white"
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                Iniciar Etapa
              </a>
            </motion.div>
          ))}
        </div>

        <div className="mt-20 text-center">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">
            Sistema FACTIRAM • Construcción de Negocios con Datos Reales • 2026
          </p>
        </div>
      </div>
    </section>
  );
}