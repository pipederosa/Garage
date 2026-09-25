const ars = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });
const ars2 = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 2 });
const num = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 1 });
const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

export const fmtMoney = (n: number | null | undefined) => (n == null ? "—" : ars.format(n));
export const fmtMoney2 = (n: number | null | undefined) => (n == null ? "—" : ars2.format(n));
export const fmtNum = (n: number | null | undefined, suffix = "") =>
  n == null ? "—" : `${num.format(n)}${suffix ? ` ${suffix}` : ""}`;

export function fmtDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

/** "2026-09" → "sep 26" */
export function fmtMes(ym: string): string {
  const [y, m] = ym.split("-");
  return `${MESES[Number(m) - 1]} ${y.slice(2)}`;
}
