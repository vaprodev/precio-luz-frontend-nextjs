# 🔍 ANÁLISIS LEGACY: Lógica de Fecha Inicial y Disabled

**Fecha de análisis**: 6 Enero 2026  
**Objetivo**: Entender exactamente cómo funciona la lógica de fecha inicial y disabled en legacy

---

## 📋 RESUMEN EJECUTIVO

### Lógica Legacy (CORRECTA):

1. **Al cargar la app**, se hace una petición a `/api/prices?date=MAÑANA`
2. **Si mañana tiene count=24** → `activeDate` inicial = MAÑANA
3. **Si mañana tiene count=0** → `activeDate` inicial = HOY
4. **maxDate del calendario**:
   - Si `tomorrowAvailable=true` → maxDate = MAÑANA
   - Si `tomorrowAvailable=false` → maxDate = HOY

**Ejemplo práctico (hoy 6 enero):**

- Si mañana (7 enero) tiene 24 registros → fecha inicial = 7 enero, 7 enero ENABLED
- Si mañana (7 enero) tiene 0 registros → fecha inicial = 6 enero, 7 enero DISABLED

---

## 🔍 CÓDIGO LEGACY ANALIZADO

### 1. Hook: `useTomorrowAvailability.js`

**Ubicación**: `frontend/src/hooks/useTomorrowAvailability.js`

```javascript
export function useTomorrowAvailability(todayYmd, tomorrowYmd, onFirstDecision) {
  const [available, setAvailable] = React.useState(false);
  const [info, setInfo] = React.useState(null);
  const decidedRef = React.useRef(false);

  React.useEffect(() => {
    async function checkTomorrowAvailability() {
      // 1. Fetch tomorrow's prices
      const { res } = await timedFetch(endpoints.byDate(tomorrowYmd));
      const json = await res.json();

      // 2. Extract count
      const count = json?.count ?? 0;
      const isComplete = count === 24;

      // 3. Update state
      setInfo({ count, date: tomorrowYmd });
      setAvailable(isComplete);

      // 4. CRITICAL: Set initial date ONCE on mount
      if (!decidedRef.current && onFirstDecision) {
        decidedRef.current = true;
        const initialDate = isComplete ? tomorrowYmd : todayYmd;
        console.log('Setting initial date:', initialDate);
        onFirstDecision(initialDate);
      }
    }

    checkTomorrowAvailability();
  }, [todayYmd, tomorrowYmd, onFirstDecision]);

  return { available, info };
}
```

**Características clave:**

- ✅ Se ejecuta UNA sola vez al montar la app
- ✅ Usa `decidedRef` para evitar múltiples decisiones
- ✅ Llama a `onFirstDecision(initialDate)` con la fecha correcta
- ✅ `initialDate = isComplete ? tomorrowYmd : todayYmd`

### 2. Uso en `App.jsx`

**Ubicación**: `frontend/src/App.jsx`

```javascript
export default function App() {
  const { activeDate } = usePricesState();

  // CRITICAL: Wait for initial decision before fetching prices
  const [initialDateReady, setInitialDateReady] = useState(false);

  const { todayMadrid, tomorrowMadrid } = useDateNavigation();

  // Callback to set initial date
  const handleFirstDecision = useCallback((initial) => {
    setActiveDate(initial); // Set activeDate in store
    setInitialDateReady(true); // Allow data fetching
  }, []);

  // Check tomorrow availability and set initial date
  const { available: tomorrowAvailable, info: tomorrowInfo } = useTomorrowAvailability(
    todayMadrid,
    tomorrowMadrid,
    handleFirstDecision, // Callback
  );

  // Only fetch prices AFTER initial decision
  const res = usePricesByDate(initialDateReady ? deferredDate : undefined);

  return (
    <div>
      {!initialDateReady && <div>Comprobando la última fecha disponible…</div>}
      {/* ... rest of UI */}
    </div>
  );
}
```

**Características clave:**

- ✅ `initialDateReady` flag para evitar fetch prematuro
- ✅ Muestra mensaje "Comprobando..." mientras decide
- ✅ `handleFirstDecision` actualiza store Y habilita fetch
- ✅ Evita flash de "hoy" → "mañana"

### 3. MiniCalendar: `MiniCalendarMantine.jsx`

**Ubicación**: `frontend/src/components/MiniCalendarMantine.jsx`

```javascript
export default function MiniCalendarMantine({
  numberOfDays = 7,
  tomorrowAvailable = false, // Prop passed from parent
}) {
  const { activeDate, setActiveDate } = usePricesStore();

  // Calculate maxDate based on tomorrow availability
  const todayYmd = dateToYmdInZone(new Date());
  const tomorrowYmdCalc = ymdToZonedDayjs(todayYmd, SPAIN_TZ).add(1, 'day').format('YYYY-MM-DD');

  // CRITICAL: maxDate restricts future date selection
  const maxDateCalc = tomorrowAvailable
    ? ymdToZonedDayjs(tomorrowYmdCalc, SPAIN_TZ).toDate() // Allow tomorrow
    : ymdToZonedDayjs(todayYmd, SPAIN_TZ).toDate(); // Only today

  return (
    <MiniCalendar
      value={valueDate}
      onChange={(date) => {
        const ymd = date ? dateToYmdInZone(date) : null;
        if (ymd) setActiveDate(ymd);
      }}
      numberOfDays={numberOfDays}
      maxDate={maxDateCalc} // CRITICAL: Disables dates beyond maxDate
      excludeDates={excludeDates} // Disables dates with no data
      // ... other props
    />
  );
}
```

**Características clave:**

- ✅ Recibe `tomorrowAvailable` como prop (no lo calcula internamente)
- ✅ `maxDate` se calcula dinámicamente basado en `tomorrowAvailable`
- ✅ Si `tomorrowAvailable=false` → mañana aparece DISABLED
- ✅ Si `tomorrowAvailable=true` → mañana es clickeable

### 4. Uso en componente padre

**Ubicación**: `frontend/src/components/MejorTramoMantine.jsx`

```javascript
export default function MejorTramoMantine({
  items = [],
  activeDate,
  tomorrowAvailable = false, // Received from App.jsx
  onSelectDate,
}) {
  return (
    <Card>
      <MiniCalendarMantine
        numberOfDays={6}
        value={activeDate}
        onChange={(ymd) => onSelectDate?.(ymd)}
        tomorrowAvailable={tomorrowAvailable} // Pass down
      />
    </Card>
  );
}
```

---

## 🔄 FLUJO COMPLETO (Paso a Paso)

### Escenario A: Mañana tiene datos completos (count=24)

```
1. App monta
2. useTomorrowAvailability:
   - Fetch /api/prices?date=2026-01-07
   - Response: { count: 24, date: "2026-01-07" }
   - isComplete = true
   - setAvailable(true)
   - onFirstDecision("2026-01-07")  ← MAÑANA
3. handleFirstDecision:
   - setActiveDate("2026-01-07")
   - setInitialDateReady(true)
4. MiniCalendar recibe:
   - activeDate = "2026-01-07"
   - tomorrowAvailable = true
   - maxDate = Date("2026-01-07")
5. Usuario ve:
   - Fecha activa: 7 ENERO
   - 7 enero: ENABLED (clickeable)
```

### Escenario B: Mañana NO tiene datos (count=0)

```
1. App monta
2. useTomorrowAvailability:
   - Fetch /api/prices?date=2026-01-07
   - Response: { count: 0, date: "2026-01-07" }
   - isComplete = false
   - setAvailable(false)
   - onFirstDecision("2026-01-06")  ← HOY
3. handleFirstDecision:
   - setActiveDate("2026-01-06")
   - setInitialDateReady(true)
4. MiniCalendar recibe:
   - activeDate = "2026-01-06"
   - tomorrowAvailable = false
   - maxDate = Date("2026-01-06")
5. Usuario ve:
   - Fecha activa: 6 ENERO
   - 7 enero: DISABLED (gris, no clickeable)
```

---

## ⚠️ PROBLEMAS EN IMPLEMENTACIÓN ACTUAL (Next.js)

### ❌ Problema 1: No se verifica mañana al inicio

**Legacy:**

```javascript
// Check tomorrow BEFORE setting initial date
const { available: tomorrowAvailable } = useTomorrowAvailability(
  todayMadrid,
  tomorrowMadrid,
  handleFirstDecision, // Sets initial date based on availability
);
```

**Next.js actual:**

```javascript
// NO HAY verificación inicial
const activeDate = usePricesStore((s) => s.activeDate); // Always today
```

### ❌ Problema 2: Store inicializa siempre en HOY

**Legacy:**

```javascript
// Initial date is set AFTER checking tomorrow
const handleFirstDecision = useCallback((initial) => {
  setActiveDate(initial); // Could be today OR tomorrow
}, []);
```

**Next.js actual:**

```typescript
// Store ALWAYS initializes to today
export const usePricesStore = create<PricesState>((set) => ({
  activeDate: getTodayMadridYmd(), // ← ALWAYS TODAY
  setActiveDate: (newDate: string) => set({ activeDate: newDate }),
}));
```

### ❌ Problema 3: tomorrowAvailable se calcula DESPUÉS

**Legacy:**

```javascript
// Check FIRST, then use the result
const { available: tomorrowAvailable } = useTomorrowAvailability(...);
// tomorrowAvailable is available BEFORE rendering MiniCalendar
```

**Next.js actual:**

```typescript
const { data, loading, error, info, meta } = usePriceData(activeDate);

// tomorrowAvailable calculated from activeDate's data
const tomorrowAvailable = React.useMemo(() => {
  return info?.isComplete === true;
}, [info]);
```

**PROBLEMA**: `info` es del `activeDate` (hoy 6 enero), NO de mañana (7 enero)

---

## ✅ SOLUCIÓN REQUERIDA

### 1. Crear hook `useTomorrowAvailability`

```typescript
// src/hooks/useTomorrowAvailability.ts
export function useTomorrowAvailability() {
  const [available, setAvailable] = useState(false);
  const [loading, setLoading] = useState(true);
  const decidedRef = useRef(false);
  const setActiveDate = usePricesStore((s) => s.setActiveDate);

  useEffect(() => {
    const todayYmd = getTodayMadridYmd();
    const tomorrowYmd = getTomorrowMadridYmd();

    async function checkTomorrow() {
      try {
        // Fetch tomorrow's data
        const result = await fetchPricesByDateClient(tomorrowYmd);

        const count = result.data?.count ?? 0;
        const isComplete = count === 24;

        setAvailable(isComplete);

        // Set initial date ONCE
        if (!decidedRef.current) {
          decidedRef.current = true;
          const initialDate = isComplete ? tomorrowYmd : todayYmd;
          setActiveDate(initialDate);
        }
      } catch (error) {
        setAvailable(false);
        if (!decidedRef.current) {
          decidedRef.current = true;
          setActiveDate(todayYmd);
        }
      } finally {
        setLoading(false);
      }
    }

    checkTomorrow();
  }, []);

  return { available, loading };
}
```

### 2. Modificar store para NO inicializar automáticamente

```typescript
// src/store/pricesStore.ts
export const usePricesStore = create<PricesState>((set) => ({
  activeDate: null, // ← Don't initialize yet
  setActiveDate: (newDate: string) => set({ activeDate: newDate }),
}));
```

### 3. Usar en home page

```typescript
// app/page.tsx
function HomeContent() {
  const activeDate = usePricesStore((s) => s.activeDate);
  const { available: tomorrowAvailable, loading: checkingTomorrow } = useTomorrowAvailability();

  const { data, loading, error } = usePriceData(activeDate ?? getTodayMadridYmd());

  if (checkingTomorrow || !activeDate) {
    return <div>Comprobando la última fecha disponible...</div>;
  }

  return (
    <main>
      <MiniCalendarMantine
        tomorrowAvailable={tomorrowAvailable}
        fetchPricesFn={fetchPricesByDateClient}
      />
      {/* ... rest */}
    </main>
  );
}
```

### 4. MiniCalendar usa tomorrowAvailable para maxDate

```typescript
// src/components/precios/MiniCalendarMantine.tsx
const maxDateCalc = React.useMemo(() => {
  const todayYmd = getTodayMadridYmd();
  const tomorrowYmd = getTomorrowMadridYmd();

  return tomorrowAvailable
    ? ymdToZonedDayjs(tomorrowYmd, SPAIN_TZ).toDate()  // Allow tomorrow
    : ymdToZonedDayjs(todayYmd, SPAIN_TZ).toDate();    // Only today
}, [tomorrowAvailable]);

return (
  <MiniCalendar
    maxDate={maxDateCalc}  // Disables dates beyond this
    // ... other props
  />
);
```

---

## 📝 CHECKLIST DE IMPLEMENTACIÓN

### Para arreglar la lógica de fecha inicial:

- [ ] Crear `src/hooks/useTomorrowAvailability.ts`
- [ ] Modificar `src/store/pricesStore.ts` (activeDate: null inicial)
- [ ] Modificar `app/page.tsx` para usar el hook
- [ ] Agregar loading state "Comprobando la última fecha disponible..."
- [ ] Pasar `tomorrowAvailable` a MiniCalendar
- [ ] Modificar MiniCalendar para usar `tomorrowAvailable` en `maxDate`
- [ ] Probar escenario A: mañana con datos (7 enero activo)
- [ ] Probar escenario B: mañana sin datos (7 enero disabled)

---

## 🎯 COMPORTAMIENTO ESPERADO

### Hoy 6 enero, mañana (7 enero) CON datos:

```
1. Usuario carga la página
2. Ve: "Comprobando la última fecha disponible..."
3. Hook verifica /api/prices?date=2026-01-07
4. Response: count=24
5. activeDate se setea a "2026-01-07"
6. Usuario ve:
   - Fecha activa: 7 ENERO
   - Gráfico muestra precios de 7 enero
   - Calendario muestra 7 enero ENABLED
```

### Hoy 6 enero, mañana (7 enero) SIN datos:

```
1. Usuario carga la página
2. Ve: "Comprobando la última fecha disponible..."
3. Hook verifica /api/prices?date=2026-01-07
4. Response: count=0
5. activeDate se setea a "2026-01-06"
6. Usuario ve:
   - Fecha activa: 6 ENERO
   - Gráfico muestra precios de 6 enero
   - Calendario muestra 7 enero DISABLED (gris)
```

---

## 🔍 DIFERENCIAS CLAVE: Legacy vs Actual

| Aspecto                  | Legacy                                  | Actual (Next.js)              | ¿Correcto? |
| ------------------------ | --------------------------------------- | ----------------------------- | ---------- |
| **Verificación inicial** | Fetch mañana ANTES de setear activeDate | activeDate siempre = hoy      | ❌ NO      |
| **Fecha inicial**        | HOY o MAÑANA (según disponibilidad)     | Siempre HOY                   | ❌ NO      |
| **tomorrowAvailable**    | Calculado de fetch explícito a mañana   | Calculado de activeDate (hoy) | ❌ NO      |
| **maxDate calendario**   | Basado en tomorrowAvailable             | Basado en info de activeDate  | ❌ NO      |
| **Loading inicial**      | Muestra "Comprobando..."                | No muestra mensaje            | ❌ NO      |
| **Flash de contenido**   | NO hay flash                            | Posible flash hoy→mañana      | ❌ NO      |

---

## ✅ CONCLUSIÓN

La implementación actual de Next.js **NO replica la lógica legacy correctamente**:

1. ❌ No verifica mañana al inicio
2. ❌ Siempre inicializa en HOY
3. ❌ `tomorrowAvailable` se calcula del activeDate (incorrecto)
4. ❌ No muestra estado de carga inicial
5. ❌ Mañana NO aparece como disabled cuando debería

**Acción requerida**: Implementar la solución propuesta arriba para replicar el comportamiento legacy exactamente.
