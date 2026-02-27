"use client";

import { motion } from "framer-motion";
import { Clock, Mail } from "lucide-react";
import Link from "next/link";

export default function PendingPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl p-12 text-center space-y-8">
        <div className="bg-amber-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-amber-200">
          <Clock className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-black text-midnight uppercase italic">Pago Pendiente</h1>
        <p className="text-slate-500 font-bold text-sm">Estamos esperando la confirmación de Mercado Pago (esto puede tardar si pagaste en efectivo).</p>
        <div className="bg-slate-50 p-6 rounded-2xl border-2 border-slate-100 text-left">
          <p className="text-[10px] font-black uppercase text-midnight flex items-center gap-2"><Mail className="w-4 h-4" /> ¿Qué sigue?</p>
          <p className="text-xs text-slate-500 font-bold italic mt-2">En cuanto se acredite el pago, te enviaremos la Guía de Rescate FACTIRAM automáticamente a tu correo.</p>
        </div>
        <Link href="/" className="block text-slate-400 font-black uppercase text-[10px] tracking-widest hover:text-midnight transition-colors italic">Entendido, volver al inicio</Link>
      </motion.div>
    </div>
  );
}