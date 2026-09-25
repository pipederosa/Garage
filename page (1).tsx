"use client";

import { useMemo } from "react";
import { Alert, Card, PageHeader, RequireAuto, StatCard, StatGrid } from "@/components/ui";
import { DataTable, type Column } from "@/components/DataTable";
import { RecordForm, type FieldDef } from "@/components/RecordForm";
import { useAutoActivo } from "@/context/AutoContext";
import { createRecord, useSheetData } from "@/hooks/useSheetData";
import { intervalosDeCarga, ordenarPorFechaDesc, resumenNafta } from "@/lib/calculations";
import { TIPOS_NAFTA } from "@/lib/constants";
import { fmtDate, fmtMoney, fmtMoney2, fmtNum } from "@/lib/format";
import type { CargaNafta } from "@/lib/schema";

const FIELDS: FieldDef[] = [
  { name: "fecha", label: "Fecha", type: "date", required: true },
  { name: "km_actual", label: "Km del odómetro", type: "number", required: true, step: "1" },
  { name: "litros", label: "Litros cargados", type: "number", required: true, step: "0.01" },
  { name: "precio_total", label: "Precio total ($)", type: "number", required: true, step: "0.01" },
  { name: "tipo_nafta", label: "Tipo de nafta", type: "select", options: TIPOS_NAFTA },
  { name: "lugar", label: "Lugar / estación", type: "text", placeholder: "YPF Av. Libertador" },
];

export default function NaftaPage() {
  return (
    <RequireAuto>
      <Nafta />
    </RequireAuto>
  );
}

function Nafta() {
  const { autoActivo } = useAutoActivo();
  const { data, loading, error, reload } = useSheetData("nafta", autoActivo?.id_auto);

  const resumen = useMemo(() => resumenNafta(data, autoActivo?.capacidad_tanque_litros ?? 0), [data, autoActivo]);

  // km/L de cada carga para mostrar en la tabla
  const kplPorKm = useMemo(() => {
    const map = new Map<number, number>();
    intervalosDeCarga(data).forEach((i) => map.set(i.km, i.kmPorLitro));
    return map;
  }, [data]);

  const columns: Column<CargaNafta>[] = [
    { header: "Fecha", cell: (r) => fmtDate(r.fecha) },
    { header: "Km", cell: (r) => fmtNum(r.km_actual), align: "right" },
    { header: "Litros", cell: (r) => fmtNum(r.litros), align: "right" },
    { header: "Total", cell: (r) => fmtMoney(r.precio_total), align: "right" },
    { header: "$/L", cell: (r) => (r.litros ? fmtMoney2(r.precio_total / r.litros) : "—"), align: "right" },
    { header: "km/L", cell: (r) => fmtNum(kplPorKm.get(r.km_actual)), align: "right" },
    { header: "Tipo", cell: (r) => r.tipo_nafta || "—" },
    { header: "Lugar", cell: (r) => r.lugar || "—" },
  ];

  async function handleSubmit(values: Record<string, string>) {
    await createRecord("nafta", { ...values, id_auto: autoActivo!.id_auto });
    await reload();
  }

  return (
    <>
      <PageHeader title="Nafta" description="Cargas de combustible, rendimiento y costo por kilómetro" />
      {error && <Alert>{error}</Alert>}

      <StatGrid>
        <StatCard
          label="Último precio pagado"
          value={resumen.precioPorLitro ? `${fmtMoney2(resumen.precioPorLitro)}/L` : "—"}
          hint={resumen.ultimaCarga ? `${resumen.lugar ?? "Sin lugar"} · ${fmtDate(resumen.ultimaCarga.fecha)}` : "Sin cargas"}
        />
        <StatCard
          label="Autonomía (última carga)"
          value={fmtNum(resumen.autonomiaUltimaKm, "km")}
          hint={resumen.kmPorLitroUltimo ? `${fmtNum(resumen.kmPorLitroUltimo, "km/L")} × ${autoActivo?.capacidad_tanque_litros} L de tanque` : "Necesitás al menos 2 cargas"}
        />
        <StatCard
          label="Rendimiento promedio"
          value={fmtNum(resumen.kmPorLitroPromedio, "km/L")}
          hint={resumen.autonomiaPromedioKm ? `Autonomía promedio ${fmtNum(resumen.autonomiaPromedioKm, "km")}` : undefined}
        />
        <StatCard
          label="Gasto promedio por km"
          value={resumen.costoPorKm ? fmtMoney2(resumen.costoPorKm) : "—"}
          hint={`Total en nafta ${fmtMoney(resumen.gastoTotal)}`}
        />
      </StatGrid>

      <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
        <Card title="Nueva carga" subtitle="Cargá siempre con tanque lleno para que la autonomía sea precisa">
          <RecordForm fields={FIELDS} onSubmit={handleSubmit} submitLabel="Registrar carga" />
        </Card>
        <Card title="Historial de cargas" subtitle={`${data.length} registros`}>
          <DataTable rows={ordenarPorFechaDesc(data)} columns={columns} rowKey={(r) => r.id} loading={loading} />
        </Card>
      </div>
    </>
  );
}
