import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.precioluzhoy.app';

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
    const response = await fetch(apiUrl.toString(), {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      // No cache para desarrollo, usar en producción si se desea
      // cache: 'no-store',
    });

    // Verificar si la respuesta es exitosa
    if (!response.ok) {
      console.error('[API Proxy] Error:', response.status, response.statusText);
      return NextResponse.json({ error: `API returned ${response.status}` }, { status: response.status });
    }

    // Obtener los datos
    const data = await response.json();

    // Copiar headers importantes de la respuesta original
    const headers = new Headers();
    headers.set('Content-Type', 'application/json');

    // Copiar headers custom del backend si existen
    const xCompleteness = response.headers.get('X-Completeness');
    const xCachePolicy = response.headers.get('X-Cache-Policy');

    if (xCompleteness) {
      headers.set('X-Completeness', xCompleteness);
    }
    if (xCachePolicy) {
      headers.set('X-Cache-Policy', xCachePolicy);
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
