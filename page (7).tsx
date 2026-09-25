"use client";

import { useMemo } from "react";
import { Alert, Card, PageHeader, RequireAuto } from "@/components/ui";
import { DataTable, type Column } from "@/components/DataTable";
import { RecordForm, type FieldDef } from "@/components/RecordForm";
import { useDatosAuto } from "@/hooks/useDatosAuto";
import { createRecord } from "@/hooks/useSheetData";
import { desgastePiezas, kmActual, lecturasKm, ordenarPorFechaDesc, type DesgastePieza } from "@/lib/calculations";
import { CATEGORIAS_MECANICO, PIEZAS_DESGASTE } from "@/lib/constants";
import { fmtDate, fmtMoney, fmtNum } from "@/lib/format";
import type { Mecanico } from "@/lib/schema";

const FIELDS: FieldDef[] = [
  { name: "fecha", label: "Fecha", type: "date", required: true },
  { name: "categoria", label: "Categoría", type: "select", required: true, options: CATEGORIAS_MECANICO },
  { name: "precio", label: "Precio ($)", type: "number", required: true, step: "0.01" },
  { name: "km_actual", label: "Km al momento del arreglo", type: "number", step: "1" },
  { name: "detalle_marca", label: "Detalle / marca del repuesto", type: "text", placeholder: "4 cubiertas Pirelli P400 185/65 R15", wide: true },
];

export default function MecanicoPage() {
  return (
    <RequireAuto>
      <MecanicoModule />
    </RequireAuto>
  );
}

function WearCard({ p }: { p: DesgastePieza }) {
  const pct = p.porcentaje ?? 0;
  const tone = pct >= 100 ? "bg-red-500" : pct >= 75 ? "bg-amber-500" : "bg-emerald-500";
  const label = pct >= 100 ? "Revisar" : pct >= 75 ? "Atención" : "OK";
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-900">{p.categoria}</p>
        {p.kmUso !== null && <span className="text-xs font-medium text-slate-500">{label}</span>}
      </div>
      {p.kmUso === null ? (
        <p className="mt-3 text-sm text-slate-400">Sin cambios registrados con km</p>
      ) : (
        <>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-slate-900">{fmtNum(p.kmUso, "km")}</p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
            <div className={`h-full rounded-full ${tone}`} style={{ width: `${Math.min(100, pct)}%` }} />
          </div>
          <p className="mt-2 text-xs text-slate-500">
            {Math.round(pct)}% de ~{fmtNum(p.vidaUtilKm, "km")} · cambio {fmtDate(p.ultimoCambio?.fecha)}
          </p>
        </>
      )}
    </div>
  );
}

function MecanicoModule() {
  const { auto, nafta, service, mecanico, loading, error, reload } = useDatosAuto();

  const kmAct = useMemo(() => kmActual(nafta, lecturasKm(nafta, service, mecanico)), [nafta, service, mecanico]);
  const desgaste = useMemo(() => desgastePiezas(mecanico, kmAct, PIEZAS_DESGASTE), [mecanico, kmAct]);

  const columns: Column<Mecanico>[] = [
    { header: "Fecha", cell: (r) => fmtDate(r.fecha) },
    { header: "Categoría", cell: (r) => r.categoria },
    { header: "Detalle / marca", cell: (r) => r.detalle_marca || "—" },
    { header: "Km", cell: (r) => (r.km_actual ? fmtNum(r.km_actual) : "—"), align: "right" },
    { header: "Precio", cell: (r) => fmtMoney(r.precio), align: "right" },
  ];

  async function handleSubmit(values: Record<string, string>) {
    await createRecord("mecanico", { ...values, id_auto: auto!.id_auto });
    await reload.mecanico();
  }

  return (
    <>
      <PageHeader
        title="Mecánico"
        description={`Arreglos y repuestos · km actual del auto: ${fmtNum(kmAct, "km")} (última carga de nafta)`}
      />
      {error && <Alert>{error}</Alert>}

      <h2 className="mb-3 text-sm font-semibold text-slate-900">Desgaste de piezas</h2>
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {desgaste.map((p) => (
          <WearCard key={p.categoria} p={p} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
        <Card title="Nuevo arreglo" subtitle="Cargá el km para poder seguir el desgaste">
          <RecordForm fields={FIELDS} onSubmit={handleSubmit} submitLabel="Registrar arreglo" />
        </Card>
        <Card title="Historial" subtitle={`${mecanico.length} registros`}>
          <DataTable rows={ordenarPorFechaDesc(mecanico)} columns={columns} rowKey={(r) => r.id} loading={loading} />
        </Card>
      </div>
    </>
  );
}
