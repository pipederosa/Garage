/**
 * /api/nafta
 *   GET  ?id_auto=abc123  → historial de cargas del auto
 *   POST { id_auto, fecha, litros, lugar, tipo_nafta, km_actual, precio_total } → nueva carga
 *
 * Escrito "a mano" como ejemplo; Service/Mecánico/Otros usan la fábrica createSheetHandlers.
 */
import { NextResponse, type NextRequest } from "next/server";
import { appendRow, readRows } from "@/lib/googleSheets";
import { errorResponse, validateRecord } from "@/lib/api";

export const dynamic = "force-dynamic"; // siempre leer datos frescos de Sheets

export async function GET(req: NextRequest) {
  try {
    const idAuto = req.nextUrl.searchParams.get("id_auto");
    if (!idAuto) {
      return NextResponse.json({ error: "Falta el parámetro id_auto" }, { status: 400 });
    }
    const cargas = await readRows("nafta", idAuto);
    return NextResponse.json(cargas);
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Record<string, unknown>;
    const result = validateRecord("nafta", body);
    if (!result.ok) return NextResponse.json({ errors: result.errors }, { status: 400 });

    const carga = result.record;

    // Regla de negocio: el odómetro no puede ir para atrás respecto de la última carga
    const previas = await readRows("nafta", carga.id_auto);
    const kmMax = Math.max(0, ...previas.map((c) => c.km_actual));
    if (carga.km_actual < kmMax) {
      return NextResponse.json(
        { errors: [`El km ingresado (${carga.km_actual}) es menor al de la última carga (${kmMax})`] },
        { status: 400 },
      );
    }

    const creada = await appendRow("nafta", carga);
    return NextResponse.json(creada, { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
}
