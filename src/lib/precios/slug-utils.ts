/**
 * URL Slug Utilities
 * Convertir entre formatos de URL y fechas ISO
 *
 * Formato de URLs:
 * - /precio-luz-hoy-16-12-2025        → Hoy (con fecha explícita)
 * - /precio-luz-manana-17-12-2025     → Mañana (con fecha explícita)
 * - /precio-luz-15-12-2025            → Días anteriores
 */

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import 'dayjs/locale/es';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale('es');

const TZ = 'Europe/Madrid';

/**
 * Tipos de slug
 */
export type SlugType = 'hoy' | 'manana' | 'pasado';

export interface ParsedSlug {
  type: SlugType;
  dateIso: string; // YYYY-MM-DD
  dateDisplay: string; // DD-MM-YYYY
  slug: string; // Original slug
}

/**
 * Parsear slug de URL a fecha ISO
 *
 * @example
 * parseSlugToDate('precio-luz-hoy-16-12-2025')
 *   → { type: 'hoy', dateIso: '2025-12-16', dateDisplay: '16-12-2025', slug: '...' }
 *
 * parseSlugToDate('precio-luz-manana-17-12-2025')
 *   → { type: 'manana', dateIso: '2025-12-17', dateDisplay: '17-12-2025', slug: '...' }
 *
 * parseSlugToDate('precio-luz-15-12-2025')
 *   → { type: 'pasado', dateIso: '2025-12-15', dateDisplay: '15-12-2025', slug: '...' }
 */
export function parseSlugToDate(slug: string): ParsedSlug | null {
  // Validate input
  if (!slug || typeof slug !== 'string') {
    return null;
  }

  // Formato: precio-luz-hoy-DD-MM-YYYY
  const hoyMatch = slug.match(/^precio-luz-hoy-(\d{2})-(\d{2})-(\d{4})$/);
  if (hoyMatch) {
    const [, day, month, year] = hoyMatch;
    const dateDisplay = `${day}-${month}-${year}`;
    const dateIso = `${year}-${month}-${day}`;

    return {
      type: 'hoy',
      dateIso,
      dateDisplay,
      slug,
    };
  }

  // Formato: precio-luz-manana-DD-MM-YYYY
  const mananaMatch = slug.match(/^precio-luz-manana-(\d{2})-(\d{2})-(\d{4})$/);
  if (mananaMatch) {
    const [, day, month, year] = mananaMatch;
    const dateDisplay = `${day}-${month}-${year}`;
    const dateIso = `${year}-${month}-${day}`;

    return {
      type: 'manana',
      dateIso,
      dateDisplay,
      slug,
    };
  }

  // Formato: precio-luz-DD-MM-YYYY (días anteriores)
  const pasadoMatch = slug.match(/^precio-luz-(\d{2})-(\d{2})-(\d{4})$/);
  if (pasadoMatch) {
    const [, day, month, year] = pasadoMatch;
    const dateDisplay = `${day}-${month}-${year}`;
    const dateIso = `${year}-${month}-${day}`;

    return {
      type: 'pasado',
      dateIso,
      dateDisplay,
      slug,
    };
  }

  return null;
}

/**
 * Crear slug de URL desde fecha ISO
 *
 * @param dateIso - Fecha en formato YYYY-MM-DD
 * @returns Slug para la URL
 *
 * @example
 * createSlugFromDate('2025-12-16')  → 'precio-luz-hoy-16-12-2025' (si es hoy)
 * createSlugFromDate('2025-12-17')  → 'precio-luz-manana-17-12-2025' (si es mañana)
 * createSlugFromDate('2025-12-15')  → 'precio-luz-15-12-2025' (si es pasado)
 */
export function createSlugFromDate(dateIso: string): string {
  const today = dayjs().tz(TZ).format('YYYY-MM-DD');
  const tomorrow = dayjs().tz(TZ).add(1, 'day').format('YYYY-MM-DD');

  // Convertir a formato DD-MM-YYYY
  const [year, month, day] = dateIso.split('-');
  const dateDisplay = `${day}-${month}-${year}`;

  if (dateIso === today) {
    return `precio-luz-hoy-${dateDisplay}`;
  } else if (dateIso === tomorrow) {
    return `precio-luz-manana-${dateDisplay}`;
  } else {
    return `precio-luz-${dateDisplay}`;
  }
}

/**
 * Obtener fecha ISO de hoy (Madrid timezone)
 */
export function getTodaySlug(): string {
  const today = dayjs().tz(TZ).format('YYYY-MM-DD');
  return createSlugFromDate(today);
}

/**
 * Obtener fecha ISO de mañana (Madrid timezone)
 */
export function getTomorrowSlug(): string {
  const tomorrow = dayjs().tz(TZ).add(1, 'day').format('YYYY-MM-DD');
  return createSlugFromDate(tomorrow);
}

/**
 * Obtener slug del día anterior
 */
export function getPreviousDaySlug(dateIso: string): string {
  const prevDay = dayjs(dateIso).subtract(1, 'day').format('YYYY-MM-DD');
  return createSlugFromDate(prevDay);
}

/**
 * Obtener slug del día siguiente
 */
export function getNextDaySlug(dateIso: string): string {
  const nextDay = dayjs(dateIso).add(1, 'day').format('YYYY-MM-DD');
  return createSlugFromDate(nextDay);
}

/**
 * Validar que una fecha ISO es válida
 */
export function isValidDate(dateIso: string): boolean {
  const parsed = dayjs(dateIso, 'YYYY-MM-DD', true);
  return parsed.isValid();
}

/**
 * Formatear fecha para mostrar en español
 *
 * @example
 * formatDateForDisplay('2025-12-16') → 'lunes, 16 de diciembre de 2025'
 */
export function formatDateForDisplay(dateIso: string): string {
  return dayjs(dateIso).locale('es').format('dddd, D [de] MMMM [de] YYYY');
}

/**
 * Formatear fecha corta
 *
 * @example
 * formatDateShort('2025-12-16') → '16 dic 2025'
 */
export function formatDateShort(dateIso: string): string {
  return dayjs(dateIso).locale('es').format('D MMM YYYY');
}

/**
 * Verificar si una fecha está en el futuro
 */
export function isFutureDate(dateIso: string): boolean {
  const today = dayjs().tz(TZ).startOf('day');
  const date = dayjs(dateIso).startOf('day');
  return date.isAfter(today);
}

/**
 * Verificar si una fecha es hoy
 */
export function isToday(dateIso: string): boolean {
  const today = dayjs().tz(TZ).format('YYYY-MM-DD');
  return dateIso === today;
}

/**
 * Verificar si una fecha es mañana
 */
export function isTomorrow(dateIso: string): boolean {
  const tomorrow = dayjs().tz(TZ).add(1, 'day').format('YYYY-MM-DD');
  return dateIso === tomorrow;
}
