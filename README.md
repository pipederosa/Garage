# Garage · Gastos y mantenimiento de autos

Next.js 16 (App Router) + TypeScript + Tailwind CSS 4 + Recharts, con **Google Sheets como base de datos**
vía `google-spreadsheet` en API Routes (las credenciales nunca llegan al navegador).

## Arquitectura

```
garage-app/
├── app/
│   ├── layout.tsx              # Layout: Sidebar + Header (selector de auto) + AutoProvider
│   ├── globals.css             # Tailwind v4
│   ├── page.tsx                # Dashboard (KPIs + 3 gráficos)
│   ├── nafta/page.tsx          # Cargas, autonomía, $/km
│   ├── service/page.tsx        # Historial + predicción del próximo service
│   ├── mecanico/page.tsx       # Arreglos + desgaste de piezas
│   ├── otros/page.tsx          # Seguro, VTV, peajes… + totales por categoría
│   ├── autos/page.tsx          # Alta de autos
│   └── api/
│       ├── autos/route.ts      # GET / POST (escrito a mano, ejemplo)
│       ├── nafta/route.ts      # GET / POST (escrito a mano, valida odómetro)
│       ├── service/route.ts    # GET / POST vía createSheetHandlers()
│       ├── mecanico/route.ts   #   〃
│       └── otros/route.ts      #   〃
├── components/
│   ├── Header.tsx, Sidebar.tsx, AutoSelector.tsx
│   ├── Charts.tsx              # Recharts: línea nafta/mes, línea km, barras por categoría
│   ├── DataTable.tsx           # Tabla genérica tipada
│   ├── RecordForm.tsx          # Formulario definido por configuración
│   └── ui.tsx                  # Card, StatCard, Alert, PageHeader, RequireAuto
├── context/AutoContext.tsx     # Auto activo global (persistido en localStorage)
├── hooks/
│   ├── useSheetData.ts         # fetch por módulo + createRecord()
│   └── useDatosAuto.ts         # los 4 módulos del auto activo
└── lib/
    ├── googleSheets.ts         # Conexión (JWT Service Account), readRows(), appendRow()  ← sólo servidor
    ├── api.ts                  # Validación + fábrica de handlers GET/POST
    ├── schema.ts               # Pestañas, columnas y tipos
    ├── calculations.ts         # Toda la matemática (pura, testeable)
    ├── parse.ts                # Números "$ 45.000,50" y fechas "25/9/2026" → tipos reales
    ├── format.ts               # Formato es-AR
    └── constants.ts            # Categorías y vida útil de piezas (editable)
```

Flujo: página (cliente) → `fetch('/api/nafta?id_auto=…')` → API Route → `lib/googleSheets.ts` → Google Sheets.
Todos los cálculos se hacen en el cliente con `lib/calculations.ts` sobre las filas ya filtradas por auto.

## 1. Preparar Google Sheets

1. Creá un documento con 5 pestañas y estos encabezados **exactos** en la fila 1:

| Pestaña    | Columnas |
|------------|----------|
| `Autos`    | `id_auto, marca_modelo, patente, capacidad_tanque_litros` |
| `Nafta`    | `id, id_auto, fecha, litros, lugar, tipo_nafta, km_actual, precio_total` |
| `Service`  | `id, id_auto, fecha, detalle, km_actual, km_proximo_service, costo` |
| `Mecanico` | `id, id_auto, fecha, categoria, detalle_marca, precio, km_actual` |
| `Otros`    | `id, id_auto, fecha, categoria, detalle, precio` |

2. En [Google Cloud Console](https://console.cloud.google.com/): creá un proyecto → habilitá **Google Sheets API** →
   *IAM y administración → Cuentas de servicio* → crear cuenta → pestaña *Claves* → *Agregar clave → JSON*.
3. **Compartí la planilla** con el `client_email` de la cuenta de servicio, con permiso de **Editor**.

## 2. Variables de entorno

Copiá `.env.example` a `.env.local`:

| Variable | De dónde sale |
|---|---|
| `GOOGLE_SHEET_ID` | La URL de la planilla: `docs.google.com/spreadsheets/d/`**`<ID>`**`/edit` |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Campo `client_email` del JSON |
| `GOOGLE_PRIVATE_KEY` | Campo `private_key` del JSON, **entre comillas dobles** y con los `\n` literales |

No llevan prefijo `NEXT_PUBLIC_`, así que sólo existen en el servidor. `.env.local` ya está en `.gitignore`.
En Vercel/Netlify cargalas en *Environment Variables* (la clave privada se pega tal cual, con los `\n`).

> GitHub Pages no sirve: las API Routes necesitan un servidor. Usá **Vercel** (recomendado para Next.js) o Netlify.

## 3. Correr

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # build de producción
```

## Cálculos

- **Rendimiento (km/L)** — método tanque lleno: `(km[i] − km[i−1]) / litros[i]`. Las cargas se ordenan por km.
- **Autonomía** — `km/L × capacidad_tanque_litros`. "Última" usa el último intervalo; "promedio" usa `Σkm / Σlitros`.
- **Gasto por km** — `Σ precio (sin la 1ª carga) / (km último − km primero)`; la nafta de la 1ª carga se consume después.
- **Km por día** — lecturas de odómetro de nafta + service + mecánico en los últimos 180 días (o todo el historial si hay < 2).
- **Próximo service** — `fecha última lectura + (km_proximo_service del último service − km actual) / km_por_día`.
- **Desgaste de piezas** — `km actual (última carga de nafta) − km del último cambio de esa categoría`, contra una vida útil de referencia en `lib/constants.ts`.

Para que la autonomía sea precisa, cargá siempre con tanque lleno.

## Notas

- Los números y fechas se aceptan en formato argentino (`45.000,50`, `25/9/2026`) si los editás a mano en Sheets.
- `id`/`id_auto` se generan en el servidor si no vienen en el POST.
- Google Sheets tiene cuota de ~60 lecturas/min por usuario: sobra para uso personal.
