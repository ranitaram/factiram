"use client";

import { motion } from "framer-motion";
import { Check, Rocket, Settings, BarChart3, Crown, GraduationCap } from "lucide-react";

export default function FactiramPlans() {
  const phoneNumber = "523318502310";

  const plans = [
    {
      name: "Prueba",
      subtitle: "Acceso inicial",
      price: "$0",
      description: "Explora tu negocio con datos reales durante 7 días. Sin compromiso.",
      features: [
        "Acceso completo al dashboard",
        "Ventas, gastos y efectivo en tiempo real",
        "Visualización de tu realidad financiera",
        "Sin tarjeta, sin compromiso"
      ],
      icon: <Rocket className="w-6 h-6 text-blue-500" />,
      highlight: false,
      waMessage: "Hola Ramsés, quiero iniciar la PRUEBA GRATIS de FACTIRAM."
    },
    {
      name: "Setup",
      subtitle: "Activación",
      price: "$800",
      description: "Dejamos tu negocio listo para operar con control financiero desde el día 1.",
      features: [
        "Configuración completa del negocio",
        "Carga inicial de productos",
        "Estructura de costos base",
        "Claves de acceso (dueño y cajero)"
      ],
      icon: <Settings className="w-6 h-6 text-emerald-500" />,
      highlight: false,
      waMessage: "Hola Ramsés, quiero contratar el SETUP de FACTIRAM ($800 MXN)."
    },
    {
      name: "Control",
      subtitle: "Básico",
      price: "$149",
      description: "Controla si estás ganando o perdiendo dinero todos los días.",
      features: [
        "Dashboard financiero en tiempo real",
        "Control de ventas y gastos",
        "Registro de efectivo diario",
        "Alertas básicas del negocio"
      ],
      icon: <BarChart3 className="w-6 h-6 text-slate-700" />,
      highlight: false,
      waMessage: "Hola Ramsés, quiero el plan CONTROL ($149 MXN)."
    },
    {
      name: "Crecimiento",
      subtitle: "Recomendado",
      price: "$399",
      description: "Te decimos qué está mal en tu negocio y cómo corregirlo.",
      features: [
        "Todo lo del plan Control",
        "Análisis automático del negocio",
        "Alertas inteligentes (riesgos y márgenes)",
        "Soporte directo por WhatsApp"
      ],
      icon: <Crown className="w-6 h-6 text-yellow-500" />,
      highlight: true,
      waMessage: "Hola Ramsés, quiero el plan CRECIMIENTO ($399 MXN)."
    },
    {
      name: "Impulso",
      subtitle: "Marketing",
      price: "$899",
      description: "Atrae más clientes mientras controlas tu dinero.",
      features: [
        "Todo lo del plan Crecimiento",
        "10 diseños mensuales",
        "1 video corto (60s)",
        "Optimización de contenido"
      ],
      icon: <Rocket className="w-6 h-6 text-purple-500" />,
      highlight: false,
      waMessage: "Hola Ramsés, quiero el plan IMPULSO ($899 MXN)."
    },
    {
      name: "Entrenamiento",
      subtitle: "Premium",
      price: "$1,800",
      description: "Aprende a vender y usar FACTIRAM para hacer crecer tu negocio.",
      features: [
        "4 sesiones personalizadas",
        "Estrategia de ventas en redes",
        "Uso avanzado de FACTIRAM",
        "+10 diseños incluidos"
      ],
      icon: <GraduationCap className="w-6 h-6 text-indigo-500" />,
      highlight: false,
      waMessage: "Hola Ramsés, quiero el ENTRENAMIENTO ($1,800 MXN)."
    }
  ];

  return (
    <section className="py-24 px-6 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-6xl font-black text-slate-900 uppercase italic tracking-tighter">
            Planes <span className="text-emerald-500">FACTIRAM</span>
          </h2>
          <p className="text-slate-500 font-bold max-w-2xl mx-auto leading-relaxed">
            No es un gasto. Es saber si tu negocio realmente gana dinero.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`relative bg-white rounded-[3rem] p-8 shadow-xl flex flex-col border-2 ${
                plan.highlight 
                  ? "border-emerald-500 scale-105 z-10 ring-8 ring-emerald-500/10" 
                  : "border-transparent hover:shadow-2xl"
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[10px] font-black px-6 py-2 rounded-full tracking-widest uppercase">
                  Más vendido
                </div>
              )}

              <div className="mb-6">
                <div className="bg-slate-100 w-12 h-12 rounded-2xl flex items-center justify-center mb-4">
                  {plan.icon}
                </div>

                <h3 className="text-xl font-black text-slate-900 uppercase italic">
                  {plan.name}
                </h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                  {plan.subtitle}
                </p>

                <div className="mt-4">
                  <span className="text-3xl font-black text-slate-900">{plan.price}</span>
                  <span className="text-xs text-slate-400 font-bold ml-1">MXN</span>
                </div>

                <p className="text-slate-500 text-sm mt-4 leading-relaxed italic border-l-2 border-emerald-500/20 pl-4">
                  {plan.description}
                </p>
              </div>

              <div className="space-y-3 mb-10 grow">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Check className="w-4 h-4 text-emerald-500 mt-1" />
                    <span className="text-sm font-semibold text-slate-800">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              <a
                href={`https://wa.me/${phoneNumber}?text=${encodeURIComponent(plan.waMessage)}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full py-5 rounded-xl font-black uppercase text-xs flex items-center justify-center gap-2 transition-all ${
                  plan.highlight 
                    ? "bg-slate-900 text-white hover:bg-black" 
                    : "bg-slate-100 text-slate-600 hover:bg-slate-900 hover:text-white"
                }`}
              >
                Contratar
              </a>
            </motion.div>
          ))}
        </div>

        <div className="mt-20 text-center">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">
            FACTIRAM • Control Financiero Real para Negocios • 2026
          </p>
        </div>
      </div>
    </section>
  );
}