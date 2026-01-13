import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.precioluzhoy.app';

// Force dynamic rendering (no static export)
export const dynamic = 'force-dynamic';

/**
 * Normalize price items to €/kWh
 * Some APIs may return €/MWh (values 80-200), convert to €/kWh
 */
function normalizeItemsToEurPerKwh(items: any[] = []): any[] {
  return (items || []).map((it) => {
    const v = it?.priceEurKwh;
    if (typeof v === 'number' && Number.isFinite(v)) {
      // If value looks like €/MWh (e.g., 80..200), convert to €/kWh
      const normalized = v > 10 ? v / 1000 : v;
      return { ...it, priceEurKwh: normalized };
    }
    return it;
  });
}

/**
 * API Route Proxy para evitar CORS en desarrollo
 *
 * Este endpoint actúa como proxy hacia la API real,
 * permitiendo que el cliente (navegador) haga peticiones
 * sin problemas de CORS en desarrollo local.
 *
 * GET /api/prices?date=YYYY-MM-DD
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    // Construir URL de la API real
    const apiUrl = new URL(`${API_BASE_URL}/api/prices`);
    if (date) {
      apiUrl.searchParams.set('date', date);
    }

    console.log('[API Proxy] Fetching from:', apiUrl.toString());

    // Hacer petición a la API real
    // En desarrollo, usamos no-store para evitar cache de Next.js y ver cambios inmediatamente
    // En producción, respetamos los headers Cache-Control del backend
    const isDev = process.env.NODE_ENV === 'development';
    const response = await fetch(apiUrl.toString(), {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      ...(isDev && { cache: 'no-store' }),
    });

    // Verificar si la respuesta es exitosa
    if (!response.ok) {
      console.error('[API Proxy] Error:', response.status, response.statusText);
      return NextResponse.json({ error: `API returned ${response.status}` }, { status: response.status });
    }

    // Obtener los datos
    const data = await response.json();

    // Normalizar precios a €/kWh (convertir de €/MWh si es necesario)
    if (data?.data && Array.isArray(data.data)) {
      data.data = normalizeItemsToEurPerKwh(data.data);
    }

    // Copiar headers importantes de la respuesta original
    const headers = new Headers();
    headers.set('Content-Type', 'application/json');

    // Copiar headers custom del backend si existen
    const xCompleteness = response.headers.get('X-Completeness');
    const xCachePolicy = response.headers.get('X-Cache-Policy');
    const cacheControl = response.headers.get('Cache-Control');

    if (xCompleteness) {
      headers.set('X-Completeness', xCompleteness);
    }
    if (xCachePolicy) {
      headers.set('X-Cache-Policy', xCachePolicy);
    }
    // CRÍTICO: propagar Cache-Control del backend para que el browser/CDN cachee correctamente
    if (cacheControl) {
      headers.set('Cache-Control', cacheControl);
    }

    console.log('[API Proxy] Success:', { date, count: data.count });

    // Devolver respuesta
    return NextResponse.json(data, { headers });
  } catch (error) {
    console.error('[API Proxy] Exception:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch from API',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
