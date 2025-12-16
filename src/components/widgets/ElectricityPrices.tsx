'use client';

import WidgetWrapper from '~/components/common/WidgetWrapper';
import Headline from '~/components/common/Headline';
import PriceChartView from '~/components/precios/price-chart/PriceChartView';
import type { ElectricityPricesProps } from '~/shared/types';

export default function ElectricityPrices({
  id,
  hasBackground = false,
  header,
  prices,
  lastUpdate,
}: ElectricityPricesProps) {
  // Transform prices data to API format expected by PriceChartView
  const priceData = prices.map((p, index) => ({
    priceEurKwh: p.precio,
    hourIndex: index,
  }));

  // Calculate min/max for color tiers
  const priceValues = prices.map(p => p.precio);
  const min = Math.min(...priceValues);
  const max = Math.max(...priceValues);

  // Get current hour for highlighting
  const currentHour = new Date().getHours();

  return (
    <WidgetWrapper id={id} hasBackground={hasBackground} containerClass="max-w-6xl">
      {/* Header de la sección */}
      {header && <Headline header={header} containerClass="text-center mb-10" />}

      {/* Área del gráfico - Componente real migrado */}
      <PriceChartView
        data={priceData}
        currentHourIndex={currentHour}
        min={min}
        max={max}
        activeDate={new Date().toISOString().split('T')[0]}
      />

      {/* Footer con última actualización */}
      {lastUpdate && (
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Última actualización: {lastUpdate}
          </p>
        </div>
      )}
    </WidgetWrapper>
  );
}
