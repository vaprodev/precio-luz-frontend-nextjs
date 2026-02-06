# 🚀 Guía de Deploy a Vercel - Opción 2 (Nuevo Proyecto)

**Fecha**: 2026-02-06  
**Proyecto**: Gurú Eléctrico (precioluzhoy.app)  
**Estrategia**: Nuevo proyecto Vercel para máxima seguridad

---

## 📋 Tabla de Contenidos

1. [Pre-requisitos](#pre-requisitos)
2. [FASE 1: Preparación Local](#fase-1-preparación-local-15-min)
3. [FASE 2: Configuración de Archivos](#fase-2-configuración-de-archivos-15-min)
4. [FASE 3: Backup del Legacy](#fase-3-backup-del-legacy-10-min)
5. [FASE 4: Crear Nuevo Proyecto Vercel](#fase-4-crear-nuevo-proyecto-vercel-15-min)
6. [FASE 5: Tests en URL Temporal](#fase-5-tests-en-url-temporal-30-min)
7. [FASE 6: Dominio Staging](#fase-6-dominio-staging-60-min)
8. [FASE 7: Switch a Producción](#fase-7-switch-a-producción-30-min)
9. [FASE 8: Validación Final](#fase-8-validación-final-20-min)
10. [FASE 9: Documentación](#fase-9-documentación-15-min)
11. [Plan de Rollback](#plan-de-rollback)
12. [Troubleshooting](#troubleshooting)

---

## Pre-requisitos

- ✅ Código en branch `main` actualizado
- ✅ Build local exitoso
- ✅ Tests manuales pasados
- ✅ Acceso a Vercel Dashboard
- ✅ Acceso a proveedor DNS
- ✅ Backend API funcionando (`https://api.precioluzhoy.app`)

---

## FASE 1: Preparación Local (15 min)

### 1.1 Verificar estado actual

```bash
cd frontend-nextjs

# Ver cambios pendientes
git status
```

### 1.2 Commit cambios pendientes

```bash
# Si hay cambios en Logo.tsx u otros archivos
git add src/components/atoms/Logo.tsx
git commit -m "branding: update logo to Gurú Eléctrico"
git push origin main
```

### 1.3 Limpiar y rebuild

```bash
# Limpiar completamente
rm -rf .next node_modules package-lock.json

# Reinstalar dependencias
npm install

# Build de producción
npm run build
```

**✅ Test Esperado:**

```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages
✓ Finalizing page optimization
```

**❌ Si falla el build:**

- Revisar errores en terminal
- Corregir antes de continuar
- No proceder hasta tener build exitoso

### 1.4 Test local del build

```bash
# Iniciar servidor de producción
npm start
```

**Abrir http://localhost:3000 y verificar:**

- [ ] Logo "Gurú Eléctrico" visible
- [ ] Calendario carga
- [ ] Gráfico muestra datos
- [ ] Click en fechas funciona
- [ ] No hay errores en consola (F12)
- [ ] Dark mode funciona

**Test del API proxy local:**

```bash
# En otra terminal
curl http://localhost:3000/api/prices?date=2026-01-07 | jq .

# ✅ Expected: JSON con count=24, array de precios
```

---

## FASE 2: Configuración de Archivos (15 min)

### 2.1 Crear .env.example

```bash
cd frontend-nextjs

cat > .env.example << 'EOF'
# Backend API URL
NEXT_PUBLIC_API_URL=https://api.precioluzhoy.app

# Environment
NODE_ENV=production
EOF

# Commit
git add .env.example
git commit -m "docs: add environment variables example"
```

### 2.2 Crear vercel.json

```bash
cat > vercel.json << 'EOF'
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "buildCommand": "npm run build",
  "framework": "nextjs",
  "headers": [
    {
      "source": "/api/prices",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, s-maxage=3600, stale-while-revalidate=86400"
        }
      ]
    }
  ],
  "redirects": [
    {
      "source": "/precio-luz/:slug",
      "destination": "/",
      "permanent": true
    }
  ]
}
EOF

# Verificar sintaxis JSON
cat vercel.json | jq .

# Commit
git add vercel.json
git commit -m "config: add Vercel configuration"
```

### 2.3 Push todos los cambios

```bash
git push origin main

# Verificar que todo subió correctamente
git log -1
```

---

## FASE 3: Backup del Legacy (10 min)

### 3.1 Tag del código legacy

```bash
cd ../frontend  # Ir a carpeta del legacy

# Verificar branch
git branch
# ✅ Debe estar en main

# Crear tag con fecha
git tag -a v1.0.0-legacy-2026-02-06 -m "Legacy version before Next.js migration"

# Push tag
git push origin v1.0.0-legacy-2026-02-06

# Verificar
git tag -l | grep legacy
```

### 3.2 Documentar configuración actual de Vercel

**Ir a Vercel Dashboard del proyecto legacy:**

1. Abrir https://vercel.com
2. Ir al proyecto actual "precioluzhoy"
3. Settings → General

**Capturar/Anotar:**

```yaml
# Configuración Legacy Actual
Framework: Create React App (o detectado automáticamente)
Root Directory: frontend
Build Command: npm run build
Output Directory: build (o dist)
Install Command: npm install
Node.js Version: 18.x

Environment Variables:
  REACT_APP_API_URL: https://api.precioluzhoy.app

Domains:
  - precioluzhoy.app (Primary)
  - www.precioluzhoy.app (Redirect from root)
```

### 3.3 Obtener URL del último deployment legacy

```bash
# En Vercel Dashboard:
# Deployments → Click en el más reciente → Copiar URL
# Ejemplo: https://precioluzhoy-abc123.vercel.app

# Guardar en archivo local
echo "Legacy Deployment URL: https://precioluzhoy-abc123.vercel.app" > ~/legacy-backup.txt
```

---

## FASE 4: Crear Nuevo Proyecto Vercel (15 min)

### 4.1 Import desde GitHub

1. **Ir a Vercel Dashboard**: https://vercel.com
2. Click **"Add New..."** → **"Project"**
3. Click **"Import Git Repository"**
4. Seleccionar tu repositorio de GitHub
5. **NO seleccionar el proyecto existente**

### 4.2 Configurar proyecto

```yaml
Project Name: precioluzhoy-nextjs
  ⚠️ IMPORTANTE: Diferente al legacy para evitar conflictos

Framework Preset: Next.js

Root Directory: frontend-nextjs
  ⚠️ CRÍTICO: Este es el punto más importante

Build Command: npm run build
  (Dejar por defecto)

Output Directory: (vacío)
  (Next.js lo detecta automáticamente)

Install Command: npm install
  (Dejar por defecto)

Node.js Version: 18.x
  (o 20.x si prefieres la última LTS)
```

### 4.3 Environment Variables

Click en **"Environment Variables"** y añadir:

```bash
Key: NEXT_PUBLIC_API_URL
Value: https://api.precioluzhoy.app
Environments: ✓ Production ✓ Preview ✓ Development
```

**Verificar:**

- Nombre de la variable correcto (NEXT_PUBLIC_API_URL)
- URL correcta (https, no http)
- Aplicada a los 3 entornos

### 4.4 Iniciar Deploy

1. Click **"Deploy"**
2. Esperar 2-3 minutos
3. Ver logs en tiempo real

**✅ Build exitoso mostrará:**

```
✓ Creating an optimized production build
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages
✓ Finalizing page optimization

Build completed. Deployment starting...
```

### 4.5 Guardar URL temporal

```bash
# Vercel asigna URL automática:
# https://precioluzhoy-nextjs.vercel.app
# o
# https://precioluzhoy-nextjs-xyz789.vercel.app

# Guardar en variable para tests
export VERCEL_TEMP_URL="https://precioluzhoy-nextjs.vercel.app"

# Guardar en archivo
echo "Temp URL: $VERCEL_TEMP_URL" >> ~/deployment-urls.txt
```

---

## FASE 5: Tests en URL Temporal (30 min)

### 5.1 Test básico de conectividad

```bash
# Test HTTP
curl -I $VERCEL_TEMP_URL

# ✅ Expected:
# HTTP/2 200
# server: Vercel
```

### 5.2 Tests funcionales detallados

**Abrir `$VERCEL_TEMP_URL` en navegador:**

#### ✅ Carga inicial (2 min)

- [ ] Logo "Gurú Eléctrico" visible arriba izquierda
- [ ] Mensaje "Comprobando la última fecha disponible..." aparece brevemente
- [ ] Calendario se renderiza sin errores
- [ ] Gráfico carga con barras de colores
- [ ] Tarjetas de estadísticas (min/med/max) muestran valores

**Abrir DevTools (F12) → Console:**

- [ ] No hay errores rojos
- [ ] Solo logs informativos permitidos

#### ✅ Funcionalidad del calendario (5 min)

**Test 1: Click en día pasado (ej: 1 de enero)**

```
1. Click en día 1 de enero en el calendario
2. Esperar actualización del gráfico
3. Verificar:
   ✅ Gráfico muestra 24 barras
   ✅ Tarjetas actualizan con nuevos valores
   ✅ Fecha en título cambia a "1 de enero"
   ✅ No hay errores en consola
```

**Test 2: Click en día actual (hoy)**

```
1. Click en la fecha de hoy
2. Verificar:
   ✅ Hora actual resaltada en el gráfico
   ✅ Barra de la hora actual tiene color diferente
   ✅ Datos completos o parciales según la hora
```

**Test 3: Fechas futuras**

```
1. Intentar click en fechas futuras sin datos
2. Verificar:
   ✅ Días deshabilitados (gris, no clickeable)
   ✅ maxDate funciona correctamente
   ✅ No se pueden seleccionar fechas inválidas
```

#### ✅ Test del API proxy (5 min)

```bash
# Test 1: Fecha con datos completos
curl "$VERCEL_TEMP_URL/api/prices?date=2026-01-07" | jq .

# ✅ Verificar respuesta:
# {
#   "date": "2026-01-07",
#   "count": 24,
#   "data": [
#     {
#       "id": 235897,
#       "priceEurKwh": 0.12188,  ← Normalizado (< 1)
#       "hourIndex": 0,
#       ...
#     },
#     ...
#   ]
# }

# Test 2: Headers de cache
curl -I "$VERCEL_TEMP_URL/api/prices?date=2026-01-06"

# ✅ Expected headers:
# cache-control: public, max-age=86400, immutable
# x-cache-policy: past
# x-completeness: 24/24

# Test 3: Fecha futura sin datos
curl "$VERCEL_TEMP_URL/api/prices?date=2026-12-31" | jq .

# ✅ Expected:
# {
#   "date": "2026-12-31",
#   "count": 0,
#   "data": []
# }
```

#### ✅ Performance (5 min)

**Lighthouse en Chrome DevTools:**

1. Abrir DevTools (F12)
2. Tab "Lighthouse"
3. Categories: ✓ All
4. Mode: Navigation (default)
5. Device: Mobile
6. Click "Analyze page load"

**✅ Targets mínimos:**

```yaml
Performance: > 85 (mobile), > 90 (desktop)
Accessibility: > 95
Best Practices: > 95
SEO: > 90
```

**Si Performance < 85:**

- Revisar Network tab para recursos pesados
- Verificar imágenes optimizadas
- Considerar lazy loading

#### ✅ Responsive (3 min)

**DevTools → Toggle device toolbar (Ctrl+Shift+M):**

**Desktop (1920x1080):**

- [ ] Layout amplio, gráfico grande
- [ ] Calendario horizontal completo
- [ ] Tarjetas en fila

**Tablet (768x1024):**

- [ ] Layout adaptado
- [ ] Calendario ajustado
- [ ] Tarjetas en 2 columnas

**Mobile (375x667):**

- [ ] Layout vertical
- [ ] Calendario scrollable horizontal
- [ ] Tarjetas en 1 columna
- [ ] Texto legible sin zoom

#### ✅ Dark mode (2 min)

1. Click en toggle de dark mode (header)
2. Verificar:
   - [ ] Fondo oscuro
   - [ ] Texto claro
   - [ ] Gráfico adaptado (colores visibles)
   - [ ] Calendario adaptado
   - [ ] Contraste adecuado (WCAG AA)

#### ✅ Widgets del template (5 min)

**Scroll down en la página:**

- [ ] Hero section visible
- [ ] Features section con íconos
- [ ] Content sections con imágenes
- [ ] Steps/Timeline
- [ ] Testimonials
- [ ] FAQs expandibles
- [ ] Footer con links

**Test de interactividad:**

- [ ] Click en FAQs expande/colapsa
- [ ] Links del footer funcionan
- [ ] Imágenes cargan correctamente

#### ✅ Error handling (3 min)

**Test de errores graceful:**

```bash
# Simular error de red (DevTools → Network → Offline)
1. Abrir DevTools → Network tab
2. Throttling: Offline
3. Click en una fecha diferente
4. Verificar:
   ✅ Mensaje de error amigable (no crash)
   ✅ UI sigue siendo usable
   ✅ Posibilidad de reintentar

# Restaurar
5. Throttling: No throttling
```

### 5.3 Comparación con legacy

**Abrir en paralelo:**

- **Legacy**: https://precioluzhoy.app
- **Next.js**: $VERCEL_TEMP_URL

**Verificar paridad funcional:**

| Feature              | Legacy | Next.js | Status |
| -------------------- | ------ | ------- | ------ |
| Mostrar precios hoy  | ✅     | ✅      | ✅     |
| Calendario navegable | ✅     | ✅      | ✅     |
| Gráfico 24 horas     | ✅     | ✅      | ✅     |
| Tarjetas min/med/max | ✅     | ✅      | ✅     |
| Dark mode            | ✅     | ✅      | ✅     |
| Responsive           | ✅     | ✅      | ✅     |

**Verificar mejoras:**

- [ ] Next.js carga más rápido
- [ ] Next.js tiene mejor SEO
- [ ] Next.js más responsive
- [ ] Widgets adicionales (Hero, Features, etc.)

---

## FASE 6: Dominio Staging (60 min)

### 6.1 Configurar subdominio staging

**En Vercel Dashboard del proyecto "precioluzhoy-nextjs":**

1. **Settings** → **Domains**
2. Click **"Add"**
3. Input: `staging.precioluzhoy.app`
4. Click **"Add"**

**Vercel mostrará:**

```
To use this domain, configure the following DNS record:

Type: CNAME
Name: staging
Value: cname.vercel-dns.com
TTL: 3600
```

### 6.2 Configurar DNS

**Ir a tu proveedor DNS (ej: Cloudflare, Namecheap, etc.):**

1. Buscar zona DNS de `precioluzhoy.app`
2. Click **"Add Record"**
3. Configurar:

```yaml
Type: CNAME
Name: staging
Target/Value: cname.vercel-dns.com
TTL: 3600 (o 1 hora)
Proxy status: DNS only (si es Cloudflare, desactivar proxy naranja)
```

4. **Save**

### 6.3 Verificar propagación DNS (30-60 min)

```bash
# Verificar inmediatamente (puede fallar al inicio)
nslookup staging.precioluzhoy.app

# ❌ Si falla: "Non-existent domain"
#    → Esperar 5-10 minutos, intentar de nuevo

# ✅ Cuando funcione:
# Name: staging.precioluzhoy.app
# Address: 76.76.21.21 (o similar, IP de Vercel)

# Test con dig (más detallado)
dig staging.precioluzhoy.app

# Test HTTPS (puede tardar más)
curl -I https://staging.precioluzhoy.app
# ✅ Expected: HTTP/2 200
```

**Tiempos de propagación típicos:**

- Cloudflare: 2-5 minutos
- Google Domains: 10-30 minutos
- Otros: 30-60 minutos

**Mientras esperas:**

- Tomar un café ☕
- Revisar documentación
- Preparar siguiente fase

### 6.4 Tests en staging

**Una vez que DNS propague, repetir FASE 5 completa en:**

```bash
export STAGING_URL="https://staging.precioluzhoy.app"

# Test rápido
curl -I $STAGING_URL

# Abrir en navegador y repetir todos los tests
```

**✅ Checklist staging:**

- [ ] Home carga correctamente
- [ ] Calendario funciona
- [ ] Gráfico actualiza
- [ ] API proxy funciona
- [ ] Cache headers correctos
- [ ] SSL/HTTPS activo
- [ ] Performance > 85
- [ ] Responsive OK
- [ ] Dark mode OK

---

## FASE 7: Switch a Producción (30 min)

### 7.1 Añadir dominio principal

**En Vercel Dashboard del proyecto "precioluzhoy-nextjs":**

1. **Settings** → **Domains** → **Add**
2. Input: `www.precioluzhoy.app`
3. Click **"Add"**

**Vercel detectará conflicto:**

```
⚠️ This domain is already in use by another project.
Do you want to transfer it to this project?
```

4. Click **"Transfer Domain"**
5. Confirmar la transferencia

**⚠️ IMPORTANTE**: Esto removerá el dominio del proyecto legacy automáticamente.

### 7.2 Añadir dominio root con redirect

**En Vercel Dashboard del mismo proyecto:**

1. **Settings** → **Domains** → **Add**
2. Input: `precioluzhoy.app`
3. Click **"Add"**
4. Seleccionar: **"Redirect to www.precioluzhoy.app"**
5. Permanent redirect: ✓
6. Click **"Add"**

### 7.3 Configurar DNS (si no está en Vercel)

**Si tu DNS está en otro proveedor:**

**Para www.precioluzhoy.app:**

```yaml
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600
```

**Para precioluzhoy.app (root):**

```yaml
Type: A
Name: @ (o vacío, según proveedor)
Value: 76.76.21.21  # IP de Vercel (verificar en docs de Vercel)
TTL: 3600
```

**O usar CNAME con ALIAS/ANAME (si tu proveedor lo soporta):**

```yaml
Type: ALIAS (o ANAME)
Name: @ (o vacío)
Value: cname.vercel-dns.com
TTL: 3600
```

### 7.4 Verificar propagación (15-30 min)

```bash
# Test WWW
nslookup www.precioluzhoy.app
# ✅ Expected: IP de Vercel

# Test root
nslookup precioluzhoy.app
# ✅ Expected: IP de Vercel

# Test HTTPS en www
curl -I https://www.precioluzhoy.app
# ✅ Expected: HTTP/2 200

# Test redirect de root a www
curl -I http://precioluzhoy.app
# ✅ Expected:
# HTTP/1.1 308 Permanent Redirect
# Location: https://www.precioluzhoy.app/

# Test redirect de HTTP a HTTPS
curl -I http://www.precioluzhoy.app
# ✅ Expected:
# HTTP/1.1 308 Permanent Redirect
# Location: https://www.precioluzhoy.app/
```

### 7.5 Verificar SSL

```bash
# Verificar certificado SSL
openssl s_client -connect www.precioluzhoy.app:443 -servername www.precioluzhoy.app < /dev/null 2>/dev/null | openssl x509 -noout -text

# ✅ Verificar:
# - Issuer: Let's Encrypt (o Vercel)
# - Subject: CN=www.precioluzhoy.app
# - Validity: Not After > fecha actual
```

**En navegador:**

1. Ir a https://www.precioluzhoy.app
2. Click en candado (🔒) en barra de direcciones
3. Verificar:
   - [ ] "Connection is secure"
   - [ ] Certificado válido
   - [ ] Emitido por autoridad confiable

---

## FASE 8: Validación Final (20 min)

### 8.1 Tests end-to-end en producción

```bash
export PROD_URL="https://www.precioluzhoy.app"

# 1. Home page
curl -I $PROD_URL
# ✅ Expected: 200 OK, no redirects

# 2. API endpoint
curl "$PROD_URL/api/prices?date=2026-02-06" | jq .
# ✅ Expected: JSON válido con datos del día

# 3. Cache headers para día pasado
curl -I "$PROD_URL/api/prices?date=2026-01-01" | grep -i cache
# ✅ Expected: cache-control: public, max-age=86400

# 4. Cache headers para hoy
curl -I "$PROD_URL/api/prices?date=$(date +%Y-%m-%d)" | grep -i cache
# ✅ Expected: cache-control: public, max-age=5 (o similar)
```

### 8.2 Checklist funcional completo

**Abrir https://www.precioluzhoy.app y verificar:**

#### ✅ Header & Navigation (2 min)

- [ ] Logo "Gurú Eléctrico" visible
- [ ] Logo clickeable (vuelve a home)
- [ ] Dark mode toggle funciona
- [ ] Header sticky en scroll
- [ ] Menu hamburger en mobile

#### ✅ Funcionalidad Principal (5 min)

- [ ] Fecha inicial correcta (hoy o mañana según disponibilidad)
- [ ] Calendario renderiza sin errores
- [ ] Gráfico muestra 24 barras con colores
- [ ] Tarjetas min/med/max con valores correctos
- [ ] Click en fechas actualiza gráfico instantáneamente
- [ ] Días pasados muestran datos históricos
- [ ] Días futuros deshabilitados o vacíos
- [ ] Hora actual resaltada (solo si es hoy)
- [ ] Domingos en color diferente (si aplica)

#### ✅ Widgets & Content (3 min)

- [ ] Hero section se muestra
- [ ] Features con íconos y descripciones
- [ ] Content sections con imágenes
- [ ] FAQs expandibles funcionan
- [ ] Footer con links correctos

#### ✅ Performance & SEO (5 min)

**Lighthouse Test:**

```bash
# Chrome DevTools → Lighthouse → Analyze page load
```

**✅ Scores esperados:**

```yaml
Performance (Mobile): > 85
Performance (Desktop): > 90
Accessibility: > 95
Best Practices: > 95
SEO: > 90
```

**View Source (Ctrl+U) - Verificar:**

- [ ] `<title>` presente y descriptivo
- [ ] `<meta description>` presente
- [ ] Open Graph tags (`og:title`, `og:description`, `og:image`)
- [ ] Twitter Card tags
- [ ] Canonical URL
- [ ] Favicon presente
- [ ] Sin errores de HTML

**Google PageSpeed Insights:**

```
https://pagespeed.web.dev/analysis?url=https://www.precioluzhoy.app
```

- [ ] Mobile score > 85
- [ ] Desktop score > 90
- [ ] Core Web Vitals: Good

#### ✅ Cross-browser (5 min)

**Testear en:**

- [ ] Chrome/Chromium (primario)
- [ ] Firefox
- [ ] Safari (si tienes Mac)
- [ ] Edge

**Verificar funcionalidad básica en cada uno:**

- Calendario funciona
- Gráfico renderiza
- Click en fechas actualiza

### 8.3 Monitoreo de errores

**En Vercel Dashboard:**

1. Ir a proyecto "precioluzhoy-nextjs"
2. **Functions** → **Logs**
3. Filtrar por últimos 30 minutos
4. Verificar:
   - [ ] No hay errores 500
   - [ ] Requests normales devuelven 200
   - [ ] Tiempo de respuesta < 1s

**Si hay errores:**

- Revisar stack trace
- Verificar configuración de environment variables
- Comprobar conexión con backend API

---

## FASE 9: Documentación (15 min)

### 9.1 Actualizar README.md

````bash
cd frontend-nextjs

# Añadir sección de deployment
cat >> README.md << 'EOF'

---

## 🚀 Deployment

### Production
- **URL**: https://www.precioluzhoy.app
- **Platform**: Vercel
- **Framework**: Next.js 14 (App Router)
- **Última actualización**: 2026-02-06

### Staging
- **URL**: https://staging.precioluzhoy.app
- **Uso**: Testing antes de deploy a producción

### Environment Variables

```bash
# Required
NEXT_PUBLIC_API_URL=https://api.precioluzhoy.app

# Optional
NODE_ENV=production
````

### Deploy Commands

```bash
# Build local
npm run build

# Test build local
npm start

# Deploy via Vercel CLI
vercel --prod
```

### Rollback

En caso de problemas, seguir [Plan de Rollback](./docs/DEPLOY_VERCEL.md#plan-de-rollback)

---

EOF

git add README.md
git commit -m "docs: add deployment information"
git push origin main

````

### 9.2 Tag de producción

```bash
# Crear tag con fecha del deploy
git tag -a v1.0.0-production-2026-02-06 -m "First production deployment to Vercel"

# Push tag
git push origin v1.0.0-production-2026-02-06

# Verificar
git tag -l | grep production
# ✅ Expected: v1.0.0-production-2026-02-06
````

### 9.3 Crear resumen de deployment

````bash
cat > ~/deployment-summary-$(date +%Y-%m-%d).md << 'EOF'
# Deployment Summary

**Fecha**: 2026-02-06
**Hora**: $(date +%H:%M:%S)
**Proyecto**: Gurú Eléctrico

---

## ✅ Deployment Exitoso

### URLs
- **Producción**: https://www.precioluzhoy.app
- **Staging**: https://staging.precioluzhoy.app
- **Vercel Project**: precioluzhoy-nextjs

### Configuración
- **Framework**: Next.js 14 (App Router)
- **Root Directory**: frontend-nextjs
- **Build Time**: ~2 minutos
- **Deploy Time**: ~3 minutos
- **Node.js**: 18.x

### Environment Variables
```bash
NEXT_PUBLIC_API_URL=https://api.precioluzhoy.app
NODE_ENV=production
````

### Tests Post-Deploy

- ✅ Funcionalidad principal: OK
- ✅ Performance Score: > 90
- ✅ SEO Score: > 90
- ✅ Accessibility: > 95
- ✅ Cache funcionando correctamente
- ✅ SSL/HTTPS activo
- ✅ Responsive: OK
- ✅ Dark mode: OK

### Legacy Backup

- **Git Tag**: v1.0.0-legacy-2026-02-06
- **Vercel Project**: precioluzhoy-legacy (pausado)
- **Rollback disponible**: SÍ

### Contactos

- **Backend API**: https://api.precioluzhoy.app
- **Vercel Dashboard**: https://vercel.com/tu-cuenta/precioluzhoy-nextjs
- **GitHub Repo**: https://github.com/tu-usuario/precio-luz-frontend

### Próximos pasos

- [ ] Monitorear logs primeras 24h
- [ ] Configurar Google Search Console
- [ ] Configurar alertas de uptime
- [ ] Actualizar Analytics
- [ ] Comunicar a usuarios

---

## 📊 Métricas

### Performance (Lighthouse)

- Mobile: 88
- Desktop: 94

### Core Web Vitals

- LCP: < 2.5s ✅
- FID: < 100ms ✅
- CLS: < 0.1 ✅

### Tiempo de Carga

- TTFB: ~200ms
- FCP: ~800ms
- TTI: ~1.2s

---

**Deployment completado exitosamente** 🎉
EOF

cat ~/deployment-summary-$(date +%Y-%m-%d).md

````

### 9.4 Limpiar proyecto legacy

**En Vercel Dashboard:**

1. Ir al proyecto legacy "precioluzhoy" (ahora sin dominios)
2. **Settings** → **General**
3. **Project Name** → Cambiar a `precioluzhoy-legacy`
4. **Save**

**Opcional: Pausar deployments del legacy**

5. **Settings** → **General**
6. Scroll hasta **"Pause Deployments"**
7. Click **"Pause"**

**Esto previene:**
- Builds automáticos en el proyecto viejo
- Gasto innecesario de recursos

---

## Plan de Rollback

### Escenario 1: Rollback Inmediato (5 min)

**Si detectas problemas críticos justo después del deploy:**

#### Opción A: Desde Vercel Dashboard

1. Ir a proyecto "precioluzhoy-nextjs"
2. **Deployments**
3. Click en deployment anterior (antes del problemático)
4. Click en menú **"..."** → **"Promote to Production"**
5. Confirmar

#### Opción B: Revertir dominio al legacy

1. Ir a proyecto "precioluzhoy-legacy"
2. **Settings** → **Domains** → **Add**
3. Añadir `www.precioluzhoy.app`
4. Confirmar transferencia
5. DNS se actualizará automáticamente

---

### Escenario 2: Rollback Planificado (15 min)

**Si necesitas volver al legacy temporalmente:**

#### Paso 1: Reactivar proyecto legacy

```bash
# En Vercel Dashboard del proyecto legacy:
1. Settings → General → Resume Deployments
2. Deployments → Click en último deployment exitoso
3. Verify URL funciona
````

#### Paso 2: Transferir dominios

```bash
# En Vercel Dashboard:
1. Proyecto legacy → Settings → Domains → Add
2. Añadir www.precioluzhoy.app
3. Transferir desde precioluzhoy-nextjs
4. Repetir para precioluzhoy.app
```

#### Paso 3: Verificar

```bash
# Esperar 5 minutos, luego test
curl -I https://www.precioluzhoy.app

# Verificar que responde el legacy
# (puede tener headers diferentes o build info)
```

---

### Escenario 3: Rollback desde CLI

```bash
# Instalar Vercel CLI (si no está instalado)
npm i -g vercel

# Login
vercel login

# Listar deployments del proyecto
vercel ls precioluzhoy-nextjs

# Ver deployments con detalles
vercel ls precioluzhoy-nextjs --next 20

# Promover deployment anterior a producción
vercel promote [DEPLOYMENT_URL] --scope=tu-cuenta

# Ejemplo:
# vercel promote https://precioluzhoy-nextjs-abc123.vercel.app --scope=tu-cuenta
```

---

### Escenario 4: Rollback a nivel DNS

**Si necesitas control total:**

```bash
# En tu proveedor DNS:

# Opción 1: Apuntar a deployment específico de legacy
Type: CNAME
Name: www
Value: precioluzhoy-legacy-xyz.vercel.app  # URL del deployment legacy

# Opción 2: Volver a CNAME original (si lo guardaste)
# Ver backup que creaste en FASE 3
```

---

### Checklist de Rollback

**Antes de hacer rollback:**

- [ ] Identificar problema específico
- [ ] Verificar que no es problema de caché (Ctrl+Shift+R)
- [ ] Revisar logs en Vercel
- [ ] Confirmar que legacy funciona
- [ ] Notificar al equipo (si aplica)

**Después del rollback:**

- [ ] Verificar legacy funciona
- [ ] Monitorear logs de errores
- [ ] Investigar causa del problema
- [ ] Corregir en Next.js
- [ ] Re-testear localmente
- [ ] Deploy fix cuando esté listo

---

## Troubleshooting

### ❌ Problema: Build falla en Vercel

**Síntoma:**

```
Error: Command "npm run build" exited with 1
```

**Causas comunes:**

1. **Root Directory incorrecto**

   ```bash
   # Verificar: Settings → Root Directory
   # Debe ser: frontend-nextjs
   ```

2. **Environment variables faltantes**

   ```bash
   # Verificar: Settings → Environment Variables
   # Debe tener: NEXT_PUBLIC_API_URL
   ```

3. **Errores de TypeScript**

   ```bash
   # Build local para ver errores:
   cd frontend-nextjs
   npm run build

   # Corregir errores antes de push
   ```

**Solución:**

- Revisar logs completos en Vercel Dashboard
- Corregir error localmente
- Commit y push
- Vercel redeployará automáticamente

---

### ❌ Problema: API devuelve CORS error

**Síntoma:**

```javascript
Access to fetch at 'https://api.precioluzhoy.app' from origin 'https://precioluzhoy-nextjs.vercel.app' has been blocked by CORS policy
```

**Causa:**
Backend no permite nuevo dominio de Vercel

**Solución:**

```bash
# En el backend (precio-luz-back):
# Actualizar CORS para incluir nuevos dominios

# src/server.ts
const allowed = [
  'https://precioluzhoy.app',
  'https://www.precioluzhoy.app',
  'https://precioluzhoy-nextjs.vercel.app',  // ← Añadir
  'https://staging.precioluzhoy.app',        // ← Añadir
  // ...
];
```

**Verificar:**

```bash
curl -I -X OPTIONS \
  -H "Origin: https://precioluzhoy-nextjs.vercel.app" \
  -H "Access-Control-Request-Method: GET" \
  https://api.precioluzhoy.app/api/prices

# ✅ Expected:
# Access-Control-Allow-Origin: https://precioluzhoy-nextjs.vercel.app
```

---

### ❌ Problema: Cache no funciona

**Síntoma:**
Cada request va al backend, no se cachea

**Verificar:**

```bash
curl -I https://www.precioluzhoy.app/api/prices?date=2026-01-06

# ❌ Falta header:
# cache-control: public, max-age=86400
```

**Causas:**

1. **vercel.json no tiene headers config**

   ```json
   // Verificar que vercel.json tiene:
   {
     "headers": [
       {
         "source": "/api/prices",
         "headers": [
           {
             "key": "Cache-Control",
             "value": "public, s-maxage=3600, stale-while-revalidate=86400"
           }
         ]
       }
     ]
   }
   ```

2. **Backend no envía headers de cache**
   ```typescript
   // En app/api/prices/route.ts
   // Verificar que se propagan headers del backend
   if (cacheControl) {
     headers.set('Cache-Control', cacheControl);
   }
   ```

**Solución:**

- Verificar vercel.json tiene configuración de headers
- Verificar proxy propaga headers del backend
- Redeploy después de corregir

---

### ❌ Problema: DNS no propaga

**Síntoma:**

```bash
nslookup www.precioluzhoy.app
# Server can't find www.precioluzhoy.app: NXDOMAIN
```

**Causas:**

1. **Record DNS mal configurado**
   - Verificar Type: CNAME (no A)
   - Verificar Value: `cname.vercel-dns.com` (exacto)
   - Verificar Name: `www` (no `www.precioluzhoy.app`)

2. **Proxy de Cloudflare interfiere**
   - Si usas Cloudflare: desactivar proxy (nube gris)
   - O esperar más tiempo

3. **TTL anterior alto**
   - Si TTL anterior era 86400 (24h), puede tardar hasta 24h
   - Usar DNS flush: `sudo systemd-resolve --flush-caches`

**Solución:**

```bash
# Test con servidor DNS público
nslookup www.precioluzhoy.app 8.8.8.8  # Google DNS
nslookup www.precioluzhoy.app 1.1.1.1  # Cloudflare DNS

# Si funciona con DNS público pero no local:
# → Problema de cache DNS local
# → Esperar o flush cache

# Linux
sudo systemd-resolve --flush-caches

# macOS
sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder

# Windows
ipconfig /flushdns
```

---

### ❌ Problema: SSL Certificate error

**Síntoma:**

```
NET::ERR_CERT_COMMON_NAME_INVALID
```

**Causa:**
Vercel aún no generó certificado SSL (toma 1-5 minutos)

**Solución:**

```bash
# Esperar 5 minutos después de añadir dominio
# Verificar en Vercel Dashboard:
# Settings → Domains → www.precioluzhoy.app
# ✅ Debe mostrar: "Certificate Active"

# Si después de 10 min sigue sin certificado:
# → Remover dominio
# → Esperar 1 minuto
# → Re-añadir dominio
```

---

### ❌ Problema: 404 en rutas

**Síntoma:**

```
https://www.precioluzhoy.app/about → 404
```

**Causa:**
Ruta no existe en Next.js o config incorrecta

**Verificar:**

```bash
# Rutas disponibles en Next.js:
# app/
#   page.tsx             → /
#   (pages)/
#     about/
#       page.tsx         → /about
#     contact/
#       page.tsx         → /contact
```

**Solución:**

- Verificar que el archivo `page.tsx` existe en la ruta
- Verificar que está en carpeta correcta (`app/`)
- Redeploy si es necesario

---

### ❌ Problema: Gráfico no muestra datos

**Síntoma:**
Calendario funciona, pero gráfico vacío

**Debug:**

```bash
# Test API directamente
curl https://www.precioluzhoy.app/api/prices?date=2026-02-06

# ✅ Si devuelve datos: problema en frontend
# ❌ Si devuelve count=0: problema en backend o normalización
```

**En navegador:**

```javascript
// DevTools → Console
// Ver network tab para request a /api/prices
// Verificar response JSON

// Si response tiene datos pero gráfico vacío:
// → Verificar normalización de precios
// → Verificar priceEurKwh < 1 (no > 100)
```

**Solución:**

```typescript
// Verificar en app/api/prices/route.ts
// Que normalización funciona:
const normalized = v > 10 ? v / 1000 : v;
```

---

### ❌ Problema: Performance score bajo

**Síntoma:**
Lighthouse Performance < 70

**Causas comunes:**

1. **Imágenes no optimizadas**

   ```tsx
   // ❌ No usar <img>
   <img src="/hero.jpg" />;

   // ✅ Usar Next.js Image
   import Image from 'next/image';
   <Image src="/hero.jpg" width={1920} height={1080} alt="..." />;
   ```

2. **JavaScript bundle grande**

   ```bash
   # Analizar bundle
   npm run build -- --analyze

   # Ver que componentes son grandes
   # Considerar code splitting / lazy loading
   ```

3. **Fonts no optimizadas**
   ```tsx
   // ✅ Usar next/font
   import { Inter } from 'next/font/google';
   const inter = Inter({ subsets: ['latin'] });
   ```

**Solución:**

- Optimizar imágenes (WebP, tamaños apropiados)
- Lazy load componentes pesados
- Usar `next/image` y `next/font`
- Minimizar JavaScript bundle

---

### ❌ Problema: Dark mode no persiste

**Síntoma:**
Dark mode se resetea al recargar página

**Causa:**
No se guarda preferencia en localStorage

**Verificar:**

```javascript
// DevTools → Application → Local Storage
// Debe tener: theme: 'dark' (o similar)
```

**Solución:**

```typescript
// Verificar que ToggleDarkMode.tsx guarda en localStorage
// O usa next-themes con persistencia
```

---

## 📞 Contactos de Emergencia

### Vercel Support

- **Dashboard**: https://vercel.com/support
- **Docs**: https://vercel.com/docs
- **Status**: https://www.vercel-status.com

### DNS Provider

- **Panel**: [URL de tu proveedor]
- **Support**: [Email o teléfono]

### Backend API

- **Endpoint**: https://api.precioluzhoy.app
- **Status**: [Healthcheck si existe]
- **Logs**: [Dónde revisar logs del backend]

---

## ✅ CHECKLIST FINAL

### Pre-Deploy

- [x] Build local exitoso
- [x] Tests locales pasados
- [x] .env.example creado
- [x] vercel.json configurado
- [x] Legacy taggeado
- [x] Backup de config Vercel

### Deploy

- [ ] Nuevo proyecto Vercel creado
- [ ] Environment variables configuradas
- [ ] Root directory correcta (frontend-nextjs)
- [ ] Build en Vercel exitoso
- [ ] Tests en URL temporal pasados

### Staging

- [ ] Subdominio staging configurado
- [ ] DNS propagado
- [ ] Tests en staging pasados
- [ ] Performance validada

### Producción

- [ ] Dominios principales transferidos
- [ ] DNS propagado
- [ ] HTTPS funcionando
- [ ] Redirects funcionando (root → www, http → https)

### Post-Deploy

- [ ] Funcionalidad principal verificada
- [ ] Performance > 85 (mobile), > 90 (desktop)
- [ ] SEO > 90
- [ ] Accessibility > 95
- [ ] Cache funcionando
- [ ] Monitoring activo
- [ ] Documentación actualizada
- [ ] Tag de producción creado
- [ ] Legacy pausado

### Rollback

- [ ] Plan de rollback documentado
- [ ] Legacy project disponible
- [ ] Contactos definidos

---

## 🎉 ¡Deployment Completado!

Tu aplicación Next.js está **LIVE** en:
**https://www.precioluzhoy.app**

### Próximos pasos recomendados:

1. **Monitorear primeras 24 horas**
   - Revisar logs en Vercel cada 2-3 horas
   - Verificar métricas de uso
   - Estar atento a reportes de usuarios

2. **Configurar Google Search Console**
   - Añadir propiedad para nuevo sitio
   - Verificar ownership
   - Enviar sitemap.xml

3. **Analytics**
   - Activar Vercel Analytics
   - Configurar Google Analytics (si usas)
   - Configurar event tracking

4. **Monitoring & Alerts**
   - Configurar UptimeRobot o similar
   - Alertas por email si sitio cae
   - Monitoreo de performance

5. **SEO**
   - Verificar indexación en Google
   - Actualizar social media links
   - Optimizar meta descriptions

6. **Comunicación**
   - Anunciar nueva versión (si aplica)
   - Solicitar feedback de usuarios
   - Documentar mejoras vs legacy

---

**¿Preguntas o problemas?**

- Revisar sección [Troubleshooting](#troubleshooting)
- Consultar [Vercel Docs](https://vercel.com/docs)
- Contactar soporte si es necesario

**Buen deploy!** 🚀✨
