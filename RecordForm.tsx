"use client";

import { useState, type FormEvent } from "react";
import { todayISO } from "@/lib/parse";

export interface FieldDef {
  name: string;
  label: string;
  type: "text" | "number" | "date" | "select";
  required?: boolean;
  options?: string[];
  placeholder?: string;
  step?: string;
  /** Ocupa las 2 columnas del grid */
  wide?: boolean;
}

const inputCls =
  "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20";

function initialValues(fields: FieldDef[]) {
  return Object.fromEntries(fields.map((f) => [f.name, f.type === "date" ? todayISO() : ""]));
}

/**
 * Formulario genérico definido por configuración.
 * `onSubmit` recibe los valores como strings; la API se encarga de convertir y validar.
 */
export function RecordForm({
  fields,
  onSubmit,
  submitLabel = "Guardar",
}: {
  fields: FieldDef[];
  onSubmit: (values: Record<string, string>) => Promise<void>;
  submitLabel?: string;
}) {
  const [values, setValues] = useState<Record<string, string>>(() => initialValues(fields));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setOk(false);
    try {
      await onSubmit(values);
      setValues(initialValues(fields));
      setOk(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar");
    } finally {
      setSaving(false);
    }
  }

  const set = (name: string, v: string) => setValues((prev) => ({ ...prev, [name]: v }));

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
      {fields.map((f) => (
        <label key={f.name} className={`block ${f.wide ? "sm:col-span-2" : ""}`}>
          <span className="mb-1 block text-xs font-medium text-slate-600">
            {f.label}
            {f.required && <span className="text-red-500"> *</span>}
          </span>
          {f.type === "select" ? (
            <select className={inputCls} required={f.required} value={values[f.name]} onChange={(e) => set(f.name, e.target.value)}>
              <option value="">Elegí…</option>
              {f.options?.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          ) : (
            <input
              className={inputCls}
              type={f.type}
              required={f.required}
              step={f.type === "number" ? (f.step ?? "any") : undefined}
              min={f.type === "number" ? 0 : undefined}
              inputMode={f.type === "number" ? "decimal" : undefined}
              placeholder={f.placeholder}
              value={values[f.name]}
              onChange={(e) => set(f.name, e.target.value)}
            />
          )}
        </label>
      ))}

      <div className="flex items-center gap-3 sm:col-span-2">
        <button
          type="submit"
          disabled={saving}
          className="h-10 rounded-lg bg-blue-600 px-5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-60"
        >
          {saving ? "Guardando…" : submitLabel}
        </button>
        {ok && <span className="text-sm text-emerald-700">✓ Guardado</span>}
        {error && <span className="text-sm text-red-600">{error}</span>}
      </div>
    </form>
  );
}
