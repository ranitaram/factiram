import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SessionWrapper from "@/components/SessionWrapper";
import Link from "next/link";
import CookieBanner from "@/components/CookieBanner"
import { auth } from "@/lib/auth"; // <-- Importamos el verificador de sesión

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FACTIRAM | Auditoría Estratégica",
  description: "Diagnóstico profesional para optimizar la rentabilidad de tu negocio.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Verificamos si hay alguien logueado para cambiar la barra de navegación
  const session = await auth();

  return (
    <html lang="es" className="scroll-smooth">
      <body className={inter.className}>
        <SessionWrapper>
          <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
            <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
              
              <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <div className="w-10 h-10 bg-midnight rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-emerald-pro font-black text-2xl italic">F</span>
                </div>
                <span className="text-2xl font-black text-midnight tracking-tighter uppercase">
                  FACTI<span className="text-emerald-pro">RAM</span>
                </span>
              </Link>
              
              <nav className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-soft uppercase tracking-wider">
                <Link href="/#como-funciona" className="hover:text-midnight transition-colors">
                  Método
                </Link>
                
                <Link href="/audit" className="hover:text-midnight transition-colors">
                  Auditoría
                </Link>

                {/* SI ESTÁ LOGUEADO: Mostramos el Dashboard. SI NO: Mostramos "Acceso" */}
                {session?.user ? (
                  <Link href="/dashboard" className="text-emerald-600 hover:text-emerald-700 transition-colors">
                    Panel (Historial)
                  </Link>
                ) : (
                  <Link href="/audit" className="bg-emerald-pro text-white px-6 py-2.5 rounded-full hover:brightness-110 transition-all shadow-md shadow-emerald-500/20 inline-block">
                    Acceso / Diagnóstico
                  </Link>
                )}
              </nav>
            </div>
          </header>

          <main className="max-w-6xl mx-auto px-6 py-12 md:py-20 min-h-screen">
            {children}
          </main>

          <footer className="bg-slate-100 border-t border-slate-200 py-10 mt-auto">
            <div className="max-w-6xl mx-auto px-6 text-center flex flex-col gap-4">
              <p className="text-slate-soft text-sm font-medium">
                © 2026 FACTIRAM. Auditoría de Negocios de Alto Nivel.
              </p>
              {/* Aquí irán los enlaces legales que haremos después */}
              <div className="flex justify-center gap-6 text-xs text-slate-400 font-bold uppercase tracking-wider">
                <Link href="/privacidad" className="hover:text-emerald-600 transition-colors">Aviso de Privacidad</Link>
                <Link href="/terminos" className="hover:text-emerald-600 transition-colors">Términos y Condiciones</Link>
              </div>
            </div>
          </footer>

          {/* El Banner de Cookies flotante */}
          <CookieBanner />
        </SessionWrapper>
      </body>
    </html>
  );
}