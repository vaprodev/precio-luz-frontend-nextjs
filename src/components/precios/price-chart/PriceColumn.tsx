import React from 'react';
import type { PriceColumnProps } from '~/shared/types/precios';

// TODO: Import formatPrice from utils once migrated
// For now, implementing inline
function formatPrice(value: number): string {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '—';
  // Round to 4 decimals
  const rounded = Math.round(value * 10000) / 10000;
  return rounded.toLocaleString('es-ES', { minimumFractionDigits: 4, maximumFractionDigits: 4 });
}

export default function PriceColumn({
  chartData,
  rowHeight = 28,
  // priceCellClass is the explicit per-row class (preferred)
  priceCellClass = '',
  // keep priceClass for backwards compatibility
  priceClass = '',
  className = '',
}: PriceColumnProps) {
  const outerClass = `${className}`.trim();
  const cellClass = priceCellClass || priceClass || '';

  return (
    <div className={outerClass}>
      <div>
        {chartData.map((row, idx) => (
          <div key={'p-' + idx} style={{ height: rowHeight }} className={`flex items-center pl-2 ${cellClass}`}>
            {formatPrice(row.price)}
          </div>
        ))}
      </div>
    </div>
  );
}
