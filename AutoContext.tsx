"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Auto } from "@/lib/schema";
import { STORAGE_KEY_AUTO } from "@/lib/constants";

interface AutoContextValue {
  autos: Auto[];
  autoActivo: Auto | null;
  setAutoActivoId: (id: string) => void;
  loading: boolean;
  error: string | null;
  recargarAutos: () => Promise<void>;
}

const AutoContext = createContext<AutoContextValue | null>(null);

export function AutoProvider({ children }: { children: ReactNode }) {
  const [autos, setAutos] = useState<Auto[]>([]);
  const [activoId, setActivoId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const recargarAutos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/autos", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se pudieron cargar los autos");
      setAutos(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error de red");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    try {
      setActivoId(localStorage.getItem(STORAGE_KEY_AUTO));
    } catch {
      /* storage no disponible */
    }
    recargarAutos();
  }, [recargarAutos]);

  const setAutoActivoId = useCallback((id: string) => {
    setActivoId(id);
    try {
      localStorage.setItem(STORAGE_KEY_AUTO, id);
    } catch {
      /* noop */
    }
  }, []);

  // Si el guardado ya no existe, cae en el primero de la lista
  const autoActivo = useMemo(
    () => autos.find((a) => a.id_auto === activoId) ?? autos[0] ?? null,
    [autos, activoId],
  );

  return (
    <AutoContext.Provider value={{ autos, autoActivo, setAutoActivoId, loading, error, recargarAutos }}>
      {children}
    </AutoContext.Provider>
  );
}

export function useAutoActivo() {
  const ctx = useContext(AutoContext);
  if (!ctx) throw new Error("useAutoActivo debe usarse dentro de <AutoProvider>");
  return ctx;
}
