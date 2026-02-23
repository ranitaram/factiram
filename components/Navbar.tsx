"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, ChevronRight } from "lucide-react";

export default function Navbar({ session }: { session: any }) {
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { name: "Método", href: "/#como-funciona" },
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
          
          {/* DESKTOP NAV (Oculto en móvil) */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-500 uppercase tracking-wider">
            {links.map((link) => (
              <Link key={link.name} href={link.href} className="hover:text-midnight transition-colors">
                {link.name}
              </Link>
            ))}
            {session ? (
              <Link href="/dashboard" className="text-emerald-600 hover:text-emerald-700 font-black">
                Panel (Historial)
              </Link>
            ) : (
              <Link href="/audit" className="bg-midnight text-white px-6 py-2.5 rounded-xl hover:bg-slate-800 transition-all text-xs">
                Acceso
              </Link>
            )}
          </nav>

          {/* MOBILE BUTTON (Solo visible en móvil) */}
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
                className="text-3xl font-black text-midnight flex justify-between items-center border-b border-slate-100 pb-4"
              >
                {link.name} <ChevronRight className="text-emerald-pro" />
              </Link>
            ))}
            {session ? (
              <Link 
                href="/dashboard" 
                onClick={() => setIsOpen(false)}
                className="text-3xl font-black text-emerald-600 flex justify-between items-center border-b border-slate-100 pb-4"
              >
                Panel <ChevronRight />
              </Link>
            ) : (
              <Link 
                href="/audit" 
                onClick={() => setIsOpen(false)}
                className="bg-emerald-600 text-white p-6 rounded-2xl text-center text-xl font-black uppercase tracking-widest mt-4"
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