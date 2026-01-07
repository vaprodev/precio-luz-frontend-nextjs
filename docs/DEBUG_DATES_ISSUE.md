# 🔍 ANÁLISIS: Problema con fechas 1 y 7 de enero

**Fecha**: 7 Enero 2026  
**Issue**: Días 1 y 7 de enero no muestran datos en el frontend

---

## ✅ VERIFICACIÓN BACKEND

### Día 7 de enero (HOY):

```bash
curl "https://api.precioluzhoy.app/api/prices?date=2026-01-07"
```

- **count**: 24
- **X-Completeness**: 24/24
- **Status**: ✅ DATOS DISPONIBLES

### Día 1 de enero:

```bash
curl "https://api.precioluzhoy.app/api/prices?date=2026-01-01"
```

- **count**: 24
- **priceEurKwh**: Valores en €/MWh (148.1, 144.26, etc.)
- **Status**: ✅ DATOS DISPONIBLES

### Día 8 de enero (MAÑANA):

```bash
curl "https://api.precioluzhoy.app/api/prices?date=2026-01-08"
```

- **count**: 0
- **Status**: ❌ SIN DATOS

---

## 🔍 POSIBLES CAUSAS

### 1. **Problema con fecha inicial (Día 7)**

**Flujo esperado:**

1. useTomorrowAvailability verifica día 8
2. Día 8 tiene count=0
3. Setea activeDate = "2026-01-07" (hoy)
4. Muestra gráfico del 7

**Posible problema:**

- El hook se ejecuta correctamente PERO algo está bloqueando la renderización
- Error en usePriceData que no maneja correctamente los datos
- Problema con normalización de precios

### 2. **Problema con intervalo visible del calendario (Día 1)**

**Configuración actual:**

```tsx
const [intervalStartDate] = React.useState(() => {
  const baseYmd = activeDate ?? getTodayMadridYmd();
  const daysToSubtract = numberOfDays - 2; // numberOfDays=7 → subtract 5
  return dayjsDate.subtract(daysToSubtract, 'day').toDate();
});
```

**Ejemplo con hoy 7 enero:**

- baseYmd = "2026-01-07"
- daysToSubtract = 5
- intervalStartDate = 2026-01-02

**Días visibles:** 2, 3, 4, 5, 6, 7, 8 de enero

**Problema:** El día 1 de enero NO está en el rango visible!

### 3. **Problema con maxDate**

```tsx
const maxDate = React.useMemo(() => {
  const todayYmd = getTodayMadridYmd(); // "2026-01-07"
  const tomorrowYmd = getTomorrowMadridYmd(); // "2026-01-08"

  if (tomorrowAvailable) {
    // false porque mañana count=0
    return ymdToZonedDayjs(tomorrowYmd).toDate(); // 8 enero
  }
  return ymdToZonedDayjs(todayYmd).toDate(); // 7 enero
}, [tomorrowAvailable]);
```

**Resultado:** maxDate = 7 enero

**Problema:** maxDate NO bloquea fechas pasadas, solo futuras. Entonces el día 1 DEBERÍA ser clickeable.

### 4. **Problema con excludeDates**

```tsx
const excludeDates = React.useMemo(() => {
  const excluded: Date[] = [];
  const queries = qc.getQueryCache().getAll();

  for (const q of queries) {
    const state = q.state.data as any;
    const hasCount = state && (state.count > 0 || (state.data && state.data.length > 0));
    if (!hasCount) {
      excluded.push(dateObject);
    }
  }

  return excluded;
}, [qc]);
```

**Problema potencial:**

- Si el día 1 no está en cache, NO se excluye
- Si el día 1 está en cache con error o datos mal formateados, SÍ se excluye

### 5. **Problema con normalización de precios**

```typescript
function normalizeItemsToEurPerKwh(items: any[] = []): any[] {
  return items.map((it) => {
    const v = it?.priceEurKwh;
    if (typeof v === 'number' && Number.isFinite(v)) {
      const normalized = v > 10 ? v / 1000 : v;
      return { ...it, priceEurKwh: normalized };
    }
    return it;
  });
}
```

**Valores del día 1:** 148.1, 144.26 → Todos > 10 → Se dividen por 1000 ✅

**Valores del día 7:** 121.88, 117.84 → Todos > 10 → Se dividen por 1000 ✅

Normalización OK.

---

## 🎯 HIPÓTESIS PRINCIPAL

### **Día 7 (HOY):**

El problema NO es que no haya datos, sino:

**Opción A:** Error en la renderización del gráfico

- Los datos llegan correctamente
- PriceChartView tiene algún error con los datos normalizados
- Loading infinito o error no manejado

**Opción B:** usePriceData retorna error

- Algo en el flujo de fetch falla
- Problema con React Query
- Cache corruption

**Opción C:** Estado inicial no se setea

- useTomorrowAvailability no ejecuta setActiveDate
- decidedRef no funciona correctamente
- Race condition

### **Día 1 de enero:**

El problema ES que no está en el rango visible:

**Solución:**

1. El calendario muestra días 2-8 cuando activeDate es 7
2. Para ver el día 1, necesitas hacer scroll/cambiar de rango
3. O hacer click en una fecha pasada para que el intervalo se mueva

---

## 🔧 PRÓXIMOS PASOS DE DEBUG

### 1. Verificar consola del navegador

```
Abrir DevTools → Console
Buscar errores de:
- [useTomorrowAvailability]
- [usePriceData]
- [API Proxy]
- [MiniCalendar]
```

### 2. Verificar Network tab

```
Abrir DevTools → Network
Filtrar por "prices"
Verificar:
- ¿Se hace fetch al día 7?
- ¿Response es 200?
- ¿Data tiene 24 registros?
- ¿Precios están normalizados?
```

### 3. Verificar React DevTools

```
Abrir React DevTools
Buscar HomeContent component
Verificar props:
- activeDate: ¿Es "2026-01-07"?
- data: ¿Tiene 24 elementos?
- loading: ¿Es false?
- error: ¿Es null?
```

### 4. Agregar logs temporales

```typescript
// En app/page.tsx
useEffect(() => {
  console.log('[HomePage DEBUG]', {
    activeDate,
    effectiveDate,
    hasData: !!data,
    dataCount: data?.data?.length,
    loading,
    error,
    meta,
  });
}, [activeDate, effectiveDate, data, loading, error, meta]);
```

---

## ✅ SOLUCIONES PROPUESTAS

### Para el día 7 (HOY):

**Si el problema es que no carga:**

1. Verificar que useTomorrowAvailability setea activeDate correctamente
2. Verificar que usePriceData recibe la fecha correcta
3. Verificar que los datos llegan desde el API proxy
4. Verificar que PriceChartView recibe los datos

**Si el problema es un error visual:**

1. Revisar error en consola
2. Verificar que minPrice/maxPrice no son null
3. Verificar que currentHourIndex es correcto

### Para el día 1 de enero:

**Opción 1: Hacer que el calendario muestre más días hacia atrás**

```typescript
// En MiniCalendarMantine.tsx
const [intervalStartDate] = React.useState(() => {
  const baseYmd = activeDate ?? getTodayMadridYmd();
  const daysToSubtract = numberOfDays - 2; // Cambiar a numberOfDays - 1 o - 3
  return dayjsDate.subtract(daysToSubtract, 'day').toDate();
});
```

**Opción 2: Permitir navegación con botones < >**

Agregar botones para mover el intervalo:

- Click "<" → Muestra días anteriores
- Click ">" → Muestra días siguientes

**Opción 3: Hacer el día 1 clickeable si aparece en otros días visibles**

Si cambias a una fecha más temprana (ej: 5 de enero), el intervalo se recalcula y el día 1 podría entrar en el rango visible.

---

## 📝 CHECKLIST DE VERIFICACIÓN

- [ ] Abrir http://localhost:3001 en navegador
- [ ] Abrir DevTools Console
- [ ] Verificar si hay logs de error
- [ ] Verificar Network tab para /api/prices?date=2026-01-07
- [ ] Verificar si activeDate es "2026-01-07"
- [ ] Verificar si data tiene 24 elementos
- [ ] Intentar hacer click en día 1 (si está visible)
- [ ] Intentar hacer click en día 7
- [ ] Verificar qué pasa en cada caso

---

## 🎯 CONCLUSIÓN PRELIMINAR

Sin ver logs específicos del navegador, las hipótesis más probables son:

1. **Día 7**: Problema de renderización o estado, NO de datos (el backend tiene los datos)
2. **Día 1**: No está en el rango visible del calendario (días 2-8)

**Acción recomendada:** Verificar consola del navegador para ver el error exacto.
