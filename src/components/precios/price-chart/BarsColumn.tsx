'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';
import { tierColor } from './logic';
import type { BarsColumnProps } from '~/shared/types/precios';

export default function BarsColumn({
  chartData,
  rowHeight = 28,
  min = null,
  max = null,
  className = '',
}: BarsColumnProps) {
  const outerClass = `${className}`.trim();
  const chartHeight = Math.max(200, Math.min(rowHeight * chartData.length, 700));
  const computedMax = typeof max === 'number' ? max : Math.max(...chartData.map((d) => d.price));
  // barSize should be slightly less than rowHeight to provide vertical padding
  const barSize = Math.max(4, rowHeight - 6);

  return (
    <div className={outerClass}>
      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 0, bottom: 0, left: 6, right: 6 }}
          barSize={barSize}
        >
          <XAxis type="number" domain={[0, computedMax]} hide />
          <YAxis type="category" dataKey="hour" width={0} tick={false} />
          <Bar dataKey="price" isAnimationActive={false}>
            {chartData.map((entry, idx) => (
              <Cell key={`cell-${idx}`} fill={tierColor(entry.price, min, max)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
