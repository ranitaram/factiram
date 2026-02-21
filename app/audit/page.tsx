import AuditForm from "@/components/AuditForm";

export default function AuditPage() {
  return (
    <div className="py-10">
      <header className="text-center mb-12">
        <h1 className="text-2xl font-black text-midnight uppercase tracking-tighter">
          Consola de <span className="text-emerald-pro">Auditoría</span>
        </h1>
        <p className="text-slate-500 text-sm font-medium">
          Ingresa tus datos con precisión para obtener un diagnóstico real.
        </p>
      </header>

      {/* Aquí renderizamos el componente que construimos */}
      <AuditForm />
    </div>
  );
}