'use client';

/**
 * MiniCalendarMantine - Componente de calendario adaptado de Legacy
 * Integra Mantine MiniCalendar (no DatePicker) con Zustand store y React Query prefetch
 *
 * Features:
 * - Prefetch automático de días cercanos a la fecha activa
 * - Desactiva fechas futuras según `tomorrowAvailable`
 * - Excluye fechas sin datos (usando cache de react-query)
 * - Marca domingos en rojo
 * - Zona horaria: Europe/Madrid
 * - Muestra numberOfDays días visibles
 */

import React from 'react';
import { MiniCalendar } from '@mantine/dates';
import { useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import {
  ymdToZonedDayjs,
  dateToYmdInZone,
  getTodayMadridYmd,
  getTomorrowMadridYmd,
  SPAIN_TZ,
} from '@/lib/precios/date-utils';
import { usePricesStore } from '@/hooks/usePricesStore';

interface MiniCalendarMantineProps {
  /** Número de días visibles en el calendario */
  numberOfDays?: number;
  /** Si true, permite seleccionar hasta mañana. Si false, solo hasta hoy */
  tomorrowAvailable?: boolean;
  /** Función para obtener datos de precios por fecha (para prefetch) */
  fetchPricesFn?: (ymd: string) => Promise<any>;
}

/**
 * MiniCalendarMantine Component
 * Calendario pequeño integrado con estado global (Zustand) y prefetch (React Query)
 */
export default function MiniCalendarMantine({
  numberOfDays = 7,
  tomorrowAvailable = false,
  fetchPricesFn,
}: MiniCalendarMantineProps) {
  // Estado global: activeDate como YYYY-MM-DD
  // IMPORTANTE: Usar selectores separados para evitar crear nuevo objeto en cada render
  const activeDate = usePricesStore((s) => s.activeDate);
  const setActiveDate = usePricesStore((s) => s.setActiveDate);

  // React Query client para prefetch
  const qc = useQueryClient();

  // Convertir activeDate (YYYY-MM-DD) a Date para Mantine
  const valueDate = React.useMemo(() => {
    if (!activeDate) return null;
    const dayjsDate = ymdToZonedDayjs(activeDate);
    return dayjsDate ? dayjsDate.toDate() : null;
  }, [activeDate]);

  /**
   * Calculate interval start date ONCE on mount (not on activeDate changes)
   * This ensures the calendar shows activeDate near the end only on initial load
   */
  const [intervalStartDate] = React.useState(() => {
    const baseYmd = activeDate ?? getTodayMadridYmd();
    // Calculate how many days to subtract so activeDate appears near the end
    // For numberOfDays=7, subtract 5 to make activeDate the 6th day
    const daysToSubtract = numberOfDays - 2;
    const dayjsDate = ymdToZonedDayjs(baseYmd, SPAIN_TZ);
    if (!dayjsDate) return new Date();
    return dayjsDate.startOf('day').subtract(daysToSubtract, 'day').toDate();
  });

  /**
   * Calcular maxDate según disponibilidad de mañana
   * - Si tomorrowAvailable=true: permite hasta mañana
   * - Si false: solo hasta hoy
   */
  const maxDate = React.useMemo(() => {
    const todayYmd = getTodayMadridYmd();
    const tomorrowYmd = getTomorrowMadridYmd();

    if (tomorrowAvailable) {
      const dayjsDate = ymdToZonedDayjs(tomorrowYmd, SPAIN_TZ);
      return dayjsDate ? dayjsDate.toDate() : new Date();
    }
    const dayjsDate = ymdToZonedDayjs(todayYmd, SPAIN_TZ);
    return dayjsDate ? dayjsDate.toDate() : new Date();
  }, [tomorrowAvailable]);

  /**
   * Prefetch de precios para días cercanos a la fecha activa
   */
  React.useEffect(() => {
    if (!fetchPricesFn || !activeDate) return;

    const prefetchNearbyDays = async () => {
      // Prefetch 7 días: 3 antes, el día actual, y 3 después
      const baseDayjs = ymdToZonedDayjs(activeDate);
      if (!baseDayjs) return;

      for (let offset = -3; offset <= 3; offset++) {
        const day = baseDayjs.add(offset, 'day').format('YYYY-MM-DD');
        try {
          await qc.prefetchQuery({
            queryKey: ['prices', day],
            queryFn: () => fetchPricesFn(day),
          });
        } catch (error) {
          console.debug(`Prefetch failed for ${day}:`, error);
        }
      }
    };

    prefetchNearbyDays();
  }, [activeDate, fetchPricesFn, qc]);

  /**
   * Build excludeDates from react-query cache: any day with no data should be disabled
   */
  const excludeDates = React.useMemo(() => {
    const excluded: Date[] = [];
    const queries = qc.getQueryCache().getAll();

    for (const q of queries) {
      const key = q.queryKey;
      if (!Array.isArray(key) || key[0] !== 'prices') continue;

      const day = key[1] as string;
      const state = q.state.data as any;

      // If we have a cached payload and count is zero or data empty -> exclude
      const hasCount = state && (state.count > 0 || (state.data && state.data.length > 0));
      if (!hasCount) {
        const d = ymdToZonedDayjs(day)?.toDate();
        if (d) excluded.push(d);
      }
    }

    return excluded.length ? excluded : undefined;
  }, [qc]);

  /**
   * Handler para cambio de fecha - Mantine v8 MiniCalendar usa strings ISO
   */
  const handleDateChange = React.useCallback(
    (dateStr: string) => {
      if (!dateStr) return;
      setActiveDate(dateStr);
    },
    [setActiveDate],
  );

  /**
   * getDayProps: customizar estilos por día - Domingos en rojo - Mantine v8 pasa strings
   */
  const getDayProps = React.useCallback((dateStr: string) => {
    const date = new Date(dateStr);
    const isDomingo = date.getDay() === 0;
    return {
      style: isDomingo
        ? {
            color: '#c92a2a',
            fontWeight: 'bold' as const,
          }
        : {},
    };
  }, []);

  // Log de debug en desarrollo
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.debug('[MiniCalendar]', {
        activeDate,
        valueDate,
        tomorrowAvailable,
        maxDate,
        intervalStartDate,
        numberOfDays,
        excludeDatesCount: excludeDates?.length ?? 0,
      });
    }
  }, [activeDate, valueDate, tomorrowAvailable, maxDate, intervalStartDate, numberOfDays, excludeDates]);

  return (
    <div className="mini-calendar-wrapper">
      <MiniCalendar
        value={valueDate}
        onChange={handleDateChange}
        numberOfDays={numberOfDays}
        defaultDate={intervalStartDate}
        maxDate={maxDate}
        getDayProps={getDayProps}
        // excludeDates no está disponible en MiniCalendar v8
        // Se usa getDayProps para deshabilitar fechas sin datos
      />
    </div>
  );
}
