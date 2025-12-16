# 🚀 Plan de Migración - FASES 6-11

**Proyecto:** Precio Luz Hoy - Migración de Legacy (React+Vite) a Project (Next.js 14 App Router)  
**Fecha:** 16 Diciembre 2025  
**Estado Actual:** ✅ Fase 1-5 completadas (PriceChart con datos mock)  
**Estrategia:** Server Components first + Client hooks para updates

---

## 📊 ESTADO ACTUAL

### ✅ Completado (Fases 1-5):

- **Infraestructura:** Next.js 14 + App Router + TailNext template
- **Componente PriceChart:** Migrado (5 archivos, 269 líneas)
- **Widget ElectricityPrices:** Integrado en homepage
- **Datos:** Mock data (24h) en `precios.data.tsx`
- **Testing:** Smoke tests pasados (200 OK)

### 📦 En Project ahora:

```
frontend-nextjs/
├─ app/(pages)/
│  ├─ test-grafico/page.tsx     # Testing del gráfico ✅
│  └─ demo-home/page.tsx         # Demo integración ✅
├─ src/
│  ├─ components/precios/price-chart/  # 5 componentes migrados ✅
│  ├─ shared/types/precios.d.ts        # Tipos TypeScript ✅
│  └─ shared/data/pages/precios.data.tsx  # Mock data ✅
```

### ❌ Falta migrar de Legacy:

```
frontend/ (Legacy - React+Vite)
├─ src/features/prices/
│  ├─ hooks.js              # usePricesByDate, polling logic
│  ├─ contracts.js          # API endpoints, fetch wrapper
│  ├─ metrics.js            # computeMetrics (min, max, best2h)
│  └─ types.js              # JSDoc types
├─ src/lib/
│  ├─ utils.js              # Date utils, formatters
│  ├─ logger.js             # Log wrapper
│  └─ date-utils.js         # dayjs timezone logic
├─ src/components/
│  ├─ min-price-card.jsx
│  ├─ best2h-card.jsx
│  ├─ mejor-tramo.jsx
│  ├─ consumption-calculator.jsx
│  └─ date-picker*.jsx
└─ API Backend: https://api.precioluzhoy.app
```

---

## 🎯 FASE 6: API LAYER Y SERVICIOS (PRÓXIMA)

**Duración estimada:** 2-3 horas  
**Prioridad:** 🔴 CRÍTICA (bloquea todo lo demás)  
**Objetivo:** Conectar con API real, reemplazar mock data

### **Análisis del Legacy API Client:**

#### **Arquitectura Actual (Legacy):**

```javascript
// 1. Contracts (endpoints y config)
src/features/prices/contracts.js
├─ API_BASE = import.meta.env.VITE_API_BASE_URL || '/api'
├─ HTTP_TIMEOUT_MS = 8000
├─ endpoints.byDate(date) → URL con query param
└─ timedFetch() → mide latencia

// 2. Fetch Logic con Retry
src/features/prices/hooks.js
├─ fetchWithBackoff() → max 3 reintentos
│  ├─ Retry en: 429, 408, network errors
│  ├─ Respeta Retry-After header
│  └─ Backoff exponencial: 1s, 2s, 4s, 8s
├─ getByDate(date) → wrapper público
└─ usePricesByDate(date) → hook React
   ├─ Estado: {loading, error, data, meta, info, policy}
   ├─ Polling para días incompletos (cada 15s)
   ├─ Normalización de items (€/kWh)
   ├─ Compute metrics (min, max, best2h, currentHour)
   └─ Parse headers (X-Completeness, X-Cache-Policy)

// 3. Metrics Computation
src/features/prices/metrics.js
├─ computeMetrics(items, date)
│  ├─ min, max prices
│  ├─ currentHourIndex (si es hoy)
│  ├─ best2h window (2h consecutivas más baratas)
│  └─ bestWindow (configurable, ej. 8h)
```

#### **Headers del Backend:**

```
X-Completeness: "24/24"  # count/24
X-Cache-Policy: "stale-while-revalidate=86400,stale-if-error=604800"
Retry-After: 15  # seconds (en caso de 429)
```

#### **Endpoints:**

```
GET /api/prices?date=YYYY-MM-DD
Response: {
  date: "2025-12-16",
  count: 24,  # puede ser 0, 23, 24, 25 (DST)
  data: [
    {
      date: "2025-12-16T00:00:00.000Z",
      hourIndex: 0,
      datetimeUtc: "2025-12-16T00:00:00.000Z",
      priceEurKwh: 0.12456,
      zone: "PENINSULA",
      source: "ESIOS"
    },
    // ... hasta hourIndex 23
  ]
}
```

---

### **Plan de Implementación FASE 6:**

#### **6.1) Crear API Client Base (45 min)**

**Archivo:** `src/lib/api/client.ts`

```typescript
// Estrategia: fetch nativo + Next.js cache
// NO usar SWR/React Query por ahora (Next.js 14 cache es suficiente)

Funcionalidades:
├─ getBaseUrl() → process.env.NEXT_PUBLIC_API_URL
├─ fetchWithRetry() → retry logic (429, timeout, network)
├─ fetchJson<T>() → generic wrapper con timeout
└─ Error types: ApiError, TimeoutError, NetworkError
```

**Variables de entorno:**

```bash
# .env.local (desarrollo)
NEXT_PUBLIC_API_URL=https://api.precioluzhoy.app

# .env.production
NEXT_PUBLIC_API_URL=https://api.precioluzhoy.app
```

**Características:**

- ✅ Retry con backoff exponencial (1s, 2s, 4s, max 8s)
- ✅ Respeta `Retry-After` header en 429
- ✅ Timeout configurable (default 8000ms)
- ✅ Logs de latencia y errores
- ✅ TypeScript strict mode
- ✅ AbortController para cancelación

---

#### **6.2) Crear Servicio de Precios (45 min)**

**Archivo:** `src/lib/api/precios-api.ts`

```typescript
// Funciones para fetch de precios con cache strategy

Funciones principales:
├─ getPricesByDate(date: string, options?)
│  ├─ Fetch con cache Next.js
│  ├─ revalidate según fecha:
│  │  ├─ Hoy: 300 (5 min) - datos cambian hasta 20:30
│  │  ├─ Mañana: 0 (sin cache) - pueden aparecer a las 20:15
│  │  └─ Pasado: 86400 (1 día) - datos estáticos
│  ├─ Parse X-Completeness header
│  └─ Normalizar items (garantizar €/kWh)
│
├─ getPricesToday()
│  └─ Helper que calcula fecha en Europe/Madrid
│
└─ getPricesTomorrow()
   └─ Helper que calcula mañana en Europe/Madrid
```

**Cache Strategy (Next.js 14):**

```typescript
// Hoy (datos cambian hasta 20:30 CET)
fetch(url, { next: { revalidate: 300 } }); // 5 min

// Mañana (pueden aparecer a las 20:15 CET)
fetch(url, { next: { revalidate: 0 } }); // No cache, siempre fresh

// Pasado (datos estáticos)
fetch(url, { next: { revalidate: 86400 } }); // 1 día
```

**Response Types:**

```typescript
interface PriceItem {
  date: string; // ISO date
  hourIndex: number; // 0-23
  datetimeUtc: string; // ISO datetime
  priceEurKwh: number;
  zone: string;
  source: string;
}

interface PricesResponse {
  date: string; // YYYY-MM-DD
  count: number; // 0, 23, 24, 25
  data: PriceItem[];
}

interface PricesMeta {
  min: number;
  max: number;
  count: number;
  incomplete: boolean;
  currentHourIndex?: number; // si es hoy
  best2h?: { startIndex: number; mean: number };
  bestWindow?: { startIndex: number; duration: number; mean: number };
}
```

---

#### **6.3) Migrar Metrics Computation (30 min)**

**Archivo:** `src/lib/precios/metrics.ts`

```typescript
// Portar desde Legacy: src/features/prices/metrics.js

Funciones:
├─ computeMetrics(items: PriceItem[], date?: string): PricesMeta
│  ├─ Calcula min, max
│  ├─ Detecta currentHourIndex (si date === today)
│  ├─ Calcula best2h (ventana de 2h más barata)
│  └─ Calcula bestWindow (configurable, ej. 8h)
│
├─ findBest2Hours(items: PriceItem[]): Best2hWindow
├─ findBestWindow(items: PriceItem[], duration: number): BestWindow
└─ isToday(date: string): boolean  # compara con Madrid timezone
```

**Algoritmo Best 2h (del Legacy):**

```typescript
// Encuentra ventana de 2 horas consecutivas con menor precio promedio
// Maneja DST (23/25 horas)
// Devuelve: { startIndex, mean }
```

---

#### **6.4) Crear Hooks para Client Components (45 min)**

**Archivo:** `src/hooks/usePriceData.ts`

```typescript
// Hook para Client Components que necesitan actualizaciones

'use client';

Hooks:
├─ usePriceData(date: string)
│  ├─ Estado: {data, loading, error, meta}
│  ├─ useEffect para fetch inicial
│  ├─ Polling si data.count < 24 (cada 15s)
│  └─ Cleanup en unmount
│
├─ usePricesToday()
│  └─ Wrapper con fecha calculada en cliente
│
└─ usePricesTomorrow()
   └─ Wrapper con mañana calculada en cliente
```

**Estrategia de Polling:**

```typescript
// Si count < 24 y es hoy/mañana → polling cada 15s
// Si count === 24 o fecha pasada → stop polling
// Usar visibility API para pausar en background
```

---

### **Estructura de Archivos FASE 6:**

```
src/
├─ lib/
│  ├─ api/
│  │  ├─ client.ts              # Fetch base con retry ✨
│  │  ├─ precios-api.ts         # Funciones de fetch precios ✨
│  │  └─ types.ts               # Response types ✨
│  │
│  └─ precios/
│     ├─ metrics.ts             # Compute min/max/best2h ✨
│     ├─ date-utils.ts          # Date helpers (Madrid TZ) ✨
│     └─ formatters.ts          # formatPrice, formatHour ✨
│
└─ hooks/
   └─ usePriceData.ts           # Client hook con polling ✨
```

**✨ = Archivos nuevos a crear**

---

### **Testing Plan FASE 6:**

#### **Test 1: API Client**

```typescript
// Manual test en test-grafico page
1. Reemplazar mock por API real
2. Verificar fetch exitoso
3. Verificar retry en errores
4. Verificar timeout
```

#### **Test 2: Cache Strategy**

```typescript
// Verificar headers de cache Next.js
1. Hoy → Cache-Control: s-maxage=300
2. Mañana → Cache-Control: no-cache
3. Pasado → Cache-Control: s-maxage=86400
```

#### **Test 3: Metrics**

```typescript
// Verificar cálculos correctos
1. Min/Max prices
2. Best 2h window
3. CurrentHourIndex detection
```

#### **Test 4: Polling Hook**

```typescript
// Verificar polling en días incompletos
1. Si count < 24 → polling activo
2. Si count === 24 → polling stop
3. Cleanup en unmount
```

---

### **Decisiones de Arquitectura FASE 6:**

#### **✅ Decisiones Tomadas:**

1. **Fetching:** fetch nativo + Next.js cache (NO SWR/React Query)
   - **Razón:** Next.js 14 tiene cache nativo muy potente
   - **Ventaja:** Menos dependencias, mejor integración

2. **Server Components para initial load**
   - **Razón:** Mejor SEO, menos JS al cliente
   - **Uso:** Páginas `/precios/[fecha]`, homepage

3. **Client hooks solo para actualizaciones**
   - **Razón:** Polling en días incompletos
   - **Uso:** Días con count < 24, real-time updates

4. **Cache dinámico por fecha:**
   - Hoy: 5 min (revalidate: 300)
   - Mañana: sin cache (revalidate: 0)
   - Pasado: 1 día (revalidate: 86400)

5. **Sin estado global inicial**
   - **Razón:** Props drilling suficiente por ahora
   - **Futuro:** Zustand si crece complejidad

6. **Retry con backoff exponencial**
   - **Razón:** API puede tener rate limits
   - **Config:** 3 reintentos, 1s → 2s → 4s → 8s max

#### **❓ Decisiones Pendientes:**

- [ ] **Error boundaries:** ¿Dónde colocar? (probablemente layout.tsx)
- [ ] **Loading UI:** ¿Skeletons o Suspense? (Suspense recomendado)
- [ ] **Logs:** ¿Mantener console.log o usar servicio? (console por ahora)

---

## 🎯 FASE 7: CONECTAR DATOS REALES

**Duración estimada:** 1-2 horas  
**Dependencia:** FASE 6 completada  
**Objetivo:** Reemplazar mock data por API calls reales

### **Plan FASE 7:**

#### **7.1) Actualizar PriceChartView (30 min)**

**Cambios en:** `app/(pages)/test-grafico/page.tsx`

```typescript
// ANTES (mock):
import { mockPriceDataRaw } from '~/shared/data/pages/precios.data';

// DESPUÉS (real):
import { getPricesToday } from '~/lib/api/precios-api';

// Server Component
export default async function TestGraficoPage() {
  const response = await getPricesToday();
  const meta = computeMetrics(response.data, response.date);

  return (
    <PriceChartView
      data={response.data}
      min={meta.min}
      max={meta.max}
      currentHourIndex={meta.currentHourIndex}
      activeDate={response.date}
    />
  );
}
```

#### **7.2) Actualizar ElectricityPrices Widget (30 min)**

**Cambios en:** `src/components/widgets/ElectricityPrices.tsx`

```typescript
// Convertir a Client Component (necesita polling)
'use client';

import { usePriceData } from '~/hooks/usePriceData';

export default function ElectricityPrices() {
  const { data, loading, error, meta } = usePriceData('today');

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorState error={error} />;

  return (
    <PriceChartView
      data={data.data}
      min={meta.min}
      max={meta.max}
      currentHourIndex={meta.currentHourIndex}
    />
  );
}
```

#### **7.3) Añadir Loading States (30 min)**

**Componentes:**

- `LoadingSkeleton.tsx` - Skeleton del gráfico
- `ErrorBoundary.tsx` - Error handling
- `ErrorState.tsx` - UI de error

**Usar Suspense:**

```typescript
// app/(pages)/test-grafico/page.tsx
import { Suspense } from 'react';

export default function Page() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <PriceChartAsync />
    </Suspense>
  );
}
```

---

## 🎯 FASE 8: PÁGINAS DINÁMICAS

**Duración estimada:** 2-3 horas  
**Dependencia:** FASE 7 completada  
**Objetivo:** Rutas dinámicas con datos reales y SEO

### **Plan FASE 8:**

#### **8.1) Página de Precios por Fecha (1h)**

**Archivo:** `app/(pages)/precios/[fecha]/page.tsx`

```typescript
// Server Component con generateStaticParams

interface PageProps {
  params: { fecha: string };  // YYYY-MM-DD
}

export async function generateStaticParams() {
  // Generar últimos 30 días + hoy + mañana
  return generarUltimos30Dias();
}

export async function generateMetadata({ params }: PageProps) {
  const { fecha } = params;
  return {
    title: `Precio de la Luz ${fecha} | Precio Luz Hoy`,
    description: `Consulta el precio de la electricidad hora a hora para el día ${fecha}`,
    openGraph: { ... },
  };
}

export default async function PreciosPage({ params }: PageProps) {
  const response = await getPricesByDate(params.fecha);
  const meta = computeMetrics(response.data, response.date);

  return (
    <div>
      <h1>Precio de la Luz - {params.fecha}</h1>
      <PriceChartView data={response.data} meta={meta} />
      <PriceStats meta={meta} />
    </div>
  );
}
```

**ISR Config:**

```typescript
// Next.js 14 App Router
export const revalidate = calcularRevalidate(fecha);

function calcularRevalidate(fecha: string): number {
  const hoy = getTodayMadrid();
  if (fecha === hoy) return 300; // 5 min
  if (fecha > hoy) return 0; // mañana, no cache
  return 86400; // pasado, 1 día
}
```

#### **8.2) Página Principal /precios (45 min)**

**Archivo:** `app/(pages)/precios/page.tsx`

```typescript
// Redirect a /precios/[hoy]
import { getTodayMadrid } from '~/lib/precios/date-utils';
import { redirect } from 'next/navigation';

export default function PreciosIndexPage() {
  const hoy = getTodayMadrid();
  redirect(`/precios/${hoy}`);
}
```

#### **8.3) Navegación entre días (45 min)**

**Componente:** `DateNavigator.tsx`

```typescript
// Client Component
'use client';

export default function DateNavigator({
  currentDate,
  hasPrev,
  hasNext
}: Props) {
  return (
    <div className="flex gap-2">
      <Link href={`/precios/${prevDate}`}>← Anterior</Link>
      <DatePicker value={currentDate} />
      <Link href={`/precios/${nextDate}`}>Siguiente →</Link>
    </div>
  );
}
```

---

## 🎯 FASE 9: SISTEMA DE BLOG POSTS DIARIOS

**Duración estimada:** 3-4 horas  
**Dependencia:** FASE 8 completada  
**Objetivo:** Posts SEO-optimizados generados automáticamente

### **Plan FASE 9:**

#### **9.1) Estructura de Posts (1h)**

**Archivo:** `app/(pages)/blog/precio-luz-[fecha]/page.tsx`

```typescript
// Post diario con análisis automático

Contenido del post:
├─ Título SEO: "Precio de la Luz Hoy ${fecha} - Análisis y Mejores Horas"
├─ Meta description con min/max del día
├─ Open Graph image dinámica (generada)
├─ Structured data (Article schema)
├─ Contenido:
│  ├─ Resumen ejecutivo (precio min, max, media)
│  ├─ Gráfico interactivo
│  ├─ Análisis de franjas (mejor 2h, peor hora)
│  ├─ Comparación con ayer/semana pasada
│  └─ Recomendaciones (cuándo lavar, cargar coche)
```

**generateStaticParams:**

```typescript
// Generar posts de últimos 90 días + hoy + mañana
export async function generateStaticParams() {
  return generarUltimos90Dias().map((fecha) => ({
    fecha: `${fecha}`, // 2025-12-16
  }));
}
```

#### **9.2) Template de Post (1h)**

**Secciones automáticas:**

1. **Hero:** Precio destacado del día
2. **Stats Cards:** Min, Max, Media, Variación
3. **Gráfico:** PriceChartView interactivo
4. **Análisis:** Texto generado basado en datos
5. **Comparación:** Tabla con días anteriores
6. **Consejos:** Recomendaciones según precios
7. **Footer:** Última actualización, disclaimer

#### **9.3) Revalidación con GitHub Actions (1h)**

**Archivo:** `.github/workflows/revalidate-daily.yml`

```yaml
name: Revalidate Daily Posts
on:
  schedule:
    - cron: '35 20 * * *' # 20:35 CET (tras ingesta backend)
  workflow_dispatch:

jobs:
  revalidate:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger ISR Revalidation
        run: |
          # Llamar a Next.js revalidate API
          curl -X POST https://tu-app.vercel.app/api/revalidate \
            -H "Authorization: Bearer ${{ secrets.REVALIDATE_TOKEN }}" \
            -d '{"path": "/blog/precio-luz-*"}'
```

**API Route:** `app/api/revalidate/route.ts`

```typescript
import { revalidatePath } from 'next/cache';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const token = request.headers.get('authorization');
  if (token !== `Bearer ${process.env.REVALIDATE_TOKEN}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { path } = await request.json();
  revalidatePath(path);

  return Response.json({ revalidated: true, path });
}
```

---

## 🎯 FASE 10: COMPONENTES ADICIONALES

**Duración estimada:** 3-4 horas  
**Dependencia:** FASE 7 completada  
**Objetivo:** Migrar resto de componentes visuales

### **Componentes a Migrar:**

#### **10.1) MinPriceCard (30 min)**

```
Legacy: src/components/min-price-card.jsx
Project: src/components/precios/MinPriceCard.tsx

Muestra:
- Precio mínimo del día
- Hora en que ocurre
- Formato español (0,1234 €/kWh)
```

#### **10.2) Best2hCard (30 min)**

```
Legacy: src/components/best2h-card.jsx
Project: src/components/precios/Best2hCard.tsx

Muestra:
- Mejor ventana de 2 horas consecutivas
- Hora de inicio
- Precio promedio
- Ahorro vs media del día
```

#### **10.3) MejorTramo (45 min)**

```
Legacy: src/components/MejorTramo.jsx
Project: src/components/precios/MejorTramo.tsx

Muestra:
- Configurable: 2h, 4h, 8h
- Múltiples franjas si el usuario quiere
- Ahorro calculado
```

#### **10.4) ConsumptionCalculator (1h)**

```
Legacy: src/components/consumption-calculator.jsx
Project: src/components/precios/ConsumptionCalculator.tsx

Funcionalidad:
- Inputs: kWh, hora inicio, hora fin
- Cálculo: coste estimado para ese rango
- Comparación: vs media del día
- Formato: euros español
```

#### **10.5) DatePicker (30 min)**

```
Legacy: src/components/date-picker*.jsx
Project: src/components/precios/DatePicker.tsx

Funcionalidad:
- Selector de fecha
- Marcar días con/sin datos
- Highlight hoy/mañana
- Restricción: no futuro > mañana
```

---

## 🎯 FASE 11: PRODUCCIÓN Y DEPLOY

**Duración estimada:** 2-3 horas  
**Dependencia:** Todas las fases previas  
**Objetivo:** Deploy a Vercel con configuración óptima

### **Plan FASE 11:**

#### **11.1) Configuración de Producción (1h)**

**Variables de entorno Vercel:**

```bash
NEXT_PUBLIC_API_URL=https://api.precioluzhoy.app
REVALIDATE_TOKEN=<token-secreto>
VERCEL_ENV=production
```

**next.config.ts:**

```typescript
export default {
  // Optimizaciones
  swcMinify: true,
  compress: true,

  // Images
  images: {
    domains: ['api.precioluzhoy.app'],
    formats: ['image/avif', 'image/webp'],
  },

  // Headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
        ],
      },
    ];
  },

  // Redirects
  async redirects() {
    return [
      {
        source: '/precios',
        destination: '/precios/' + getTodayMadrid(),
        permanent: false,
      },
    ];
  },
};
```

#### **11.2) SEO Optimización (1h)**

**sitemap.xml dinámico:**

```typescript
// app/sitemap.ts
export default async function sitemap() {
  const ultimos30Dias = generarUltimos30Dias();

  return [
    {
      url: 'https://precioluzhoy.app',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...ultimos30Dias.map((fecha) => ({
      url: `https://precioluzhoy.app/precios/${fecha}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    })),
  ];
}
```

**robots.txt:**

```typescript
// app/robots.ts
export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/admin/'],
    },
    sitemap: 'https://precioluzhoy.app/sitemap.xml',
  };
}
```

#### **11.3) Analytics y Monitoreo (30 min)**

**Vercel Analytics:**

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
```

---

## 📋 CHECKLIST GENERAL DE MIGRACIÓN

### **Infraestructura:**

- [x] Next.js 14 App Router instalado
- [x] Template TailNext integrado
- [x] TypeScript configurado
- [ ] Variables de entorno configuradas
- [ ] Vercel proyecto creado

### **API Layer:**

- [ ] API client con retry logic
- [ ] Servicios de precios
- [ ] Cache strategy implementada
- [ ] Error handling robusto
- [ ] Logs de latencia

### **Componentes:**

- [x] PriceChartView (5 archivos)
- [ ] MinPriceCard
- [ ] Best2hCard
- [ ] MejorTramo
- [ ] ConsumptionCalculator
- [ ] DatePicker
- [ ] LoadingSkeleton
- [ ] ErrorBoundary

### **Páginas:**

- [x] /test-grafico (testing)
- [x] /demo-home (demo)
- [ ] /precios/[fecha] (dinámica)
- [ ] /precios (redirect)
- [ ] /blog/precio-luz-[fecha] (posts)
- [ ] / (homepage con datos reales)

### **SEO:**

- [ ] generateMetadata en todas las páginas
- [ ] Open Graph images
- [ ] sitemap.xml dinámico
- [ ] robots.txt
- [ ] Structured data (Article schema)

### **Testing:**

- [x] Smoke tests básicos
- [ ] Tests de API calls
- [ ] Tests de cache
- [ ] Tests de polling
- [ ] Tests de errores

### **Deploy:**

- [ ] Deploy a Vercel
- [ ] Custom domain configurado
- [ ] GitHub Actions para revalidación
- [ ] Monitoreo activado
- [ ] Logs configurados

---

## 🎯 PRÓXIMOS PASOS INMEDIATOS

### **AHORA (Fase 6):**

1. **Crear estructura de carpetas:**

   ```bash
   mkdir -p src/lib/api
   mkdir -p src/lib/precios
   mkdir -p src/hooks
   ```

2. **Crear archivos base:**
   - `src/lib/api/client.ts` (fetch wrapper)
   - `src/lib/api/precios-api.ts` (servicios)
   - `src/lib/precios/metrics.ts` (cálculos)
   - `src/hooks/usePriceData.ts` (client hook)

3. **Configurar variables de entorno:**

   ```bash
   echo "NEXT_PUBLIC_API_URL=https://api.precioluzhoy.app" > .env.local
   ```

4. **Portar lógica de Legacy:**
   - Copiar retry logic de `features/prices/hooks.js`
   - Copiar metrics de `features/prices/metrics.js`
   - Adaptar a TypeScript

5. **Testing:**
   - Modificar `/test-grafico` para usar API real
   - Verificar fetch exitoso
   - Verificar cache headers

---

## 📚 DOCUMENTOS LEGACY A CONSULTAR

Durante la migración, consultar estos archivos del Legacy:

1. **API Logic:**
   - `src/features/prices/hooks.js` - usePricesByDate, polling
   - `src/features/prices/contracts.js` - endpoints, fetch
   - `src/features/prices/metrics.js` - computeMetrics

2. **Utilities:**
   - `src/lib/utils.js` - date helpers, formatters
   - `src/lib/date-utils.js` - dayjs timezone logic
   - `src/lib/logger.js` - logging

3. **Componentes:**
   - `src/components/min-price-card.jsx`
   - `src/components/best2h-card.jsx`
   - `src/components/mejor-tramo.jsx`
   - `src/components/consumption-calculator.jsx`

4. **Documentación:**
   - `instrucciones/instrucciones-consulta-api.md` - contrato API
   - `instrucciones/arquitectura.md` - arquitectura general
   - `instrucciones/estado-y-contratos.md` - estado y tipos

---

## 🎓 PRINCIPIOS DE MIGRACIÓN

### **✅ DO:**

- Usar Server Components por defecto
- Cache strategy diferenciado (hoy/mañana/pasado)
- TypeScript strict mode
- Error boundaries en layout
- Logs de latencia y errores
- Atomic commits por feature
- Testing después de cada fase

### **❌ DON'T:**

- No añadir estado global prematuramente
- No usar Client Components innecesariamente
- No cachear datos de mañana
- No hacer fetch sin retry logic
- No ignorar X-Completeness header
- No hardcodear fechas (usar Europe/Madrid)

---

## 📊 TIMELINE ESTIMADO

```
Fase 6: API Layer          → 2-3 horas  (HOY)
Fase 7: Datos Reales       → 1-2 horas  (HOY/MAÑANA)
Fase 8: Páginas Dinámicas  → 2-3 horas  (MAÑANA)
Fase 9: Blog Posts         → 3-4 horas  (2 DÍAS)
Fase 10: Componentes       → 3-4 horas  (2 DÍAS)
Fase 11: Deploy            → 2-3 horas  (1 DÍA)
───────────────────────────────────────────────
TOTAL:                      13-19 horas (1 semana aprox)
```

**Con fases 1-5 ya completadas (7h), total: 20-26 horas**

---

## ✅ CRITERIOS DE ÉXITO

### **Fase 6 (API Layer):**

- [ ] Fetch exitoso a API real
- [ ] Retry logic funciona (test con timeout forzado)
- [ ] Cache headers correctos según fecha
- [ ] Metrics correctos (min/max/best2h)
- [ ] Polling funciona en días incompletos
- [ ] 0 errores TypeScript

### **Fase 7 (Datos Reales):**

- [ ] /test-grafico muestra datos reales
- [ ] Homepage muestra datos reales
- [ ] Loading states correctos
- [ ] Error handling funciona
- [ ] Polling activo en días incompletos

### **Migración Completa:**

- [ ] Todas las páginas funcionan
- [ ] SEO optimizado (score > 90)
- [ ] Performance > 90 en Lighthouse
- [ ] Deploy exitoso a Vercel
- [ ] GitHub Actions funcionando
- [ ] Datos actualizándose diariamente

---

**Documento creado:** 16 Diciembre 2025  
**Última actualización:** 16 Diciembre 2025  
**Responsable:** Migración Legacy → Project  
**Estado:** 📋 PLAN APROBADO - LISTO PARA EJECUTAR FASE 6
