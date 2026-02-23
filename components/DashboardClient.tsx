"use client";

import { useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { PdfReport } from "./PdfReport";
import { calculateAuditResults } from "@/lib/engine";
import { FileDown, Calendar, Trash2, Loader2, Target } from "lucide-react";

export default function DashboardClient({ audits: initialAudits, userName }: { audits: any[], userName: string | null }) {
  const [audits, setAudits] = useState(initialAudits);
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm("¿Estás seguro de que deseas eliminar este diagnóstico? Esta acción no se puede deshacer.");
    if (!confirmed) return;

    setIsDeleting(id);
    try {
      const res = await fetch(`/api/audits/${id}`, { method: "DELETE" });
      if (res.ok) {
        setAudits((prev) => prev.filter((audit) => audit.id !== id));
      } else {
        alert("No se pudo eliminar el registro.");
      }
    } catch (error) {
      alert("Error de conexión al eliminar.");
    } finally {
      setIsDeleting(null);
    }
  };

  const handleReDownload = async (audit: any) => {
    setIsGenerating(audit.id);
    try {
      const formData = {
        industry: audit.industry,
        status: audit.status,
        ticketAvg: Number(audit.ticketAvg),
        costDirectPercent: Number(audit.costDirectPercent),
        fixedCosts: Number(audit.fixedCosts),
        desiredSalary: Number(audit.desiredSalary),
        marketingSpend: Number(audit.marketingSpend),
        emergencyFund: Number(audit.emergencyFund),
        operatingDays: Number(audit.operatingDays),
        capacityPerDay: Number(audit.capacityPerDay),
        occupancy: Number(audit.occupancy),
        visibilityScore: Number(audit.visibilityScore),
        competitionScore: Number(audit.competitionScore),
        differentiation: Number(audit.differentiation),
        digitalScore: Number(audit.digitalScore),
        taxStatus: audit.taxStatus,
      };

      const result = calculateAuditResults(formData);
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
      const messages = data.messages || [];

      const blob = await pdf(
        <PdfReport formData={formData} result={result} userName={userName} messages={messages} />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Historial_FACTIRAM_${new Date(audit.createdAt).toLocaleDateString()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      alert("Error al generar reporte.");
    } finally {
      setIsGenerating(null);
    }
  };

  if (audits.length === 0) {
    return (
      <div className="bg-white p-12 rounded-[3rem] border border-slate-100 shadow-sm text-center max-w-2xl mx-auto">
        <p className="text-slate-400 mb-8 text-xl font-medium italic">Tu historial de auditorías está vacío.</p>
        <a href="/audit" className="bg-emerald-600 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-emerald-200 inline-block">
          Nueva Auditoría
        </a>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {audits.map((audit) => (
        <div 
          key={audit.id} 
          className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl hover:shadow-2xl hover:border-emerald-200 transition-all flex flex-col justify-between group relative overflow-hidden"
        >
          {/* BOTÓN DE ELIMINAR FLOTANTE */}
          <button
            onClick={() => handleDelete(audit.id)}
            disabled={isDeleting === audit.id}
            className="absolute top-6 right-6 w-12 h-12 bg-white shadow-lg border border-slate-100 rounded-full flex items-center justify-center text-slate-300 hover:text-red-500 hover:scale-110 active:scale-90 transition-all z-20"
            title="Eliminar Auditoría"
          >
            {isDeleting === audit.id ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Trash2 className="w-5 h-5" />
            )}
          </button>

          <div>
            {/* CABECERA DE TARJETA */}
            <div className="mb-8">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-[0.2em] mb-4">
                <Calendar className="w-4 h-4 text-emerald-500" />
                {new Date(audit.createdAt).toLocaleDateString()}
              </div>
              <div className="inline-flex items-center gap-2 bg-midnight text-emerald-pro px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
                <Target className="w-3 h-3" />
                {audit.industry}
              </div>
            </div>

            {/* MÉTRICAS PRINCIPALES */}
            <div className="flex gap-4 mb-8">
              <div className="flex-1 bg-slate-50 p-5 rounded-3xl border border-slate-100 text-center">
                <p className="text-[10px] uppercase font-bold text-slate-400 mb-2 tracking-widest">Score</p>
                <p className="text-4xl font-black text-midnight italic tracking-tighter">{audit.finalScore}</p>
              </div>
              <div className="flex-1 bg-emerald-50/50 p-5 rounded-3xl border border-emerald-100/50 text-center">
                <p className="text-[10px] uppercase font-bold text-emerald-600 mb-2 tracking-widest">Utilidad</p>
                <p className={`text-2xl font-black flex items-center justify-center h-full ${Number(audit.netProfit) < 0 ? 'text-red-500' : 'text-emerald-700'}`}>
                  ${Number(audit.netProfit).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* ACCIÓN PRINCIPAL */}
          <button
            onClick={() => handleReDownload(audit)}
            disabled={isGenerating === audit.id}
            className="w-full bg-midnight text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-slate-800 hover:translate-y-[-2px] active:translate-y-[0px] transition-all shadow-lg disabled:opacity-50"
          >
            {isGenerating === audit.id ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generando...
              </>
            ) : (
              <>
                <FileDown className="w-5 h-5" />
                Descargar PDF
              </>
            )}
          </button>
        </div>
      ))}
    </div>
  );
}