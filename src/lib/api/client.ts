/**
 * API Client Base
 * Fetch wrapper with retry logic, timeout, and exponential backoff
 * Ported from Legacy: src/features/prices/contracts.js + hooks.js
 *
 * IMPORTANTE: En desarrollo usa el proxy local (/api) para evitar CORS
 * En producción puede usar la URL directa o el proxy según configuración
 */

import type { FetchResult } from './types';

// Determinar si estamos en desarrollo
const isDev = process.env.NODE_ENV === 'development';

// En desarrollo SIEMPRE usar proxy local para evitar CORS
// En producción usar la URL configurada o proxy
const API_BASE = isDev ? '/api' : process.env.NEXT_PUBLIC_API_URL || '/api';

const HTTP_TIMEOUT_MS = 8000;
const MAX_RETRIES = 3;

/**
 * Get the base API URL
 */
export function getBaseUrl(): string {
  return API_BASE;
}

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Timed fetch with AbortController for timeout
 */
async function timedFetch(
  url: string,
  init?: RequestInit,
  timeoutMs: number = HTTP_TIMEOUT_MS,
): Promise<{ res: Response; ms: number }> {
  const ctrl = new AbortController();
  const t0 = performance.now();
  let timer: NodeJS.Timeout | undefined;

  try {
    timer = setTimeout(() => ctrl.abort(), timeoutMs);
    const res = await fetch(url, {
      ...init,
      signal: ctrl.signal,
    });
    const t1 = performance.now();
    return { res, ms: Math.round(t1 - t0) };
  } finally {
    if (timer) clearTimeout(timer);
  }
}

/**
 * Fetch JSON with error handling
 */
async function fetchJson(url: string): Promise<FetchResult> {
  try {
    const { res, ms } = await timedFetch(url);
    const text = await res.text();

    let json: any = null;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      json = null;
    }

    return {
      ok: res.ok,
      status: res.status,
      headers: res.headers,
      ms,
      json,
      url,
    };
  } catch (e: any) {
    const isAbort = e && (e.name === 'AbortError' || e.code === 'ABORT_ERR');

    return {
      ok: false,
      status: isAbort ? 408 : 0,
      headers: new Headers(),
      ms: 0,
      json: null,
      error: isAbort ? 'timeout' : 'network',
      url,
    };
  }
}

/**
 * Fetch with exponential backoff retry logic
 * Retries on: 429 (rate limit), 408 (timeout), network errors
 * Respects Retry-After header on 429
 */
export async function fetchWithBackoff(url: string): Promise<FetchResult> {
  let attempt = 0;
  let delay = 1000; // Start with 1s delay

  while (true) {
    const result = await fetchJson(url);

    if (result.ok) return result;

    const isRateLimited = result.status === 429;
    const isClientTimeout = result.status === 408 || result.error === 'timeout';
    const isNetwork = result.status === 0 || result.error === 'network';

    // Retry conditions
    if ((isRateLimited || isClientTimeout || isNetwork) && attempt < MAX_RETRIES) {
      // Check for Retry-After header
      const retryAfter = result.headers.get?.('Retry-After');
      const waitMs = isRateLimited && retryAfter ? Number(retryAfter) * 1000 : delay;

      console.warn(`[API] Retry ${attempt + 1}/${MAX_RETRIES} after ${waitMs}ms`, {
        url,
        status: result.status,
        error: result.error,
      });

      await sleep(waitMs);
      attempt += 1;
      delay = Math.min(delay * 2, 8000); // Exponential backoff, max 8s
      continue;
    }

    // No more retries or non-retryable error
    return result;
  }
}

/**
 * Generic fetch wrapper with TypeScript generics
 */
export async function fetchApi<T = any>(
  url: string,
): Promise<{
  ok: boolean;
  status: number;
  data: T | null;
  error?: string;
  ms: number;
}> {
  const result = await fetchWithBackoff(url);

  return {
    ok: result.ok,
    status: result.status,
    data: result.json as T,
    error: result.error,
    ms: result.ms,
  };
}
