'use client';

/**
 * Home Page - Phase 4: Integrated with MiniCalendar
 * Uses Zustand for state management and React Query for data fetching
 */

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePricesStore } from '@/hooks/usePricesStore';
import { usePriceData } from '@/hooks/usePriceData';
import { useTomorrowAvailability } from '@/hooks/useTomorrowAvailability';
import MiniCalendarMantine from '@/components/precios/MiniCalendarMantine';
import PriceChartView from '@/components/precios/price-chart/PriceChartView';
import { fetchPricesByDateClient } from '~/lib/api/precios-api';
import { getCurrentHourMadrid, isToday, getTodayMadridYmd } from '~/lib/precios/date-utils';

// Template widgets
import Hero from '~/components/widgets/Hero';
import Features from '~/components/widgets/Features';
import Content from '~/components/widgets/Content';
import Steps from '~/components/widgets/Steps';
import Testimonials from '~/components/widgets/Testimonials';
import FAQs2 from '~/components/widgets/FAQs2';
import CallToAction2 from '~/components/widgets/CallToAction2';
import {
  callToAction2Home,
  contentHomeOne,
  contentHomeTwo,
  faqs2Home,
  featuresHome,
  heroHome,
  stepsHome,
  testimonialsHome,
} from '~/shared/data/pages/home.data';

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

  // Check tomorrow availability and set initial date
  const { available: tomorrowAvailable, loading: checkingTomorrow } = useTomorrowAvailability();

  // Use activeDate if available, otherwise fallback to today (should not happen after checkingTomorrow=false)
  const effectiveDate = activeDate ?? getTodayMadridYmd();
  const { data, loading, error, info, meta } = usePriceData(effectiveDate);

  // Calculate current hour index for highlighting (only if viewing today)
  const currentHourIndex = React.useMemo(() => {
    if (!effectiveDate || !isToday(effectiveDate)) return null;
    return getCurrentHourMadrid();
  }, [effectiveDate]);

  // Calculate min/max for chart colors
  const { minPrice, maxPrice } = React.useMemo(() => {
    if (!meta) return { minPrice: null, maxPrice: null };
    return {
      minPrice: meta.min ?? null,
      maxPrice: meta.max ?? null,
    };
  }, [meta]);

  // Show loading while checking tomorrow's availability
  if (checkingTomorrow || !activeDate) {
    return (
      <main className="min-h-screen">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="py-12 md:py-20">
            <header className="mb-10 text-center">
              <h1 className="mb-6 text-4xl font-bold tracking-tighter md:text-5xl lg:text-6xl">
                ¿Cuál es el Precio de la Luz Hoy?
              </h1>
              <p className="text-xl font-normal text-gray-600 dark:text-slate-400">
                Consulta los precios por hora de la electricidad en España
              </p>
            </header>
            <div className="flex h-64 items-center justify-center">
              <div className="text-center">
                <div className="mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-primary-600 mx-auto"></div>
                <p className="text-lg text-gray-600 dark:text-gray-400">Comprobando la última fecha disponible…</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="py-12 md:py-20">
          {/* Header */}
          <header className="mb-10 text-center">
            <h1 className="mb-6 text-4xl font-bold tracking-tighter md:text-5xl lg:text-6xl">
              ¿Cuál es el Precio de la Luz Hoy?
            </h1>
            <p className="text-xl font-normal text-gray-600 dark:text-slate-400">
              Desliza para ver las Horas de Luz más Baratas
            </p>
          </header>
          {/* MiniCalendar Navigation */}
          <section className="mb-8">
            <div className="card p-6">
              <div className="flex justify-center">
                <MiniCalendarMantine tomorrowAvailable={tomorrowAvailable} fetchPricesFn={fetchPricesByDateClient} />
              </div>
            </div>
          </section>
          {/* Price Chart Section */}
          <section>
            <div className="card p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Gráfico con las tarifas de luz por horas del {effectiveDate}
                </h2>

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
                    activeDate={effectiveDate}
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
          {/* Template Widgets */}
          <FAQs2 {...faqs2Home} />
          {/*
          <Hero {...heroHome} />
          <Features {...featuresHome} />
          <Content {...contentHomeOne} />
          <Content {...contentHomeTwo} />
          <Steps {...stepsHome} />
          <Testimonials {...testimonialsHome} />
          
          <CallToAction2 {...callToAction2Home} />
          */}
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
