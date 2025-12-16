'use client';

import WidgetWrapper from '~/components/common/WidgetWrapper';
import Headline from '~/components/common/Headline';
import type { ElectricityPricesProps } from '~/shared/types';

export default function ElectricityPrices({
  id,
  hasBackground = false,
  header,
  prices,
  lastUpdate,
}: ElectricityPricesProps) {
  return (
    <WidgetWrapper id={id} hasBackground={hasBackground} containerClass="max-w-6xl">
      {/* Header de la sección */}
      {header && <Headline header={header} containerClass="text-center mb-10" />}

      {/* Área del gráfico */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 md:p-8">
        {/* Aquí irá tu PriceChartView cuando lo migres */}
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 mb-4">📊 Gráfico de precios</p>
          <p className="text-sm text-gray-400">(PriceChartView se integrará aquí después de la migración)</p>

          {/* Simulación del gráfico con datos mock */}
          <div className="mt-8 grid grid-cols-24 gap-1 h-48">
            {prices.map((price, idx) => {
              const height = (price.precio / 0.25) * 100; // Escala 0-0.25€
              const getColor = () => {
                if (price.precio < 0.12) return 'bg-green-500';
                if (price.precio < 0.18) return 'bg-yellow-500';
                return 'bg-red-500';
              };

              return (
                <div
                  key={price.hora}
                  className="flex flex-col justify-end"
                  title={`${price.hora}: ${price.precio.toFixed(3)} €/kWh`}
                >
                  <div
                    className={`${getColor()} rounded-t transition-all hover:opacity-80 cursor-pointer`}
                    style={{ height: `${Math.max(height, 10)}%` }}
                  />
                  {idx % 3 === 0 && (
                    <span className="text-[8px] text-gray-500 mt-1 hidden md:block">
                      {price.hora.split(':')[0]}h
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Leyenda de colores */}
        <div className="flex justify-center gap-6 mt-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded" />
            <span className="text-gray-600 dark:text-gray-400">Bajo (&lt; 0.12 €)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded" />
            <span className="text-gray-600 dark:text-gray-400">Medio (0.12 - 0.18 €)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded" />
            <span className="text-gray-600 dark:text-gray-400">Alto (&gt; 0.18 €)</span>
          </div>
        </div>
      </div>

      {/* Footer con última actualización */}
      {lastUpdate && (
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Last update: {lastUpdate}
          </p>
        </div>
      )}
    </WidgetWrapper>
  );
}
