"use client";

import { motion } from "framer-motion";
import { Check, Store, Star } from "lucide-react";

export default function PricingTableProveedores() {
  const phoneNumber = "523318502310";

  const plans = [
    {
      name: "Profesional",
      subtitle: "Para proveedores",
      price: "$249",
      description: "Posiciona tu negocio y recibe más clientes al comparar precios en FACTIRAM.",
      features: [
        "Perfil reclamado",
        "Logo del negocio",
        "Horarios",
        "WhatsApp destacado",
        "Estadísticas de visitas",
        "Estadísticas de clics en WhatsApp",
        "Estadísticas de clics en \"Cómo llegar\"",
        "Prioridad cuando exista empate de precio con otro proveedor",
        "Posibilidad de actualizar información del negocio"
      ],
      icon: <Store className="w-6 h-6 text-teal-500" />,
      highlight: false,
      waMessage: "Hola Ramsés, quiero contratar el plan PROFESIONAL para proveedores ($249 MXN/mes)."
    },
    {
      name: "Destacado",
      subtitle: "Premium",
      price: "$599",
      description: "Máxima visibilidad dentro de la plataforma para atraer más clientes.",
      features: [
        "Todo lo del plan Profesional",
        "Productos destacados",
        "Promociones de la semana",
        "Banner dentro del comparador",
        "Aparición en publicaciones semanales de ofertas",
        "Mayor visibilidad dentro de la plataforma"
      ],
      icon: <Star className="w-6 h-6 text-yellow-500" />,
      highlight: true,
      waMessage: "Hola Ramsés, quiero contratar el plan DESTACADO para proveedores ($599 MXN/mes)."
    }
  ];

  return (
    <section className="py-24 px-6 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-6xl font-black text-slate-900 uppercase italic tracking-tighter">
            Planes para <span className="text-emerald-500">Proveedores</span>
          </h2>
          <p className="text-slate-500 font-bold max-w-2xl mx-auto leading-relaxed">
            Destaca tu negocio y gana más clientes comparando precios en FACTIRAM.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
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
                  <span className="text-xs text-slate-400 font-bold ml-1">MXN/mes</span>
                </div>

                <p className="text-slate-500 text-sm mt-4 leading-relaxed italic border-l-2 border-emerald-500/20 pl-4">
                  {plan.description}
                </p>
              </div>

              <div className="space-y-3 mb-10 grow">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Check className="w-4 h-4 text-emerald-500 mt-1 shrink-0" />
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
