'use client';

/**
 * MiniCalendarMantine - Componente de calendario adaptado de Legacy
 * Integra Mantine DatePicker con Zustand store y React Query prefetch
 *
 * Features:
 * - Prefetch automático de días cercanos a la fecha activa
 * - Desactiva fechas futuras según `tomorrowAvailable`
 * - Excluye fechas sin datos (usando cache de react-query)
 * - Marca domingos en rojo
 * - Zona horaria: Europe/Madrid
 */

import React from 'react';
import { DatePicker } from '@mantine/dates';
import { useQueryClient } from '@tanstack/react-query';
import {
  ymdToZonedDayjs,
  dateToYmdInZone,
  getTodayMadridYmd,
  getTomorrowMadridYmd,
  SPAIN_TZ,
} from '@/lib/precios/date-utils';
import { usePricesStore } from '@/hooks/usePricesStore';

interface MiniCalendarMantineProps {
  /** Número de días visibles en el calendario (no usado en DatePicker) */
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
export default function MiniCalendarMantine({ tomorrowAvailable = false, fetchPricesFn }: MiniCalendarMantineProps) {
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
   * Construir lista de fechas excluidas (sin datos disponibles)
   * NOTA: Deshabilitado por ahora para evitar bucles infinitos
   * TODO: Implementar con estado separado cuando se necesite
   */
  const excludeDates = React.useMemo(() => {
    return [];
  }, []);

  /**
   * Handler para cambio de fecha - Mantine v8 usa strings ISO (YYYY-MM-DD)
   */
  const handleDateChange = React.useCallback(
    (value: string | null) => {
      if (!value) return;
      // Mantine pasa la fecha como string YYYY-MM-DD ya en zona horaria correcta
      setActiveDate(value);
    },
    [setActiveDate],
  );

  /**
   * Verificar si una fecha debe ser excluida - Mantine v8 pasa string
   * NOTA: Siempre retorna false por ahora (excludeDates está vacío)
   */
  const shouldExcludeDate = React.useCallback((dateStr: string) => {
    // Por ahora, no excluimos ninguna fecha
    return false;
  }, []);

  /**
   * getDayProps: customizar estilos por día - Domingos en rojo - Mantine v8 pasa string
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
        excludeDatesCount: excludeDates.length,
      });
    }
  }, [activeDate, valueDate, tomorrowAvailable, maxDate, excludeDates.length]);

  return (
    <div className="mini-calendar-wrapper">
      <DatePicker
        value={valueDate}
        onChange={handleDateChange}
        maxDate={maxDate}
        excludeDate={shouldExcludeDate}
        getDayProps={getDayProps}
        firstDayOfWeek={1}
      />
    </div>
  );
}
