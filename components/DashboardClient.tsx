"use client";

import { useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { PdfReport } from "./PdfReport";
import { calculateAuditResults } from "@/lib/engine";
import { FileDown, Calendar } from "lucide-react";

export default function DashboardClient({ audits, userName }: { audits: any[], userName: string | null }) {
  const [isGenerating, setIsGenerating] = useState<string | null>(null);

  const handleReDownload = async (audit: any) => {
    setIsGenerating(audit.id);
    try {
      // 1. Reconstruimos los datos del formulario tal como los pide el motor
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

      // 2. Pasamos los datos por tu motor para recrear los triggers y resultados exactos
      const result = calculateAuditResults(formData);

      // 3. Vamos a buscar los mensajes correctos a la BD
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

      // 4. Dibujamos y descargamos el PDF
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
      console.error("Error al regenerar PDF", error);
      alert("Hubo un error al generar tu reporte.");
    } finally {
      setIsGenerating(null);
    }
  };

  if (audits.length === 0) {
    return (
      <div className="bg-white p-10 rounded-4xl border border-slate-100 shadow-sm text-center max-w-2xl mx-auto">
        <p className="text-slate-500 mb-6 text-lg">Aún no tienes auditorías guardadas en tu cuenta.</p>
        <a href="/audit" className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-all inline-block">
          Iniciar mi primera auditoría
        </a>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {audits.map((audit) => (
        <div key={audit.id} className="bg-white p-6 rounded-4xl border border-slate-100 shadow-lg hover:border-emerald-200 transition-all flex flex-col justify-between group">
          <div>
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
                <Calendar className="w-4 h-4" />
                {new Date(audit.createdAt).toLocaleDateString()}
              </div>
              <div className="bg-slate-50 border border-slate-200 px-3 py-1 rounded-full text-[10px] font-black text-midnight uppercase tracking-widest">
                {audit.industry}
              </div>
            </div>

            <div className="flex gap-4 mb-6">
              <div className="flex-1 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Score</p>
                <p className="text-3xl font-black text-midnight">{audit.finalScore}</p>
              </div>
              <div className="flex-1 bg-emerald-50 p-4 rounded-2xl border border-emerald-100 text-center">
                <p className="text-[10px] uppercase font-bold text-emerald-600 mb-1">Utilidad</p>
                <p className={`text-xl font-black flex items-center justify-center h-full ${Number(audit.netProfit) < 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                  ${Number(audit.netProfit).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => handleReDownload(audit)}
            disabled={isGenerating === audit.id}
            className="w-full bg-midnight text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors disabled:opacity-50 mt-auto"
          >
            {isGenerating === audit.id ? "Preparando Documento..." : (
              <>
                <FileDown className="w-4 h-4" />
                Descargar Reporte PDF
              </>
            )}
          </button>
        </div>
      ))}
    </div>
  );
}