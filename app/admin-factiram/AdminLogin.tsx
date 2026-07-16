"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const router = useRouter();
  const [secret, setSecret] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [intento, setIntento] = useState(0);
  const [bloqueado, setBloqueado] = useState(false);
  const [retryAfter, setRetryAfter] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  function iniciarCuentaRegresiva(segundos: number) {
    setBloqueado(true);
    setRetryAfter(segundos);
    timerRef.current = setInterval(() => {
      setRetryAfter((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setBloqueado(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

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

      if (res.status === 429) {
        const j = await res.json().catch(() => ({}));
        iniciarCuentaRegresiva(j.retryAfter ?? 60);
        setError(j.error || "Demasiados intentos");
        setEnviando(false);
        return;
      }

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError(j.error || "Clave incorrecta");
        setIntento(j.intentos ?? intento + 1);
        setEnviando(false);
        return;
      }

      setIntento(0);
      router.refresh();
    } catch {
      setError("Error de conexión");
      setEnviando(false);
    }
  }

  const deshabilitado = enviando || !secret || bloqueado;

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
          disabled={bloqueado}
          className="w-full text-center font-bold text-lg border border-gray-200 rounded-xl p-3 bg-gray-50 focus:outline-none focus:border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
          placeholder="••••••••"
        />
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        {intento > 0 && !bloqueado && (
          <p className="text-orange-400 text-xs text-center font-medium">
            Intento {intento} de 5
          </p>
        )}
        {bloqueado && (
          <p className="text-red-600 text-sm text-center font-bold">
            Demasiados intentos. Intenta en {retryAfter} segundos
          </p>
        )}
        <button
          type="submit"
          disabled={deshabilitado}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold disabled:opacity-50 active:bg-blue-700"
        >
          {enviando ? "Entrando…" : bloqueado ? `Espera ${retryAfter}s` : "Entrar"}
        </button>
      </form>
    </div>
  );
}
