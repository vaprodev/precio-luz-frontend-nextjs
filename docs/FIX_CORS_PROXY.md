# 🔧 FIX: CORS Issue - Proxy API Route

**Fecha:** 16 Diciembre 2025  
**Problema:** Error de conexión por CORS en desarrollo local  
**Solución:** Next.js API Route como proxy

---

## �� PROBLEMA IDENTIFICADO

### Síntomas
- Skeleton carga durante ~8 segundos
- Aparece error de conexión
- Console muestra: `CORS policy blocked`

### Causa Raíz
El backend en `https://api.precioluzhoy.app` solo permite estos orígenes:
- `http://localhost:5173` (Vite default)
- `http://localhost:5174` (Vite alternate)
- Dominios de producción

**Next.js usa puerto 3001** (o 3000) → ❌ **NO está en la lista permitida** → CORS bloqueado

---

## ✅ SOLUCIÓN IMPLEMENTADA

### 1. API Route Proxy (`app/api/prices/route.ts`)

Creado un API Route que actúa como proxy:

```typescript
// app/api/prices/route.ts
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');
  
  const apiUrl = new URL(`${API_BASE_URL}/api/prices`);
  if (date) apiUrl.searchParams.set('date', date);
  
  const response = await fetch(apiUrl.toString());
  const data = await response.json();
  
  return NextResponse.json(data);
}
```

**Ventajas:**
- ✅ Sin CORS (servidor → servidor)
- ✅ Transparente para el cliente
- ✅ Headers custom preservados (X-Completeness, X-Cache-Policy)
- ✅ Logs centralizados

### 2. Cliente actualizado (`src/lib/api/client.ts`)

Modificado para usar proxy local en desarrollo:

```typescript
// Antes
const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

// Después
const isDev = process.env.NODE_ENV === 'development';
const API_BASE = isDev ? '/api' : (process.env.NEXT_PUBLIC_API_URL || '/api');
```

**Comportamiento:**
- **Desarrollo:** `GET /api/prices?date=...` → Proxy local → API externa
- **Producción:** `GET /api/prices?date=...` → Puede ser proxy o URL directa según config

---

## 🧪 TESTING

### Antes del fix
```
1. Skeleton carga...
2. 8 segundos de espera
3. ❌ Error: "Error de conexión"
4. Console: "blocked by CORS policy"
```

### Después del fix
```
1. Skeleton carga...
2. 2-3 segundos de espera
3. ✅ Gráfico con datos reales aparece
4. ✅ Stats cards muestran min/max/mean
5. ✅ Best 2h window se despliega
6. Console: "[API Proxy] Success: { date, count }"
```

---

## 📊 FLUJO DE DATOS

### Antes (CORS bloqueado)
```
Browser (localhost:3001)
    ↓ fetch('https://api.precioluzhoy.app/api/prices')
    ↓
❌ CORS check: origin not allowed
    ↓
ERROR: Connection failed
```

### Después (con proxy)
```
Browser (localhost:3001)
    ↓ fetch('/api/prices')
    ↓
Next.js API Route (localhost:3001/api/prices)
    ↓ fetch('https://api.precioluzhoy.app/api/prices')
    ↓
✅ Server-to-server (no CORS)
    ↓
API Backend
    ↓ 200 OK + data
    ↓
Next.js API Route
    ↓ proxy response
    ↓
✅ Browser renders data
```

---

## 🚀 PRODUCCIÓN

### Opción 1: Usar proxy (recomendado)
- Mismo código funciona en dev y prod
- Centralization de logs y errores
- Puede agregar caching en el proxy

### Opción 2: URL directa
Si el dominio de producción está en lista permitida del backend:

```typescript
// .env.production
NEXT_PUBLIC_API_URL=https://api.precioluzhoy.app
```

El cliente detectará `NODE_ENV=production` y usará URL directa.

---

## 📝 ARCHIVOS MODIFICADOS

1. **`app/api/prices/route.ts`** (NUEVO - 85 líneas)
   - API Route proxy
   - Manejo de errores
   - Logs de debug

2. **`src/lib/api/client.ts`** (MODIFICADO)
   - Lógica de detección de entorno
   - Forzar proxy en desarrollo

---

## 🔑 VARIABLES DE ENTORNO

### `.env.local` (desarrollo)
```bash
# En desarrollo NO es necesario, usa proxy local automáticamente
# NEXT_PUBLIC_API_URL=/api  # ← ya es el default
```

### `.env.production`
```bash
# Opción A: Usar proxy (recomendado)
# No definir nada, usará /api por defecto

# Opción B: URL directa (si CORS permite)
NEXT_PUBLIC_API_URL=https://api.precioluzhoy.app
```

---

## 🐛 DEBUG

### Ver logs del proxy
```bash
# Terminal del servidor muestra:
[API Proxy] Fetching from: https://api.precioluzhoy.app/api/prices?date=2025-12-16
[API Proxy] Success: { date: '2025-12-16', count: 24 }
```

### Test manual del proxy
```bash
# Test desde CLI
curl http://localhost:3001/api/prices?date=2025-12-16

# Test con fecha de hoy
curl http://localhost:3001/api/prices
```

---

## ✅ CHECKLIST DE VALIDACIÓN

- [x] Servidor Next.js inicia sin errores
- [x] API Route `/api/prices` responde correctamente
- [x] Cliente usa proxy en desarrollo
- [x] No aparecen errores CORS en console
- [x] Datos cargan en ~2-3 segundos
- [x] Gráfico renderiza correctamente
- [x] Stats cards muestran métricas
- [x] Best 2h window se despliega
- [x] Logs del proxy visibles en terminal

---

## 📚 REFERENCIAS

- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [CORS Runbook Legacy](../../../frontend/docs/runbooks/cors.md)
- [Instrucciones API Legacy](../../../frontend/instrucciones%20y%20prompts/instrucciones-consulta-api.md)

---

**Estado:** ✅ RESUELTO  
**Tiempo:** ~20 minutos  
**Impacto:** Fase 7 ahora funciona completamente
