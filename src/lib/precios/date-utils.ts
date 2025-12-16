/**
 * Date Utilities
 * Timezone-aware date manipulation for Europe/Madrid
 * Ported from Legacy: src/lib/date-utils.js
 */

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export const SPAIN_TZ = 'Europe/Madrid';

/**
 * Convert YYYY-MM-DD string to dayjs object in specified timezone
 */
export function ymdToZonedDayjs(ymd: string, zone: string = SPAIN_TZ): dayjs.Dayjs | null {
  if (!ymd) return null;
  const d = dayjs.tz(ymd, 'YYYY-MM-DD', zone);
  return d.isValid() ? d : null;
}

/**
 * Get Date object for a specific hour index (0-23) on a given date in timezone
 */
export function ymdHourIndexToDate(ymd: string, hourIndex: number, zone: string = SPAIN_TZ): Date | null {
  const day = ymdToZonedDayjs(ymd, zone);
  if (!day) return null;
  return day.hour(hourIndex).minute(0).second(0).millisecond(0).toDate();
}

/**
 * Format hour for display (e.g., "14-15h" for hour 14)
 */
export function formatHourForZone(
  ymd: string,
  hourIndex: number,
  zone: string = SPAIN_TZ,
  fmt: string = 'HH:mm',
): string {
  const day = ymdToZonedDayjs(ymd, zone);
  if (!day) return '';

  // Generate hour range format: 00-01h, 01-02h, ..., 23-00h
  if (fmt === 'HH:mm') {
    const currentHour = day.hour(hourIndex).format('HH');
    const nextHour = day.hour((hourIndex + 1) % 24).format('HH');
    return `${currentHour}-${nextHour}h`;
  }

  return day.hour(hourIndex).format(fmt);
}

/**
 * Convert Date/Dayjs to YYYY-MM-DD string in specified timezone
 */
export function dateToYmdInZone(dateOrDayjs: Date | dayjs.Dayjs, zone: string = SPAIN_TZ): string | null {
  const d = dayjs(dateOrDayjs).tz(zone);
  return d.isValid() ? d.format('YYYY-MM-DD') : null;
}

/**
 * Get today's date as YYYY-MM-DD in Madrid timezone
 */
export function getTodayMadridYmd(): string {
  return dayjs().tz(SPAIN_TZ).format('YYYY-MM-DD');
}

/**
 * Get tomorrow's date as YYYY-MM-DD in Madrid timezone
 */
export function getTomorrowMadridYmd(): string {
  return dayjs().tz(SPAIN_TZ).add(1, 'day').format('YYYY-MM-DD');
}

/**
 * Get yesterday's date as YYYY-MM-DD in Madrid timezone
 */
export function getYesterdayMadridYmd(): string {
  return dayjs().tz(SPAIN_TZ).subtract(1, 'day').format('YYYY-MM-DD');
}

/**
 * Check if a date string is today in Madrid timezone
 */
export function isToday(dateStr: string): boolean {
  return dateStr === getTodayMadridYmd();
}

/**
 * Check if a date string is tomorrow in Madrid timezone
 */
export function isTomorrow(dateStr: string): boolean {
  return dateStr === getTomorrowMadridYmd();
}

/**
 * Check if a date string is in the past (before today) in Madrid timezone
 */
export function isPast(dateStr: string): boolean {
  const today = getTodayMadridYmd();
  return dateStr < today;
}

/**
 * Get current hour index (0-23) in Madrid timezone
 */
export function getCurrentHourMadrid(): number {
  return Number(dayjs().tz(SPAIN_TZ).format('HH'));
}

/**
 * Extract hour index from UTC ISO datetime string in specified timezone
 */
export function hourFromUtcIsoInTz(utcIso: string, zone: string = SPAIN_TZ): number {
  return Number(dayjs.utc(utcIso).tz(zone).format('HH'));
}
