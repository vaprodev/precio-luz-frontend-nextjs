/**
 * URL Slug Utilities
 * Convertir entre formatos de URL y fechas ISO
 *
 * Formato de URLs (NUEVO):
 * - /precio-luz-16-diciembre-2025     → Cualquier día (sin prefijo hoy/mañana)
 * - /precio-luz-17-diciembre-2025     → Mañana (detectado por fecha)
 * - /precio-luz-25-diciembre-2025     → Navidad
 * - /precio-luz-1-enero-2026          → Año nuevo
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
 * Mapa de nombres de meses en español (lowercase)
 */
const MESES_NOMBRES = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
] as const;

/**
 * Mapa inverso: nombre del mes → número (1-12)
 */
const MESES_MAP: Record<string, number> = {
  enero: 1,
  febrero: 2,
  marzo: 3,
  abril: 4,
  mayo: 5,
  junio: 6,
  julio: 7,
  agosto: 8,
  septiembre: 9,
  octubre: 10,
  noviembre: 11,
  diciembre: 12,
};

/**
 * Tipos de slug (basado en comparación de fechas)
 */
export type SlugType = 'hoy' | 'manana' | 'pasado';

export interface ParsedSlug {
  type: SlugType;
  dateIso: string; // YYYY-MM-DD
  dateDisplay: string; // DD de MMMM de YYYY (ej: "16 de diciembre de 2025")
  slug: string; // Original slug
}

/**
 * Parsear slug de URL a fecha ISO
 *
 * @example
 * parseSlugToDate('precio-luz-16-diciembre-2025')
 *   → { type: 'hoy', dateIso: '2025-12-16', dateDisplay: '16 de diciembre de 2025', slug: '...' }
 *
 * parseSlugToDate('precio-luz-17-diciembre-2025')
 *   → { type: 'manana', dateIso: '2025-12-17', dateDisplay: '17 de diciembre de 2025', slug: '...' }
 *
 * parseSlugToDate('precio-luz-25-diciembre-2025')
 *   → { type: 'pasado', dateIso: '2025-12-25', dateDisplay: '25 de diciembre de 2025', slug: '...' }
 */
export function parseSlugToDate(slug: string): ParsedSlug | null {
  // Validate input
  if (!slug || typeof slug !== 'string') {
    return null;
  }

  // Formato: precio-luz-DD-MMMM-YYYY
  // Ejemplo: precio-luz-16-diciembre-2025
  const pattern =
    /^precio-luz-(\d{1,2})-(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)-(\d{4})$/;
  const match = slug.match(pattern);

  if (!match) {
    return null;
  }

  const [, day, monthName, year] = match;
  const monthNumber = MESES_MAP[monthName];

  if (!monthNumber) {
    return null;
  }

  // Pad day and month with zeros
  const dayPadded = day.padStart(2, '0');
  const monthPadded = monthNumber.toString().padStart(2, '0');

  const dateIso = `${year}-${monthPadded}-${dayPadded}`;
  const dateDisplay = `${day} de ${monthName} de ${year}`;

  // Validar que la fecha sea válida
  if (!isValidDate(dateIso)) {
    return null;
  }

  // Determinar tipo comparando con hoy y mañana
  const today = dayjs().tz(TZ).format('YYYY-MM-DD');
  const tomorrow = dayjs().tz(TZ).add(1, 'day').format('YYYY-MM-DD');

  let type: SlugType;
  if (dateIso === today) {
    type = 'hoy';
  } else if (dateIso === tomorrow) {
    type = 'manana';
  } else {
    type = 'pasado';
  }

  return {
    type,
    dateIso,
    dateDisplay,
    slug,
  };
}

/**
 * Crear slug de URL desde fecha ISO
 *
 * @param dateIso - Fecha en formato YYYY-MM-DD
 * @returns Slug para la URL
 *
 * @example
 * createSlugFromDate('2025-12-16')  → 'precio-luz-16-diciembre-2025'
 * createSlugFromDate('2025-12-25')  → 'precio-luz-25-diciembre-2025'
 * createSlugFromDate('2026-01-01')  → 'precio-luz-1-enero-2026'
 */
export function createSlugFromDate(dateIso: string): string {
  const [year, month, day] = dateIso.split('-');
  const monthNumber = parseInt(month, 10);
  const dayNumber = parseInt(day, 10);

  // Obtener nombre del mes (0-indexed, por eso -1)
  const monthName = MESES_NOMBRES[monthNumber - 1];

  return `precio-luz-${dayNumber}-${monthName}-${year}`;
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
