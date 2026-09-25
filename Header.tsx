"use client";

import { AutoSelector } from "./AutoSelector";
import { useAutoActivo } from "@/context/AutoContext";

export function Header() {
  const { autoActivo } = useAutoActivo();
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b border-slate-200 bg-white/90 px-4 backdrop-blur md:px-8">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-slate-900">{autoActivo?.marca_modelo ?? "Sin auto seleccionado"}</p>
        {autoActivo && (
          <p className="text-xs text-slate-500">
            {autoActivo.patente} · tanque {autoActivo.capacidad_tanque_litros} L
          </p>
        )}
      </div>
      <AutoSelector />
    </header>
  );
}
