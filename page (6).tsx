"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Alert, Card, PageHeader, RequireAuto, StatCard, StatGrid } from "@/components/ui";
import { CategoriasChart, GastoNaftaChart, KmChart } from "@/components/Charts";
import { useDatosAuto } from "@/hooks/useDatosAuto";
import {
  gastoDelMes,
  gastoNaftaPorMes,
  lecturasKm,
  ordenarPorKm,
  proximoService,
  resumenNafta,
  totalesPorCategoria,
} from "@/lib/calculations";
import { fmtDate, fmtMoney, fmtNum } from "@/lib/format";
import { todayISO } from "@/lib/parse";

export default function DashboardPage() {
  return (
    <RequireAuto>
      <Dashboard />
    </RequireAuto>
  );
}

function Dashboard() {
  const { auto, nafta, service, mecanico, otros, loading, error } = useDatosAuto();

  const kpis = useMemo(() => {
    const mes = todayISO().slice(0, 7);
    const lecturas = lecturasKm(nafta, service, mecanico);
    return {
      mes: gastoDelMes(mes, { nafta, service, mecanico, otros }),
      nafta: resumenNafta(nafta, auto?.capacidad_tanque_litros ?? 0),
      service: proximoService(service, lecturas),
      naftaPorMes: gastoNaftaPorMes(nafta),
      km: ordenarPorKm(nafta).map((c) => ({ fecha: c.fecha, km: c.km_actual })),
      categorias: totalesPorCategoria([
        ...mecanico.map((m) => ({ categoria: `Mecánico: ${m.categoria}`, precio: m.precio })),
        ...otros,
      ]),
    };
  }, [auto, nafta, service, mecanico, otros]);

  const s = kpis.service;
  const serviceTone = s.vencido ? "critical" : s.diasRestantes !== null && s.diasRestantes <= 30 ? "warning" : "good";

  return (
    <>
      <PageHeader title="Dashboard" description={loading ? "Actualizando datos…" : "Resumen del auto activo"} />
      {error && <Alert>{error}</Alert>}

      <StatGrid>
        <StatCard
          label="Gasto total del mes"
          value={fmtMoney(kpis.mes.total)}
          hint={`Nafta ${fmtMoney(kpis.mes.nafta)} · Resto ${fmtMoney(kpis.mes.total - kpis.mes.nafta)}`}
        />
        <StatCard
          label="Autonomía promedio"
          value={fmtNum(kpis.nafta.autonomiaPromedioKm, "km")}
          hint={kpis.nafta.kmPorLitroPromedio ? `${fmtNum(kpis.nafta.kmPorLitroPromedio, "km/L")} con tanque lleno` : "Necesitás 2 cargas"}
        />
        <StatCard
          label="Próximo service"
          value={
            s.vencido ? "Vencido" : s.diasRestantes !== null ? `${s.diasRestantes} días` : s.kmRestantes !== null ? fmtNum(s.kmRestantes, "km") : "—"
          }
          tone={s.ultimoService ? serviceTone : "default"}
          badge={s.vencido ? "Vencido" : serviceTone === "warning" ? "Pronto" : "Al día"}
          hint={
            s.fechaEstimada && !s.vencido
              ? `Estimado ${fmtDate(s.fechaEstimada)} · faltan ${fmtNum(s.kmRestantes, "km")}`
              : s.ultimoService
                ? `Objetivo ${fmtNum(s.kmObjetivo, "km")}`
                : <Link href="/service" className="text-blue-600 hover:underline">Cargá el primer service</Link>
          }
        />
        <StatCard
          label="Gasto por km (nafta)"
          value={kpis.nafta.costoPorKm ? `$${fmtNum(kpis.nafta.costoPorKm)}` : "—"}
          hint={`${fmtNum(kpis.nafta.kmTotales, "km")} registrados`}
        />
      </StatGrid>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Gasto en nafta por mes" subtitle="Suma de cargas de cada mes">
          <GastoNaftaChart data={kpis.naftaPorMes} />
        </Card>
        <Card title="Evolución del kilometraje" subtitle="Odómetro en cada carga de nafta">
          <KmChart data={kpis.km} />
        </Card>
        <Card title="Gastos por fuera de la nafta" subtitle="Mecánico + Otros, total histórico por categoría" className="lg:col-span-2">
          <CategoriasChart data={kpis.categorias} />
        </Card>
      </div>
    </>
  );
}
