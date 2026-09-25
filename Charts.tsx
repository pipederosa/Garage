"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { fmtDate, fmtMes, fmtMoney, fmtNum } from "@/lib/format";

// Paleta: un solo color por gráfico (cada gráfico tiene una sola serie; el título la nombra)
const COLOR_GASTO = "#2a78d6";
const COLOR_KM = "#4a3aa7";
const GRID = "#e2e8f0";
const AXIS = "#64748b";

const axisProps = { stroke: AXIS, fontSize: 12, tickLine: false, axisLine: false } as const;
const compact = new Intl.NumberFormat("es-AR", { notation: "compact", maximumFractionDigits: 1 });

function Empty() {
  return <div className="grid h-64 place-items-center text-sm text-slate-400">Sin datos suficientes</div>;
}

function TooltipBox({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-md">
      <p className="text-slate-500">{title}</p>
      <p className="mt-0.5 font-semibold tabular-nums text-slate-900">{value}</p>
    </div>
  );
}

export function GastoNaftaChart({ data }: { data: { mes: string; total: number; litros: number }[] }) {
  if (data.length === 0) return <Empty />;
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid stroke={GRID} vertical={false} />
        <XAxis dataKey="mes" tickFormatter={fmtMes} {...axisProps} />
        <YAxis tickFormatter={(v) => `$${compact.format(v)}`} width={56} {...axisProps} />
        <Tooltip
          cursor={{ stroke: AXIS, strokeDasharray: "3 3" }}
          content={({ active, payload }) =>
            active && payload?.[0] ? (
              <TooltipBox
                title={fmtMes(String(payload[0].payload.mes))}
                value={`${fmtMoney(Number(payload[0].value))} · ${fmtNum(payload[0].payload.litros, "L")}`}
              />
            ) : null
          }
        />
        <Line type="monotone" dataKey="total" stroke={COLOR_GASTO} strokeWidth={2} dot={{ r: 4, strokeWidth: 2, fill: "#fff" }} activeDot={{ r: 6 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function KmChart({ data }: { data: { fecha: string; km: number }[] }) {
  if (data.length < 2) return <Empty />;
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid stroke={GRID} vertical={false} />
        <XAxis dataKey="fecha" tickFormatter={(v) => fmtDate(v).slice(0, 5)} minTickGap={24} {...axisProps} />
        <YAxis domain={["dataMin", "auto"]} tickFormatter={(v) => compact.format(v)} width={56} {...axisProps} />
        <Tooltip
          cursor={{ stroke: AXIS, strokeDasharray: "3 3" }}
          content={({ active, payload }) =>
            active && payload?.[0] ? (
              <TooltipBox title={fmtDate(String(payload[0].payload.fecha))} value={fmtNum(Number(payload[0].value), "km")} />
            ) : null
          }
        />
        <Line type="monotone" dataKey="km" stroke={COLOR_KM} strokeWidth={2} dot={{ r: 4, strokeWidth: 2, fill: "#fff" }} activeDot={{ r: 6 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function CategoriasChart({ data }: { data: { categoria: string; total: number }[] }) {
  if (data.length === 0) return <Empty />;
  const height = Math.max(160, data.length * 40);
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, left: 8, bottom: 0 }} barCategoryGap={8}>
        <CartesianGrid stroke={GRID} horizontal={false} />
        <XAxis type="number" tickFormatter={(v) => `$${compact.format(v)}`} {...axisProps} />
        <YAxis type="category" dataKey="categoria" width={110} {...axisProps} />
        <Tooltip
          cursor={{ fill: "#f1f5f9" }}
          content={({ active, payload }) =>
            active && payload?.[0] ? (
              <TooltipBox title={String(payload[0].payload.categoria)} value={fmtMoney(Number(payload[0].value))} />
            ) : null
          }
        />
        <Bar dataKey="total" fill={COLOR_GASTO} radius={[0, 4, 4, 0]} maxBarSize={24} />
      </BarChart>
    </ResponsiveContainer>
  );
}
