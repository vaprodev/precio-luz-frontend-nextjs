/**
 * Metrics Computation for Price Data
 * Ported from Legacy: src/features/prices/metrics.js
 */

import type { PriceItem, PricesMeta } from '../api/types';
import { getCurrentHourMadrid, hourFromUtcIsoInTz, isToday, SPAIN_TZ } from './date-utils';

/**
 * Check if value is a finite number
 */
function isNum(n: any): n is number {
  return typeof n === 'number' && Number.isFinite(n);
}

/**
 * Sanitize price items - remove NaN values and detect incompleteness
 */
export function sanitize(items: PriceItem[] = []): {
  data: PriceItem[];
  incomplete: boolean;
} {
  const rawCount = items?.length || 0;
  const data = (items || []).filter((it) => isNum(it?.priceEurKwh));
  const filtered = data.length !== rawCount;

  // Consider 23/24/25 as valid (DST cases); other sizes suggest gaps/duplicates
  const expectedCount = data.length === 23 || data.length === 24 || data.length === 25;
  const incomplete = filtered || !expectedCount;

  return { data, incomplete };
}

/**
 * Compute basic statistics (min, max, mean)
 */
export function computeBasicStats(data: PriceItem[] = []): {
  min: number | null;
  max: number | null;
  mean: number | null;
  count: number;
} {
  if (!data.length) {
    return { min: null, max: null, mean: null, count: 0 };
  }

  let min = Infinity;
  let max = -Infinity;
  let sum = 0;

  for (const it of data) {
    const v = it.priceEurKwh;
    if (v < min) min = v;
    if (v > max) max = v;
    sum += v;
  }

  const mean = sum / data.length;

  return { min, max, mean, count: data.length };
}

/**
 * Find current hour index if querying today
 */
export function findCurrentHourIndex(data: PriceItem[] = [], dayStr?: string): number | null {
  if (!data.length || !dayStr) return null;

  // Check if dayStr is today in Madrid timezone
  if (!isToday(dayStr)) return null;

  const currentHour = getCurrentHourMadrid();

  // Prefer hourIndex when available (backend provides hourIndex 0..23 per date)
  for (let i = 0; i < data.length; i++) {
    const it = data[i];
    if (typeof it?.hourIndex === 'number' && it.hourIndex === currentHour) {
      return i;
    }
  }

  // Fallback: compare datetimeUtc converted to Europe/Madrid hour
  for (let i = 0; i < data.length; i++) {
    const it = data[i];
    if (it?.datetimeUtc) {
      const h = hourFromUtcIsoInTz(it.datetimeUtc, SPAIN_TZ);
      if (h === currentHour) {
        return i;
      }
    }
  }

  return null;
}

/**
 * Find best 2-hour consecutive window (lowest total price)
 */
export function findBest2hWindow(data: PriceItem[] = []): {
  startIndex: number;
  total: number;
} | null {
  if (!data || data.length < 2) {
    return null;
  }

  let bestIdx = 0;
  let bestTotal = data[0].priceEurKwh + data[1].priceEurKwh;

  for (let i = 1; i < data.length - 1; i++) {
    const total = data[i].priceEurKwh + data[i + 1].priceEurKwh;
    if (total < bestTotal) {
      bestTotal = total;
      bestIdx = i;
    }
  }

  return { startIndex: bestIdx, total: bestTotal };
}

/**
 * Find best 2 or 3-hour window by average price
 */
export function findBest2or3hByAverage(data: PriceItem[] = []): {
  startIndex: number;
  duration: number;
  mean: number;
} | null {
  const n = data?.length || 0;
  if (n < 2) {
    return null;
  }

  let best = {
    startIndex: 0,
    duration: 2,
    mean: (data[0].priceEurKwh + data[1].priceEurKwh) / 2,
  };

  // Check 2-hour windows
  for (let i = 0; i < n - 1; i++) {
    const m2 = (data[i].priceEurKwh + data[i + 1].priceEurKwh) / 2;
    if (m2 < best.mean) {
      best = { startIndex: i, duration: 2, mean: m2 };
    }
  }

  // Check 3-hour windows
  if (n >= 3) {
    for (let i = 0; i < n - 2; i++) {
      const m3 = (data[i].priceEurKwh + data[i + 1].priceEurKwh + data[i + 2].priceEurKwh) / 3;
      if (m3 < best.mean) {
        best = { startIndex: i, duration: 3, mean: m3 };
      }
    }
  }

  return best;
}

/**
 * Compute all metrics for price data
 */
export function computeMetrics(items: PriceItem[] = [], dayStr?: string): PricesMeta {
  const { data, incomplete } = sanitize(items);
  const basics = computeBasicStats(data);
  const currentHourIndex = findCurrentHourIndex(data, dayStr);
  const best2h = findBest2hWindow(data);
  const bestWindow = findBest2or3hByAverage(data);

  return {
    ...basics,
    incomplete,
    currentHourIndex,
    best2h,
    bestWindow,
  };
}

/**
 * Transform raw items into bar-series friendly array
 * Tolerant to 23/25 hours and NaN values
 */
export function toBarSeries(items: PriceItem[] = []): Array<{
  hourIndex: number;
  datetimeUtc?: string;
  priceEurKwh: number;
}> {
  const { data } = sanitize(items);

  return data.map((it, i) => {
    let hourIndex: number;

    if (typeof it?.hourIndex === 'number') {
      hourIndex = it.hourIndex;
    } else if (it?.datetimeUtc) {
      hourIndex = hourFromUtcIsoInTz(it.datetimeUtc, SPAIN_TZ);
    } else {
      hourIndex = i; // fallback stable
    }

    return {
      hourIndex,
      datetimeUtc: it?.datetimeUtc,
      priceEurKwh: it.priceEurKwh,
    };
  });
}

/**
 * Format hour index as HH:00 or HH-HH+1h
 */
export function formatHour(hourIndex: number | null | undefined): string {
  if (typeof hourIndex !== 'number' || !Number.isFinite(hourIndex)) {
    return '—';
  }

  const h = String(hourIndex).padStart(2, '0');
  return `${h}:00`;
}

/**
 * Format hour as range (e.g., "14-15h")
 */
export function formatHourRange(hourIndex: number | null | undefined): string {
  if (typeof hourIndex !== 'number' || !Number.isFinite(hourIndex)) {
    return '—';
  }

  const h1 = String(hourIndex).padStart(2, '0');
  const h2 = String((hourIndex + 1) % 24).padStart(2, '0');
  return `${h1}-${h2}h`;
}
