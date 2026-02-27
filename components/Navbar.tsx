"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, ChevronRight, Sparkles, LayoutGrid } from "lucide-react";

export default function Navbar({ session }: { session: any }) {
  const [isOpen, setIsOpen] = useState(false);

  // Estructura de navegación actualizada
  const links = [
    { name: "Método", href: "/#como-funciona" },
    { name: "La Guía", href: "/guia", highlight: true },
    { name: "Planes", href: "/planes" },
    { name: "Auditoría", href: "/audit" },
  ];

  return (
    <>
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-100">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          
          {/* LOGO */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-midnight rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-emerald-pro font-black text-2xl italic">F</span>
            </div>
            <span className="text-2xl font-black text-midnight tracking-tighter uppercase">
              FACTI<span className="text-emerald-pro">RAM</span>
            </span>
          </Link>
          
          {/* DESKTOP NAV */}
          <nav className="hidden md:flex items-center gap-7 text-[11px] font-black text-slate-500 uppercase tracking-[0.15em]">
            {links.map((link) => (
              <Link 
                key={link.name} 
                href={link.href} 
                className={`transition-all flex items-center gap-1.5 hover:scale-105 ${
                  link.highlight ? "text-emerald-600" : "hover:text-midnight"
                }`}
              >
                {link.highlight && <Sparkles className="w-3.5 h-3.5" />}
                {link.name}
              </Link>
            ))}
            
            <div className="h-6 w-px bg-slate-100 mx-2" />

            {session ? (
              <Link href="/dashboard" className="text-midnight hover:text-emerald-600 transition-colors">
                Panel
              </Link>
            ) : (
              <Link href="/audit" className="bg-midnight text-white px-5 py-2.5 rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-midnight/10">
                Acceso
              </Link>
            )}
          </nav>

          {/* MOBILE BUTTON */}
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-midnight"
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </header>

      {/* MOBILE MENU OVERLAY */}
      {isOpen && (
        <div className="fixed inset-0 bg-white z-90 md:hidden pt-24 px-6 animate-in slide-in-from-top duration-300">
          <nav className="flex flex-col gap-5">
            {links.map((link) => (
              <Link 
                key={link.name} 
                href={link.href} 
                onClick={() => setIsOpen(false)}
                className={`text-2xl font-black flex justify-between items-center border-b border-slate-50 pb-5 ${
                  link.highlight ? "text-emerald-600" : "text-midnight"
                }`}
              >
                <span className="flex items-center gap-3 uppercase tracking-tighter">
                  {link.name} 
                  {link.highlight && <span className="text-[9px] bg-emerald-50 text-emerald-600 px-2 py-1 rounded-md tracking-[0.2em] font-black">POPULAR</span>}
                </span>
                <ChevronRight className={link.highlight ? "text-emerald-pro" : "text-slate-200"} />
              </Link>
            ))}
            
            <div className="pt-6 space-y-4">
              {session ? (
                <Link 
                  href="/dashboard" 
                  onClick={() => setIsOpen(false)}
                  className="w-full py-5 rounded-2xl bg-slate-50 text-midnight text-center font-black uppercase tracking-widest text-sm"
                >
                  Ir a mi Panel
                </Link>
              ) : (
                <Link 
                  href="/audit" 
                  onClick={() => setIsOpen(false)}
                  className="w-full py-5 rounded-2xl bg-midnight text-white text-center font-black uppercase tracking-widest text-sm shadow-xl"
                >
                  Empezar Auditoría
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </>
  );
}