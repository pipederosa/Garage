/**
 * Esquema de la base de datos (un documento de Google Sheets con 5 pestañas).
 * Este archivo se usa tanto en el servidor como en el cliente: no importa nada de Google.
 */

export const SHEET_NAMES = {
  autos: "Autos",
  nafta: "Nafta",
  service: "Service",
  mecanico: "Mecanico",
  otros: "Otros",
} as const;

export type SheetKey = keyof typeof SHEET_NAMES;

type FieldType = "string" | "number" | "date";

interface ColumnDef {
  type: FieldType;
  required?: boolean;
}

/** Columnas de la fila 1 de cada pestaña, en orden. */
export const COLUMNS: Record<SheetKey, Record<string, ColumnDef>> = {
  autos: {
    id_auto: { type: "string" },
    marca_modelo: { type: "string", required: true },
    patente: { type: "string", required: true },
    capacidad_tanque_litros: { type: "number", required: true },
  },
  nafta: {
    id: { type: "string" },
    id_auto: { type: "string", required: true },
    fecha: { type: "date", required: true },
    litros: { type: "number", required: true },
    lugar: { type: "string" },
    tipo_nafta: { type: "string" },
    km_actual: { type: "number", required: true },
    precio_total: { type: "number", required: true },
  },
  service: {
    id: { type: "string" },
    id_auto: { type: "string", required: true },
    fecha: { type: "date", required: true },
    detalle: { type: "string" },
    km_actual: { type: "number", required: true },
    km_proximo_service: { type: "number", required: true },
    costo: { type: "number", required: true },
  },
  mecanico: {
    id: { type: "string" },
    id_auto: { type: "string", required: true },
    fecha: { type: "date", required: true },
    categoria: { type: "string", required: true },
    detalle_marca: { type: "string" },
    precio: { type: "number", required: true },
    km_actual: { type: "number" },
  },
  otros: {
    id: { type: "string" },
    id_auto: { type: "string", required: true },
    fecha: { type: "date", required: true },
    categoria: { type: "string", required: true },
    detalle: { type: "string" },
    precio: { type: "number", required: true },
  },
};

/** Columna que funciona como clave primaria en cada pestaña. */
export const ID_COLUMN: Record<SheetKey, string> = {
  autos: "id_auto",
  nafta: "id",
  service: "id",
  mecanico: "id",
  otros: "id",
};

// ---------- Tipos de dominio ----------

export interface Auto {
  id_auto: string;
  marca_modelo: string;
  patente: string;
  capacidad_tanque_litros: number;
}

export interface CargaNafta {
  id: string;
  id_auto: string;
  fecha: string; // yyyy-mm-dd
  litros: number;
  lugar: string;
  tipo_nafta: string;
  km_actual: number;
  precio_total: number;
}

export interface Service {
  id: string;
  id_auto: string;
  fecha: string;
  detalle: string;
  km_actual: number;
  km_proximo_service: number;
  costo: number;
}

export interface Mecanico {
  id: string;
  id_auto: string;
  fecha: string;
  categoria: string;
  detalle_marca: string;
  precio: number;
  km_actual: number;
}

export interface Otro {
  id: string;
  id_auto: string;
  fecha: string;
  categoria: string;
  detalle: string;
  precio: number;
}

export interface SheetRowMap {
  autos: Auto;
  nafta: CargaNafta;
  service: Service;
  mecanico: Mecanico;
  otros: Otro;
}
