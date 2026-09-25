/**
 * Conversión de valores que vienen de Google Sheets.
 * Sheets devuelve lo que se ve en la celda (formateado según la configuración regional),
 * así que hay que tolerar "$ 45.000,50", "45000.5", "25/9/2026", "2026-09-25", etc.
 */

export function parseNumber(value: unknown): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (value === null || value === undefined) return 0;
  let s = String(value).trim().replace(/[$\s]/g, "").replace(/ARS/i, "");
  if (!s) return 0;

  const hasComma = s.includes(",");
  const hasDot = s.includes(".");
  if (hasComma && hasDot) {
    // El separador que aparece último es el decimal
    if (s.lastIndexOf(",") > s.lastIndexOf(".")) {
      s = s.replace(/\./g, "").replace(",", "."); // 45.000,50 (es-AR)
    } else {
      s = s.replace(/,/g, ""); // 45,000.50 (en-US)
    }
  } else if (hasComma) {
    s = s.replace(",", "."); // 12,5
  } else if (hasDot && /^\d{1,3}(\.\d{3})+$/.test(s)) {
    s = s.replace(/\./g, ""); // 45.000 → miles, no decimal
  }
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
}

/** Normaliza una fecha a "yyyy-mm-dd". Devuelve "" si no se puede interpretar. */
export function parseDate(value: unknown): string {
  if (value === null || value === undefined) return "";
  const s = String(value).trim();
  if (!s) return "";

  let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) return `${m[1]}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}`;

  // dd/mm/yyyy o dd-mm-yyyy (formato argentino)
  m = s.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);
  if (m) {
    const year = m[3].length === 2 ? `20${m[3]}` : m[3];
    return `${year}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
  }
  return "";
}

/** Crea un Date local (sin corrimiento de huso horario) a partir de "yyyy-mm-dd". */
export function toDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function todayISO(): string {
  return toISODate(new Date());
}
