"use client";

import type { ReactNode } from "react";

export interface Column<T> {
  header: string;
  cell: (row: T) => ReactNode;
  align?: "left" | "right";
}

export function DataTable<T>({
  rows,
  columns,
  rowKey,
  loading,
  empty = "Sin registros todavía",
}: {
  rows: T[];
  columns: Column<T>[];
  rowKey: (row: T) => string;
  loading?: boolean;
  empty?: string;
}) {
  return (
    <div className="-mx-5 overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200">
            {columns.map((c) => (
              <th
                key={c.header}
                className={`whitespace-nowrap px-5 py-2.5 text-xs font-medium uppercase tracking-wide text-slate-500 ${
                  c.align === "right" ? "text-right" : "text-left"
                }`}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {loading && rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-5 py-8 text-center text-slate-400">
                Cargando…
              </td>
            </tr>
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-5 py-8 text-center text-slate-400">
                {empty}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={rowKey(row)} className="hover:bg-slate-50">
                {columns.map((c) => (
                  <td
                    key={c.header}
                    className={`whitespace-nowrap px-5 py-2.5 text-slate-700 ${c.align === "right" ? "text-right tabular-nums" : ""}`}
                  >
                    {c.cell(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
