"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useAutoActivo } from "@/context/AutoContext";

export function PageHeader({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function Card({ title, subtitle, children, className = "" }: { title?: string; subtitle?: string; children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}>
      {title && (
        <header className="mb-4">
          <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
          {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
        </header>
      )}
      {children}
    </section>
  );
}

type Tone = "default" | "good" | "warning" | "critical";
const TONES: Record<Tone, string> = {
  default: "",
  good: "text-emerald-700 bg-emerald-50",
  warning: "text-amber-700 bg-amber-50",
  critical: "text-red-700 bg-red-50",
};

export function StatCard({
  label,
  value,
  hint,
  tone = "default",
  badge,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  tone?: Tone;
  badge?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
        {badge && tone !== "default" && (
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${TONES[tone]}`}>{badge}</span>
        )}
      </div>
      <p className="mt-2 text-2xl font-semibold tabular-nums text-slate-900">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

export function StatGrid({ children }: { children: ReactNode }) {
  return <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{children}</div>;
}

export function Alert({ children, tone = "critical" }: { children: ReactNode; tone?: "critical" | "info" }) {
  const cls = tone === "critical" ? "border-red-200 bg-red-50 text-red-800" : "border-blue-200 bg-blue-50 text-blue-800";
  return <div className={`mb-4 rounded-lg border px-4 py-3 text-sm ${cls}`}>{children}</div>;
}

/** Envuelve páginas que necesitan un auto activo. */
export function RequireAuto({ children }: { children: ReactNode }) {
  const { autoActivo, loading, error } = useAutoActivo();
  if (error) return <Alert>No se pudo conectar con Google Sheets: {error}</Alert>;
  if (loading && !autoActivo) return <div className="h-40 animate-pulse rounded-xl bg-slate-100" />;
  if (!autoActivo)
    return (
      <Card>
        <div className="py-10 text-center">
          <p className="font-medium text-slate-900">Todavía no cargaste ningún auto</p>
          <p className="mt-1 text-sm text-slate-500">Agregá uno para empezar a registrar gastos.</p>
          <Link href="/autos" className="mt-4 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            Agregar auto
          </Link>
        </div>
      </Card>
    );
  return <>{children}</>;
}
