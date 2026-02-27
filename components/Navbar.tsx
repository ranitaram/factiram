"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, ChevronRight, Sparkles } from "lucide-react";

export default function Navbar({ session }: { session: any }) {
  const [isOpen, setIsOpen] = useState(false);

  // Agregamos la Guía al arreglo de links
  const links = [
    { name: "Método", href: "/#como-funciona" },
    { name: "La Guía", href: "/guia", highlight: true }, // <-- Nuevo link con marca de resaltado
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
          <nav className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-500 uppercase tracking-wider">
            {links.map((link) => (
              <Link 
                key={link.name} 
                href={link.href} 
                className={`transition-colors flex items-center gap-1 ${
                  link.highlight ? "text-emerald-600 font-black" : "hover:text-midnight"
                }`}
              >
                {link.highlight && <Sparkles className="w-3 h-3" />}
                {link.name}
              </Link>
            ))}
            
            {session ? (
              <Link href="/dashboard" className="text-midnight hover:text-emerald-600 font-black border-l pl-8 border-slate-100">
                Panel
              </Link>
            ) : (
              <Link href="/audit" className="bg-midnight text-white px-6 py-2.5 rounded-xl hover:bg-slate-800 transition-all text-xs shadow-lg shadow-midnight/10">
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
          <nav className="flex flex-col gap-6">
            {links.map((link) => (
              <Link 
                key={link.name} 
                href={link.href} 
                onClick={() => setIsOpen(false)}
                className={`text-3xl font-black flex justify-between items-center border-b border-slate-100 pb-4 ${
                  link.highlight ? "text-emerald-600" : "text-midnight"
                }`}
              >
                <span className="flex items-center gap-3">
                  {link.name} 
                  {link.highlight && <span className="text-[10px] bg-emerald-100 px-2 py-1 rounded-md tracking-widest">NUEVO</span>}
                </span>
                <ChevronRight className={link.highlight ? "text-emerald-pro" : "text-slate-200"} />
              </Link>
            ))}
            
            {session ? (
              <Link 
                href="/dashboard" 
                onClick={() => setIsOpen(false)}
                className="text-3xl font-black text-midnight flex justify-between items-center border-b border-slate-100 pb-4"
              >
                Panel <ChevronRight />
              </Link>
            ) : (
              <Link 
                href="/audit" 
                onClick={() => setIsOpen(false)}
                className="bg-midnight text-white p-6 rounded-2xl text-center text-xl font-black uppercase tracking-widest mt-4 shadow-2xl"
              >
                Empezar Auditoría
              </Link>
            )}
          </nav>
        </div>
      )}
    </>
  );
}