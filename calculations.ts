/**
 * Lógica de negocio pura (sin React ni red): fácil de testear y reutilizable.
 */
import type { CargaNafta, Mecanico, Otro, Service } from "./schema";
import { toDate, toISODate } from "./parse";

const MS_POR_DIA = 86_400_000;

export interface LecturaKm {
  fecha: string;
  km: number;
}

/** Ordena cargas por km (y fecha como desempate). El km es más confiable que la fecha para el orden físico. */
export function ordenarPorKm(cargas: CargaNafta[]): CargaNafta[] {
  return [...cargas]
    .filter((c) => c.km_actual > 0)
    .sort((a, b) => a.km_actual - b.km_actual || a.fecha.localeCompare(b.fecha));
}

export function ordenarPorFechaDesc<T extends { fecha: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => b.fecha.localeCompare(a.fecha));
}

// ---------------------------------------------------------------- Nafta

export interface Intervalo {
  fecha: string;
  km: number;
  kmRecorridos: number;
  litros: number;
  kmPorLitro: number;
}

/**
 * Rendimiento entre cargas (método "tanque lleno"):
 * los km recorridos desde la carga anterior se hicieron con los litros que se reponen en esta carga.
 *   kmPorLitro = (km_actual[i] - km_actual[i-1]) / litros[i]
 */
export function intervalosDeCarga(cargas: CargaNafta[]): Intervalo[] {
  const ordenadas = ordenarPorKm(cargas);
  const out: Intervalo[] = [];
  for (let i = 1; i < ordenadas.length; i++) {
    const km = ordenadas[i].km_actual - ordenadas[i - 1].km_actual;
    const litros = ordenadas[i].litros;
    if (km > 0 && litros > 0) {
      out.push({ fecha: ordenadas[i].fecha, km: ordenadas[i].km_actual, kmRecorridos: km, litros, kmPorLitro: km / litros });
    }
  }
  return out;
}

export interface ResumenNafta {
  ultimaCarga: CargaNafta | null;
  precioPorLitro: number | null;
  lugar: string | null;
  kmPorLitroUltimo: number | null;
  kmPorLitroPromedio: number | null;
  autonomiaUltimaKm: number | null; // km/l última × capacidad del tanque
  autonomiaPromedioKm: number | null;
  costoPorKm: number | null;
  kmTotales: number;
  gastoTotal: number;
}

export function resumenNafta(cargas: CargaNafta[], capacidadTanque: number): ResumenNafta {
  const ordenadas = ordenarPorKm(cargas);
  const ultima = ordenadas.at(-1) ?? null;
  const intervalos = intervalosDeCarga(cargas);
  const ultimoIntervalo = intervalos.at(-1) ?? null;

  // Promedio ponderado: km totales / litros totales (más estable que promediar cocientes)
  const kmInt = intervalos.reduce((s, i) => s + i.kmRecorridos, 0);
  const litrosInt = intervalos.reduce((s, i) => s + i.litros, 0);
  const kmPorLitroPromedio = litrosInt > 0 ? kmInt / litrosInt : null;
  const kmPorLitroUltimo = ultimoIntervalo?.kmPorLitro ?? null;

  // Gasto por km: la nafta de la 1ª carga se consume después, así que se excluye su precio
  const kmTotales = ordenadas.length > 1 ? ordenadas.at(-1)!.km_actual - ordenadas[0].km_actual : 0;
  const gastoIntervalos = ordenadas.slice(1).reduce((s, c) => s + c.precio_total, 0);
  const costoPorKm = kmTotales > 0 ? gastoIntervalos / kmTotales : null;

  const cap = capacidadTanque > 0 ? capacidadTanque : null;
  return {
    ultimaCarga: ultima,
    precioPorLitro: ultima && ultima.litros > 0 ? ultima.precio_total / ultima.litros : null,
    lugar: ultima?.lugar || null,
    kmPorLitroUltimo,
    kmPorLitroPromedio,
    autonomiaUltimaKm: kmPorLitroUltimo && cap ? kmPorLitroUltimo * cap : null,
    autonomiaPromedioKm: kmPorLitroPromedio && cap ? kmPorLitroPromedio * cap : null,
    costoPorKm,
    kmTotales,
    gastoTotal: cargas.reduce((s, c) => s + c.precio_total, 0),
  };
}

// ---------------------------------------------------------------- Kilometraje

/** Junta todas las lecturas de odómetro disponibles (nafta, service, mecánico). */
export function lecturasKm(
  cargas: CargaNafta[],
  services: Service[] = [],
  mecanicos: Mecanico[] = [],
): LecturaKm[] {
  return [
    ...cargas.map((c) => ({ fecha: c.fecha, km: c.km_actual })),
    ...services.map((s) => ({ fecha: s.fecha, km: s.km_actual })),
    ...mecanicos.map((m) => ({ fecha: m.fecha, km: m.km_actual })),
  ]
    .filter((l) => l.fecha && l.km > 0)
    .sort((a, b) => a.fecha.localeCompare(b.fecha) || a.km - b.km);
}

/** Km actual del auto: el de la última carga de nafta; si no hay, la última lectura conocida. */
export function kmActual(cargas: CargaNafta[], lecturas: LecturaKm[] = []): number | null {
  const ultima = ordenarPorKm(cargas).at(-1);
  if (ultima) return ultima.km_actual;
  const maxLectura = Math.max(0, ...lecturas.map((l) => l.km));
  return maxLectura > 0 ? maxLectura : null;
}

/**
 * Promedio de km por día.
 * Usa la ventana de los últimos `ventanaDias` si tiene al menos 2 lecturas (refleja el uso reciente);
 * si no, todo el historial.
 */
export function kmPorDia(lecturas: LecturaKm[], ventanaDias = 180): number | null {
  if (lecturas.length < 2) return null;
  const ultima = lecturas.at(-1)!;
  const desde = toDate(ultima.fecha).getTime() - ventanaDias * MS_POR_DIA;
  const recientes = lecturas.filter((l) => toDate(l.fecha).getTime() >= desde);
  const serie = recientes.length >= 2 ? recientes : lecturas;

  const primera = serie[0];
  const dias = (toDate(ultima.fecha).getTime() - toDate(primera.fecha).getTime()) / MS_POR_DIA;
  const km = Math.max(...serie.map((l) => l.km)) - primera.km;
  if (dias < 1 || km <= 0) return null;
  return km / dias;
}

// ---------------------------------------------------------------- Service

export interface ProximoService {
  ultimoService: Service | null;
  kmObjetivo: number | null;
  kmRestantes: number | null;
  kmPorDia: number | null;
  fechaEstimada: string | null;
  diasRestantes: number | null; // negativo = vencido
  vencido: boolean;
}

/**
 * Proyecta la fecha del próximo service:
 *   fecha = fecha de la última lectura + (km_proximo_service − km de esa lectura) / km_por_día
 */
export function proximoService(
  services: Service[],
  lecturas: LecturaKm[],
  hoy: Date = new Date(),
): ProximoService {
  const ultimoService = ordenarPorFechaDesc(services)[0] ?? null;
  const kpd = kmPorDia(lecturas);
  const base = {
    ultimoService,
    kmObjetivo: ultimoService?.km_proximo_service || null,
    kmRestantes: null,
    kmPorDia: kpd,
    fechaEstimada: null,
    diasRestantes: null,
    vencido: false,
  };
  if (!ultimoService || !ultimoService.km_proximo_service) return base;

  const ultimaLectura = [...lecturas].sort((a, b) => a.km - b.km).at(-1);
  const kmAct = ultimaLectura?.km ?? ultimoService.km_actual;
  const kmRestantes = ultimoService.km_proximo_service - kmAct;
  if (kmRestantes <= 0) {
    return { ...base, kmRestantes, diasRestantes: 0, fechaEstimada: toISODate(hoy), vencido: true };
  }
  if (!kpd || !ultimaLectura) return { ...base, kmRestantes };

  const fechaEst = new Date(toDate(ultimaLectura.fecha).getTime() + (kmRestantes / kpd) * MS_POR_DIA);
  const hoy0 = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  const diasRestantes = Math.ceil((fechaEst.getTime() - hoy0.getTime()) / MS_POR_DIA);
  return {
    ...base,
    kmRestantes,
    fechaEstimada: toISODate(fechaEst),
    diasRestantes,
    vencido: diasRestantes < 0,
  };
}

// ---------------------------------------------------------------- Mecánico

export interface DesgastePieza {
  categoria: string;
  vidaUtilKm: number;
  ultimoCambio: Mecanico | null;
  kmUso: number | null;
  porcentaje: number | null; // 0–100+
}

/** km de uso = km actual del auto (última carga de nafta) − km en que se cambió la pieza. */
export function desgastePiezas(
  mecanicos: Mecanico[],
  kmAct: number | null,
  piezas: { categoria: string; vidaUtilKm: number }[],
): DesgastePieza[] {
  return piezas.map(({ categoria, vidaUtilKm }) => {
    const cambios = mecanicos
      .filter((m) => m.categoria.toLowerCase() === categoria.toLowerCase() && m.km_actual > 0)
      .sort((a, b) => b.km_actual - a.km_actual);
    const ultimoCambio = cambios[0] ?? null;
    const kmUso = ultimoCambio && kmAct !== null ? Math.max(0, kmAct - ultimoCambio.km_actual) : null;
    return {
      categoria,
      vidaUtilKm,
      ultimoCambio,
      kmUso,
      porcentaje: kmUso !== null ? (kmUso / vidaUtilKm) * 100 : null,
    };
  });
}

// ---------------------------------------------------------------- Agregaciones

export function totalesPorCategoria(items: { categoria: string; precio: number }[]) {
  const map = new Map<string, number>();
  for (const it of items) {
    const cat = it.categoria || "Sin categoría";
    map.set(cat, (map.get(cat) ?? 0) + it.precio);
  }
  return [...map.entries()]
    .map(([categoria, total]) => ({ categoria, total }))
    .sort((a, b) => b.total - a.total);
}

/** Gasto de nafta agrupado por mes ("2026-09"). */
export function gastoNaftaPorMes(cargas: CargaNafta[]) {
  const map = new Map<string, { total: number; litros: number }>();
  for (const c of cargas) {
    if (!c.fecha) continue;
    const mes = c.fecha.slice(0, 7);
    const acc = map.get(mes) ?? { total: 0, litros: 0 };
    acc.total += c.precio_total;
    acc.litros += c.litros;
    map.set(mes, acc);
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([mes, v]) => ({ mes, ...v }));
}

/** Suma de todos los módulos para un mes "yyyy-mm". */
export function gastoDelMes(
  mes: string,
  data: { nafta: CargaNafta[]; service: Service[]; mecanico: Mecanico[]; otros: Otro[] },
) {
  const enMes = (f: string) => f.startsWith(mes);
  const nafta = data.nafta.filter((x) => enMes(x.fecha)).reduce((s, x) => s + x.precio_total, 0);
  const service = data.service.filter((x) => enMes(x.fecha)).reduce((s, x) => s + x.costo, 0);
  const mecanico = data.mecanico.filter((x) => enMes(x.fecha)).reduce((s, x) => s + x.precio, 0);
  const otros = data.otros.filter((x) => enMes(x.fecha)).reduce((s, x) => s + x.precio, 0);
  return { nafta, service, mecanico, otros, total: nafta + service + mecanico + otros };
}
