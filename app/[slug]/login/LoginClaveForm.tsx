"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginClaveForm({ slug }: { slug: string }) {
  const router = useRouter();
  const [clave, setClave] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^\d{4}$/.test(clave)) {
      setError("Ingresa los 4 dígitos");
      return;
    }
    setEnviando(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/factiram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, clave }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError(j.error || "Clave incorrecta");
        setEnviando(false);
        return;
      }
      router.replace(`/${slug}`);
      router.refresh();
    } catch {
      setError("Error de conexión");
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <p className="text-xs uppercase font-bold text-gray-400 tracking-widest">
        Clave de acceso
      </p>
      <input
        type="password"
        inputMode="numeric"
        pattern="\d{4}"
        maxLength={4}
        value={clave}
        autoFocus
        onChange={(e) => {
          setClave(e.target.value.replace(/\D/g, "").slice(0, 4));
          setError(null);
        }}
        className="w-full text-center font-black text-3xl tracking-[0.5em] border border-gray-200 rounded-xl p-3 bg-gray-50 focus:outline-none focus:border-blue-300"
        placeholder="••••"
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={enviando || clave.length !== 4}
        className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold disabled:opacity-50 active:bg-blue-700"
      >
        {enviando ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
