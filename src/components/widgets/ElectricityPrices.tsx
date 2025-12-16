'use client';

import { useState } from 'react';
import WidgetWrapper from '~/components/common/WidgetWrapper';
import PriceChartView from '~/components/precios/price-chart/PriceChartView';
import PriceChartSkeleton from '~/components/precios/PriceChartSkeleton';
import PriceChartErrorState from '~/components/precios/PriceChartErrorState';
import { usePriceData } from '~/hooks/usePriceData';
import { formatPrice } from '~/lib/precios/formatters';
import type { Header } from '~/shared/types';

interface ElectricityPricesRealDataProps {
  id?: string;
  hasBackground?: boolean;
  header?: Header;
}

export default function ElectricityPrices({
  id = 'precios-hoy',
  hasBackground = false,
  header,
}: ElectricityPricesRealDataProps) {
  const [retryKey, setRetryKey] = useState(0);

  // Fetch real data from API with polling
  const { loading, error, data, meta } = usePriceData('today');

  const handleRetry = () => {
    setRetryKey((prev) => prev + 1);
    window.location.reload(); // Force reload to retry
  };

  return (
    <WidgetWrapper id={id} hasBackground={hasBackground} containerClass="max-w-6xl">
      {/* Header de la sección */}
      {header && (
        <div className="mb-10 text-center">
          {header.tagline && (
            <p className="text-base font-semibold uppercase tracking-wide text-primary-600 dark:text-primary-200">
              {header.tagline}
            </p>
          )}
          {header.title && (
            <h2 className="font-heading text-4xl md:text-5xl font-bold tracking-tight mb-4">{header.title}</h2>
          )}
          {header.subtitle && (
            <p className="mx-auto mt-4 max-w-3xl text-xl text-gray-600 dark:text-slate-400">{header.subtitle}</p>
          )}
        </div>
      )}

      {/* Loading state */}
      {loading && <PriceChartSkeleton />}

      {/* Error state */}
      {!loading && error && <PriceChartErrorState error={error} onRetry={handleRetry} />}

      {/* Success state with data */}
      {!loading && !error && data && meta && (
        <>
          {/* Chart */}
          <PriceChartView
            data={data.data}
            currentHourIndex={meta.currentHourIndex ?? undefined}
            min={meta.min ?? 0}
            max={meta.max ?? 0}
            activeDate={data.date}
          />

          {/* Stats cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Precio Mínimo</div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{formatPrice(meta.min)} €/kWh</div>
              <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">Hora más barata del día</div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Precio Medio</div>
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {formatPrice(meta.mean)} €/kWh
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">Promedio del día</div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Precio Máximo</div>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">{formatPrice(meta.max)} €/kWh</div>
              <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">Hora más cara del día</div>
            </div>
          </div>

          {/* Best 2h window */}
          {meta.best2h && (
            <div className="mt-6 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <div className="text-3xl">🌟</div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-emerald-700 dark:text-emerald-400 mb-1">
                    Mejor momento para consumir electricidad
                  </div>
                  <div className="text-xl font-bold text-emerald-900 dark:text-emerald-300">
                    {String(meta.best2h.startIndex).padStart(2, '0')}:00 -{' '}
                    {String(meta.best2h.startIndex + 2).padStart(2, '0')}:00
                  </div>
                  <div className="text-sm text-emerald-600 dark:text-emerald-500 mt-1">
                    Precio promedio: {formatPrice(meta.best2h.total / 2)} €/kWh
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Last update footer */}
          <div className="text-center mt-6">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Última actualización:{' '}
              {new Date().toLocaleString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
            {data.count < 24 && (
              <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-1">
                ⏳ Datos incompletos ({data.count}/24 horas) - Actualizando automáticamente...
              </p>
            )}
          </div>
        </>
      )}
    </WidgetWrapper>
  );
}
