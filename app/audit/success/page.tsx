"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, Download, Mail, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";

function SuccessContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [token, setToken] = useState<string | null>(null);
  const preferenceId = searchParams.get("preference_id");

  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 15;

    const checkPayment = async () => {
      if (!preferenceId) {
        setStatus("error");
        return;
      }

      try {
        const res = await fetch(`/api/check-purchase?preference_id=${preferenceId}`);
        const data = await res.json();

        if (data.status === "PAID" && data.downloadToken) {
          setToken(data.downloadToken);
          setStatus("ready");
        } else if (attempts < maxAttempts) {
          attempts++;
          setTimeout(checkPayment, 2000);
        } else {
          setStatus("error");
        }
      } catch (error) {
        setStatus("error");
      }
    };

    checkPayment();
  }, [preferenceId]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl w-full bg-white rounded-[3.5rem] shadow-2xl overflow-hidden border border-slate-100">
        <div className="bg-midnight p-12 text-center space-y-6">
          <CheckCircle2 className="w-20 h-20 text-emerald-pro mx-auto" />
          <h1 className="text-4xl md:text-5xl font-black text-white italic tracking-tighter uppercase">¡Pago <span className="text-emerald-pro">Confirmado!</span></h1>
          <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">Tu Guía de Rescate FACTIRAM está lista</p>
        </div>

        <div className="p-10 md:p-14 text-center space-y-8">
          {status === "loading" && (
            <div className="flex flex-col items-center gap-4 py-10">
              <Loader2 className="w-10 h-10 text-emerald-pro animate-spin" />
              <p className="text-midnight font-black uppercase text-xs tracking-widest">Validando con Mercado Pago...</p>
            </div>
          )}

          {status === "ready" && (
            <div className="space-y-8">
              <div className="bg-emerald-50 border-2 border-emerald-100 p-6 rounded-3xl flex items-start gap-4 text-left">
                <div className="bg-emerald-500 p-2 rounded-xl text-white"><Mail className="w-5 h-5" /></div>
                <p className="text-emerald-800 text-sm font-bold">Hemos enviado el enlace a tu correo por seguridad.</p>
              </div>
              <motion.a whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} href={`/api/download?token=${token}`} className="w-full bg-midnight text-white py-6 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 shadow-2xl hover:bg-slate-800 cursor-pointer transition-all">
                <Download className="w-5 h-5 text-emerald-pro" /> Descargar Guía Ahora (PDF)
              </motion.a>
            </div>
          )}

          {status === "error" && (
            <div className="py-10 space-y-4 text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
              <p className="text-midnight font-black uppercase text-xs">No pudimos validar la compra automáticamente.</p>
              <p className="text-slate-500 text-sm font-bold italic">Revisa tu correo electrónico para obtener el enlace de descarga.</p>
            </div>
          )}

          <div className="pt-8 border-t border-slate-100 flex justify-center">
            <Link href="/" className="text-slate-400 font-black uppercase text-[10px] tracking-widest flex items-center gap-2 hover:text-midnight transition-colors">Volver al Inicio <ArrowRight className="w-4 h-4" /></Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-black uppercase text-midnight">Cargando...</div>}>
      <SuccessContent />
    </Suspense>
  );
}