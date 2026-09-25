/**
 * Conexión a Google Sheets. SÓLO se importa desde API Routes (servidor):
 * las credenciales nunca llegan al navegador.
 */
import { GoogleSpreadsheet, type GoogleSpreadsheetWorksheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";
import { COLUMNS, ID_COLUMN, SHEET_NAMES, type SheetKey, type SheetRowMap } from "./schema";
import { parseDate, parseNumber } from "./parse";

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

function getEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Falta la variable de entorno ${name}`);
  return value;
}

// Cacheamos el documento entre requests del mismo proceso (evita re-autenticar cada vez).
let docPromise: Promise<GoogleSpreadsheet> | null = null;

export function getDoc(): Promise<GoogleSpreadsheet> {
  if (!docPromise) {
    docPromise = (async () => {
      const auth = new JWT({
        email: getEnv("GOOGLE_SERVICE_ACCOUNT_EMAIL"),
        // En .env la clave viene con "\n" literales: los convertimos en saltos de línea reales
        key: getEnv("GOOGLE_PRIVATE_KEY").replace(/\\n/g, "\n"),
        scopes: SCOPES,
      });
      const doc = new GoogleSpreadsheet(getEnv("GOOGLE_SHEET_ID"), auth);
      await doc.loadInfo();
      return doc;
    })().catch((err) => {
      docPromise = null; // permite reintentar en el próximo request
      throw err;
    });
  }
  return docPromise;
}

async function getSheet(key: SheetKey): Promise<GoogleSpreadsheetWorksheet> {
  const doc = await getDoc();
  const title = SHEET_NAMES[key];
  const sheet = doc.sheetsByTitle[title];
  if (!sheet) throw new Error(`No existe la pestaña "${title}" en el documento`);
  return sheet;
}

/** Convierte un objeto crudo (strings de Sheets o JSON del cliente) al tipo de dominio. */
export function normalizeRecord<K extends SheetKey>(
  key: K,
  raw: Record<string, unknown>,
): SheetRowMap[K] {
  const out: Record<string, string | number> = {};
  for (const [col, def] of Object.entries(COLUMNS[key])) {
    const v = raw[col];
    if (def.type === "number") out[col] = parseNumber(v);
    else if (def.type === "date") out[col] = parseDate(v);
    else out[col] = v === undefined || v === null ? "" : String(v).trim();
  }
  return out as unknown as SheetRowMap[K];
}

/** Lee todas las filas de una pestaña, opcionalmente filtradas por auto. */
export async function readRows<K extends SheetKey>(
  key: K,
  idAuto?: string,
): Promise<SheetRowMap[K][]> {
  const sheet = await getSheet(key);
  const rows = await sheet.getRows();
  return rows
    .map((row) => normalizeRecord(key, row.toObject()))
    .filter((r) => r[ID_COLUMN[key] as keyof typeof r]) // descarta filas vacías
    .filter((r) => !idAuto || (r as { id_auto: string }).id_auto === idAuto);
}

/** Agrega una fila al final de la pestaña. El registro ya debe venir validado. */
export async function appendRow<K extends SheetKey>(
  key: K,
  record: SheetRowMap[K],
): Promise<SheetRowMap[K]> {
  const sheet = await getSheet(key);
  await sheet.addRow(record as unknown as Record<string, string | number>);
  return record;
}
