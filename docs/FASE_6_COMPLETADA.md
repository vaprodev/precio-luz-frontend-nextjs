# ✅ FASE 6 COMPLETADA: API LAYER Y SERVICIOS

**Fecha:** 16 Diciembre 2025  
**Duración:** ~2 horas  
**Estado:** ✅ COMPLETADA

---

## 📦 Archivos Creados

### API Layer (`src/lib/api/`)

1. **types.ts** (89 líneas)
   - `PriceItem`: Estructura de datos del backend
   - `PricesResponse`: Response del endpoint `/api/prices`
   - `PricesMeta`: Métricas computadas (min, max, mean, best2h, etc.)
   - `CompletenessInfo`, `CachePolicy`, `ApiError`, `FetchResult`

2. **client.ts** (147 líneas)
   - `fetchWithBackoff()`: Retry logic con backoff exponencial
   - `timedFetch()`: Fetch con timeout usando AbortController
   - `fetchJson()`: Parser JSON con error handling
   - `fetchApi<T>()`: Generic wrapper con TypeScript
   - Retry en: 429 (rate limit), 408 (timeout), errores de red
   - Respeta header `Retry-After`
   - Delays: 1s → 2s → 4s → 8s max

3. **precios-api.ts** (177 líneas)
   - `getPricesByDate()`: Fetch principal con cache strategy
   - `getPricesToday()`: Helper para hoy
   - `getPricesTomorrow()`: Helper para mañana
   - `fetchPricesByDateClient()`: Sin cache (para Client Components)
   - Normalización de precios (€/MWh → €/kWh)
   - Parse de headers `X-Completeness` y `X-Cache-Policy`
   - **Cache strategy Next.js:**
     - Hoy: `revalidate: 300` (5 min)
     - Mañana: `revalidate: 0` (sin cache)
     - Pasado: `revalidate: 86400` (1 día)
   - MODO MARTILLO: Garantiza `hourIndex` en timezone Madrid

---

### Precios Utils (`src/lib/precios/`)

4. **metrics.ts** (251 líneas)
   - `sanitize()`: Filtra NaN y detecta incompletitud
   - `computeBasicStats()`: Calcula min, max, mean
   - `findCurrentHourIndex()`: Detecta hora actual (si es hoy)
   - `findBest2hWindow()`: Mejor ventana de 2h consecutivas
   - `findBest2or3hByAverage()`: Mejor ventana 2-3h por promedio
   - `computeMetrics()`: Función principal que computa todo
   - `toBarSeries()`: Transform para gráficos
   - `formatHour()`, `formatHourRange()`: Formateo de horas

5. **date-utils.ts** (120 líneas)
   - `ymdToZonedDayjs()`: Convert YYYY-MM-DD a dayjs en timezone
   - `getTodayMadridYmd()`, `getTomorrowMadridYmd()`, `getYesterdayMadridYmd()`
   - `isToday()`, `isTomorrow()`, `isPast()`: Comparaciones de fechas
   - `getCurrentHourMadrid()`: Hora actual en Madrid (0-23)
   - `hourFromUtcIsoInTz()`: Extraer hora de ISO UTC en timezone
   - `formatHourForZone()`: Formateo "14-15h"
   - **Timezone:** Todas las funciones usan `Europe/Madrid`

6. **formatters.ts** (24 líneas)
   - `formatPrice()`: Formato español 0,1234 €/kWh
   - `formatPriceWithCurrency()`: Con símbolo de moneda

---

### React Hook (`src/hooks/`)

7. **usePriceData.ts** (178 líneas)
   - Hook para Client Components con polling automático
   - `usePriceData(date | 'today' | 'tomorrow')`: Hook principal
   - `usePricesToday()`, `usePricesTomorrow()`: Wrappers
   - **Polling logic:**
     - Si `count < 24` y policy = today/tomorrow → polling cada 15s
     - Si `count >= 24` o policy = past → stop polling
     - Cleanup automático en unmount o cambio de fecha
   - Estados: loading, error, data, meta, info, policy

---

### Configuración

8. **.env.local**
   ```bash
   NEXT_PUBLIC_API_URL=https://api.precioluzhoy.app
   ```

9. **package.json**
   - Añadida dependencia: `dayjs@^1.11.13`

---

## 🧪 Testing

### Página Actualizada

**`app/(pages)/test-grafico/page.tsx`** - Reescrita completamente:
- ✅ Server Component async
- ✅ Usa `getPricesToday()` para fetch real
- ✅ Computa metrics con `computeMetrics()`
- ✅ Formatea precios con `formatPrice()`
- ✅ Manejo de errores con UI de error
- ✅ Muestra: min/max/mean, best2h, bestWindow, currentHour
- ✅ Badges dinámicos: completeness, latency, policy
- ✅ Checklist de validación
- ✅ Info técnica del API layer

### Validaciones

- ✅ **Sin errores TypeScript** en todos los archivos
- ✅ **Servidor compila** correctamente
- ✅ **Simple Browser abierto** en `/test-grafico`

---

## 🎯 Funcionalidades Implementadas

### 1. Retry Logic con Backoff Exponencial

```typescript
// 3 reintentos con delays crecientes
Intento 1: 1s
Intento 2: 2s
Intento 3: 4s
Max delay: 8s
```

**Retriable:**
- 429 Too Many Requests (respeta `Retry-After`)
- 408 Request Timeout
- Errores de red (status 0)

### 2. Cache Strategy Diferenciado

```typescript
// Next.js ISR (Incremental Static Regeneration)
- Hoy:    revalidate: 300    (5 min)
- Mañana: revalidate: 0      (sin cache, always fresh)
- Pasado: revalidate: 86400  (1 día, datos estáticos)
```

### 3. Normalización Automática

```typescript
// Backend puede retornar €/MWh (80-200) o €/kWh (0.08-0.20)
if (price > 10) {
  normalized = price / 1000;  // €/MWh → €/kWh
}
```

### 4. Timezone Europe/Madrid

```typescript
// Todas las operaciones de fecha usan Madrid TZ
- getTodayMadridYmd() → "2025-12-16"
- getCurrentHourMadrid() → 14
- isToday("2025-12-16") → true
```

### 5. Completeness Detection

```typescript
// Header: X-Completeness: "24/24"
{
  count: 24,
  isComplete: true
}

// Datos incompletos activan polling en Client Components
```

### 6. Metrics Computation

```typescript
{
  min: 0.0850,          // Precio mínimo
  max: 0.2234,          // Precio máximo
  mean: 0.1542,         // Precio medio
  count: 24,            // Horas disponibles
  incomplete: false,    // Datos completos
  currentHourIndex: 14, // Hora actual (si es hoy)
  best2h: {             // Mejor ventana 2h
    startIndex: 3,
    total: 0.1735
  },
  bestWindow: {         // Mejor ventana 2-3h
    startIndex: 3,
    duration: 2,
    mean: 0.0868
  }
}
```

---

## 🔍 Arquitectura

### Flujo de Datos (Server Components)

```
Page.tsx (Server Component)
    ↓
getPricesToday()
    ↓
fetchWithBackoff(url)
    ↓ (retry logic)
timedFetch(url)
    ↓ (AbortController timeout)
Backend API: https://api.precioluzhoy.app/api/prices?date=YYYY-MM-DD
    ↓
normalizeItemsToEurPerKwh()
    ↓
computeMetrics(items, date)
    ↓
Return: { ok, status, data, meta, info, policy, ms }
    ↓
Page renders with real data
```

### Flujo de Datos (Client Components con Polling)

```
Component.tsx ('use client')
    ↓
usePriceData('today')
    ↓
fetchPricesByDateClient(date)
    ↓
[polling loop if incomplete]
    ↓ (every 15s)
fetchPricesByDateClient(date)
    ↓ (until count >= 24)
setState({ loading: false, data, meta, info })
```

---

## 📊 Comparación Legacy vs Project

| Aspecto | Legacy (React+Vite) | Project (Next.js) |
|---------|---------------------|-------------------|
| **Fetch** | `fetch` nativo | `fetch` nativo + AbortController |
| **Retry** | Manual con backoff | ✅ Mismo algoritmo (portado) |
| **Cache** | Manual + React Query | ✅ Next.js ISR (revalidate) |
| **Polling** | useEffect manual | ✅ useEffect manual (portado) |
| **Timezone** | dayjs + timezone | ✅ dayjs + timezone (portado) |
| **Metrics** | computeMetrics() | ✅ computeMetrics() (portado) |
| **Types** | JSDoc | ✅ **TypeScript strict** |
| **Server/Client** | Todo cliente | ✅ **Server Components + Client hooks** |

---

## ✅ Checklist de Validación

- [x] Carpetas creadas: `src/lib/api/`, `src/lib/precios/`, `src/hooks/`
- [x] Variables de entorno: `.env.local` con API URL
- [x] API client con retry y timeout
- [x] Servicios con cache strategy
- [x] Metrics computation portado
- [x] Date utilities con timezone Madrid
- [x] Hook con polling para días incompletos
- [x] Página test-grafico actualizada con API real
- [x] Sin errores TypeScript
- [x] Servidor compila correctamente
- [x] dayjs instalado

---

## 🚀 Próximos Pasos (Fase 7)

**FASE 7: CONECTAR DATOS REALES**

1. Actualizar `ElectricityPrices` widget para usar API real
2. Actualizar `demo-home` con datos reales
3. Añadir componentes de loading (Skeletons, Suspense)
4. Añadir error boundaries
5. Testing completo del flujo
6. Documentar smoke tests con API real

---

**Tiempo total Fase 6:** ~2 horas  
**Archivos creados:** 8 archivos nuevos + 1 actualizado  
**Líneas de código:** ~1,100 líneas TypeScript  
**Estado:** ✅ **COMPLETADA Y FUNCIONAL**
