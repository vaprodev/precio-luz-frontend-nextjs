import React from 'react';
import { toChartData } from './logic';
import HourColumn from './HourColumn';
import PriceColumn from './PriceColumn';
import BarsColumn from './BarsColumn';
import type { PriceChartViewProps } from '~/shared/types/precios';

export default function PriceChartView({
  data,
  currentHourIndex = null,
  min = null,
  max = null,
  activeDate,
  // layout props
  rowHeight = 23,
  gridTemplate = 'grid-cols-[1fr_1fr_2fr]',
  hourClass = '',
  priceClass = '',
}: PriceChartViewProps) {
  const chartData = React.useMemo(() => toChartData(data), [data]);

  if (!chartData?.length) return null;

  return (
    <div className="border border-gray-200 dark:border-gray-700 p-4 shadow-sm rounded-lg bg-white dark:bg-slate-900">
      {/* CONTAINER PRINCIPAL */}
      <div className="">
        {/* GRID: plantilla de columnas y gap */}
        <div className={`grid ${gridTemplate} gap-2 items-start`}>
          {/* HEADER COMPARTIDO */}
          <div className="flex items-center">
            <div className="text-xs font-semibold">Hora</div>
          </div>
          <div className="flex items-center">
            <div className="text-xs font-semibold">
              Precio <span className="text-[10px] ml-1">€/kWh</span>
            </div>
          </div>
          <div className="flex items-center">
            <div className="text-xs font-semibold">Gráfico</div>
          </div>

          {/* COLUMNA: HORA  */}
          <div className="">
            <HourColumn
              chartData={chartData}
              currentHourIndex={currentHourIndex}
              rowHeight={rowHeight}
              hourCellClass={hourClass}
              dayStr={activeDate}
            />
          </div>

          {/* COLUMNA: PRECIO */}
          <div className="">
            <PriceColumn
              chartData={chartData}
              rowHeight={rowHeight}
              // map public priceClass to priceCellClass for per-row styling
              priceCellClass={priceClass}
            />
          </div>

          {/* COLUMNA: BARRAS  */}
          <div className="">
            <BarsColumn chartData={chartData} rowHeight={rowHeight} min={min} max={max} />
          </div>
        </div>
      </div>
    </div>
  );
}
