/**
 * /api/autos
 *   GET  → lista de autos
 *   POST { marca_modelo, patente, capacidad_tanque_litros } → alta de auto (id_auto se genera solo)
 */
import { NextResponse, type NextRequest } from "next/server";
import { appendRow, readRows } from "@/lib/googleSheets";
import { errorResponse, validateRecord } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const autos = await readRows("autos");
    return NextResponse.json(autos);
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Record<string, unknown>;
    if (typeof body.patente === "string") body.patente = body.patente.toUpperCase().replace(/\s+/g, "");

    const result = validateRecord("autos", body);
    if (!result.ok) return NextResponse.json({ errors: result.errors }, { status: 400 });

    const existentes = await readRows("autos");
    if (existentes.some((a) => a.patente === result.record.patente)) {
      return NextResponse.json({ errors: ["Ya existe un auto con esa patente"] }, { status: 409 });
    }

    return NextResponse.json(await appendRow("autos", result.record), { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
}
