"use client";

import { useState, useEffect } from "react";

export default function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Si no ha aceptado las cookies antes, lo mostramos
    const hasAccepted = localStorage.getItem("factiram_cookies");
    if (!hasAccepted) {
      setShow(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem("factiram_cookies", "true");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 w-full bg-midnight text-slate-300 p-4 z-100 border-t border-slate-800 shadow-2xl flex flex-col sm:flex-row items-center justify-center gap-4 text-xs md:text-sm">
      <p>
        Utilizamos cookies para mejorar tu experiencia y guardar tus preferencias de sesión. Al continuar navegando, aceptas nuestra política de privacidad.
      </p>
      <button 
        onClick={acceptCookies}
        className="bg-emerald-pro text-white px-6 py-2 rounded-full font-bold uppercase tracking-widest hover:brightness-110 transition-all whitespace-nowrap"
      >
        Aceptar
      </button>
    </div>
  );
}