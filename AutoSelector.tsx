"use client";

import Link from "next/link";
import { useAutoActivo } from "@/context/AutoContext";

export function AutoSelector() {
  const { autos, autoActivo, setAutoActivoId, loading } = useAutoActivo();

  if (loading && autos.length === 0) {
    return <div className="h-10 w-56 animate-pulse rounded-lg bg-slate-100" />;
  }

  if (autos.length === 0) {
    return (
      <Link href="/autos" className="rounded-lg border border-dashed border-slate-300 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">
        + Agregar un auto
      </Link>
    );
  }

  return (
    <label className="flex items-center gap-2">
      <span className="hidden text-xs font-medium uppercase tracking-wide text-slate-500 sm:inline">Auto activo</span>
      <div className="relative">
        <select
          value={autoActivo?.id_auto ?? ""}
          onChange={(e) => setAutoActivoId(e.target.value)}
          className="h-10 w-full min-w-0 appearance-none rounded-lg border border-slate-200 bg-white pl-3 pr-9 text-sm font-medium text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 sm:w-64"
        >
          {autos.map((a) => (
            <option key={a.id_auto} value={a.id_auto}>
              {a.marca_modelo} · {a.patente}
            </option>
          ))}
        </select>
        <svg className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
        </svg>
      </div>
    </label>
  );
}
