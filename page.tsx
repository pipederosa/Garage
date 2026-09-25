"use client";

import { useMemo } from "react";
import { Alert, Card, PageHeader, RequireAuto } from "@/components/ui";
import { DataTable, type Column } from "@/components/DataTable";
import { RecordForm, type FieldDef } from "@/components/RecordForm";
import { useAutoActivo } from "@/context/AutoContext";
import { createRecord, useSheetData } from "@/hooks/useSheetData";
import { ordenarPorFechaDesc, totalesPorCategoria } from "@/lib/calculations";
import { CATEGORIAS_OTROS } from "@/lib/constants";
import { fmtDate, fmtMoney } from "@/lib/format";
import type { Otro } from "@/lib/schema";

const FIELDS: FieldDef[] = [
  { name: "fecha", label: "Fecha", type: "date", required: true },
  { name: "categoria", label: "Categoría", type: "select", required: true, options: CATEGORIAS_OTROS },
  { name: "precio", label: "Precio ($)", type: "number", required: true, step: "0.01" },
  { name: "detalle", label: "Detalle", type: "text", placeholder: "Cuota septiembre" },
];

export default function OtrosPage() {
  return (
    <RequireAuto>
      <Otros />
    </RequireAuto>
  );
}

function Otros() {
  const { autoActivo } = useAutoActivo();
  const { data, loading, error, reload } = useSheetData("otros", autoActivo?.id_auto);
  const totales = useMemo(() => totalesPorCategoria(data), [data]);
  const total = totales.reduce((s, t) => s + t.total, 0);

  const columns: Column<Otro>[] = [
    { header: "Fecha", cell: (r) => fmtDate(r.fecha) },
    { header: "Categoría", cell: (r) => r.categoria },
    { header: "Detalle", cell: (r) => r.detalle || "—" },
    { header: "Precio", cell: (r) => fmtMoney(r.precio), align: "right" },
  ];

  async function handleSubmit(values: Record<string, string>) {
    await createRecord("otros", { ...values, id_auto: autoActivo!.id_auto });
    await reload();
  }

  return (
    <>
      <PageHeader title="Otros gastos" description="Seguro, VTV, peajes, lavados, multas y patente" />
      {error && <Alert>{error}</Alert>}

      <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
        <div className="space-y-6">
          <Card title="Nuevo gasto">
            <RecordForm fields={FIELDS} onSubmit={handleSubmit} submitLabel="Registrar gasto" />
          </Card>
          <Card title="Total por categoría" subtitle={`Histórico · ${fmtMoney(total)}`}>
            {totales.length === 0 ? (
              <p className="text-sm text-slate-400">Sin gastos todavía</p>
            ) : (
              <ul className="space-y-3">
                {totales.map((t) => (
                  <li key={t.categoria}>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-700">{t.categoria}</span>
                      <span className="font-medium tabular-nums text-slate-900">{fmtMoney(t.total)}</span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-blue-600" style={{ width: `${(t.total / total) * 100}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
        <Card title="Historial" subtitle={`${data.length} registros`}>
          <DataTable rows={ordenarPorFechaDesc(data)} columns={columns} rowKey={(r) => r.id} loading={loading} />
        </Card>
      </div>
    </>
  );
}
