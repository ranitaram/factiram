import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SessionWrapper from "@/components/SessionWrapper";
import CookieBanner from "@/components/CookieBanner";
import Navbar from "@/components/Navbar"; // Importamos el nuevo componente responsivo
import { auth } from "@/lib/auth";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FACTIRAM | Auditoría Estratégica",
  description: "Diagnóstico profesional para optimizar la rentabilidad de tu negocio.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Obtenemos la sesión en el servidor para pasársela al Navbar
  const session = await auth();

  return (
    <html lang="es" className="scroll-smooth">
      <body className={inter.className}>
        <SessionWrapper>
          {/* El Navbar ahora maneja el menú hamburguesa en móvil y los enlaces en desktop */}
          <Navbar session={session} />

          <main className="max-w-6xl mx-auto px-6 py-12 md:py-20 min-h-screen">
            {children}
          </main>

          <footer className="bg-slate-100 border-t border-slate-200 py-10 mt-auto">
            <div className="max-w-6xl mx-auto px-6 text-center flex flex-col gap-4">
              <p className="text-slate-soft text-sm font-medium">
                © 2026 FACTIRAM. Auditoría de Negocios de Alto Nivel.
              </p>
              <div className="flex justify-center gap-6 text-xs text-slate-400 font-bold uppercase tracking-wider">
                <a href="/privacidad" className="hover:text-emerald-600 transition-colors">Aviso de Privacidad</a>
                <a href="/terminos" className="hover:text-emerald-600 transition-colors">Términos y Condiciones</a>
              </div>
            </div>
          </footer>

          <CookieBanner />
        </SessionWrapper>
      </body>
    </html>
  );
}