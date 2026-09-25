export const TIPOS_NAFTA = ["Súper", "Premium", "Diésel", "Diésel Premium", "GNC"];

export const CATEGORIAS_MECANICO = [
  "Ruedas",
  "Amortiguadores",
  "Frenos",
  "Embrague",
  "Chasis",
  "Suspensión",
  "Batería",
  "Motor",
  "Electricidad",
  "Otro",
];

export const CATEGORIAS_OTROS = ["Seguro", "VTV", "Peajes", "Lavado", "Multas", "Patente", "Estacionamiento", "Otro"];

/**
 * Piezas cuyo desgaste se sigue en el módulo Mecánico.
 * vidaUtilKm es una referencia orientativa: ajustala a tu auto y a tus repuestos.
 */
export const PIEZAS_DESGASTE: { categoria: string; vidaUtilKm: number }[] = [
  { categoria: "Ruedas", vidaUtilKm: 50000 },
  { categoria: "Amortiguadores", vidaUtilKm: 80000 },
  { categoria: "Frenos", vidaUtilKm: 35000 },
  { categoria: "Embrague", vidaUtilKm: 100000 },
];

export const STORAGE_KEY_AUTO = "garage:auto-activo";
