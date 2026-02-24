"use client";

import { pdf } from '@react-pdf/renderer';
import { PdfReport } from './PdfReport';
import { signIn, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { 
  ArrowRight, ArrowLeft, CheckCircle2, 
  Factory, Store, UserCog, Utensils, TrendingUp, Target, MousePointer2, RefreshCcw, AlertCircle, ShieldCheck
} from "lucide-react";
// Importamos TaxStatus para que el formulario lo reconozca
import { AuditInputs, IndustryType, AuditStatus, TaxStatus, calculateAuditResults, MODEL_VERSION } from "@/lib/engine"; 

/* =========================================================
   0. TIPOS Y CONTEXTOS
========================================================= */
type AuditResult = ReturnType<typeof calculateAuditResults>;

const INDUSTRY_CONTEXT = {
  [IndustryType.COMIDA]: {
    label: "Alimentos y Bebidas",
    examples: "Restaurantes, taquerías, cafeterías, repostería, dark kitchens.",
    capacityHint: "¿Cuántas órdenes puedes entregar al día como máximo?",
    costHint: "Si el taco vale $10 y gastas $4 en insumos, pones 40%."
  },
  [IndustryType.SERVICIO]: {
    label: "Servicios Profesionales",
    examples: "Barberías, consultorios, agencias, limpieza, despachos.",
    capacityHint: "¿A cuántas personas pueden atender tú y tu equipo al día?",
    costHint: "Si cobras $500 por sesión y gastas $50 en materiales, pones 10%."
  },
  [IndustryType.RETAIL]: {
    label: "Venta de Productos",
    examples: "Tiendas de ropa, abarrotes, papelerías, e-commerce.",
    capacityHint: "¿Cuántas ventas o envíos puedes procesar al día?",
    costHint: "Si compras algo en $60 para venderlo en $100, pones 60%."
  },
  [IndustryType.TECNICO]: {
    label: "Oficios y Reparaciones",
    examples: "Talleres mecánicos, carpintería, soporte técnico, instalaciones.",
    capacityHint: "¿Cuántas reparaciones o trabajos puedes entregar al día?",
    costHint: "Si el servicio es de $1,000 y las piezas cuestan $400, pones 40%."
  }
};

/* =========================================================
   1. SUBCOMPONENTE: INPUT NUMÉRICO
========================================================= */
const NumberInput = ({ label, hint, value, onChange, prefix, suffix, error }: any) => (
  <div className="space-y-2">
    <label className="font-black text-midnight text-[10px] md:text-xs uppercase tracking-tight flex justify-between">
      {label}
      {error && <span className="text-red-500 font-bold animate-pulse">Requerido *</span>}
    </label>
    <div className="relative">
      {prefix && <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">{prefix}</span>}
      <input
        type="number"
        className={`w-full p-4 bg-slate-50 border-2 rounded-2xl outline-none font-bold text-midnight transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none cursor-text ${
          error ? "border-red-200 bg-red-50" : "border-transparent focus:border-emerald-pro"
        } ${prefix ? "pl-10" : ""}`}
        value={value === 0 ? "" : value ?? ""} 
        onChange={(e) => onChange(Number(e.target.value))}
        placeholder="0"
      />
      {suffix && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">{suffix}</span>}
    </div>
    <p className="text-[10px] text-slate-500 leading-tight bg-slate-100/50 p-2 rounded-lg italic">{hint}</p>
  </div>
);

/* =========================================================
   2. COMPONENTE PRINCIPAL
========================================================= */
export default function AuditForm() {
  const { data: session, status } = useSession();
  const [step, setStep] = useState(1);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [diagnosticMessages, setDiagnosticMessages] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Estado inicial sincronizado con el Engine v1.3.3
  const [formData, setFormData] = useState<AuditInputs>({
    industry: IndustryType.COMIDA,
    status: AuditStatus.PROYECTO,
    ticketAvg: 0,
    costDirectPercent: 0,
    fixedCosts: 0,
    desiredSalary: 0,
    marketingSpend: 0,
    emergencyFund: 0,
    operatingDays: 24,
    capacityPerDay: 0,
    occupancy: 20, 
    visibilityScore: 5,
    competitionScore: 5,
    differentiation: 5,
    digitalScore: 5,
    taxStatus: TaxStatus.INFORMAL, // Default inicial
  });

  const ctx = INDUSTRY_CONTEXT[formData.industry];
  const isIdea = formData.status === AuditStatus.PROYECTO;

  // Carga de mensajes dinámicos
  useEffect(() => {
    if (result && formData) {
      const fetchMessages = async () => {
        try {
          const res = await fetch("/api/get-messages", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              score: result.finalScore,
              conditions: result.triggeredConditions,
              industry: formData.industry,
              status: formData.status
            })
          });
          const data = await res.json();
          setDiagnosticMessages(data.messages || []);
        } catch (err) {
          console.error("Error obteniendo textos de diagnóstico:", err);
        }
      };
      fetchMessages();
    }
  }, [result, formData]);

  useEffect(() => { 
    window.scrollTo({ top: 0, behavior: "smooth" }); 
  }, [step, result]);

  // Recuperación de borrador
  useEffect(() => {
    const saved = localStorage.getItem("factiram_draft");
    if (saved) {
      const parsedData = JSON.parse(saved);
      setFormData(parsedData);

      const pendingReturn = sessionStorage.getItem("factiram_return");
      if (pendingReturn) {
        try {
          const calculatedResult = calculateAuditResults(parsedData);
          setResult(calculatedResult);
          setStep(4);
        } catch (err) { console.error(err); }
        sessionStorage.removeItem("factiram_return");
      }
    }
  }, []);

  // Guardado automático
  useEffect(() => {
    if (step < 4) {
      localStorage.setItem("factiram_draft", JSON.stringify(formData));
    }
  }, [formData, step]);

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors.includes(field)) setErrors(errors.filter(e => e !== field));
  };

  const resetAudit = () => {
    localStorage.removeItem("factiram_draft");
    window.location.href = "/audit";
  };

  const handleNext = () => {
    if (step === 2) {
      const required: (keyof AuditInputs)[] = ["ticketAvg", "costDirectPercent", "fixedCosts", "desiredSalary", "operatingDays", "capacityPerDay"];
      const newErrors = required.filter(f => typeof formData[f] === "number" && (formData[f] as number) <= 0);
      if (newErrors.length > 0) { setErrors(newErrors as string[]); return; }
    }
    setStep(s => s + 1);
  };

  const handleDownloadPDF = async () => {
    setIsGenerating(true);
    try {
      if (status === "authenticated" && result) {
        await fetch("/api/save-audit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ formData, result })
        });
      }

      const blob = await pdf(
        <PdfReport formData={formData} result={result} userName={session?.user?.name} messages={diagnosticMessages}/>
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Diagnostico_FACTIRAM_${new Date().getTime()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert("Hubo un error al generar tu reporte.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerate = () => {
    try {
      const data = calculateAuditResults(formData);
      setResult(data);
    } catch (err) {
      alert("Revisa los datos ingresados.");
    }
  };

  /* =========================================================
     3. VISTA DE RESULTADOS (Sin cambios)
  ========================================================== */
  if (result) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-8">
        <header className="text-center">
          <h2 className="text-5xl font-black text-midnight italic tracking-tighter uppercase">Resultado</h2>
          <p className="text-slate-400 font-bold text-[10px] uppercase mt-2">Modelo FACTIRAM v{MODEL_VERSION}</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-midnight p-10 rounded-[3rem] text-white text-center relative overflow-hidden shadow-2xl">
            <p className="text-emerald-pro font-black text-xs uppercase tracking-widest mb-4">Salud del Modelo</p>
            <div className="text-9xl font-black italic">{result.finalScore}<span className="text-3xl text-emerald-pro/50">/100</span></div>
          </div>
          <div className="bg-white border-2 border-slate-100 p-8 rounded-[3rem] shadow-xl text-center">
            <TrendingUp className="mx-auto text-emerald-pro mb-2" />
            <p className="text-slate-400 font-black text-[10px] uppercase">Ganancia Neta Mensual</p>
            <div className={`text-3xl font-black ${result.netProfit < 0 ? 'text-red-500' : 'text-midnight'}`}>
              ${result.netProfit.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="bg-emerald-500 p-10 rounded-[3rem] text-white text-center space-y-6">
          <h3 className="text-3xl font-black uppercase italic">¡Reporte Completo Gratis!</h3>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            {status === "authenticated" ? (
             <button 
              onClick={handleDownloadPDF} 
              disabled={isGenerating}
                className={`bg-white text-emerald-600 px-10 py-5 rounded-2xl font-black uppercase tracking-widest transition-all shadow-lg ${isGenerating ? "opacity-50 cursor-not-allowed" : "hover:scale-105 cursor-pointer"}`}
                >
                {isGenerating ? "Generando PDF..." : "Descargar Reporte PDF"}
            </button>
            ) : (
              <button onClick={() => {sessionStorage.setItem("factiram_return", "true");signIn("google");}} className="bg-white text-emerald-600 px-10 py-5 rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg cursor-pointer flex items-center justify-center gap-2">
                <img src="https://authjs.dev/img/providers/google.svg" className="w-4 h-4" alt="Google" />
                Registrarme y Bajar Reporte
              </button>
            )}
            <button onClick={resetAudit} className="bg-emerald-700 text-white px-8 py-5 rounded-2xl font-black uppercase text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md">
              <RefreshCcw className="w-4 h-4" /> Nueva Auditoría
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  /* =========================================================
     4. VISTA DE FORMULARIO
  ========================================================== */
  return (
    <div className="w-full max-w-4xl mx-auto pb-20 px-4">
      <div className="mb-10 px-4">
        <div className="h-3 bg-slate-200 rounded-full overflow-hidden border border-white shadow-sm">
          <motion.div className="h-full bg-emerald-pro" animate={{ width: `${(step / 4) * 100}%` }} />
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] md:rounded-[4.5rem] shadow-2xl border border-slate-100 overflow-hidden">
        <div className="p-8 md:p-16">
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
              
              {step === 1 && (
                <div className="space-y-12">
                  <header>
                    <h2 className="text-4xl font-black text-midnight tracking-tighter uppercase mb-2">1. Perfil</h2>
                    <p className="text-sm font-bold text-emerald-600 flex items-center gap-2 italic"><MousePointer2 className="w-4 h-4"/> Selecciona tu industria:</p>
                  </header>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[{ id: IndustryType.COMIDA, label: "Comida", icon: Utensils }, { id: IndustryType.SERVICIO, label: "Servicios", icon: UserCog }, { id: IndustryType.RETAIL, label: "Ventas", icon: Store }, { id: IndustryType.TECNICO, label: "Técnico", icon: Factory }].map(item => (
                      <button key={item.id} onClick={() => updateField("industry", item.id)} className={`p-6 rounded-3xl border-2 flex flex-col items-center gap-3 transition-all cursor-pointer ${formData.industry === item.id ? "border-emerald-pro bg-emerald-50 text-emerald-700 shadow-lg" : "border-slate-100 text-slate-400 bg-white"}`}>
                        <item.icon className="w-8 h-8" />
                        <span className="text-[10px] font-black uppercase">{item.label}</span>
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-slate-400 text-center font-bold px-4 italic bg-slate-50 py-3 rounded-2xl">Ejemplos: {ctx.examples}</p>

                  <div className="space-y-4 pt-4 border-t border-slate-50">
                    <p className="text-sm font-bold text-emerald-600 flex items-center gap-2 italic"><MousePointer2 className="w-4 h-4"/> Estado del Negocio:</p>
                    <div className="grid grid-cols-2 gap-4">
                      {[{ id: AuditStatus.PROYECTO, label: "Es una Idea" }, { id: AuditStatus.EN_MARCHA, label: "Ya opera" }].map(s => (
                        <button key={s.id} onClick={() => updateField("status", s.id)} className={`p-5 rounded-2xl font-black text-xs uppercase border-2 transition-all cursor-pointer ${formData.status === s.id ? "bg-midnight text-white border-midnight shadow-xl" : "border-slate-100 text-slate-400"}`}>
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-8">
                  <h2 className="text-4xl font-black text-midnight tracking-tighter uppercase italic">2. Finanzas</h2>

                  {/* NUEVO: SELECTOR DE RÉGIMEN FISCAL */}
                  <div className="bg-midnight p-8 rounded-[2.5rem] text-white shadow-2xl space-y-4">
                    <label className="text-[10px] font-black uppercase text-emerald-pro tracking-widest flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4" /> Situación Fiscal (SAT)
                    </label>
                    <select 
                      className="w-full bg-slate-800 border-2 border-slate-700 p-4 rounded-2xl font-bold text-sm outline-none focus:border-emerald-pro transition-all cursor-pointer"
                      value={formData.taxStatus}
                      onChange={(e) => updateField("taxStatus", e.target.value)}
                    >
                      <option value={TaxStatus.INFORMAL}>Informal / No registrado</option>
                      <option value={TaxStatus.RESICO}>RESICO (Física)</option>
                      <option value={TaxStatus.PERSONA_FISICA}>P. Física (Act. Empresarial)</option>
                      <option value={TaxStatus.PERSONA_MORAL}>P. Moral (Empresa)</option>
                    </select>
                    <p className="text-[9px] text-slate-400 italic font-medium">
                      *Si seleccionas un régimen formal, restaremos un 30% estimado de impuestos para mostrar tu ganancia real.
                    </p>
                  </div>

                  <div className={`${isIdea ? 'bg-amber-50 border-amber-100' : 'bg-emerald-50 border-emerald-100'} p-6 rounded-[2.5rem] border mb-8`}>
                    <label className={`font-black ${isIdea ? 'text-amber-800' : 'text-emerald-800'} text-[10px] uppercase tracking-widest flex items-center gap-2`}>
                      {isIdea ? <AlertCircle className="w-4 h-4" /> : <Target className="w-4 h-4" />}
                      {isIdea ? "Escenario de Éxito Inicial" : "% de Ocupación Actual"}
                    </label>
                    <div className="flex items-center gap-6 mt-4">
                      <input 
                        type="range" min="5" max={isIdea ? "50" : "100"} step="5"
                        className={`grow cursor-pointer ${isIdea ? 'accent-amber-500' : 'accent-emerald-500'}`}
                        value={formData.occupancy ?? (isIdea ? 20 : 50)} 
                        onChange={(e) => updateField("occupancy", Number(e.target.value))}
                      />
                      <span className={`${isIdea ? 'bg-amber-600' : 'bg-emerald-600'} text-white w-14 h-14 flex items-center justify-center rounded-2xl font-black text-sm shadow-lg`}>{formData.occupancy}%</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                    <NumberInput label="Venta Promedio" hint="Lo que paga un cliente promedio." prefix="$" value={formData.ticketAvg} onChange={(v: any) => updateField("ticketAvg", v)} error={errors.includes("ticketAvg")} />
                    <NumberInput label="Costo Materiales" hint={ctx.costHint} suffix="%" value={formData.costDirectPercent} onChange={(v: any) => updateField("costDirectPercent", v)} error={errors.includes("costDirectPercent")} />
                    <NumberInput label="Gastos Fijos" hint="Renta, luz, agua, internet y sueldos fijos mensuales." prefix="$" value={formData.fixedCosts} onChange={(v: any) => updateField("fixedCosts", v)} error={errors.includes("fixedCosts")} />
                    <NumberInput label="Tu Sueldo Ideal" hint="Lo que quieres ganar mensualmente." prefix="$" value={formData.desiredSalary} onChange={(v: any) => updateField("desiredSalary", v)} error={errors.includes("desiredSalary")} />
                    <NumberInput label="Publicidad" hint="Inversión mensual en publicidad." prefix="$" value={formData.marketingSpend} onChange={(v: any) => updateField("marketingSpend", v)} />
                    <NumberInput label="Días Laborados" hint="Días al mes que abres al público." value={formData.operatingDays} onChange={(v: any) => updateField("operatingDays", v)} error={errors.includes("operatingDays")} />
                    <NumberInput label="Capacidad Diaria" hint={ctx.capacityHint} value={formData.capacityPerDay} onChange={(v: any) => updateField("capacityPerDay", v)} error={errors.includes("capacityPerDay")} />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-12">
                  <h2 className="text-4xl font-black text-midnight tracking-tighter uppercase italic">3. Mercado</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12">
                    {[
                      { id: "visibilityScore", label: "Visibilidad Local", hint: "¿Qué tan fácil es que te encuentren?" },
                      { id: "competitionScore", label: "Competencia Directa", hint: "¿Cuántos venden lo MISMO a menos de 10 min?" },
                      { id: "differentiation", label: "Diferencia", hint: "¿Si cierras mañana, tus clientes estarían tristes?" },
                      { id: "digitalScore", label: "Fuerza Digital", hint: "Calidad de tus redes y Maps." }
                    ].map(s => (
                      <div key={s.id} className="space-y-4">
                        <label className="font-black text-xs uppercase text-midnight flex justify-between">
                          {s.label} <span className="text-emerald-pro">Nivel {formData[s.id as keyof AuditInputs]}</span>
                        </label>
                        <p className="text-[10px] text-slate-400 leading-tight italic">{s.hint}</p>
                        <input type="range" min="1" max="10" className="w-full accent-emerald-pro cursor-pointer h-2 bg-slate-100 rounded-lg appearance-none" value={formData[s.id as keyof AuditInputs] ?? 5} onChange={(e) => updateField(s.id, Number(e.target.value))} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="text-center py-10 space-y-8">
                  <CheckCircle2 className="w-24 h-24 text-emerald-pro mx-auto drop-shadow-xl" />
                  <h2 className="text-4xl font-black text-midnight uppercase italic tracking-tighter">¡Listo para el diagnóstico!</h2>
                  <button onClick={handleGenerate} className="bg-emerald-pro text-white px-12 py-5 rounded-2xl font-black uppercase shadow-xl hover:scale-105 cursor-pointer transition-all">Ver Resultados</button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="mt-16 flex justify-between border-t pt-10 border-slate-100">
            <Link href="/" className="text-slate-300 font-black uppercase text-[10px] tracking-widest flex items-center gap-2 hover:text-midnight cursor-pointer transition-colors">
              <ArrowLeft className="w-4 h-4" /> Inicio
            </Link>
            <div className="flex gap-4">
              {step > 1 && (
                <button onClick={() => setStep(s => s - 1)} className="text-slate-400 font-black uppercase text-[10px] tracking-widest hover:text-midnight cursor-pointer transition-colors">Anterior</button>
              )}
              {step < 4 && (
                <button onClick={handleNext} className="bg-midnight text-white px-10 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-3 shadow-xl hover:bg-slate-800 transition-all cursor-pointer">Siguiente <ArrowRight className="w-4 h-4 text-emerald-pro" /></button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}