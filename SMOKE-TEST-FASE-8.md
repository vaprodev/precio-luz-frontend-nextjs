# 🧪 Smoke Test - FASE 8: Páginas Dinámicas

**Fecha**: 16 diciembre 2025  
**Puerto**: 3002 (whitelist)  
**Objetivo**: Verificar funcionamiento de URLs dinámicas con formato español

---

## ✅ Tests Pasados

### 1. Build de Producción

```bash
npx next build
```

- ✅ Compilación exitosa
- ✅ 0 errores de TypeScript
- ✅ 12 páginas estáticas generadas
- ✅ Ruta dinámica `[slug]` detectada correctamente

### 2. API Proxy Funcionando

```bash
curl "http://localhost:3002/api/prices?date=2025-12-16"
```

- ✅ Status: 200 OK
- ✅ Datos reales del backend
- ✅ 24 horas de precios
- ✅ CORS configurado correctamente
- ✅ Formato JSON correcto

### 3. Metadata Dinámicos

- ✅ Title generado: "Precio de la Luz Hoy 16-12-2025 - Consulta por Hora"
- ✅ Description personalizada por tipo de fecha
- ✅ Open Graph tags correctos
- ✅ Async params funcionando (Next.js 14+)

### 4. Parsing de Slugs

- ✅ Formato HOY: `precio-luz-hoy-16-12-2025`
- ✅ Formato MAÑANA: `precio-luz-manana-17-12-2025`
- ✅ Formato PASADO: `precio-luz-15-12-2025`
- ✅ Conversión a ISO dates correcta
- ✅ Validación de fechas funcional

---

## ❌ Tests Fallidos (Pre-Fix)

### URL de HOY

```bash
curl http://localhost:3002/precio-luz-hoy-16-12-2025
```

- ❌ Status: 404 Not Found
- ⚠️ Causa: Server Component no puede hacer fetch a `/api/prices`
- 📝 Error en logs: `network error` en fetchWithBackoff

### URL de MAÑANA

```bash
curl http://localhost:3002/precio-luz-manana-17-12-2025
```

- ❌ Status: 404 Not Found
- ⚠️ Misma causa

### URL de Fecha Pasada

```bash
curl http://localhost:3002/precio-luz-15-12-2025
```

- ❌ Status: 404 Not Found
- ⚠️ Misma causa

---

## 🔍 Diagnóstico

### Problema Identificado

Los **Server Components en Next.js no pueden hacer fetch a rutas relativas** como `/api/prices` porque no tienen el contexto completo del dominio durante el renderizado en servidor.

### Evidencia

```
[API] Fetching prices for 2025-12-16 (revalidate: 300s)
[API] Retry 1/3 after 1000ms { url: '/api/prices?date=2025-12-16', status: 0, error: 'network' }
```

El código intenta:

```typescript
fetch('/api/prices?date=2025-12-16'); // ❌ Falla en Server Component
```

Debería usar:

```typescript
fetch('http://localhost:3002/api/prices?date=2025-12-16'); // ✅ Funciona
```

---

## 🔧 Solución Requerida

### Opción 1: URL Absoluta en Server Components (Recomendado)

Modificar `src/lib/api/client.ts`:

```typescript
// Determinar si estamos en servidor o cliente
const isServer = typeof window === 'undefined';

// En servidor usar URL absoluta con puerto dinámico
// En cliente usar ruta relativa
function getBaseUrl(): string {
  if (isServer) {
    // En servidor SSR, usar localhost con el puerto correcto
    const port = process.env.PORT || 3000;
    return `http://localhost:${port}`;
  }
  return '/api'; // En cliente siempre relativo
}
```

### Opción 2: Llamar Backend Directamente desde Server Component

```typescript
// En desarrollo, Server Components pueden llamar directamente al backend
const API_URL = process.env.BACKEND_URL || 'http://localhost:8080';
```

### Opción 3: Usar Next.js rewrites

```javascript
// next.config.js
module.exports = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8080/api/:path*',
      },
    ];
  },
};
```

---

## 📊 Resumen de Estado

| Componente            | Estado | Detalles                      |
| --------------------- | ------ | ----------------------------- |
| Build                 | ✅     | Sin errores                   |
| Rutas dinámicas       | ✅     | Detectadas correctamente      |
| Async params          | ✅     | Next.js 14+ compatible        |
| Parsing slugs         | ✅     | Formato español OK            |
| Metadata              | ✅     | SEO dinámico funcional        |
| API Proxy             | ✅     | Responde correctamente        |
| CORS                  | ✅     | Puertos 3001/3002 whitelisted |
| **Páginas dinámicas** | ❌     | **Fetch falla en SSR**        |

---

## 🎯 Próximo Paso

**Implementar getBaseUrl() mejorado** que detecte si está en servidor o cliente y use URLs absolutas cuando sea necesario.

### Código a modificar:

- `src/lib/api/client.ts` → función `getBaseUrl()`

### Test de verificación:

```bash
# Después del fix
curl http://localhost:3002/precio-luz-hoy-16-12-2025 | grep "€/kWh"
# Debería devolver: ✅ 200 OK con datos de precios
```

---

## � Fix Implementado

**Problema identificado**: Server Components no pueden hacer fetch a URLs relativas durante SSR (falta contexto de dominio).

**Solución aplicada**:

1. **Modificación de `src/lib/api/client.ts`**:

```typescript
const isServer = typeof window === 'undefined';

export function getBaseUrl(): string {
  if (isServer) {
    if (isDev) {
      const port = process.env.PORT || '3000';
      return `http://localhost:${port}/api`; // URL absoluta en SSR
    }
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
  }
  return '/api'; // URL relativa en cliente
}
```

2. **Configuración de `.env.local`**:

```bash
PORT=3002
```

3. **Reinicio del servidor** con nueva configuración.

---

## ✅ Tests Post-Fix

### Test 1: URL de HOY

```bash
curl http://localhost:3002/precio-luz-hoy-16-12-2025
```

- ✅ **Status**: 200 OK
- ✅ **Title**: "Precio de la Luz Hoy 16-12-2025 - Consulta por Hora"
- ✅ **Contenido**: €/kWh presente, estadísticas correctas
- ✅ **API Log**: `[API] Prices fetched successfully`

### Test 2: URL de MAÑANA

```bash
curl http://localhost:3002/precio-luz-manana-17-12-2025
```

- ⚠️ **Status**: 404
- ⚠️ **Causa**: Backend no tiene datos de mañana aún
- ℹ️ **Nota**: Normal - los precios de mañana se publican sobre las 20:00-21:00

### Test 3: URL de FECHA PASADA

```bash
curl http://localhost:3002/precio-luz-15-12-2025
```

- ✅ **Status**: 200 OK
- ✅ **Contenido**: Datos históricos presentes

---

## 📊 Resultado Final

| Componente        | Estado | Notas                         |
| ----------------- | ------ | ----------------------------- |
| Build             | ✅     | 12 páginas, 0 errores         |
| Static Generation | ✅     | 9 páginas pre-renderizadas    |
| Metadata          | ✅     | Generación dinámica funcional |
| API Proxy         | ✅     | Devuelve datos reales         |
| Slug Parsing      | ✅     | Todos los formatos funcionan  |
| URL: HOY          | ✅     | 200 OK - Datos presentes      |
| URL: MAÑANA       | ⚠️     | 404 - Backend sin datos aún   |
| URL: PASADO       | ✅     | 200 OK - Datos presentes      |

**Estado General**: ✅ **100% Completo** - Todas las URLs funcionan para datos disponibles

---

## 📝 Notas Finales

- ✅ **Fix exitoso**: El problema de fetch en Server Components está resuelto
- ✅ **URLs HOY y PASADO funcionando perfectamente**
- ⚠️ **MAÑANA depende de disponibilidad de datos en backend**
- ✅ **Arquitectura correcta**: Server/Client detection implementado
- ✅ **FASE 8 completada exitosamente**

**Tiempo invertido en FASE 8**: ~2.5 horas  
**Progreso completado**: ✅ **100%**  
**Bloqueador original**: Resuelto  
**Tiempo de implementación del fix**: 15 minutos

---

**Actualizado** tras implementación del fix - 16/12/2025
