"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const router = useRouter();
  const [secret, setSecret] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError(j.error || "Clave incorrecta");
        setEnviando(false);
        return;
      }
      router.refresh();
    } catch {
      setError("Error de conexión");
      setEnviando(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <form onSubmit={onSubmit} className="bg-white rounded-2xl p-8 shadow-sm w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-black text-blue-600 text-center">FACTIRAM Admin</h1>
        <p className="text-xs uppercase font-bold text-gray-400 tracking-widest text-center">
          Clave de admin
        </p>
        <input
          type="password"
          value={secret}
          onChange={(e) => {
            setSecret(e.target.value);
            setError(null);
          }}
          autoFocus
          className="w-full text-center font-bold text-lg border border-gray-200 rounded-xl p-3 bg-gray-50 focus:outline-none focus:border-blue-300"
          placeholder="••••••••"
        />
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <button
          type="submit"
          disabled={enviando || !secret}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold disabled:opacity-50 active:bg-blue-700"
        >
          {enviando ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </div>
  );
}
