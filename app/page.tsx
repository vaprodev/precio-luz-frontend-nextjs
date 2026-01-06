'use client';

/**
 * Home Page - Phase 4: Integrated with MiniCalendar
 * Uses Zustand for state management and React Query for data fetching
 */

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePricesStore } from '@/hooks/usePricesStore';
import { usePriceData } from '@/hooks/usePriceData';
import MiniCalendarMantine from '@/components/precios/MiniCalendarMantine';
import PriceChartView from '@/components/precios/price-chart/PriceChartView';
import { fetchPricesByDateClient } from '~/lib/api/precios-api';
import { getCurrentHourMadrid, isToday } from '~/lib/precios/date-utils';

// Create QueryClient for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      refetchOnWindowFocus: false,
    },
  },
});

function HomeContent() {
  const activeDate = usePricesStore((s) => s.activeDate);
  const { data, loading, error, info, meta } = usePriceData(activeDate);

  // Calculate if tomorrow is available based on completeness
  const tomorrowAvailable = React.useMemo(() => {
    return info?.isComplete === true;
  }, [info]);

  // Calculate current hour index for highlighting (only if viewing today)
  const currentHourIndex = React.useMemo(() => {
    if (!activeDate || !isToday(activeDate)) return null;
    return getCurrentHourMadrid();
  }, [activeDate]);

  // Calculate min/max for chart colors
  const { minPrice, maxPrice } = React.useMemo(() => {
    if (!meta) return { minPrice: null, maxPrice: null };
    return {
      minPrice: meta.min ?? null,
      maxPrice: meta.max ?? null,
    };
  }, [meta]);

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="py-12 md:py-20">
          {/* Header */}
          <header className="mb-10 text-center">
            <h1 className="mb-6 text-4xl font-bold tracking-tighter md:text-5xl lg:text-6xl">Precio de la Luz Hoy</h1>
            <p className="text-xl font-normal text-gray-600 dark:text-slate-400">
              Consulta los precios por hora de la electricidad en España
            </p>
          </header>

          {/* MiniCalendar Navigation */}
          <section className="mb-8">
            <div className="card p-6">
              <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">Selecciona una fecha</h2>
              <div className="flex justify-center">
                <MiniCalendarMantine tomorrowAvailable={tomorrowAvailable} fetchPricesFn={fetchPricesByDateClient} />
              </div>
            </div>
          </section>

          {/* Price Chart Section */}
          <section>
            <div className="card p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Precios del {activeDate}</h2>

                {/* Completeness indicator */}
                {info && (
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Datos disponibles: {info.count}/24 {info.isComplete ? '✓' : '⏳'}
                  </span>
                )}
              </div>

              {/* Loading state */}
              {loading && (
                <div className="flex h-64 items-center justify-center">
                  <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary-600"></div>
                </div>
              )}

              {/* Error state */}
              {error && !loading && (
                <div className="rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700 dark:border-red-600 dark:bg-red-900/20 dark:text-red-400">
                  <strong>Error:</strong> No se pudieron cargar los precios para esta fecha.
                </div>
              )}

              {/* Data state */}
              {data && !loading && !error && (
                <div className="space-y-4">
                  {/* Price Chart */}
                  <PriceChartView
                    data={data.data}
                    currentHourIndex={currentHourIndex}
                    min={minPrice}
                    max={maxPrice}
                    activeDate={activeDate}
                  />

                  {/* Metadata info */}
                  {meta && (
                    <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                        <div className="text-sm font-medium text-blue-900 dark:text-blue-100">Precio Mínimo</div>
                        <div className="mt-1 text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {meta.min?.toFixed(4)} €/kWh
                        </div>
                      </div>

                      <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
                        <div className="text-sm font-medium text-green-900 dark:text-green-100">Precio Medio</div>
                        <div className="mt-1 text-2xl font-bold text-green-600 dark:text-green-400">
                          {meta.mean?.toFixed(4)} €/kWh
                        </div>
                      </div>

                      <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
                        <div className="text-sm font-medium text-red-900 dark:text-red-100">Precio Máximo</div>
                        <div className="mt-1 text-2xl font-bold text-red-600 dark:text-red-400">
                          {meta.max?.toFixed(4)} €/kWh
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

export default function Page() {
  return (
    <QueryClientProvider client={queryClient}>
      <HomeContent />
    </QueryClientProvider>
  );
}
