/**
 * React Hook for Fetching Price Data (Client Components)
 * With automatic polling for incomplete days
 * Ported from Legacy: src/features/prices/hooks.js
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { fetchPricesByDateClient } from '~/lib/api/precios-api';
import { computeMetrics } from '~/lib/precios/metrics';
import type { PricesResponse, PricesMeta, CompletenessInfo, CachePolicy } from '~/lib/api/types';
import { getTodayMadridYmd, getTomorrowMadridYmd } from '~/lib/precios/date-utils';

interface UsePriceDataState {
  loading: boolean;
  error: string | number | null;
  data: PricesResponse | null;
  meta: PricesMeta | null;
  info: CompletenessInfo | null;
  policy: CachePolicy;
}

/**
 * Sleep utility for polling delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Hook to fetch and manage price data with automatic polling
 * @param dateStr - Date in YYYY-MM-DD format, or 'today'/'tomorrow'
 */
export function usePriceData(dateStr: string | 'today' | 'tomorrow'): UsePriceDataState {
  const [state, setState] = useState<UsePriceDataState>({
    loading: true,
    error: null,
    data: null,
    meta: null,
    info: null,
    policy: null,
  });

  const lastDateRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    // Resolve 'today'/'tomorrow' to actual dates
    let actualDate = dateStr;
    if (dateStr === 'today') actualDate = getTodayMadridYmd();
    if (dateStr === 'tomorrow') actualDate = getTomorrowMadridYmd();

    lastDateRef.current = actualDate;

    if (!actualDate) {
      setState({
        loading: false,
        error: 'missing-date',
        data: null,
        meta: null,
        info: null,
        policy: null,
      });
      return () => {};
    }

    setState((s) => ({ ...s, loading: true, error: null }));

    (async () => {
      const result = await fetchPricesByDateClient(actualDate);

      if (cancelled) return;

      if (!result.ok) {
        console.warn('[usePriceData] Failed to fetch prices', {
          date: actualDate,
          status: result.status,
          error: result.error,
        });

        setState({
          loading: false,
          error: result.status || 'network',
          data: null,
          meta: null,
          info: null,
          policy: result.policy,
        });
        return;
      }

      const payload = result.data!;
      const meta = computeMetrics(payload.data, payload.date);

      console.log('[usePriceData] Prices fetched successfully', {
        date: actualDate,
        count: payload.count,
        isComplete: result.info.isComplete,
        policy: result.policy,
        meta: {
          min: meta.min,
          max: meta.max,
          currentHourIndex: meta.currentHourIndex,
        },
      });

      setState({
        loading: false,
        error: null,
        data: payload,
        meta,
        info: result.info,
        policy: result.policy,
      });

      // Start polling if data is incomplete and it's today/tomorrow
      const shouldPoll = !result.info?.isComplete && (result.policy === 'today' || result.policy === 'tomorrow');

      if (shouldPoll) {
        console.log('[usePriceData] Starting polling for incomplete data', {
          date: actualDate,
          policy: result.policy,
        });

        (async function poll() {
          // Check if still on same date and not cancelled
          if (cancelled || lastDateRef.current !== actualDate) return;

          // Wait 15 seconds between polls
          await sleep(15000);

          if (cancelled || lastDateRef.current !== actualDate) return;

          const result2 = await fetchPricesByDateClient(actualDate);

          if (cancelled || lastDateRef.current !== actualDate) return;

          if (!result2.ok) {
            console.warn('[usePriceData] Poll failed, will retry', {
              date: actualDate,
              status: result2.status,
              error: result2.error,
            });
            // Continue polling despite error
            return poll();
          }

          const payload2 = result2.data!;
          const meta2 = computeMetrics(payload2.data, payload2.date);

          setState({
            loading: false,
            error: null,
            data: payload2,
            meta: meta2,
            info: result2.info,
            policy: result2.policy,
          });

          // Continue polling if still incomplete
          if (!result2.info?.isComplete && (result2.policy === 'today' || result2.policy === 'tomorrow')) {
            return poll();
          }

          console.log('[usePriceData] Polling stopped - data complete', {
            date: actualDate,
            info: result2.info,
          });
        })();
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [dateStr]);

  return state;
}

/**
 * Hook to fetch today's prices
 */
export function usePricesToday(): UsePriceDataState {
  return usePriceData('today');
}

/**
 * Hook to fetch tomorrow's prices
 */
export function usePricesTomorrow(): UsePriceDataState {
  return usePriceData('tomorrow');
}
