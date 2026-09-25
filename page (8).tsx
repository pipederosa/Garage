"use client";

import { useMemo } from "react";
import { Alert, Card, PageHeader, RequireAuto, StatCard, StatGrid } from "@/components/ui";
import { DataTable, type Column } from "@/components/DataTable";
import { RecordForm, type FieldDef } from "@/components/RecordForm";
import { useDatosAuto } from "@/hooks/useDatosAuto";
import { createRecord } from "@/hooks/useSheetData";
import { lecturasKm, ordenarPorFechaDesc, proximoService } from "@/lib/calculations";
import { fmtDate, fmtMoney, fmtNum } from "@/lib/format";
import type { Service } from "@/lib/schema";

const FIELDS: FieldDef[] = [
  { name: "fecha", label: "Fecha", type: "date", required: true },
  { name: "costo", label: "Costo ($)", type: "number", required: true, step: "0.01" },
  { name: "km_actual", label: "Km al hacer el service", type: "number", required: true, step: "1" },
  { name: "km_proximo_service", label: "Km del próximo service", type: "number", required: true, step: "1" },
  { name: "detalle", label: "Detalle", type: "text", placeholder: "Aceite 5W30, filtros de aire y aceite", wide: true },
];

export default function ServicePage() {
  return (
    <RequireAuto>
      <ServiceModule />
    </RequireAuto>
  );
}

function ServiceModule() {
  const { auto, nafta, service, mecanico, loading, error, reload } = useDatosAuto();
  const pred = useMemo(() => proximoService(service, lecturasKm(nafta, service, mecanico)), [nafta, service, mecanico]);

  const columns: Column<Service>[] = [
    { header: "Fecha", cell: (r) => fmtDate(r.fecha) },
    { header: "Km", cell: (r) => fmtNum(r.km_actual), align: "right" },
    { header: "Próximo", cell: (r) => fmtNum(r.km_proximo_service), align: "right" },
    { header: "Costo", cell: (r) => fmtMoney(r.costo), align: "right" },
    { header: "Detalle", cell: (r) => r.detalle || "—" },
  ];

  async function handleSubmit(values: Record<string, string>) {
    await createRecord("service", { ...values, id_auto: auto!.id_auto });
    await reload.service();
  }

  const tone = pred.vencido ? "critical" : pred.diasRestantes !== null && pred.diasRestantes <= 30 ? "warning" : "good";

  return (
    <>
      <PageHeader title="Service" description="Historial de services y predicción del próximo" />
      {error && <Alert>{error}</Alert>}

      <StatGrid>
        <StatCard
          label="Fecha estimada próximo service"
          value={pred.vencido ? "Vencido" : fmtDate(pred.fechaEstimada)}
          tone={pred.ultimoService ? tone : "default"}
          badge={pred.vencido ? "Vencido" : tone === "warning" ? "Pronto" : "Al día"}
          hint={
            pred.diasRestantes !== null && !pred.vencido
              ? `En ${pred.diasRestantes} días`
              : !pred.kmPorDia
                ? "Faltan lecturas de km para proyectar"
                : undefined
          }
        />
        <StatCard label="Km objetivo" value={fmtNum(pred.kmObjetivo, "km")} hint={pred.ultimoService ? `Último service ${fmtDate(pred.ultimoService.fecha)}` : "Sin services"} />
        <StatCard label="Km restantes" value={fmtNum(pred.kmRestantes, "km")} />
        <StatCard label="Uso promedio" value={fmtNum(pred.kmPorDia, "km/día")} hint="Según las lecturas de odómetro de los últimos 6 meses" />
      </StatGrid>

      <Alert tone="info">
        Cómo se calcula: km por día = km recorridos ÷ días transcurridos entre la primera y la última lectura del odómetro
        (cargas de nafta, services y arreglos). Fecha estimada = última lectura + (km objetivo − km actual) ÷ km por día.
      </Alert>

      <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
        <Card title="Nuevo service">
          <RecordForm fields={FIELDS} onSubmit={handleSubmit} submitLabel="Registrar service" />
        </Card>
        <Card title="Historial" subtitle={`${service.length} registros`}>
          <DataTable rows={ordenarPorFechaDesc(service)} columns={columns} rowKey={(r) => r.id} loading={loading} />
        </Card>
      </div>
    </>
  );
}
