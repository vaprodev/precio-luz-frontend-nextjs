/**
 * API Response Types
 * Based on backend contract: GET /api/prices?date=YYYY-MM-DD
 */

export interface PriceItem {
  /** ISO date string */
  date: string;
  /** Hour index (0-23, may be 0-24 for DST) */
  hourIndex: number;
  /** ISO datetime in UTC */
  datetimeUtc: string;
  /** Price in €/kWh */
  priceEurKwh: number;
  /** Geographic zone (e.g., "PENINSULA") */
  zone: string;
  /** Data source (e.g., "ESIOS") */
  source: string;
}

export interface PricesResponse {
  /** Date in YYYY-MM-DD format */
  date: string;
  /** Number of price items (0-25, typically 24) */
  count: number;
  /** Array of price items */
  data: PriceItem[];
}

export interface PricesMeta {
  /** Minimum price in €/kWh */
  min: number | null;
  /** Maximum price in €/kWh */
  max: number | null;
  /** Average price in €/kWh */
  mean: number | null;
  /** Number of valid price items */
  count: number;
  /** Whether data is incomplete (missing hours or has gaps) */
  incomplete: boolean;
  /** Index of current hour (0-23) if querying today */
  currentHourIndex: number | null;
  /** Best 2-hour consecutive window */
  best2h: {
    startIndex: number;
    total: number;
  } | null;
  /** Best window (2 or 3 hours) by average */
  bestWindow: {
    startIndex: number;
    duration: number;
    mean: number;
  } | null;
}

export interface CompletenessInfo {
  /** Number of hours received */
  count: number | null;
  /** Whether all expected hours are present */
  isComplete: boolean;
}

export type CachePolicy = 'today' | 'tomorrow' | 'past' | null;

export interface ApiError {
  status: number;
  error: string;
  url: string;
}

export interface FetchResult {
  ok: boolean;
  status: number;
  headers: Headers;
  ms: number;
  json: any;
  url: string;
  error?: string;
}
