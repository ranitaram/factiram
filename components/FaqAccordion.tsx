"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

type FaqItem = {
  pregunta: string;
  respuesta: string;
};

type Props = {
  items: FaqItem[];
};

export default function FaqAccordion({ items }: Props) {
  const [abierto, setAbierto] = useState<number | null>(0);

  function toggle(i: number) {
    setAbierto(abierto === i ? null : i);
  }

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div
          key={i}
          className="bg-white border border-slate-200 rounded-2xl overflow-hidden transition-all"
        >
          <button
            onClick={() => toggle(i)}
            className="w-full flex items-center justify-between p-5 text-left font-bold text-midnight text-sm uppercase tracking-wider"
          >
            {item.pregunta}
            <ChevronDown
              className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                abierto === i ? "rotate-180" : ""
              }`}
            />
          </button>
          <div
            className={`overflow-hidden transition-all duration-200 ${
              abierto === i ? "max-h-96 pb-5" : "max-h-0"
            }`}
          >
            <p className="px-5 text-sm text-slate-600 leading-relaxed">
              {item.respuesta}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
