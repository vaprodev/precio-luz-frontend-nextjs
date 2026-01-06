/**
 * useTomorrowAvailability Hook
 * Checks if tomorrow's prices are complete (24/24) and sets initial activeDate
 * Ported from Legacy: frontend/src/hooks/useTomorrowAvailability.js
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { fetchPricesByDateClient } from '~/lib/api/precios-api';
import { getTodayMadridYmd, getTomorrowMadridYmd } from '~/lib/precios/date-utils';
import { usePricesStore } from './usePricesStore';

interface TomorrowAvailabilityResult {
  available: boolean;
  loading: boolean;
  info: {
    count: number;
    date: string;
  } | null;
}

/**
 * Hook to check tomorrow's availability and set initial activeDate
 * - Fetches tomorrow's prices on mount
 * - If tomorrow has 24 records → sets activeDate to tomorrow
 * - If tomorrow has 0 records → sets activeDate to today
 * - Returns availability status for MiniCalendar maxDate
 */
export function useTomorrowAvailability(): TomorrowAvailabilityResult {
  const [available, setAvailable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [info, setInfo] = useState<{ count: number; date: string } | null>(null);

  const decidedRef = useRef(false);
  const setActiveDate = usePricesStore((s) => s.setActiveDate);

  useEffect(() => {
    let cancelled = false;

    const todayYmd = getTodayMadridYmd();
    const tomorrowYmd = getTomorrowMadridYmd();

    async function checkTomorrowAvailability() {
      try {
        console.log('[useTomorrowAvailability] Checking tomorrow:', tomorrowYmd);

        // Fetch tomorrow's prices from the API
        const result = await fetchPricesByDateClient(tomorrowYmd);

        if (cancelled) return;

        // Extract count from the response
        const count = result.data?.count ?? 0;
        const isComplete = count === 24;

        console.log('[useTomorrowAvailability] Response:', {
          date: tomorrowYmd,
          count,
          isComplete,
          status: result.status,
        });

        // Update state
        setInfo({ count, date: tomorrowYmd });
        setAvailable(isComplete);

        // CRITICAL: Set initial date ONCE on mount
        if (!decidedRef.current) {
          decidedRef.current = true;
          const initialDate = isComplete ? tomorrowYmd : todayYmd;
          console.log('[useTomorrowAvailability] Setting initial date:', initialDate);
          setActiveDate(initialDate);
        }
      } catch (error) {
        console.error('[useTomorrowAvailability] Error checking tomorrow:', error);

        if (cancelled) return;

        // On error, assume tomorrow is not available
        setAvailable(false);
        setInfo(null);

        // Fallback to today
        if (!decidedRef.current) {
          decidedRef.current = true;
          console.log('[useTomorrowAvailability] Error fallback to today');
          setActiveDate(todayYmd);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    // Check once on mount
    checkTomorrowAvailability();

    return () => {
      cancelled = true;
    };
  }, []); // Empty deps - only run once on mount

  return { available, loading, info };
}
