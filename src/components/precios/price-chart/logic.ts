import type { PriceDataItem, HourlyPrice } from '~/shared/types/precios';

// TODO: Import these utilities once they are migrated to Project
// For now, we'll implement them inline
const TIMEZONE_ESP = 'Europe/Madrid';

function formatHourRange(hour: number): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  const start = pad(hour);
  const end = pad((hour + 1) % 24);
  return `${start}-${end}h`;
}

function hourFromUtcIsoInTz(isoUtc: string, timeZone: string): number {
  const d = new Date(isoUtc);
  const hh = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
    .format(d)
    .split(':')[0];
  return Number(hh);
}

/**
 * Transforms raw API data into chart-ready format
 * Filters valid prices, adds hour labels, and sorts by hour (0-23)
 */
export function toChartData(items: PriceDataItem[] = []): HourlyPrice[] {
  return (
    (items || [])
      .filter((it) => typeof it?.priceEurKwh === 'number' && !Number.isNaN(it.priceEurKwh))
      .map((it) => {
        // Ensure we derive a numeric hour 0..23 for each row. Prefer explicit hourIndex,
        // else derive from datetimeUtc in the Spain timezone (hammer fix). If neither
        // is available, leave hourNum undefined so it will sort to the end.
        let hourNum: number | undefined;
        if (typeof it.hourIndex === 'number') hourNum = it.hourIndex;
        else if (it.datetimeUtc) hourNum = hourFromUtcIsoInTz(it.datetimeUtc, TIMEZONE_ESP);
        const hourLabel = typeof hourNum === 'number' ? formatHourRange(hourNum) : '—';
        return { hour: hourLabel, price: it.priceEurKwh, hourNum };
      })
      // HAMMER: sort rows by the numeric hour (undefined last) so 00 appears first and
      // hours render in natural order 0..23. Keep stable ordering for equal hours.
      .sort((a, b) => {
        const aa = typeof a.hourNum === 'number' ? a.hourNum : 1e9;
        const bb = typeof b.hourNum === 'number' ? b.hourNum : 1e9;
        return aa - bb;
      })
  );
}

/**
 * Returns HSL color based on price tier (terciles)
 * Green: lowest third, Yellow: middle third, Red: highest third
 */
export function tierColor(price: number, min: number | null, max: number | null): string {
  const range = typeof max === 'number' && typeof min === 'number' ? max - min : null;
  if (!range || range <= 0 || min === null) {
    return 'hsl(142.1 76.2% 36.3%)'; // Default green
  }
  const t1 = min + range / 3;
  const t2 = min + (2 * range) / 3;
  if (price <= t1) return 'hsl(142.1 76.2% 36.3%)'; // Green
  if (price <= t2) return 'hsl(45.9 96.7% 64.5%)'; // Yellow
  return 'hsl(0 84.2% 60.2%)'; // Red
}
