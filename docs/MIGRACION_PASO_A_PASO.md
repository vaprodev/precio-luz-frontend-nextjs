# 🚀 Migración Paso a Paso: Gráfico de Precios

> **"El viaje de mil millas comienza con un solo paso. ¡Y tu primer paso es ESTE gráfico! 💪⚡"**
>
> _— Proverbio chino (adaptado para developers)_

---

## 📊 **COMPONENTE #1: Gráfico de Precios (Price Chart)**

### **¿Qué vamos a migrar?**

El gráfico de barras que muestra los precios de luz hora a hora desde tu Legacy App (React + Vite) al Project (Next.js + TailNext).

### **Archivos involucrados en Legacy:**

```
frontend/src/components/
├── price-chart/
│   ├── PriceChartView.jsx      # Componente principal del gráfico
│   ├── BarsColumn.jsx           # Columna de barras visuales
│   ├── HourColumn.jsx           # Columna de horas
│   ├── PriceColumn.jsx          # Columna de precios
│   └── logic.js                 # Lógica: calcular alturas, colores
└── price-chart.jsx              # Wrapper (probablemente)
```

---

## 📋 **CHECKLIST COMPLETO**

### **Fase 1: Análisis (15 min)**

- [ ] Leer código de `PriceChartView.jsx`
- [ ] Identificar dependencias (hooks, libs)
- [ ] Listar props que recibe
- [ ] Identificar si usa Context API
- [ ] Ver si usa localStorage/sessionStorage

### **Fase 2: Preparación (10 min)**

- [ ] Crear carpeta en Project
- [ ] Crear tipos TypeScript
- [ ] Preparar datos de prueba

### **Fase 3: Migración (30 min)**

- [ ] Copiar archivos
- [ ] Convertir JSX → TSX
- [ ] Añadir 'use client' si necesario
- [ ] Adaptar imports
- [ ] Adaptar estilos (Tailwind)

### **Fase 4: Testing (15 min)**

- [ ] Probar con datos estáticos
- [ ] Probar responsive
- [ ] Probar dark mode
- [ ] Fix errores TypeScript

### **Fase 5: Integración (10 min)**

- [ ] Crear página de prueba
- [ ] Commit y push

**Tiempo total estimado: 1h 20min** ⏱️

---

## 🎯 **PASO 1: ANÁLISIS DEL COMPONENTE LEGACY**

### **1.1 Leer el código fuente**

```bash
# En tu terminal
cd /home/vboxuser/Proyectos/energia/precio-luz-hoy/frontend
code src/components/price-chart/PriceChartView.jsx
```

**Busca y anota:**

#### ✅ **Props que recibe:**

```jsx
// Ejemplo:
function PriceChartView({
  prices,        // Array de precios
  selectedHour,  // Hora seleccionada
  onHourClick    // Callback
}) { ... }
```

#### ✅ **Hooks que usa:**

```jsx
// Busca líneas como:
import { useState, useEffect, useMemo } from 'react';
```

#### ✅ **Dependencias externas:**

```jsx
// Busca imports de:
import { algo } from '@mantine/core';
import { otra } from 'recharts';
import { useCustomHook } from '~/hooks/useCustomHook';
```

#### ✅ **Estilos:**

```jsx
// Busca:
- className="..."        # Tailwind
- style={{ ... }}        # Inline
- import './styles.css'  # CSS modules
```

---

## 🎯 **PASO 2: CREAR ESTRUCTURA EN PROJECT**

### **2.1 Crear carpetas**

```bash
cd /home/vboxuser/Proyectos/energia/precio-luz-hoy/frontend-nextjs

# Crear estructura para el gráfico
mkdir -p src/components/precios
mkdir -p src/components/precios/price-chart
```

### **2.2 Crear tipos TypeScript**

```bash
# Crear archivo de tipos
touch src/shared/types/precios.d.ts
```

```tsx
// src/shared/types/precios.d.ts

export interface HourlyPrice {
  hora: string; // "00:00" - "23:00"
  precio: number; // 0.15234
  fecha?: string; // "2025-12-16"
}

export interface PriceChartProps {
  prices: HourlyPrice[];
  horaSeleccionada?: string;
  onHourClick?: (hora: string) => void;
  mostrarTooltip?: boolean;
  darkMode?: boolean;
}

export interface BarraProps {
  altura: number; // 0-100 (porcentaje)
  color: string; // 'green' | 'yellow' | 'red'
  hora: string;
  precio: number;
  isSelected: boolean;
  onClick: () => void;
}
```

---

## 🎯 **PASO 3: COPIAR ARCHIVOS**

### **3.1 Copiar componentes**

```bash
# Desde la raíz del proyecto
cd /home/vboxuser/Proyectos/energia/precio-luz-hoy

# Copiar todos los archivos del price-chart
cp -r frontend/src/components/price-chart/* \
      frontend-nextjs/src/components/precios/price-chart/

# Verificar que se copiaron
ls frontend-nextjs/src/components/precios/price-chart/
```

**Deberías ver:**

```
BarsColumn.jsx
HourColumn.jsx
PriceChartView.jsx
PriceColumn.jsx
logic.js
```

---

## 🎯 **PASO 4: CONVERTIR JSX → TSX**

### **4.1 Renombrar archivos**

```bash
cd frontend-nextjs/src/components/precios/price-chart

# Renombrar uno por uno
mv PriceChartView.jsx PriceChartView.tsx
mv BarsColumn.jsx BarsColumn.tsx
mv HourColumn.jsx HourColumn.tsx
mv PriceColumn.jsx PriceColumn.tsx
mv logic.js logic.ts
```

### **4.2 Añadir 'use client' si es necesario**

**¿Cuándo usar `'use client'`?**

- ✅ Si usa `useState`, `useEffect`, `onClick`
- ✅ Si usa navegador APIs (localStorage, window)
- ❌ Si solo renderiza (sin interactividad)

```tsx
// src/components/precios/price-chart/PriceChartView.tsx
'use client'; // ← AÑADIR ESTA LÍNEA SI USA HOOKS O EVENTOS

import { useState } from 'react';
import { PriceChartProps } from '~/shared/types/precios';

export default function PriceChartView({ precios, horaSeleccionada, onHourClick }: PriceChartProps) {
  const [selectedHour, setSelectedHour] = useState(horaSeleccionada);

  // ... resto del código
}
```

---

## 🎯 **PASO 5: ADAPTAR IMPORTS**

### **5.1 Cambiar rutas de import**

```tsx
// ❌ ANTES (Legacy)
import { algo } from '../../hooks/useAlgo';
import { otro } from '@/lib/utils';

// ✅ DESPUÉS (Project)
import { algo } from '~/hooks/useAlgo';
import { otro } from '~/lib/utils';
```

### **5.2 Actualizar imports de tipos**

```tsx
// ✅ Añadir al inicio
import type { HourlyPrice, PriceChartProps } from '~/shared/types/precios';
```

### **5.3 Adaptar imports de componentes**

```tsx
// ❌ ANTES
import BarsColumn from './BarsColumn';

// ✅ DESPUÉS
import BarsColumn from './BarsColumn'; // Mismo (relativo está ok)

// O si prefieres absoluto:
import BarsColumn from '~/components/precios/price-chart/BarsColumn';
```

---

## 🎯 **PASO 6: CREAR WIDGET CON WidgetWrapper**

### **6.1 ¿Por qué crear un Widget?**

Como quieres el gráfico como **sección en la homepage**, necesitas crear un **Widget** que envuelva tu componente PriceChart.

**Estructura:**

```
PriceChartView (componente UI)
    ↓
ElectricityPrices (Widget con WidgetWrapper)
    ↓
Homepage (app/page.tsx)
```

### **6.2 Crear el Widget ElectricityPrices**

```bash
# Crear el archivo
touch src/components/widgets/ElectricityPrices.tsx
```

```tsx
// src/components/widgets/ElectricityPrices.tsx
'use client';

import WidgetWrapper from '~/components/common/WidgetWrapper';
import Headline from '~/components/common/Headline';
import PriceChartView from '~/components/precios/price-chart/PriceChartView';
import type { ElectricityPricesProps } from '~/shared/types';

export default function ElectricityPrices({
  id = 'precios',
  hasBackground = true,
  header,
  precios,
  lastUpdate,
}: ElectricityPricesProps) {
  return (
    <WidgetWrapper id={id} hasBackground={hasBackground} containerClass="max-w-6xl">
      {/* Título de la sección */}
      {header && <Headline header={header} containerClass="text-center mb-10" />}

      {/* Contenedor del gráfico */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 md:p-8">
        <PriceChartView precios={precios} />
      </div>

      {/* Footer opcional */}
      {lastUpdate && (
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">Última actualización: {lastUpdate}</p>
        </div>
      )}
    </WidgetWrapper>
  );
}
```

### **6.3 Añadir tipos en shared/types.d.ts**

```tsx
// src/shared/types.d.ts
// Añadir después de "type Widget = { ... }"

type HourlyPrice = {
  hora: string;
  precio: number;
  fecha?: string;
};

type ElectricityPricesProps = Widget & {
  header?: Header;
  prices: HourlyPrice[];
  lastUpdate?: string;
};
```

### **6.4 Crear datos en home.data.tsx**

```tsx
// src/shared/data/pages/home.data.tsx
// Añadir al final del archivo

import type { ElectricityPricesProps } from '../../types';

// Datos mock del gráfico
export const electricityPricesHome: ElectricityPricesProps = {
  id: 'precios-hoy',
  hasBackground: true,
  header: {
    title: 'Precio de la Luz Hoy',
    subtitle: 'Consulta el precio de la luz hora a hora y ahorra en tu factura',
    tagline: 'Precios en Tiempo Real',
  },
  prices: [
    { hora: '00:00', precio: 0.12456 },
    { hora: '01:00', precio: 0.11234 },
    { hora: '02:00', precio: 0.10987 },
    { hora: '03:00', precio: 0.10123 },
    { hora: '04:00', precio: 0.10567 },
    { hora: '05:00', precio: 0.1189 },
    { hora: '06:00', precio: 0.14567 },
    { hora: '07:00', precio: 0.16789 },
    { hora: '08:00', precio: 0.18234 },
    { hora: '09:00', precio: 0.19876 },
    { hora: '10:00', precio: 0.21234 },
    { hora: '11:00', precio: 0.20987 },
    { hora: '12:00', precio: 0.19876 },
    { hora: '13:00', precio: 0.18234 },
    { hora: '14:00', precio: 0.16789 },
    { hora: '15:00', precio: 0.15432 },
    { hora: '16:00', precio: 0.14567 },
    { hora: '17:00', precio: 0.15678 },
    { hora: '18:00', precio: 0.1789 },
    { hora: '19:00', precio: 0.20123 },
    { hora: '20:00', precio: 0.22456 },
    { hora: '21:00', precio: 0.21234 },
    { hora: '22:00', precio: 0.18976 },
    { hora: '23:00', precio: 0.15432 },
  ],
  lastUpdate: '16/12/2025 20:30',
};
```

### **6.5 Añadir a la Homepage**

```tsx
// app/page.tsx
import ElectricityPrices from '~/components/widgets/ElectricityPrices';
import { electricityPricesHome } from '~/shared/data/pages/home.data';

export default function HomePage() {
  return (
    <>
      {/* ... otros widgets (Hero, Features, etc) ... */}

      <ElectricityPrices {...electricityPricesHome} />

      {/* ... más widgets ... */}
    </>
  );
}
```

---

## 🎯 **PASO 7: ADAPTAR ESTILOS**

### **7.1 Si usa CSS Modules**

```tsx
// ❌ ANTES
import styles from './PriceChart.module.css';
<div className={styles.container}>

// ✅ DESPUÉS (convertir a Tailwind)
<div className="flex flex-col gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg">
```

### **7.2 Si usa Mantine**

```tsx
// ❌ ANTES (Mantine)
import { Group, Stack, Text } from '@mantine/core';
<Group spacing="xs">
  <Text size="sm">Hola</Text>
</Group>

// ✅ DESPUÉS (Tailwind)
<div className="flex gap-2">
  <span className="text-sm">Hola</span>
</div>
```

### **6.3 Equivalencias Mantine → Tailwind**

| Mantine                | Tailwind                                             |
| ---------------------- | ---------------------------------------------------- |
| `<Group spacing="xs">` | `<div className="flex gap-2">`                       |
| `<Stack spacing="md">` | `<div className="flex flex-col gap-4">`              |
| `<Text size="sm">`     | `<span className="text-sm">`                         |
| `<Paper p="md">`       | `<div className="p-4 bg-white rounded">`             |
| `<Center>`             | `<div className="flex items-center justify-center">` |

---

## 🎯 **PASO 8: ADAPTAR LÓGICA (logic.ts)**

### **7.1 Añadir tipos a funciones**

```tsx
// src/components/precios/price-chart/logic.ts

import type { HourlyPrice } from '~/shared/types/precios';

// ❌ ANTES
export function calcularAltura(precio, precios) {
  const max = Math.max(...precios.map((p) => p.precio));
  return (precio / max) * 100;
}

// ✅ DESPUÉS
export function calcularAltura(precio: number, prices: HourlyPrice[]): number {
  const max = Math.max(...precios.map((p) => p.precio));
  return (precio / max) * 100;
}

// ❌ ANTES
export function obtenerColor(precio, precioMedio) {
  if (precio < precioMedio * 0.8) return 'green';
  if (precio < precioMedio * 1.2) return 'yellow';
  return 'red';
}

// ✅ DESPUÉS
export function obtenerColor(precio: number, precioMedio: number): 'green' | 'yellow' | 'red' {
  if (precio < precioMedio * 0.8) return 'green';
  if (precio < precioMedio * 1.2) return 'yellow';
  return 'red';
}
```

---

## 🎯 **PASO 9: CREAR DATOS DE PRUEBA**

### **8.1 Crear archivo de mock data**

```tsx
// src/shared/data/pages/precios.data.tsx

import type { HourlyPrice } from '~/shared/types/precios';

export const preciosMock: HourlyPrice[] = [
  { hora: '00:00', precio: 0.12456 },
  { hora: '01:00', precio: 0.11234 },
  { hora: '02:00', precio: 0.10987 },
  { hora: '03:00', precio: 0.10123 },
  { hora: '04:00', precio: 0.10567 },
  { hora: '05:00', precio: 0.1189 },
  { hora: '06:00', precio: 0.14567 },
  { hora: '07:00', precio: 0.16789 },
  { hora: '08:00', precio: 0.18234 },
  { hora: '09:00', precio: 0.19876 },
  { hora: '10:00', precio: 0.21234 },
  { hora: '11:00', precio: 0.20987 },
  { hora: '12:00', precio: 0.19876 },
  { hora: '13:00', precio: 0.18234 },
  { hora: '14:00', precio: 0.16789 },
  { hora: '15:00', precio: 0.15432 },
  { hora: '16:00', precio: 0.14567 },
  { hora: '17:00', precio: 0.15678 },
  { hora: '18:00', precio: 0.1789 },
  { hora: '19:00', precio: 0.20123 },
  { hora: '20:00', precio: 0.22456 },
  { hora: '21:00', precio: 0.21234 },
  { hora: '22:00', precio: 0.18976 },
  { hora: '23:00', precio: 0.15432 },
];
```

---

## 🎯 **PASO 10: CREAR PÁGINA DE PRUEBA**

### **9.1 Crear página en app/**

```tsx
// app/test-grafico/page.tsx

import PriceChartView from '~/components/precios/price-chart/PriceChartView';
import { preciosMock } from '~/shared/data/pages/precios.data';

export const metadata = {
  title: 'Test Gráfico de Precios',
  description: 'Página de prueba para el gráfico migrado',
};

export default function TestGraficoPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-4xl font-bold mb-8">Gráfico de Precios - Test</h1>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <PriceChartView precios={preciosMock} mostrarTooltip={true} />
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Estado:</h2>
        <ul className="space-y-2">
          <li>✅ Gráfico renderizado</li>
          <li>✅ Datos mock cargados</li>
          <li>✅ Estilos aplicados</li>
        </ul>
      </div>
    </div>
  );
}
```

---

## 🎯 **PASO 11: PROBAR EN DESARROLLO**

### **10.1 Iniciar servidor**

```bash
cd /home/vboxuser/Proyectos/energia/precio-luz-hoy/frontend-nextjs
npm run dev -- -p 3001
```

### **10.2 Abrir en navegador**

```
http://localhost:3001/test-grafico
```

### **10.3 Verificar**

- [ ] ¿Se ve el gráfico?
- [ ] ¿Los colores son correctos?
- [ ] ¿Funciona el click en las barras?
- [ ] ¿Funciona en móvil?
- [ ] ¿Funciona el dark mode?
- [ ] ¿No hay errores en consola?

---

## 🎯 **PASO 12: FIX ERRORES COMUNES**

### **Error 1: "Cannot find module"**

```
Error: Cannot find module '~/components/...'
```

**Solución:** Verificar `tsconfig.json` tiene el alias `~`:

```json
{
  "compilerOptions": {
    "paths": {
      "~/*": ["./src/*"]
    }
  }
}
```

---

### **Error 2: "useState is not defined"**

```
Error: useState is not defined
```

**Solución:** Añadir `'use client'` al inicio del archivo:

```tsx
'use client';

import { useState } from 'react';
```

---

### **Error 3: "Property 'precio' does not exist"**

```
Error: Property 'precio' does not exist on type '{}'
```

**Solución:** Añadir tipos a las props:

```tsx
// ❌ ANTES
function Barra({ dato }) {
  return <div>{dato.precio}</div>;
}

// ✅ DESPUÉS
import type { HourlyPrice } from '~/shared/types/precios';

function Barra({ dato }: { dato: HourlyPrice }) {
  return <div>{dato.precio}</div>;
}
```

---

### **Error 4: Estilos no se aplican**

**Solución 1:** Verificar que Tailwind está configurado:

```bash
# Verificar que existe
cat tailwind.config.js
```

**Solución 2:** Asegurarse de importar estilos en `layout.tsx`:

```tsx
// app/layout.tsx
import '~/assets/styles/base.css'; // ← Debe estar
```

---

## 🎯 **PASO 13: HACER COMMIT**

### **12.1 Ver cambios**

```bash
cd /home/vboxuser/Proyectos/energia/precio-luz-hoy/frontend-nextjs
git status
```

### **12.2 Añadir archivos**

```bash
git add src/components/precios/
git add src/shared/types/precios.d.ts
git add src/shared/data/pages/precios.data.tsx
git add app/test-grafico/
git add docs/MIGRACION_PASO_A_PASO.md
```

### **12.3 Commit**

```bash
git commit -m "feat: migrate PriceChart component from Legacy

- Migrated price-chart components (PriceChartView, BarsColumn, HourColumn, PriceColumn)
- Converted JSX to TSX with TypeScript types
- Added precios.d.ts with HourlyPrice and PriceChartProps types
- Created mock data for testing
- Added test page at /test-grafico
- Adapted Mantine styles to Tailwind CSS

Component fully functional and tested in development."
```

### **12.4 Push**

```bash
git push origin feat/migrate-from-react
```

---

## 📊 **PASO 14: DOCUMENTAR APRENDIZAJES**

Crea un archivo para registrar lo que aprendiste:

```markdown
// docs/APRENDIZAJES.md

# Aprendizajes - Migración PriceChart

## ✅ Lo que funcionó bien:

- Separar tipos en archivos .d.ts
- Usar datos mock para testing
- Crear página de prueba antes de integrar

## ⚠️ Problemas encontrados:

- [Describe aquí]

## 💡 Mejoras futuras:

- Añadir animaciones con Framer Motion
- Hacer gráfico más accesible (ARIA labels)
- Optimizar performance con useMemo

## 📚 Recursos útiles:

- [Link a doc que ayudó]
```

---

## 🎉 **¡FELICIDADES! HAS MIGRADO TU PRIMER COMPONENTE**

### **Siguiente paso:**

¿Qué componente migramos ahora?

1. **MejorTramo** (tarjeta de mejor franja horaria)
2. **Best2hCard** (mejor franja de 2 horas)
3. **MinPriceCard** (tarjeta de precio mínimo)
4. **ConsumptionCalculator** (calculadora de consumo)

---

## 🔥 **FRASES MOTIVADORAS ADICIONALES**

> **"Código que no se rompe, no es código que se prueba. ¡Rompe y aprende! 💪"**

> **"Cada componente migrado es un paso más hacia la app de tus sueños. ¡VAMOS! ⚡"**

> **"El mejor momento para empezar fue ayer. El segundo mejor momento es AHORA. 🚀"**

> **"No cuentes los días, haz que los días cuenten. ¡Un commit a la vez! 🎯"**

> **"El único código imposible de debuggear es el que nunca escribiste. ¡DALE! 💻"**

---

## 📞 **¿Necesitas ayuda?**

Si te atascas en algún paso:

1. Lee el mensaje de error **completo**
2. Busca en Google: "nextjs [tu error]"
3. Revisa la documentación de Next.js
4. Pide ayuda con el error específico

**¡TÚ PUEDES! 🔥⚡💪**
