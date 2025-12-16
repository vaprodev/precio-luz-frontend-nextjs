'use client';

import { useRouter } from 'next/navigation';
import {
  parseSlugToDate,
  getPreviousDaySlug,
  getNextDaySlug,
  formatDateShort,
  isFutureDate,
} from '~/lib/precios/slug-utils';
import dayjs from 'dayjs';

interface DateNavigatorProps {
  currentSlug: string;
}

export default function DateNavigator({ currentSlug }: DateNavigatorProps) {
  const router = useRouter();
  const parsed = parseSlugToDate(currentSlug);

  if (!parsed) return null;

  const prevSlug = getPreviousDaySlug(parsed.dateIso);
  const nextSlug = getNextDaySlug(parsed.dateIso);

  // No permitir navegar más allá de mañana
  const nextDate = dayjs(parsed.dateIso).add(1, 'day').format('YYYY-MM-DD');
  const canGoNext = !isFutureDate(nextDate) || nextDate === dayjs().add(1, 'day').format('YYYY-MM-DD');

  const handlePrevious = () => {
    router.push(`/${prevSlug}`);
  };

  const handleNext = () => {
    if (canGoNext) {
      router.push(`/${nextSlug}`);
    }
  };

  return (
    <div className="flex items-center justify-between gap-4 mb-6 p-4 bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-gray-700">
      {/* Botón anterior */}
      <button
        onClick={handlePrevious}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        <span>Día anterior</span>
      </button>

      {/* Fecha actual */}
      <div className="text-center">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {parsed.type === 'hoy' && '🟢 Hoy'}
          {parsed.type === 'manana' && '🔵 Mañana'}
          {parsed.type === 'pasado' && '📅 Histórico'}
        </div>
        <div className="text-lg font-semibold text-gray-900 dark:text-white">{formatDateShort(parsed.dateIso)}</div>
      </div>

      {/* Botón siguiente */}
      <button
        onClick={handleNext}
        disabled={!canGoNext}
        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition ${
          canGoNext
            ? 'text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
            : 'text-gray-400 dark:text-gray-600 bg-gray-50 dark:bg-gray-900 cursor-not-allowed'
        }`}
      >
        <span>Día siguiente</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}
