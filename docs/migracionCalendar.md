# 📋 MIGRACIÓN: URLs Dinámicas → MiniCalendar en Home con Zustand

---

## 🎯 OBJETIVO

Migrar de URLs dinámicas (`/precio-luz-[slug]`) a navegación con MiniCalendar de Mantine en la home (`/`), usando **Zustand** (igual que en legacy) para gestión de estado.

---

## 📊 ANÁLISIS PREVIO

### ✅ Lo que ya sabemos del Legacy:

- **Estado:** Zustand con `usePricesStore` → `activeDate` (string YYYY-MM-DD)
- **Fetching:** react-query con prefetch automático de fechas visibles
- **MiniCalendar:** Mantine Calendar con 7 días visibles, domingos en rojo
- **maxDate:** Dinámico según `tomorrowAvailable` (basado en completitud 24/24)
- **excludeDates:** Calculado por ausencia de datos en cache
- **Timezone:** `Europe/Madrid` en todos los cálculos

### ✅ Lo que ya tienes en Next.js:

- ✅ react-query configurado (`@tanstack/react-query`)
- ✅ dayjs con timezone
- ✅ `date-utils.ts` con helpers de Madrid timezone
- ✅ `usePriceData` hook funcional
- ✅ Backend devuelve header `X-Completeness`

### ❌ Lo que falta:

- ❌ Zustand no instalado en Next.js
- ❌ Mantine no instalado (`@mantine/core`, `@mantine/dates`)
- ❌ MiniCalendar no migrado del legacy
- ❌ Home no usa navegación con calendario

---

## 🗂️ ESTRUCTURA DE TAREAS

```
├── FASE 1: Setup de dependencias [10 min]
├── FASE 2: Crear Zustand Store [15 min]
├── FASE 3: Migrar MiniCalendar del Legacy [45 min]
├── FASE 4: Refactorizar Home Page [30 min]
├── FASE 5: Eliminar archivos innecesarios [10 min]
└── FASE 6: Testing y Validación [20 min]
```

**Tiempo total estimado:** 2 - 2.5 horas

---

## 📦 FASE 1: Setup de Dependencias [10 min]

### Tarea 1.1: Instalar dependencias necesarias

```bash
cd frontend-nextjs
npm install zustand @mantine/core @mantine/dates @mantine/hooks
```

### Tarea 1.2: Verificar dayjs está instalado

```bash
npm list dayjs
# Si no está: npm install dayjs
```

### Tarea 1.3: Configurar Mantine Provider en Layout

**Archivo:** `app/layout.tsx`

```tsx
import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <MantineProvider
          theme={{
            // Adaptar colores de Mantine a tu paleta Tailwind
            primaryColor: 'blue',
            fontFamily: 'inherit', // Usa la fuente de Tailwind
            radius: {
              md: '0.5rem', // Consistente con rounded-lg de Tailwind
            },
            // Adaptar al dark mode de tu plantilla
            colors: {
              dark: [
                '#f5f5f5',
                '#e7e7e7',
                '#cdcdcd',
                '#b2b2b2',
                '#9a9a9a',
                '#8b8b8b',
                '#848484',
                '#717171',
                '#656565',
                '#1e293b', // slate-800 de tu plantilla
              ],
            },
          }}
        >
          {children}
        </MantineProvider>
      </body>
    </html>
  );
}
```

**Nota:** Esto adapta el tema de Mantine para que coincida con los colores y estilos de tu plantilla Tailwind.

### ✅ Smoke Test 1.1

```bash
npm run dev
# Abrir http://localhost:3000
# ✅ Verifica que no hay errores de importación en consola
# ✅ La aplicación carga normalmente
```

---

## 🧩 FASE 2: Crear Zustand Store [15 min]

### Tarea 2.1: Crear store de precios

**Archivo nuevo:** `src/store/pricesStore.ts`

```typescript
import { create } from 'zustand';
import { dateToYmdInZone } from '@/lib/precios/date-utils';

interface PricesState {
  activeDate: string; // YYYY-MM-DD
  setActiveDate: (date: string) => void;
}

export const usePricesStore = create<PricesState>((set) => ({
  // Inicializar con fecha de hoy en timezone Madrid
  activeDate: dateToYmdInZone(new Date()),

  setActiveDate: (date: string) => set({ activeDate: date }),
}));
```

### Tarea 2.2: Crear hook de conveniencia (opcional)

**Archivo nuevo:** `src/hooks/usePricesStore.ts`

```typescript
import { usePricesStore as useStore } from '@/store/pricesStore';

/**
 * Hook de conveniencia para acceder solo a activeDate y setActiveDate
 * Mantiene compatibilidad con legacy
 */
export function usePricesStore() {
  const activeDate = useStore((s) => s.activeDate);
  const setActiveDate = useStore((s) => s.setActiveDate);

  return { activeDate, setActiveDate };
}
```

### ✅ Smoke Test 2.1

**Crear página de test temporal:** `app/test-store/page.tsx`

```tsx
'use client';

import { usePricesStore } from '@/hooks/usePricesStore';

export default function TestStorePage() {
  const { activeDate, setActiveDate } = usePricesStore();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      <div className="py-12">
        <h1 className="mb-4 text-2xl font-bold">Test Zustand Store</h1>
        <p className="mb-4">Active Date: {activeDate}</p>

        <div className="space-x-2">
          <button onClick={() => setActiveDate('2025-01-01')} className="btn btn-primary">
            Cambiar a 2025-01-01
          </button>

          <button onClick={() => setActiveDate('2025-01-06')} className="btn btn-primary">
            Cambiar a 2025-01-06
          </button>
        </div>
      </div>
    </div>
  );
}
```

**Verificar:**

```bash
# Abrir http://localhost:3000/test-store
# ✅ Muestra fecha de hoy inicialmente
# ✅ Click en botones cambia activeDate correctamente
# ✅ Estado persiste entre re-renders
```

**Eliminar después del test:**

```bash
rm app/test-store/page.tsx
```

---

## 🗓️ FASE 3: Migrar MiniCalendar del Legacy [45 min]

### Tarea 3.1: Copiar archivo base del legacy

```bash
# Copiar desde legacy
cp ../frontend/src/components/MiniCalendarMantine.jsx \
   src/components/precios/MiniCalendarMantine.tsx
```

### Tarea 3.2: Adaptar MiniCalendar a Next.js con TypeScript

**Archivo:** `src/components/precios/MiniCalendarMantine.tsx`

```tsx
'use client';

import React, { useMemo, useEffect } from 'react';
import { Calendar } from '@mantine/dates';
import { useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

import { usePricesStore } from '@/hooks/usePricesStore';
import { dateToYmdInZone, ymdToZonedDayjs } from '@/lib/precios/date-utils';
import { getPricesByDate } from '@/lib/api/precios-api';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isSameOrBefore);

const MADRID_TZ = 'Europe/Madrid';

interface MiniCalendarMantineProps {
  numberOfDays?: number;
  tomorrowAvailable?: boolean;
}

export default function MiniCalendarMantine({ numberOfDays = 7, tomorrowAvailable = false }: MiniCalendarMantineProps) {
  const { activeDate, setActiveDate } = usePricesStore();
  const qc = useQueryClient();

  // Fechas clave en timezone Madrid
  const today = useMemo(() => dateToYmdInZone(new Date()), []);
  const tomorrow = useMemo(() => dayjs().tz(MADRID_TZ).add(1, 'day').format('YYYY-MM-DD'), []);

  // maxDate: mañana si hay datos completos (24/24), sino hoy
  const maxDate = useMemo(() => {
    const targetDate = tomorrowAvailable ? tomorrow : today;
    return ymdToZonedDayjs(targetDate).toDate();
  }, [tomorrowAvailable, today, tomorrow]);

  // Calcular intervalStartDate para que fecha activa aparezca cerca del final
  // Ejemplo: si numberOfDays=7, fecha activa estará en posición 5-6
  const intervalStartDate = useMemo(() => {
    const activeDayjs = ymdToZonedDayjs(activeDate);
    const offsetDays = Math.max(0, numberOfDays - 2);
    return activeDayjs.subtract(offsetDays, 'day').toDate();
  }, [activeDate, numberOfDays]);

  // Calcular fechas visibles para prefetch
  const visibleDates = useMemo(() => {
    const start = dayjs(intervalStartDate);
    const dates: string[] = [];
    const maxDayjs = dayjs(maxDate);

    for (let i = 0; i < numberOfDays; i++) {
      const date = start.add(i, 'day');
      if (date.isSameOrBefore(maxDayjs, 'day')) {
        dates.push(date.format('YYYY-MM-DD'));
      }
    }

    return dates;
  }, [intervalStartDate, numberOfDays, maxDate]);

  // Prefetch automático de fechas visibles
  useEffect(() => {
    visibleDates.forEach((date) => {
      qc.prefetchQuery({
        queryKey: ['prices', date],
        queryFn: () => getPricesByDate(date),
        staleTime: 1000 * 60 * 5, // 5 minutos
      });
    });
  }, [visibleDates, qc]);

  // excludeDates: todas las fechas posteriores a maxDate
  const excludeDates = useMemo(() => {
    const excluded: Date[] = [];
    const maxDayjs = dayjs(maxDate);

    // Excluir siguientes 365 días después de maxDate
    for (let i = 1; i <= 365; i++) {
      const futureDate = maxDayjs.add(i, 'day');
      excluded.push(futureDate.toDate());
    }

    return excluded;
  }, [maxDate]);

  // Handler de cambio de fecha
  const handleDateChange = (date: Date | null) => {
    if (!date) return;

    const ymd = dateToYmdInZone(date);

    // Validar que no sea posterior a maxDate
    if (dayjs(ymd).isAfter(dayjs(maxDate), 'day')) {
      console.warn('Fecha seleccionada está más allá de maxDate:', ymd);
      return;
    }

    setActiveDate(ymd);
  };

  // Función para estilizar días (domingos en rojo)
  const getDayProps = (date: Date) => {
    const dayOfWeek = dayjs(date).day();
    const isSunday = dayOfWeek === 0;

    return {
      style: isSunday ? { color: 'red', fontWeight: 'bold' } : undefined,
    };
  };

  return (
    <div className="flex justify-center my-4">
      <Calendar
        value={ymdToZonedDayjs(activeDate).toDate()}
        onChange={handleDateChange}
        maxDate={maxDate}
        excludeDate={(date) => excludeDates.some((excluded) => dayjs(date).isSame(dayjs(excluded), 'day'))}
        getDayProps={getDayProps}
        numberOfColumns={1}
        size="md"
        firstDayOfWeek={1} // Lunes
        locale="es"
        // Estilos para integrar con tu plantilla
        classNames={{
          calendarHeader: 'text-gray-900 dark:text-white',
          day: 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700',
        }}
      />
    </div>
  );
}
```

### Tarea 3.3: Verificar helpers en date-utils.ts

**Archivo:** `src/lib/precios/date-utils.ts`

Asegurar que existen estas funciones (si no, crearlas):

```typescript
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);
dayjs.extend(timezone);

const MADRID_TZ = 'Europe/Madrid';

export function dateToYmdInZone(date: Date): string {
  return dayjs(date).tz(MADRID_TZ).format('YYYY-MM-DD');
}

export function ymdToZonedDayjs(ymd: string) {
  return dayjs.tz(ymd, MADRID_TZ);
}

export function getTodayInMadrid(): string {
  return dateToYmdInZone(new Date());
}

export function getTomorrowInMadrid(): string {
  return dayjs().tz(MADRID_TZ).add(1, 'day').format('YYYY-MM-DD');
}
```

### ✅ Smoke Test 3.1

**Crear página de test:** `app/test-calendar/page.tsx`

```tsx
'use client';

import MiniCalendarMantine from '@/components/precios/MiniCalendarMantine';
import { usePricesStore } from '@/hooks/usePricesStore';

export default function TestCalendarPage() {
  const { activeDate } = usePricesStore();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      <div className="py-12">
        <h1 className="mb-4 text-2xl font-bold">Test MiniCalendar</h1>
        <p className="mb-4 text-lg">
          Fecha activa: <strong>{activeDate}</strong>
        </p>

        <div className="card">
          <MiniCalendarMantine numberOfDays={7} tomorrowAvailable={false} />
        </div>

        <div className="mt-8">
          <h2 className="mb-2 text-xl font-semibold">Checklist:</h2>
          <ul className="list-disc space-y-1 pl-6">
            <li>✅ Calendario se renderiza sin errores</li>
            <li>✅ Muestra 7 días visibles</li>
            <li>✅ Fecha de hoy está seleccionada</li>
            <li>✅ Domingos aparecen en rojo</li>
            <li>✅ Click en fecha cambia activeDate (verificar arriba)</li>
            <li>✅ No permite seleccionar fechas futuras</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
```

**Verificar:**

```bash
# Abrir http://localhost:3000/test-calendar
# ✅ Calendario se muestra correctamente
# ✅ Fecha de hoy seleccionada por defecto
# ✅ Domingos en color rojo
# ✅ Click en fecha actualiza el texto "Fecha activa"
# ✅ No se pueden seleccionar fechas posteriores a hoy
# ✅ Network tab muestra prefetch de 7 fechas
```

**Eliminar después del test:**

```bash
rm app/test-calendar/page.tsx
```

---

## 🏠 FASE 4: Refactorizar Home Page [30 min]

### Tarea 4.1: Actualizar Home para usar MiniCalendar

**Archivo:** `app/page.tsx`

```tsx
'use client';

import { usePricesStore } from '@/hooks/usePricesStore';
import { usePriceData } from '@/hooks/usePriceData';
import MiniCalendarMantine from '@/components/precios/MiniCalendarMantine';
import PriceChart from '@/components/precios/price-chart/PriceChart';

export default function HomePage() {
  const { activeDate } = usePricesStore();
  const { data, isLoading, error } = usePriceData(activeDate);

  // Calcular si mañana está disponible basado en completitud
  const tomorrowAvailable = useMemo(() => {
    // Verificar si data tiene completeness header
    // Esto depende de cómo tu API devuelve la info
    return data?.info?.completeness === '24/24';
  }, [data]);

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="py-12 md:py-20">
          {/* Header - estilo consistente con Hero de tu plantilla */}
          <header className="mb-10 text-center">
            <h1 className="font-heading mb-6 text-4xl font-bold tracking-tighter md:text-5xl lg:text-6xl">
              Precio de la Luz Hoy
            </h1>
            <p className="text-xl font-normal text-gray-600 dark:text-slate-400">
              Consulta los precios por hora de la electricidad en España
            </p>
          </header>

          {/* MiniCalendar Navigation - usa clase .card de tu plantilla */}
          <section className="mb-8">
            <div className="card">
              <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">Selecciona una fecha</h2>
              <MiniCalendarMantine numberOfDays={7} tomorrowAvailable={tomorrowAvailable} />
            </div>
          </section>

          {/* Price Chart Section - usa clase .card de tu plantilla */}
          <section>
            <div className="card">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Precios del {activeDate}</h2>

                {/* Indicador de completitud */}
                {data?.info?.completeness && (
                  <span className="text-sm text-gray-600 dark:text-gray-400">{data.info.completeness}</span>
                )}
              </div>

              {/* Estados de carga/error/datos */}
              {isLoading && (
                <div className="flex h-64 items-center justify-center">
                  <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary-600"></div>
                </div>
              )}

              {error && (
                <div className="rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700 dark:border-red-600 dark:bg-red-900/20 dark:text-red-400">
                  <strong>Error:</strong> No se pudieron cargar los precios.
                </div>
              )}

              {data && !isLoading && !error && <PriceChart data={data.data} />}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
```

### Tarea 4.2: Verificar compatibilidad de usePriceData

**Archivo:** `src/hooks/usePriceData.ts`

Asegurar que acepta formato `YYYY-MM-DD`:

```typescript
import { useQuery } from '@tanstack/react-query';
import { getPricesByDate } from '@/lib/api/precios-api';

export function usePriceData(date: string) {
  return useQuery({
    queryKey: ['prices', date],
    queryFn: () => getPricesByDate(date),
    staleTime: 1000 * 60 * 5, // 5 minutos
    retry: 2,
  });
}
```

### Tarea 4.3: Adaptar fetchPrices si es necesario

**Archivo:** `src/lib/api/precios-api.ts`

Si tu función espera slugs (`hoy`, `manana`), adaptar para aceptar fechas:

```typescript
export async function getPricesByDate(date: string) {
  // date ya está en formato YYYY-MM-DD
  const response = await fetch(`${API_URL}/api/prices?date=${date}`, {
    next: { revalidate: getRevalidateForDate(date) },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch prices for ${date}`);
  }

  const data = await response.json();

  return {
    data: data.data,
    info: {
      completeness: response.headers.get('X-Completeness'),
      policy: response.headers.get('X-Cache-Policy'),
    },
    ok: true,
    status: response.status,
  };
}

function getRevalidateForDate(date: string): number {
  const today = dateToYmdInZone(new Date());
  const isPast = date < today;

  if (isPast) return 86400; // 24 horas
  return 300; // 5 minutos
}
```

### ✅ Smoke Test 4.1

```bash
# Abrir http://localhost:3000
# ✅ Página carga sin errores
# ✅ MiniCalendar se muestra correctamente
# ✅ Gráfico de precios aparece para fecha activa
# ✅ Click en otra fecha en calendario actualiza el gráfico
# ✅ URL permanece en "/" (no cambia)
# ✅ Domingos en rojo en el calendario
# ✅ No se pueden seleccionar fechas futuras
# ✅ Prefetch: Network tab muestra 7 requests al cargar
# ✅ Click en fecha prefetcheada: carga instantánea (sin nuevo request)
```

---

## 🗑️ FASE 5: Eliminar Archivos Innecesarios [10 min]

### Tarea 5.1: Eliminar directorio de URLs dinámicas

```bash
# Eliminar completamente el directorio precio-luz-[slug]
rm -rf app/precio-luz-\[slug\]
```

### Tarea 5.2: Eliminar utilidades de slugs (si existen)

```bash
# Si existe archivo de utilidades de slugs
rm -f src/lib/precios/slug-utils.ts
```

### Tarea 5.3: Buscar y eliminar componentes obsoletos

```bash
# Buscar referencias a DateNavigator (si ya no se usa)
grep -r "DateNavigator" src/

# Si DateNavigator ya no se usa, eliminarlo
# rm src/components/precios/DateNavigator.tsx
```

### Tarea 5.4: Limpiar imports obsoletos

Buscar y eliminar imports de archivos eliminados:

```bash
# Buscar referencias a precio-luz-
grep -r "precio-luz-" src/ app/

# Buscar imports de slug-utils
grep -r "slug-utils" src/ app/
```

### ✅ Smoke Test 5.1

```bash
# Build para verificar que no hay imports rotos
npm run build

# ✅ Build completa sin errores
# ✅ No hay warnings de módulos no encontrados
# ✅ Bundle size no aumentó significativamente
```

---

## 🧪 FASE 6: Testing y Validación Final [20 min]

### Test 6.1: Flujo completo de usuario

**Checklist manual:**

```bash
# Abrir http://localhost:3000
```

- [ ] Página carga en menos de 2 segundos
- [ ] MiniCalendar muestra 7 días visibles
- [ ] Fecha de hoy está seleccionada por defecto
- [ ] Gráfico muestra precios de hoy (24 barras o las disponibles)
- [ ] Click en ayer → gráfico se actualiza instantáneamente
- [ ] Click en fecha hace 5 días → gráfico se actualiza
- [ ] URL permanece en `/` en todo momento
- [ ] Domingos aparecen en color rojo
- [ ] No se puede seleccionar mañana (si tomorrowAvailable=false)
- [ ] Fecha activa aparece cerca del final del rango visible (posición 5-6)

### Test 6.2: Prefetch de datos

**Verificar en DevTools → Network:**

```bash
# Al cargar la página:
# ✅ Aparecen ~7 requests a /api/prices?date=...
# ✅ Requests se hacen en paralelo
# ✅ Responses se guardan en cache de react-query
```

**Verificar navegación con prefetch:**

```bash
# 1. Cargar home (prefetch de 7 días)
# 2. Click en día visible en calendario
# ✅ NO aparece nuevo request (usa cache)
# ✅ Gráfico carga instantáneamente
```

### Test 6.3: Estado de Zustand persiste

```bash
# 1. Abrir http://localhost:3000
# 2. Cambiar fecha a 2025-01-05
# 3. Abrir DevTools → Components (React DevTools)
# 4. Buscar "usePricesStore"
# ✅ activeDate = "2025-01-05"
# 5. Hacer cualquier acción que re-renderice
# ✅ activeDate sigue siendo "2025-01-05" (no se resetea)
```

### Test 6.4: Comportamiento de maxDate

**Caso A: tomorrowAvailable = false**

```tsx
<MiniCalendarMantine tomorrowAvailable={false} />
```

- [ ] maxDate = hoy
- [ ] Mañana está deshabilitado (gris, no clickeable)
- [ ] Pasado mañana está deshabilitado

**Caso B: tomorrowAvailable = true**

```tsx
<MiniCalendarMantine tomorrowAvailable={true} />
```

- [ ] maxDate = mañana
- [ ] Mañana es seleccionable
- [ ] Pasado mañana está deshabilitado

### Test 6.5: Responsive (verificación básica)

```bash
# Abrir DevTools → Toggle Device Toolbar
# Seleccionar "iPhone 12 Pro" o similar
```

- [ ] MiniCalendar se muestra correctamente
- [ ] 7 días entran en la pantalla (sin scroll horizontal)
- [ ] Gráfico de precios es responsive
- [ ] No hay overflow horizontal

### Test 6.6: Timezone Europe/Madrid

**Verificar cálculo correcto de fechas:**

```tsx
// Añadir console.log temporal en MiniCalendar
console.log('Today (Madrid):', dateToYmdInZone(new Date()));
console.log('Active Date:', activeDate);
console.log('Tomorrow:', getTomorrowInMadrid());
```

- [ ] Fecha de hoy corresponde al día actual en España (no UTC)
- [ ] Si son las 23:30 UTC pero ya es medianoche en Madrid, debe mostrar el día siguiente

### Test 6.7: Manejo de errores

**Simular error de API (temporal):**

```typescript
// En precios-api.ts, forzar error
export async function getPricesByDate(date: string) {
  throw new Error('Test error');
}
```

- [ ] MiniCalendar se renderiza sin crashear
- [ ] Se muestra mensaje de error en lugar del gráfico
- [ ] No hay errores rojos en consola del navegador
- [ ] Zustand mantiene activeDate correctamente

**Restaurar código después del test**

### Test 6.8: Build de producción

```bash
# Build completo
npm run build

# ✅ Build completa sin errores
# ✅ No hay warnings críticos
# ✅ Bundle size es razonable

# Start en modo producción
npm run start

# Abrir http://localhost:3000
# ✅ Todo funciona igual que en desarrollo
```

### ✅ Smoke Test Final 6.9

**Checklist completo de validación:**

- [ ] `npm run dev` funciona sin errores
- [ ] `npm run build` completa sin errores
- [ ] `npm run start` (producción) funciona correctamente
- [ ] Home (/) carga en menos de 2 segundos
- [ ] MiniCalendar prefetchea 7 días automáticamente
- [ ] Navegación entre fechas es fluida (sin reloads)
- [ ] Zustand mantiene estado correctamente
- [ ] Domingos aparecen en rojo
- [ ] maxDate dinámico funciona correctamente
- [ ] excludeDates previene fechas futuras
- [ ] URLs antiguas (`/precio-luz-*`) devuelven 404 (como esperado)
- [ ] No hay errores en consola del navegador
- [ ] No hay warnings de React en consola
- [ ] Dark mode funciona (si está implementado)
- [ ] Responsive: funciona en mobile y desktop

---

## 📄 RESUMEN DE ARCHIVOS

### ✨ ARCHIVOS NUEVOS CREADOS:

```
frontend-nextjs/
├── src/
│   ├── store/
│   │   └── pricesStore.ts                  # ✨ Zustand store
│   ├── hooks/
│   │   └── usePricesStore.ts               # ✨ Hook de conveniencia
│   └── components/
│       └── precios/
│           └── MiniCalendarMantine.tsx     # ✨ Migrado desde legacy
```

### ✏️ ARCHIVOS MODIFICADOS:

```
frontend-nextjs/
├── app/
│   ├── layout.tsx                          # ✏️ Añadir MantineProvider
│   └── page.tsx                            # ✏️ Refactorizar con MiniCalendar
├── src/
│   ├── hooks/
│   │   └── usePriceData.ts                 # ✏️ Verificar compatibilidad
│   ├── lib/
│   │   ├── api/
│   │   │   └── precios-api.ts              # ✏️ Adaptar para fechas YYYY-MM-DD
│   │   └── precios/
│   │       └── date-utils.ts               # ✏️ Verificar helpers existen
└── package.json                            # ✏️ Añadir dependencias
```

### 🗑️ ARCHIVOS ELIMINADOS:

```
frontend-nextjs/
├── app/
│   └── precio-luz-[slug]/                  # 🗑️ ELIMINADO
│       ├── page.tsx
│       └── layout.tsx (si existe)
└── src/
    └── lib/
        └── precios/
            └── slug-utils.ts               # 🗑️ ELIMINADO (si existe)
```

---

## 🚀 COMANDOS RÁPIDOS

```bash
# Instalación de dependencias
npm install zustand @mantine/core @mantine/dates @mantine/hooks

# Desarrollo
npm run dev

# Build de producción
npm run build
npm run start

# Linting
npm run lint

# Type checking
npx tsc --noEmit
```

---

## ⚠️ PROBLEMAS COMUNES Y SOLUCIONES

### Problema 1: "Module not found: Can't resolve '@mantine/core'"

**Causa:** Mantine no instalado o mal configurado

**Solución:**

```bash
npm install @mantine/core @mantine/dates @mantine/hooks
# Verificar que aparecen en package.json
```

---

### Problema 2: CSS de Mantine no se aplica

**Causa:** Imports de CSS faltantes

**Solución:**

```tsx
// En app/layout.tsx
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
```

---

### Problema 3: "Cannot read property 'activeDate' of undefined"

**Causa:** Zustand store no inicializado correctamente

**Solución:**

```typescript
// Verificar en pricesStore.ts:
activeDate: dateToYmdInZone(new Date()), // Debe tener valor inicial
```

---

### Problema 4: Prefetch no funciona

**Causa:** QueryClient no configurado o no se está usando

**Solución:**

```tsx
// Verificar que layout.tsx o _app.tsx tiene:
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
```

---

### Problema 5: Fechas incorrectas (UTC vs Madrid)

**Causa:** dayjs timezone plugin no configurado

**Solución:**

```typescript
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);
dayjs.extend(timezone);
```

---

### Problema 6: "Calendar is not a named export from '@mantine/dates'"

**Causa:** Versión incorrecta de Mantine o import equivocado

**Solución:**

```typescript
// Verificar import correcto:
import { Calendar } from '@mantine/dates';

// Verificar versión de Mantine (debe ser v7+):
npm list @mantine/dates
```

---

### Problema 7: Estilos de Mantine no coinciden con la plantilla

**Causa:** Tema de Mantine no configurado para tu paleta de colores

**Solución:**

```tsx
// En app/layout.tsx, personalizar tema de Mantine:
<MantineProvider
  theme={{
    primaryColor: 'blue',
    fontFamily: 'inherit',
    radius: { md: '0.5rem' },
    colors: {
      dark: [
        '#f5f5f5',
        '#e7e7e7',
        '#cdcdcd',
        '#b2b2b2',
        '#9a9a9a',
        '#8b8b8b',
        '#848484',
        '#717171',
        '#656565',
        '#1e293b', // slate-800
      ],
    },
  }}
>
  {children}
</MantineProvider>
```

También puedes usar clases Tailwind directamente en `classNames` del Calendar:

```tsx
<Calendar
  classNames={{
    calendarHeader: 'text-gray-900 dark:text-white',
    day: 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700',
    month: 'bg-white dark:bg-slate-900',
  }}
/>
```

---

## 📚 DOCUMENTACIÓN DE REFERENCIA

- [Zustand - Getting Started](https://docs.pmnd.rs/zustand/getting-started/introduction)
- [Mantine Calendar](https://mantine.dev/dates/calendar/)
- [React Query Prefetching](https://tanstack.com/query/latest/docs/framework/react/guides/prefetching)
- [Next.js App Router](https://nextjs.org/docs/app)
- [dayjs Timezone Plugin](https://day.js.org/docs/en/plugin/timezone)

---

## ✅ CRITERIOS DE ÉXITO

La migración se considera completada exitosamente cuando:

1. ✅ Home (/) muestra MiniCalendar de Mantine funcional
2. ✅ Zustand gestiona estado de activeDate correctamente
3. ✅ Navegación de fechas NO cambia URL (permanece en /)
4. ✅ Prefetch de 7 días visibles funciona automáticamente
5. ✅ Domingos aparecen en color rojo
6. ✅ maxDate dinámico según tomorrowAvailable
7. ✅ excludeDates previene selección de fechas futuras
8. ✅ URLs antiguas (`/precio-luz-[slug]`) eliminadas (404)
9. ✅ Build de producción sin errores ni warnings
10. ✅ Performance: carga inicial <2 segundos
11. ✅ No hay errores en consola del navegador
12. ✅ Responsive: funciona en mobile y desktop

---

## 🎯 PRÓXIMOS PASOS (POST-MIGRACIÓN)

Una vez completada la migración, considera:

1. **Tests automatizados:** Añadir tests E2E con Playwright
2. **Analytics:** Tracking de cambios de fecha con Zustand middleware
3. **Optimización:** Lazy loading de componentes pesados
4. **Animaciones:** Transiciones suaves al cambiar fecha
5. **SEO:** Meta tags dinámicos según fecha activa
6. **Accesibilidad:** Verificar ARIA labels en MiniCalendar
7. **PWA:** Service Worker para cache offline

---

## 📊 TIEMPO ESTIMADO POR FASE

| Fase      | Tarea              | Tiempo          |
| --------- | ------------------ | --------------- |
| 1         | Setup dependencias | 10 min          |
| 2         | Zustand store      | 15 min          |
| 3         | MiniCalendar       | 45 min          |
| 4         | Refactorizar Home  | 30 min          |
| 5         | Eliminar archivos  | 10 min          |
| 6         | Testing final      | 20 min          |
| **TOTAL** |                    | **2-2.5 horas** |

---

**🚀 ¡Listo para empezar! Sigue los pasos en orden y valida cada Smoke Test antes de continuar.**

**Buena suerte con la migración.** 🎉
