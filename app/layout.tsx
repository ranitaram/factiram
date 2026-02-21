import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FACTIRAM | Auditoría Estratégica",
  description: "Diagnóstico profesional para optimizar la rentabilidad de tu negocio.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-midnight rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-emerald-pro font-black text-2xl italic">F</span>
              </div>
              <span className="text-2xl font-black text-midnight tracking-tighter uppercase">
                FACTI<span className="text-emerald-pro">RAM</span>
              </span>
            </div>
            
            <nav className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-soft uppercase tracking-wider">
              <a href="#" className="hover:text-midnight transition-colors">Método</a>
              <a href="#" className="hover:text-midnight transition-colors">Estadísticas</a>
              <button className="bg-emerald-pro text-white px-6 py-2.5 rounded-full hover:brightness-110 transition-all shadow-md shadow-emerald-500/20">
                Acceso Clientes
              </button>
            </nav>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-6 py-12 md:py-20">
          {children}
        </main>

        <footer className="bg-slate-100 border-t border-slate-200 py-10 mt-auto">
          <div className="max-w-6xl mx-auto px-6 text-center">
            <p className="text-slate-soft text-sm font-medium">
              © 2026 FACTIRAM. Auditoría de Negocios de Alto Nivel.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}