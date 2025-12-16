# 📊 Análisis Completo: PriceChartView Component

> **Fecha:** 16 Diciembre 2025  
> **Estado:** ✅ FASE 1 COMPLETADA  
> **Tiempo invertido:** 15 minutos

---

## 🎯 RESUMEN EJECUTIVO

El componente `PriceChartView` es un gráfico de barras horizontales que muestra 24 horas de precios de electricidad. Usa **Recharts** para visualización, **Mantine** para el Card wrapper, y **Tailwind CSS** para estilos.

**Complejidad:** ⭐⭐⭐ Media (3/5)  
**Dependencias críticas:** Recharts, dayjs, utilidades personalizadas  
**Trabajo estimado de migración:** 45-60 minutos

---

## 📁 ESTRUCTURA DE ARCHIVOS

```
frontend/src/components/price-chart/
├── PriceChartView.jsx      # Componente principal (layout grid)
├── HourColumn.jsx           # Columna de horas (00-01h, 01-02h, ...)
├── PriceColumn.jsx          # Columna de precios (0,1234 €/kWh)
├── BarsColumn.jsx           # Columna de barras (Recharts)
└── logic.js                 # Lógica: toChartData(), tierColor()
```

---

## ✅ PROPS DEL COMPONENTE PRINCIPAL

### `PriceChartView.jsx`

```typescript
interface PriceChartViewProps {
  // DATA
  data: Array<{
    priceEurKwh: number;
    hourIndex?: number; // 0-23
    datetimeUtc?: string; // ISO string si no hay hourIndex
  }>;

  // ESTADO UI
  currentHourIndex?: number | null; // Hora actual resaltada
  min?: number | null; // Precio mínimo (para colores)
  max?: number | null; // Precio máximo (para colores)
  activeDate?: string; // 'YYYY-MM-DD' para formatear horas

  // LAYOUT
  rowHeight?: number; // Default: 23px
  gridTemplate?: string; // Default: 'grid-cols-[1fr_1fr_2fr]'
  hourClass?: string; // Clase CSS para celdas de hora
  priceClass?: string; // Clase CSS para celdas de precio
}
```

---

## 🪝 HOOKS UTILIZADOS

### En `PriceChartView.jsx`:

- ✅ `React.useMemo()` - Para memoizar `toChartData(data)`
- ❌ NO usa `useState`
- ❌ NO usa `useEffect`
- ❌ NO usa Context API

### En subcomponentes:

- ❌ Ningún hook (componentes puros)

**Conclusión:** Solo necesita `'use client'` si queremos añadir interactividad futura (clicks, hover). Por ahora, puede ser Server Component.

---

## 📦 DEPENDENCIAS EXTERNAS

### 1️⃣ **Recharts** (Librería de gráficos)

```jsx
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';
```

**Ubicación:** `BarsColumn.jsx`  
**Uso:** Renderiza barras horizontales con colores según precio  
**Migración:** ✅ Compatible con Next.js (requiere `'use client'`)

---

### 2️⃣ **Mantine UI** (Solo Card)

```jsx
import { Card } from '@mantine/core';
```

**Ubicación:** `PriceChartView.jsx`  
**Uso:** Wrapper con borde y sombra  
**Migración:** 🔄 Reemplazar con Tailwind:

```tsx
// ❌ ANTES
<Card withBorder padding="md" shadow="sm" radius="md">

// ✅ DESPUÉS
<div className="border border-gray-200 dark:border-gray-700 p-4 shadow-sm rounded-lg">
```

---

### 3️⃣ **dayjs** (Manejo de fechas)

```javascript
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
```

**Ubicación:** `date-utils.js`  
**Uso:** Conversiones de zona horaria (Europe/Madrid)  
**Migración:** ✅ Copiar `date-utils.js` completo al Project

---

### 4️⃣ **Utilidades personalizadas**

```javascript
// Desde utils.js
-TIMEZONE_ESP -
  formatHourRange(hour) - // 0 -> '00-01h'
  hourFromUtcIsoInTz(iso, tz) - // ISO -> hora numérica
  formatPrice(value) - // 0.1234 -> '0,1234'
  // Desde date-utils.js
  formatHourForZone(ymd, idx); // 'YYYY-MM-DD', 14 -> '14-15h'
```

**Migración:** 🔄 Copiar funciones relevantes a `~/lib/utils.ts` en Project

---

## 🎨 ESTILOS

### Tecnología usada:

- ✅ **Tailwind CSS** (clases utilitarias)
- ❌ NO usa CSS Modules
- ❌ NO usa styled-components
- ❌ NO usa inline styles dinámicos (excepto `height: rowHeight`)

### Clases Tailwind identificadas:

```jsx
// Grid layout
'grid grid-cols-[1fr_1fr_2fr] gap-2 items-start';

// Headers
'text-xs font-semibold';
'text-[10px] ml-1';

// Celdas
'flex items-center';
'font-mono pl-2';
'bg-primary/10'; // Highlight hora actual
```

**Conclusión:** ✅ Estilos totalmente compatibles con Project (ya usa Tailwind)

---

## 🧠 LÓGICA DE NEGOCIO

### Archivo: `logic.js`

#### 1️⃣ **Función `toChartData(items)`**

```javascript
// INPUT: Array de items con priceEurKwh y hourIndex/datetimeUtc
// OUTPUT: Array ordenado con { hour, price, hourNum }

[
  { priceEurKwh: 0.1234, hourIndex: 0 },
  { priceEurKwh: 0.1567, hourIndex: 1 },
  ...
]
↓
[
  { hour: '00-01h', price: 0.1234, hourNum: 0 },
  { hour: '01-02h', price: 0.1567, hourNum: 1 },
  ...
]
```

**Pasos:**

1. Filtra items con `priceEurKwh` válido
2. Calcula `hourNum` desde `hourIndex` o `datetimeUtc`
3. Formatea `hourLabel` con `formatHourRange()`
4. Ordena por `hourNum` (0-23)

---

#### 2️⃣ **Función `tierColor(price, min, max)`**

```javascript
// INPUT: precio actual, precio mínimo, precio máximo
// OUTPUT: color HSL según terciles

Tercil 1 (bajo):    precio <= min + range/3   → Verde  'hsl(142.1 76.2% 36.3%)'
Tercil 2 (medio):   precio <= min + 2*range/3 → Amarillo 'hsl(45.9 96.7% 64.5%)'
Tercil 3 (alto):    precio > tercil 2         → Rojo   'hsl(0 84.2% 60.2%)'
```

**Uso:** Colorea cada barra del gráfico según el precio relativo

---

## 🔗 FLUJO DE DATOS

```
API Response
    ↓
PriceChartView (recibe data[])
    ↓
useMemo: toChartData(data) → chartData[]
    ↓
┌─────────────┬─────────────┬─────────────┐
│ HourColumn  │ PriceColumn │ BarsColumn  │
│ (horas)     │ (precios)   │ (gráfico)   │
└─────────────┴─────────────┴─────────────┘
```

**Props flow:**

- `chartData` → Compartido por los 3 subcomponentes
- `currentHourIndex` → Solo para `HourColumn` (highlight)
- `min, max` → Solo para `BarsColumn` (colores)
- `rowHeight` → Los 3 (alineación vertical)

---

## 🚨 PUNTOS CRÍTICOS PARA MIGRACIÓN

### 1️⃣ **Recharts requiere 'use client'**

```tsx
// BarsColumn.tsx DEBE tener:
'use client';
```

### 2️⃣ **Alias de imports**

```tsx
// ❌ Legacy usa rutas relativas
import { formatPrice } from '../../lib/utils';

// ✅ Project usa alias '~'
import { formatPrice } from '~/lib/utils';
```

### 3️⃣ **Reemplazar Card de Mantine**

```tsx
// ❌ ANTES
<Card withBorder padding="md" shadow="sm" radius="md">

// ✅ DESPUÉS
<div className="border border-gray-200 dark:border-gray-700 p-4 shadow-sm rounded-lg bg-white dark:bg-slate-900">
```

### 4️⃣ **Copiar utilidades necesarias**

Desde `frontend/src/lib/`:

- `date-utils.js` → `frontend-nextjs/src/lib/date-utils.ts` (completo)
- `utils.js` → Extraer solo funciones usadas:
  - `formatHourRange()`
  - `formatPrice()`
  - `hourFromUtcIsoInTz()`
  - `TIMEZONE_ESP`

### 5️⃣ **Tipado TypeScript**

Convertir todos `.jsx` → `.tsx` y añadir interfaces

---

## 💾 ALMACENAMIENTO

- ❌ NO usa `localStorage`
- ❌ NO usa `sessionStorage`
- ❌ NO usa cookies
- ✅ Es componente stateless (recibe data por props)

---

## 🎯 DECISIONES DE ARQUITECTURA

### ¿Server Component o Client Component?

| Componente     | Tipo                   | Razón                             |
| -------------- | ---------------------- | --------------------------------- |
| PriceChartView | **Server** (por ahora) | No tiene estado ni eventos        |
| HourColumn     | **Server**             | Solo renderiza (no interactivo)   |
| PriceColumn    | **Server**             | Solo renderiza (no interactivo)   |
| BarsColumn     | **Client** ⚠️          | Usa Recharts (requiere navegador) |

**Estrategia:**

- Envolver solo `BarsColumn` en Client Component
- Mantener el resto como Server Components
- Si necesitamos clicks → añadir `'use client'` solo a `PriceChartView`

---

## ✅ CHECKLIST FASE 1: COMPLETADO

- [x] Leer código de `PriceChartView.jsx`
- [x] Identificar dependencias (Recharts, Mantine, dayjs)
- [x] Listar props que recibe (10 props documentadas)
- [x] Identificar si usa Context API (NO)
- [x] Ver si usa localStorage/sessionStorage (NO)
- [x] Analizar subcomponentes (HourColumn, PriceColumn, BarsColumn)
- [x] Analizar lógica de negocio (logic.js)
- [x] Identificar utilidades necesarias (utils.js, date-utils.js)
- [x] Mapear estilos (100% Tailwind, sin CSS modules)
- [x] Documentar flujo de datos

---

## 📋 PRÓXIMOS PASOS

### FASE 2: PREPARACIÓN (10 min)

1. ✅ Crear carpetas en Project
2. ✅ Crear tipos TypeScript
3. ✅ Preparar datos de prueba

**Comando siguiente:**

```bash
cd /home/vboxuser/Proyectos/energia/precio-luz-hoy/frontend-nextjs
mkdir -p src/components/precios/price-chart
touch src/shared/types/precios.d.ts
```

---

## 🎉 CONCLUSIÓN

**Componente bien estructurado y migrable** ✅

- Separación clara de responsabilidades (3 columnas)
- Lógica aislada en `logic.js`
- Estilos con Tailwind (sin conversión necesaria)
- Única dependencia "pesada": Recharts

**Riesgo de migración:** 🟢 BAJO  
**Tiempo estimado:** 45-60 minutos

---

> **"El conocimiento es poder. ¡Ahora tienes el poder de migrar este componente con confianza! 💪⚡"**
