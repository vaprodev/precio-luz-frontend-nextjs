/**
 * Precios API Service
 * Functions for fetching electricity prices with cache strategy
 * Ported from Legacy: src/features/prices/hooks.js
 */

import { getBaseUrl, fetchWithBackoff } from './client';
import type { PricesResponse, PriceItem, CompletenessInfo, CachePolicy } from './types';
import {
  getTodayMadridYmd,
  getTomorrowMadridYmd,
  isPast,
  isToday,
  isTomorrow,
  hourFromUtcIsoInTz,
  SPAIN_TZ,
} from '../precios/date-utils';

/**
 * Build endpoint URL for price query by date
 */
function buildPricesUrl(date: string): string {
  const base = getBaseUrl();
  return `${base}/prices?date=${encodeURIComponent(date)}`;
}

/**
 * Normalize price items to €/kWh
 * Some APIs may return €/MWh (values 80-200), convert to €/kWh
 */
function normalizeItemsToEurPerKwh(items: PriceItem[] = []): PriceItem[] {
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
 * Parse X-Completeness header (format: "N/24")
 */
function getCompletenessFromHeaders(headers: Headers): CompletenessInfo {
  const completeness = headers.get('X-Completeness') || headers.get('x-completeness');
  if (completeness) {
    const match = completeness.match(/^(\d+)\/(\d+)$/);
    if (match) {
      const count = Number(match[1]);
      const expected = Number(match[2]);
      return {
        count,
        isComplete: count >= expected,
      };
    }
  }
  return { count: null, isComplete: false };
}

/**
 * Determine cache policy from date
 */
function getCachePolicyForDate(date: string): CachePolicy {
  if (isToday(date)) return 'today';
  if (isTomorrow(date)) return 'tomorrow';
  if (isPast(date)) return 'past';
  return null;
}

/**
 * Calculate Next.js revalidate value based on date
 * - Today: 300 seconds (5 minutes) - data changes until 20:30 CET
 * - Tomorrow: 0 seconds (no cache) - data appears around 20:15 CET
 * - Past: 86400 seconds (1 day) - static data
 */
function getRevalidateForDate(date: string): number {
  if (isToday(date)) return 300; // 5 minutes
  if (isTomorrow(date)) return 0; // No cache
  if (isPast(date)) return 86400; // 1 day
  return 0; // Default: no cache
}

/**
 * Fetch prices by date with retry logic and cache strategy
 * This is the main function for Server Components
 */
export async function getPricesByDate(
  date: string,
  options?: {
    noCache?: boolean;
  },
): Promise<{
  ok: boolean;
  status: number;
  data: PricesResponse | null;
  error?: string;
  ms: number;
  info: CompletenessInfo;
  policy: CachePolicy;
}> {
  const url = buildPricesUrl(date);
  const revalidate = options?.noCache ? 0 : getRevalidateForDate(date);

  console.log(`[API] Fetching prices for ${date} (revalidate: ${revalidate}s)`);

  // Use Next.js fetch with cache control
  const result = await fetchWithBackoff(url);

  if (!result.ok) {
    console.warn('[API] Failed to fetch prices', {
      url,
      status: result.status,
      error: result.error,
      ms: result.ms,
    });

    return {
      ok: false,
      status: result.status,
      data: null,
      error: result.error || `HTTP ${result.status}`,
      ms: result.ms,
      info: { count: null, isComplete: false },
      policy: getCachePolicyForDate(date),
    };
  }

  const payload = result.json as PricesResponse;
  let items = normalizeItemsToEurPerKwh(payload?.data || []);

  // MODO MARTILLO: Ensure hourIndex reflects Europe/Madrid hour
  try {
    items = items.map((it) => {
      try {
        if (it?.datetimeUtc) {
          const h = hourFromUtcIsoInTz(it.datetimeUtc, SPAIN_TZ);
          return { ...it, hourIndex: h };
        }
        return it;
      } catch {
        return it;
      }
    });
  } catch {
    // Keep original items on error
  }

  // Parse completeness info
  const headerInfo = getCompletenessFromHeaders(result.headers);
  const info: CompletenessInfo =
    headerInfo.count != null
      ? headerInfo
      : {
          count: payload?.count ?? items.length,
          isComplete: (payload?.count ?? items.length) >= 24,
        };

  const policy = getCachePolicyForDate(date);

  console.log('[API] Prices fetched successfully', {
    date,
    count: payload?.count,
    isComplete: info.isComplete,
    policy,
    ms: result.ms,
  });

  return {
    ok: true,
    status: result.status,
    data: payload ? { ...payload, data: items } : { date, count: items.length, data: items },
    ms: result.ms,
    info,
    policy,
  };
}

/**
 * Fetch today's prices (convenience wrapper)
 */
export async function getPricesToday(options?: { noCache?: boolean }) {
  const today = getTodayMadridYmd();
  return getPricesByDate(today, options);
}

/**
 * Fetch tomorrow's prices (convenience wrapper)
 */
export async function getPricesTomorrow(options?: { noCache?: boolean }) {
  const tomorrow = getTomorrowMadridYmd();
  return getPricesByDate(tomorrow, options);
}

/**
 * Client-side fetch wrapper (for use in Client Components)
 * Does NOT use Next.js cache, suitable for real-time updates
 */
export async function fetchPricesByDateClient(date: string): Promise<{
  ok: boolean;
  status: number;
  data: PricesResponse | null;
  error?: string;
  ms: number;
  info: CompletenessInfo;
  policy: CachePolicy;
}> {
  return getPricesByDate(date, { noCache: true });
}
