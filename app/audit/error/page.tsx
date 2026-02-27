"use client";

import { motion } from "framer-motion";
import { XCircle, RefreshCw, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ErrorPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl p-10 text-center space-y-8 border border-red-50">
        <XCircle className="w-20 h-20 text-red-500 mx-auto" />
        <h1 className="text-3xl font-black text-midnight uppercase italic">Pago Fallido</h1>
        <p className="text-slate-500 font-bold text-sm">Hubo un problema con la transacción. Tu cuenta no ha sido cargada.</p>
        <div className="flex flex-col gap-4">
          <button onClick={() => window.history.back()} className="w-full bg-midnight text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3">
            <RefreshCw className="w-4 h-4 text-emerald-pro" /> Reintentar Pago
          </button>
          <Link href="/audit" className="text-slate-400 font-black uppercase text-[10px] tracking-widest hover:text-midnight transition-colors italic">Volver al Diagnóstico</Link>
        </div>
      </motion.div>
    </div>
  );
}