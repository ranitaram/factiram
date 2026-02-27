"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, ArrowRight, Loader2, Lock } from "lucide-react";

// 1. Definimos la interfaz para que TS sepa que 'email' existe
interface CheckoutButtonProps {
  email: string;
}

// 2. Desestructuramos el email en los argumentos de la función
export default function CheckoutButton({ email }: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);

  const isValidEmail = (value: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  const handleCheckout = async () => {
    if (loading) return;

    if (!email || !isValidEmail(email)) {
      alert("Por favor ingresa un correo válido antes de continuar.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) throw new Error("Error del servidor");

      const data = await res.json();

      if (data?.init_point) {
        window.location.href = data.init_point;
      } else {
        throw new Error("No se recibió init_point");
      }

    } catch (error) {
      console.error("Error en el checkout:", error);
      alert("Hubo un error al conectar con Mercado Pago.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-midnight p-8 md:p-12 rounded-[3rem] shadow-2xl border-2 border-emerald-500/20 relative overflow-hidden group">
      <div className="absolute -right-20 -top-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all duration-500" />
      
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="text-center md:text-left space-y-4">
          <div className="flex items-center justify-center md:justify-start gap-2 text-emerald-pro">
            <ShieldCheck className="w-5 h-5" />
            <span className="font-black uppercase tracking-widest text-xs">Acceso Inmediato</span>
          </div>
          <h3 className="text-3xl md:text-4xl font-black text-white italic tracking-tighter uppercase leading-none">
            Guía Maestra de <br />
            <span className="text-emerald-pro">Rescate Financiero</span>
          </h3>
          <p className="text-slate-400 font-bold text-sm max-w-md">
            No te quedes solo con el diagnóstico. Aplica la metodología de 51 páginas para blindar tu caja hoy mismo.
          </p>
        </div>

        <div className="flex flex-col items-center gap-4">
          <motion.button
            whileHover={{ scale: loading ? 1 : 1.05 }}
            whileTap={{ scale: loading ? 1 : 0.95 }}
            onClick={handleCheckout}
            disabled={loading}
            className={`relative flex items-center gap-3 px-10 py-6 rounded-2xl font-black uppercase tracking-widest text-sm shadow-[0_20px_50px_rgba(16,185,129,0.3)] ${
              loading ? "bg-slate-700 text-slate-400 cursor-not-allowed" : "bg-emerald-pro text-midnight cursor-pointer hover:bg-white transition-colors"
            }`}
          >
            {loading ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Procesando...</>
            ) : (
              <>Comprar Guía $199 MXN <ArrowRight className="w-5 h-5" /></>
            )}
          </motion.button>
          <div className="flex items-center gap-2 text-[10px] text-slate-500 font-black uppercase tracking-widest">
            <Lock className="w-3 h-3" /> Pago Seguro vía Mercado Pago
          </div>
        </div>
      </div>
    </div>
  );
}