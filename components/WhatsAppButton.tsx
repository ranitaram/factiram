"use client";

import { MessageCircle } from "lucide-react";

export default function WhatsAppButton() {
  // Configura aquí tu número (Formato internacional sin el +)
  // Ejemplo: 52311XXXXXXX (52 de México + 311 de Tepic + tu número)
  const phoneNumber = "523114000046"; 
  const message = encodeURIComponent("¡Hola! Vengo de Factiram y me gustaría recibir más información sobre mi auditoría.");

  return (
    <a
      href={`https://wa.me/${phoneNumber}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-100 bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center group"
      aria-label="Contactar por WhatsApp"
    >
      {/* Tooltip que aparece al pasar el mouse */}
      <span className="absolute right-full mr-4 bg-midnight text-white text-xs py-2 px-4 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        ¿Necesitas ayuda o asesoría?
      </span>
      <MessageCircle className="w-6 h-6 fill-current" />
    </a>
  );
}