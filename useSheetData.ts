"use client";

import { useCallback, useEffect, useState } from "react";
import type { SheetKey, SheetRowMap } from "@/lib/schema";

/** Trae las filas de un módulo para el auto indicado. Si idAuto es null no hace nada. */
export function useSheetData<K extends SheetKey>(key: K, idAuto: string | null | undefined) {
  const [data, setData] = useState<SheetRowMap[K][]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!idAuto) {
      setData([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/${key}?id_auto=${encodeURIComponent(idAuto)}`, { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? `Error al leer ${key}`);
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error de red");
    } finally {
      setLoading(false);
    }
  }, [key, idAuto]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { data, loading, error, reload };
}

/** POST genérico. Lanza un Error con los mensajes de validación del servidor. */
export async function createRecord(key: SheetKey, body: Record<string, unknown>) {
  const res = await fetch(`/api/${key}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.errors?.join(" · ") ?? json.error ?? "No se pudo guardar");
  return json;
}
