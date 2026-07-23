import { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle,
  Globe,
  Search,
  Smartphone,
  MessageCircle,
  Shield,
  Clock,
  BarChart3,
  ChevronRight,
  Star,
} from "lucide-react";
import FaqAccordion from "@/components/FaqAccordion";

const WHATSAPP = "523318502310";

function waLink(msg: string) {
  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;
}

export const metadata: Metadata = {
  title: "Sitios Web Profesionales para Negocios en Tepic | FACTIRAM",
  description:
    "Diseñamos sitios web modernos, rápidos y optimizados para Google. Ideal para PYMES. Entrega desde 2 días hábiles. ¡Cotiza hoy!",
  openGraph: {
    title: "Sitios Web Profesionales para Negocios | FACTIRAM",
    description:
      "Diseñamos sitios web modernos, rápidos y optimizados. Ideal para PYMES. Entrega desde 2 días hábiles.",
    siteName: "FACTIRAM",
    locale: "es_MX",
    type: "website",
  },
};

const beneficios = [
  { icon: CheckCircle, text: "Generar confianza desde el primer contacto." },
  { icon: Globe, text: "Mostrar tus productos o servicios las 24 horas." },
  { icon: Search, text: "Facilitar que los clientes te encuentren en Google." },
  { icon: MessageCircle, text: "Recibir solicitudes desde cualquier dispositivo." },
  { icon: Star, text: "Fortalecer la imagen de tu empresa." },
];

const caracteristicas = [
  { icon: Globe, titulo: "Sitios rápidos y modernos", desc: "Desarrollados con tecnologías actuales para ofrecer una experiencia fluida en computadoras, tablets y teléfonos móviles." },
  { icon: Search, titulo: "Optimización para Google", desc: "Aplicamos buenas prácticas de SEO técnico para facilitar la indexación de tu sitio en los motores de búsqueda." },
  { icon: MessageCircle, titulo: "Diseño pensado para generar contactos", desc: "Integramos llamadas a la acción, formularios y botones de WhatsApp para facilitar la comunicación con tus clientes." },
  { icon: Shield, titulo: "Seguridad", desc: "Todos los proyectos incluyen conexión segura mediante certificado SSL y buenas prácticas de desarrollo." },
  { icon: Clock, titulo: "Información siempre disponible", desc: "Tu negocio estará disponible en internet las 24 horas del día." },
  { icon: BarChart3, titulo: "Estadísticas", desc: "Integramos Google Analytics para que puedas conocer el comportamiento de los visitantes." },
];

const pasos = [
  { num: "1", titulo: "Planeación", desc: "Conocemos tu negocio, tus objetivos y analizamos la mejor solución para tu empresa." },
  { num: "2", titulo: "Configuración", desc: "Te ayudamos a crear las cuentas necesarias para que el proyecto quede completamente a tu nombre.", detalle: ["Dominio", "Vercel (Hosting)", "Neon (Base de datos, cuando el proyecto lo requiera)"] },
  { num: "3", titulo: "Desarrollo", desc: "Construimos tu sitio web o sistema utilizando tecnologías modernas y escalables." },
  { num: "4", titulo: "Pruebas", desc: "Verificamos funcionamiento, velocidad, seguridad y compatibilidad." },
  { num: "5", titulo: "Publicación", desc: "Realizamos el despliegue directamente en tu infraestructura." },
  { num: "6", titulo: "Entrega", desc: "Capacitación básica y entrega del proyecto completamente funcional." },
];

const preguntasFaq = [
  {
    pregunta: "¿El dominio, el hosting y la base de datos están incluidos?",
    respuesta: "No. Estos servicios son contratados directamente por el cliente para que siempre conserve la propiedad de su proyecto. Nosotros realizamos toda la configuración necesaria.",
  },
  {
    pregunta: "¿Dónde estará alojado mi proyecto?",
    respuesta: "Trabajamos con plataformas modernas y confiables. Vercel para el alojamiento del sitio web y Neon para la base de datos cuando el proyecto lo requiera. Las cuentas siempre se crean a nombre del cliente.",
  },
  {
    pregunta: "¿Cuánto tarda el desarrollo?",
    respuesta: "Dependiendo del paquete, el tiempo estimado es de 2 a 12 días hábiles. Los desarrollos empresariales se cotizan y calendarizan de acuerdo con su complejidad.",
  },
  {
    pregunta: "¿Mi página aparecerá en Google?",
    respuesta: "Sí. Todos los proyectos incluyen optimización técnica para facilitar su indexación en Google. Los paquetes superiores incorporan una estrategia de SEO Local para mejorar su visibilidad.",
  },
  {
    pregunta: "¿Qué necesito para comenzar?",
    respuesta: "Solo necesitamos la información de tu empresa, tu logotipo (si ya cuentas con uno) y fotografías. Si aún no dispones de estos recursos, podemos orientarte para prepararlos.",
  },
  {
    pregunta: "¿Por qué elegirnos?",
    respuesta: "No desarrollamos sitios web únicamente para que tu empresa 'esté en internet'. Creamos soluciones digitales con un enfoque en rendimiento, experiencia de usuario y crecimiento a largo plazo. Nuestro objetivo es entregar herramientas que representen profesionalmente tu negocio y aporten valor tanto a tu empresa como a tus clientes.",
  },
];

export default function SitiosWebPage() {
  return (
    <div>
      {/* ── HERO ── */}
      <section className="py-10 md:py-20">
        <div className="max-w-3xl">
          <h1 className="text-3xl md:text-5xl font-black text-midnight uppercase italic tracking-tighter leading-tight">
            Tu negocio merece una página web que inspire{" "}
            <span className="text-emerald-pro">confianza</span>
          </h1>
          <p className="text-base md:text-lg text-slate-600 mt-5 leading-relaxed font-medium">
            Diseñamos sitios web modernos, rápidos y optimizados para que tu empresa tenga una presencia profesional en internet y facilite que tus clientes te encuentren y se pongan en contacto contigo.
          </p>

          <ul className="mt-6 space-y-2">
            {["Diseño profesional", "Optimización para Google", "Adaptado a celulares", "Integración con WhatsApp", "Entrega desde 2 días hábiles"].map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm text-slate-700 font-medium">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                {item}
              </li>
            ))}
          </ul>

          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <a
              href={waLink("Hola, me gustaría solicitar una cotización para un sitio web profesional.")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-xl font-black text-sm uppercase tracking-wider transition-all shadow-lg shadow-emerald-200"
            >
              <MessageCircle className="w-5 h-5" />
              Solicitar cotización
            </a>
            <a
              href="#paquetes"
              className="inline-flex items-center justify-center gap-2 bg-midnight text-white px-8 py-4 rounded-xl font-black text-sm uppercase tracking-wider hover:bg-slate-800 transition-all shadow-lg"
            >
              Ver paquetes <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* ── ¿POR QUÉ INVERTIR? ── */}
      <section className="py-16 md:py-24 border-t border-slate-100">
        <h2 className="text-2xl md:text-3xl font-black text-midnight uppercase italic tracking-tighter mb-4">
          ¿Por qué invertir en un sitio web{" "}
          <span className="text-emerald-pro">profesional</span>?
        </h2>
        <p className="text-slate-600 text-sm md:text-base leading-relaxed max-w-2xl mb-8">
          Hoy, la mayoría de las personas buscan en internet antes de tomar una decisión de compra. Si tu negocio no tiene una presencia profesional, muchos clientes potenciales terminarán contactando a tu competencia.
        </p>
        <p className="text-sm font-bold text-midnight uppercase tracking-wider mb-5">
          Un sitio web bien desarrollado te ayuda a:
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {beneficios.map((b) => (
            <div key={b.text} className="flex items-start gap-3 bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
              <b.icon className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <span className="text-sm text-slate-700 font-medium">{b.text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── QUÉ OBTIENES ── */}
      <section className="py-16 md:py-24 border-t border-slate-100">
        <h2 className="text-2xl md:text-3xl font-black text-midnight uppercase italic tracking-tighter mb-4">
          ¿Qué obtienes con nuestros{" "}
          <span className="text-emerald-pro">desarrollos</span>?
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-8">
          {caracteristicas.map((c) => (
            <div key={c.titulo} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center mb-4">
                <c.icon className="w-5 h-5 text-emerald-600" />
              </div>
              <h3 className="font-bold text-midnight text-sm uppercase tracking-wider mb-2">
                {c.titulo}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── ASÍ TRABAJAMOS ── */}
      <section className="py-16 md:py-24 border-t border-slate-100">
        <h2 className="text-2xl md:text-3xl font-black text-midnight uppercase italic tracking-tighter mb-12">
          Así <span className="text-emerald-pro">trabajamos</span>
        </h2>
        <div className="space-y-0">
          {pasos.map((paso, i) => (
            <div key={paso.num} className="flex gap-6">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-black text-sm shrink-0">
                  {paso.num}
                </div>
                {i < pasos.length - 1 && (
                  <div className="w-0.5 bg-emerald-100 flex-1 my-1" />
                )}
              </div>
              <div className="pb-10">
                <h3 className="font-black text-midnight text-base uppercase tracking-wider">
                  {paso.titulo}
                </h3>
                <p className="text-sm text-slate-600 mt-1 leading-relaxed">{paso.desc}</p>
                {paso.detalle && (
                  <ul className="mt-2 space-y-1">
                    {paso.detalle.map((d) => (
                      <li key={d} className="text-xs font-bold text-slate-400 flex items-center gap-2">
                        <ChevronRight className="w-3 h-3 text-emerald-400" />
                        {d}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PAQUETES ── */}
      <section id="paquetes" className="py-16 md:py-24 border-t border-slate-100">
        <h2 className="text-2xl md:text-3xl font-black text-midnight uppercase italic tracking-tighter mb-4">
          Nuestros <span className="text-emerald-pro">paquetes</span>
        </h2>
        <p className="text-slate-600 text-sm md:text-base max-w-2xl mb-10">
          Elige el plan que mejor se adapte a las necesidades de tu negocio.
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
          {/* INICIO DIGITAL — Destacado */}
          <div className="relative bg-white rounded-2xl p-6 shadow-lg shadow-emerald-200/30 border-2 border-emerald-400 flex flex-col">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-[9px] font-black px-4 py-1 rounded-full uppercase tracking-widest shadow-md">
              Recomendado
            </div>
            <div className="flex items-center gap-2 mb-1 mt-2">
              <Star className="w-4 h-4 text-emerald-500" />
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Inicio Digital</span>
            </div>
            <p className="text-3xl font-black text-midnight mb-4">
              $4,500 <span className="text-sm font-bold text-slate-400">MXN</span>
            </p>
            <p className="text-xs text-slate-500 font-medium mb-5 leading-relaxed">
              Ideal para emprendedores y pequeños negocios que desean tener una presencia profesional en internet.
            </p>
            <ul className="space-y-2 mb-6 flex-1">
              {[
                "Diseño personalizado",
                "Landing Page profesional",
                "Integración con WhatsApp",
                "Formulario de contacto",
                "Adaptación a celulares",
                "SEO técnico básico",
                "Certificado SSL",
                "Publicación en tu cuenta de Vercel",
              ].map((f) => (
                <li key={f} className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <a
              href={waLink("Hola, me interesa el paquete Inicio Digital para mi negocio. ¿Podrían darme más información?")}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-md"
            >
              <MessageCircle className="w-4 h-4" />
              Quiero comenzar
            </a>
          </div>

          {/* CRECIMIENTO */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Crecimiento</span>
            </div>
            <p className="text-3xl font-black text-midnight mb-4">
              $8,000 <span className="text-sm font-bold text-slate-400">MXN</span>
            </p>
            <p className="text-xs text-slate-500 font-medium mb-5 leading-relaxed">
              Pensado para negocios que buscan fortalecer su presencia digital y mejorar su visibilidad en Google.
            </p>
            <ul className="space-y-2 mb-6 flex-1">
              {[
                "Todo lo del paquete Inicio Digital",
                "Estrategia de SEO Local",
                "Configuración de Google Business Profile",
                "Google Analytics",
                "Páginas optimizadas para tus servicios",
                "Arquitectura orientada al posicionamiento",
                "Mejor experiencia de navegación",
                "Optimización para generar más contactos",
              ].map((f) => (
                <li key={f} className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <a
              href={waLink("Hola, me interesa el paquete de Crecimiento para mi negocio. ¿Podrían darme más información?")}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 bg-midnight hover:bg-slate-800 text-white py-3.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-md"
            >
              <MessageCircle className="w-4 h-4" />
              Solicitar cotización
            </a>
          </div>

          {/* AUTOMATIZACIÓN */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Automatización</span>
            </div>
            <p className="text-3xl font-black text-midnight mb-4">
              $18,000 <span className="text-sm font-bold text-slate-400">MXN</span>
            </p>
            <p className="text-xs text-slate-500 font-medium mb-5 leading-relaxed">
              Para empresas que desean optimizar procesos y ofrecer una mejor experiencia a sus clientes.
            </p>
            <ul className="space-y-2 mb-6 flex-1">
              {[
                "Todo lo de los paquetes anteriores",
                "Sistema de citas o reservas",
                "Catálogo administrable",
                "Panel administrativo básico",
                "Formularios avanzados",
                "Automatizaciones sencillas",
                "Capacitación para el uso del sistema",
              ].map((f) => (
                <li key={f} className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <a
              href={waLink("Hola, me interesa el paquete de Automatización para mi negocio. ¿Podrían darme más información?")}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 bg-midnight hover:bg-slate-800 text-white py-3.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-md"
            >
              <MessageCircle className="w-4 h-4" />
              Quiero más información
            </a>
          </div>

          {/* EMPRESARIAL */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black text-purple-600 uppercase tracking-widest">Empresarial</span>
            </div>
            <p className="text-2xl font-black text-midnight mb-4">
              A la medida
            </p>
            <p className="text-xs text-slate-500 font-medium mb-5 leading-relaxed">
              Soluciones desarrolladas completamente a la medida para tu empresa.
            </p>
            <ul className="space-y-2 mb-6 flex-1">
              {[
                "Sistemas administrativos",
                "CRM / ERP",
                "Paneles de control",
                "Portales para clientes",
                "Automatización de procesos",
                "Integraciones con APIs",
                "Dashboards y reportes",
                "Plataformas SaaS",
              ].map((f) => (
                <li key={f} className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <a
              href={waLink("Hola, me gustaría solicitar asesoría para un desarrollo empresarial a la medida.")}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white py-3.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-md"
            >
              <MessageCircle className="w-4 h-4" />
              Solicitar asesoría
            </a>
          </div>
        </div>
      </section>

      {/* ── TU PROYECTO ES TUYO ── */}
      <section className="py-16 md:py-24 border-t border-slate-100">
        <h2 className="text-2xl md:text-3xl font-black text-midnight uppercase italic tracking-tighter mb-4">
          Tu proyecto siempre será <span className="text-emerald-pro">tuyo</span>
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed max-w-3xl mb-5">
          Creemos que una empresa debe ser propietaria de toda su infraestructura digital. Por ello, desde el inicio te ayudamos a crear las cuentas necesarias para que todo quede registrado a tu nombre.
        </p>
        <p className="text-sm text-slate-600 leading-relaxed max-w-3xl mb-6">
          Nosotros desarrollamos, configuramos y damos soporte técnico durante el proyecto. Tú conservas la propiedad de:
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-3xl">
          {["Dominio", "Hosting en Vercel", "Base de datos en Neon", "Proyecto publicado", "Información de tu empresa"].map((item) => (
            <div key={item} className="flex items-center gap-2 text-sm text-slate-700 font-medium bg-white rounded-xl p-3 shadow-sm border border-slate-100">
              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
              {item}
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-400 font-medium mt-6 max-w-3xl leading-relaxed">
          De esta manera tendrás el control total de tu plataforma y no dependerás de terceros para administrar tu infraestructura.
        </p>
      </section>

      {/* ── NO INCLUIDO ── */}
      <section className="py-16 md:py-24 border-t border-slate-100">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 md:p-8 max-w-3xl">
          <h2 className="text-lg font-black text-midnight uppercase italic tracking-tighter mb-3">
            ¿Qué servicios no están incluidos?
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed mb-4">
            Para garantizar que siempre seas el propietario de tu proyecto, algunos servicios se contratan directamente a tu nombre y no forman parte del precio del desarrollo.
          </p>
          <ul className="space-y-2 mb-4">
            {[
              "Dominio (.com, .com.mx, .mx, etc.).",
              "Hosting en Vercel.",
              "Base de datos en Neon (cuando el proyecto la requiera).",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm text-slate-700 font-medium">
                <ChevronRight className="w-4 h-4 text-amber-500 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
          <p className="text-xs text-slate-500 leading-relaxed">
            Nosotros te guiaremos paso a paso para crear las cuentas y dejar toda la infraestructura correctamente configurada. Si en el futuro el crecimiento de tu proyecto requiere contratar planes de pago en Vercel o Neon, esos costos serán responsabilidad del cliente.
          </p>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-16 md:py-24 border-t border-slate-100">
        <h2 className="text-2xl md:text-3xl font-black text-midnight uppercase italic tracking-tighter mb-8">
          Preguntas <span className="text-emerald-pro">frecuentes</span>
        </h2>
        <div className="max-w-2xl">
          <FaqAccordion items={preguntasFaq} />
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="py-16 md:py-24 border-t border-slate-100">
        <div className="bg-midnight rounded-2xl p-8 md:p-12 text-center shadow-xl">
          <h2 className="text-2xl md:text-3xl font-black text-white uppercase italic tracking-tighter mb-4">
            Da el siguiente paso hacia la transformación digital de tu negocio
          </h2>
          <p className="text-sm text-slate-300 max-w-xl mx-auto mb-8 leading-relaxed">
            Solicita una cotización sin compromiso y descubre cuál de nuestras soluciones se adapta mejor a las necesidades de tu empresa.
          </p>
          <a
            href={waLink("Hola, me gustaría solicitar una cotización para un sitio web profesional.")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-5 rounded-xl font-black text-sm uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50"
          >
            <MessageCircle className="w-5 h-5" />
            Solicitar cotización
          </a>
        </div>
      </section>
    </div>
  );
}
