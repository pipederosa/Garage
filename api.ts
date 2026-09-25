/**
 * Helpers compartidos por las API Routes: validación y respuestas de error.
 */
import { NextResponse, type NextRequest } from "next/server";
import { appendRow, normalizeRecord, readRows } from "./googleSheets";
import { COLUMNS, ID_COLUMN, type SheetKey, type SheetRowMap } from "./schema";

type ValidationResult<K extends SheetKey> =
  | { ok: true; record: SheetRowMap[K] }
  | { ok: false; errors: string[] };

export function validateRecord<K extends SheetKey>(
  key: K,
  body: Record<string, unknown>,
): ValidationResult<K> {
  const errors: string[] = [];
  const idCol = ID_COLUMN[key];
  const withId = { ...body, [idCol]: body[idCol] || crypto.randomUUID().slice(0, 8) };
  const record = normalizeRecord(key, withId);
  const values = record as unknown as Record<string, string | number>;

  for (const [col, def] of Object.entries(COLUMNS[key])) {
    const raw = body[col];
    const missing = raw === undefined || raw === null || String(raw).trim() === "";
    if (def.required && missing) errors.push(`El campo "${col}" es obligatorio`);
    if (!missing && def.type === "date" && !values[col]) errors.push(`"${col}" no es una fecha válida`);
    if (!missing && def.type === "number" && (values[col] as number) < 0)
      errors.push(`"${col}" no puede ser negativo`);
  }
  return errors.length ? { ok: false, errors } : { ok: true, record };
}

export function errorResponse(err: unknown) {
  const message = err instanceof Error ? err.message : "Error inesperado";
  console.error("[API]", message);
  return NextResponse.json({ error: message }, { status: 500 });
}

/**
 * Fábrica de handlers GET/POST para una pestaña.
 * GET  /api/<modulo>?id_auto=XXX → filas del auto
 * POST /api/<modulo>              → agrega una fila (body JSON)
 */
export function createSheetHandlers<K extends SheetKey>(key: K) {
  async function GET(req: NextRequest) {
    try {
      const idAuto = req.nextUrl.searchParams.get("id_auto") ?? undefined;
      return NextResponse.json(await readRows(key, idAuto));
    } catch (err) {
      return errorResponse(err);
    }
  }

  async function POST(req: NextRequest) {
    try {
      const body = (await req.json()) as Record<string, unknown>;
      const result = validateRecord(key, body);
      if (!result.ok) return NextResponse.json({ errors: result.errors }, { status: 400 });
      return NextResponse.json(await appendRow(key, result.record), { status: 201 });
    } catch (err) {
      return errorResponse(err);
    }
  }

  return { GET, POST };
}
