// 🔷 TypeScript Types for Electricity Prices Components
// Professional naming convention with English terminology

/**
 * Represents a single hourly price point
 */
export interface HourlyPrice {
  /** Hour in format '00-01h', '14-15h', etc. */
  hour: string;
  /** Price in EUR/kWh (e.g., 0.12456) */
  price: number;
  /** Numeric hour index 0-23 (optional, for sorting/logic) */
  hourNum?: number;
}

/**
 * Raw data item from API before transformation
 */
export interface PriceDataItem {
  /** Price in EUR/kWh */
  priceEurKwh: number;
  /** Hour index 0-23 (preferred) */
  hourIndex?: number;
  /** ISO datetime string in UTC (fallback if no hourIndex) */
  datetimeUtc?: string;
}

/**
 * Props for the main PriceChartView component
 */
export interface PriceChartViewProps {
  /** Array of raw price data from API */
  data: PriceDataItem[];

  /** Current hour index (0-23) to highlight, null for none */
  currentHourIndex?: number | null;

  /** Minimum price for color calculation (optional) */
  min?: number | null;

  /** Maximum price for color calculation (optional) */
  max?: number | null;

  /** Active date in 'YYYY-MM-DD' format for hour formatting */
  activeDate?: string;

  // Layout customization
  /** Height of each row in pixels */
  rowHeight?: number;

  /** Tailwind grid template (e.g., 'grid-cols-[1fr_1fr_2fr]') */
  gridTemplate?: string;

  /** Custom CSS class for hour cells */
  hourClass?: string;

  /** Custom CSS class for price cells */
  priceClass?: string;
}

/**
 * Props for HourColumn subcomponent
 */
export interface HourColumnProps {
  /** Transformed chart data */
  chartData: HourlyPrice[];

  /** Current hour index to highlight */
  currentHourIndex?: number | null;

  /** Row height in pixels */
  rowHeight?: number;

  /** Custom class for each hour cell */
  hourCellClass?: string;

  /** Legacy prop name (backwards compatibility) */
  hourClass?: string;

  /** Active date for hour formatting */
  dayStr?: string;

  /** Outer container class */
  className?: string;
}

/**
 * Props for PriceColumn subcomponent
 */
export interface PriceColumnProps {
  /** Transformed chart data */
  chartData: HourlyPrice[];

  /** Row height in pixels */
  rowHeight?: number;

  /** Custom class for each price cell */
  priceCellClass?: string;

  /** Legacy prop name (backwards compatibility) */
  priceClass?: string;

  /** Outer container class */
  className?: string;
}

/**
 * Props for BarsColumn subcomponent (Recharts)
 */
export interface BarsColumnProps {
  /** Transformed chart data */
  chartData: HourlyPrice[];

  /** Row height in pixels */
  rowHeight?: number;

  /** Minimum price for color calculation */
  min?: number | null;

  /** Maximum price for color calculation */
  max?: number | null;

  /** Outer container class */
  className?: string;
}

/**
 * Color tier type for price visualization
 */
export type PriceTier = 'green' | 'yellow' | 'red';
