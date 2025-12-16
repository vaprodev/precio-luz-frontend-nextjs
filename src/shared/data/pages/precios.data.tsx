// 🔷 Mock data for testing PriceChart component
// 24 hours of realistic electricity prices for Spain

import type { PriceDataItem, HourlyPrice } from '~/shared/types/precios';

/**
 * Mock API response data (raw format)
 * Simulates a typical day with price variations
 */
export const mockPriceDataRaw: PriceDataItem[] = [
  // Night hours (00:00-06:00) - Lower prices
  { priceEurKwh: 0.12456, hourIndex: 0 },
  { priceEurKwh: 0.11234, hourIndex: 1 },
  { priceEurKwh: 0.10987, hourIndex: 2 },
  { priceEurKwh: 0.10123, hourIndex: 3 },
  { priceEurKwh: 0.10567, hourIndex: 4 },
  { priceEurKwh: 0.1189, hourIndex: 5 },

  // Morning peak (06:00-10:00) - Rising prices
  { priceEurKwh: 0.14567, hourIndex: 6 },
  { priceEurKwh: 0.16789, hourIndex: 7 },
  { priceEurKwh: 0.18234, hourIndex: 8 },
  { priceEurKwh: 0.19876, hourIndex: 9 },

  // Midday (10:00-14:00) - Peak prices
  { priceEurKwh: 0.21234, hourIndex: 10 },
  { priceEurKwh: 0.20987, hourIndex: 11 },
  { priceEurKwh: 0.19876, hourIndex: 12 },
  { priceEurKwh: 0.18234, hourIndex: 13 },

  // Afternoon (14:00-18:00) - Moderate prices
  { priceEurKwh: 0.16789, hourIndex: 14 },
  { priceEurKwh: 0.15432, hourIndex: 15 },
  { priceEurKwh: 0.14567, hourIndex: 16 },
  { priceEurKwh: 0.15678, hourIndex: 17 },

  // Evening peak (18:00-22:00) - High prices
  { priceEurKwh: 0.1789, hourIndex: 18 },
  { priceEurKwh: 0.20123, hourIndex: 19 },
  { priceEurKwh: 0.22456, hourIndex: 20 }, // Highest price
  { priceEurKwh: 0.21234, hourIndex: 21 },

  // Late night (22:00-24:00) - Decreasing prices
  { priceEurKwh: 0.18976, hourIndex: 22 },
  { priceEurKwh: 0.15432, hourIndex: 23 },
];

/**
 * Mock data already transformed to chart format
 * (Useful for testing subcomponents directly)
 */
export const mockChartData: HourlyPrice[] = [
  { hour: '00-01h', price: 0.12456, hourNum: 0 },
  { hour: '01-02h', price: 0.11234, hourNum: 1 },
  { hour: '02-03h', price: 0.10987, hourNum: 2 },
  { hour: '03-04h', price: 0.10123, hourNum: 3 },
  { hour: '04-05h', price: 0.10567, hourNum: 4 },
  { hour: '05-06h', price: 0.1189, hourNum: 5 },
  { hour: '06-07h', price: 0.14567, hourNum: 6 },
  { hour: '07-08h', price: 0.16789, hourNum: 7 },
  { hour: '08-09h', price: 0.18234, hourNum: 8 },
  { hour: '09-10h', price: 0.19876, hourNum: 9 },
  { hour: '10-11h', price: 0.21234, hourNum: 10 },
  { hour: '11-12h', price: 0.20987, hourNum: 11 },
  { hour: '12-13h', price: 0.19876, hourNum: 12 },
  { hour: '13-14h', price: 0.18234, hourNum: 13 },
  { hour: '14-15h', price: 0.16789, hourNum: 14 },
  { hour: '15-16h', price: 0.15432, hourNum: 15 },
  { hour: '16-17h', price: 0.14567, hourNum: 16 },
  { hour: '17-18h', price: 0.15678, hourNum: 17 },
  { hour: '18-19h', price: 0.1789, hourNum: 18 },
  { hour: '19-20h', price: 0.20123, hourNum: 19 },
  { hour: '20-21h', price: 0.22456, hourNum: 20 },
  { hour: '21-22h', price: 0.21234, hourNum: 21 },
  { hour: '22-23h', price: 0.18976, hourNum: 22 },
  { hour: '23-00h', price: 0.15432, hourNum: 23 },
];

/**
 * Calculate min and max prices from mock data
 */
export const mockPriceStats = {
  min: Math.min(...mockPriceDataRaw.map((d) => d.priceEurKwh)),
  max: Math.max(...mockPriceDataRaw.map((d) => d.priceEurKwh)),
  mean: mockPriceDataRaw.reduce((sum, d) => sum + d.priceEurKwh, 0) / mockPriceDataRaw.length,
};

/**
 * Mock data with missing hourIndex (tests datetimeUtc fallback)
 */
export const mockPriceDataWithUtc: PriceDataItem[] = [
  { priceEurKwh: 0.12456, datetimeUtc: '2025-12-16T00:00:00Z' },
  { priceEurKwh: 0.11234, datetimeUtc: '2025-12-16T01:00:00Z' },
  { priceEurKwh: 0.10987, datetimeUtc: '2025-12-16T02:00:00Z' },
  // ... rest would follow same pattern
];

/**
 * Mock active date for testing
 */
export const mockActiveDate = '2025-12-16';

/**
 * Mock current hour (for highlighting)
 */
export const mockCurrentHour = new Date().getHours();

export default {
  mockPriceDataRaw,
  mockChartData,
  mockPriceStats,
  mockPriceDataWithUtc,
  mockActiveDate,
  mockCurrentHour,
};
