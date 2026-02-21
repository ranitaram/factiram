export default function Home() {
  return (
    <div className="flex flex-col items-center">
      <section className="text-center max-w-3xl mb-20">
        <span className="inline-block px-4 py-1.5 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full uppercase tracking-widest mb-6">
          Impulsado por IA Estratégica
        </span>
        <h1 className="text-5xl md:text-7xl font-black text-midnight leading-tight mb-8">
          No lances tu negocio a <span className="text-emerald-pro">ciegas.</span>
        </h1>
        <p className="text-xl text-slate-soft leading-relaxed">
          Nuestra auditoría profesional analiza 12 variables clave para darte una probabilidad real de éxito en menos de 5 minutos.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full max-w-5xl">
        {/* Tarjeta Idea */}
        <button className="group p-10 bg-white border border-slate-200 rounded-[2rem] shadow-xl shadow-slate-200/50 hover:border-emerald-pro hover:-translate-y-2 transition-all duration-300 text-left">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-emerald-50 transition-colors">
            <span className="text-4xl">💡</span>
          </div>
          <h3 className="text-3xl font-black text-midnight mb-4 tracking-tight">Tengo una Idea</h3>
          <p className="text-slate-soft text-lg leading-relaxed mb-8">
            Ideal para proyectos en papel. Validaremos si tus proyecciones de inversión y mercado son realistas.
          </p>
          <span className="text-emerald-pro font-black text-lg flex items-center gap-2">
            COMENZAR VALIDACIÓN →
          </span>
        </button>

        {/* Tarjeta Negocio */}
        <button className="group p-10 bg-midnight border border-midnight rounded-[2rem] shadow-2xl shadow-midnight/20 hover:-translate-y-2 transition-all duration-300 text-left">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-emerald-pro/20 transition-colors">
            <span className="text-4xl">🚀</span>
          </div>
          <h3 className="text-3xl font-black text-white mb-4 tracking-tight">Negocio en Marcha</h3>
          <p className="text-slate-300 text-lg leading-relaxed mb-8">
            Auditoría de rendimiento para empresas operando. Detecta fugas de dinero y optimiza tu rentabilidad.
          </p>
          <span className="text-emerald-pro font-black text-lg flex items-center gap-2">
            INICIAR AUDITORÍA →
          </span>
        </button>
      </div>
    </div>
  );
}