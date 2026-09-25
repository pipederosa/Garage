"use client";

import { Alert, Card, PageHeader } from "@/components/ui";
import { DataTable, type Column } from "@/components/DataTable";
import { RecordForm, type FieldDef } from "@/components/RecordForm";
import { useAutoActivo } from "@/context/AutoContext";
import { createRecord } from "@/hooks/useSheetData";
import type { Auto } from "@/lib/schema";

const FIELDS: FieldDef[] = [
  { name: "marca_modelo", label: "Marca y modelo", type: "text", required: true, placeholder: "Toyota Etios XLS", wide: true },
  { name: "patente", label: "Patente", type: "text", required: true, placeholder: "AB123CD" },
  { name: "capacidad_tanque_litros", label: "Capacidad del tanque (L)", type: "number", required: true, step: "0.1" },
];

export default function AutosPage() {
  const { autos, autoActivo, setAutoActivoId, recargarAutos, loading, error } = useAutoActivo();

  const columns: Column<Auto>[] = [
    { header: "Auto", cell: (r) => <span className="font-medium text-slate-900">{r.marca_modelo}</span> },
    { header: "Patente", cell: (r) => <span className="font-mono">{r.patente}</span> },
    { header: "Tanque", cell: (r) => `${r.capacidad_tanque_litros} L`, align: "right" },
    {
      header: "",
      align: "right",
      cell: (r) =>
        r.id_auto === autoActivo?.id_auto ? (
          <span className="text-xs font-medium text-blue-700">Activo</span>
        ) : (
          <button onClick={() => setAutoActivoId(r.id_auto)} className="text-xs font-medium text-slate-500 hover:text-blue-700">
            Usar este
          </button>
        ),
    },
  ];

  async function handleSubmit(values: Record<string, string>) {
    const nuevo = (await createRecord("autos", values)) as Auto;
    await recargarAutos();
    setAutoActivoId(nuevo.id_auto);
  }

  return (
    <>
      <PageHeader title="Mis autos" description="Alta de vehículos. El auto activo se elige desde el selector del header." />
      {error && <Alert>{error}</Alert>}
      <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
        <Card title="Agregar auto">
          <RecordForm fields={FIELDS} onSubmit={handleSubmit} submitLabel="Agregar" />
        </Card>
        <Card title="Autos" subtitle={`${autos.length} registrados`}>
          <DataTable rows={autos} columns={columns} rowKey={(r) => r.id_auto} loading={loading} />
        </Card>
      </div>
    </>
  );
}
