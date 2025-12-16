import React from 'react';
import type { HourColumnProps } from '~/shared/types/precios';

// TODO: Import formatHourForZone from date-utils once migrated
// For now, using the hour label from chartData directly
function formatHourForZone(ymd: string, hourIndex: number): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  const start = pad(hourIndex);
  const end = pad((hourIndex + 1) % 24);
  return `${start}-${end}h`;
}

export default function HourColumn({
  chartData,
  currentHourIndex,
  rowHeight = 28,
  // hourCellClass is the explicit per-row cell class (preferred)
  hourCellClass = '',
  // keep hourClass for backwards compatibility
  hourClass = '',
  dayStr,
  className = '',
}: HourColumnProps) {
  const outerClass = `${className}`.trim();
  const cellClass = hourCellClass || hourClass || '';

  return (
    <div className={outerClass}>
      <div>
        {chartData.map((row, idx) => (
          <div
            key={'h-' + idx}
            style={{ height: rowHeight }}
            className={
              idx === currentHourIndex
                ? `bg-primary/10 flex items-center font-mono pl-2 ${cellClass}`
                : `flex items-center pl-2 ${cellClass}`
            }
          >
            <div className="min-w-0">
              {dayStr && typeof row.hourNum === 'number' ? formatHourForZone(dayStr, row.hourNum) : row.hour}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
