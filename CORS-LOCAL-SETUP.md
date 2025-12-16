# Configuración CORS para desarrollo local

## Problema

El frontend de Next.js corre en los puertos `3000`, `3001`, `3002`, etc., pero el backend no tiene permisos CORS para estos puertos, causando errores de conexión a la API.

## Solución en el Backend

### 1. Ubicar el archivo de configuración CORS

Busca el archivo donde se configure CORS en tu backend. Típicamente:

- **Express.js**: `app.js` o `server.js`
- **Fastify**: `app.js` o `index.js`
- **NestJS**: `main.ts`

### 2. Agregar puertos del frontend al whitelist

```javascript
// Ejemplo para Express con cors
const cors = require('cors');

const allowedOrigins = [
  'http://localhost:3000', // Puerto por defecto de Next.js
  'http://localhost:3001', // Puerto alternativo 1
  'http://localhost:3002', // Puerto alternativo 2
  'http://localhost:3006', // Puerto alternativo 3
  'https://precioluzhoy.app', // Producción
  'https://www.precioluzhoy.app'
  'https://www.guruelectrico.com',
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Permitir requests sin origin (como mobile apps o curl)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = 'La política CORS no permite acceso desde este origen.';
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
  }),
);
```

### 3. Alternativa: Permitir todos los localhost en desarrollo

```javascript
app.use(
  cors({
    origin: function (origin, callback) {
      // En desarrollo, permitir todos los localhost
      if (!origin || origin.startsWith('http://localhost:')) {
        return callback(null, true);
      }

      // En producción, solo dominios específicos
      const allowedDomains = ['https://precioluzhoy.app', 'https://www.precioluzhoy.app'];

      if (allowedDomains.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error('No permitido por CORS'), false);
    },
    credentials: true,
  }),
);
```

### 4. Configuración con variables de entorno

**Archivo `.env`:**

```bash
# Desarrollo
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:3002,http://localhost:3006

# Producción
# NODE_ENV=production
# ALLOWED_ORIGINS=https://precioluzhoy.app,https://www.precioluzhoy.app
```

**Código del backend:**

```javascript
const allowedOrigins = process.env.ALLOWED_ORIGINS.split(',');

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);
```

### 5. Para Fastify

```javascript
await app.register(require('@fastify/cors'), {
  origin: (origin, callback) => {
    if (!origin || origin.startsWith('http://localhost:')) {
      callback(null, true);
    } else if (['https://precioluzhoy.app', 'https://www.precioluzhoy.app'].includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
});
```

### 6. Para NestJS

**main.ts:**

```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:3002',
        'http://localhost:3006',
        'https://precioluzhoy.app',
        'https://www.precioluzhoy.app',
      ];

      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  });

  await app.listen(3000);
}
```

## Verificación

Después de actualizar la configuración CORS:

1. **Reinicia el servidor backend**
2. **Verifica en el navegador** (consola de desarrollador):
   - No deberían aparecer errores CORS
   - Las requests a `/api/prices` deberían funcionar

3. **Prueba con curl**:

```bash
curl -H "Origin: http://localhost:3001" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     http://localhost:8080/api/prices
```

Deberías ver headers como:

```
Access-Control-Allow-Origin: http://localhost:3001
Access-Control-Allow-Credentials: true
```

## Notas Importantes

- ⚠️ **NO uses `origin: '*'` en producción** - es un riesgo de seguridad
- ✅ En desarrollo local, puedes ser más permisivo con localhost
- ✅ Asegúrate de incluir `credentials: true` si usas cookies/auth
- ✅ Reinicia el backend después de cambiar la configuración

## Puertos del Frontend Next.js

- **3000**: Puerto por defecto
- **3001-3006**: Puertos alternativos cuando 3000 está ocupado
- El frontend-nextjs actual usa cualquiera de estos puertos disponibles

---

**Última actualización**: 16 diciembre 2025
