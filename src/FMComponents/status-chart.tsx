
"use client";

import * as React from 'react';
import { type Alarm } from '@/config/alarm-config';

type ChartableColumn = keyof Alarm;

interface ColumnChartProps {
  columnId: ChartableColumn;
  label: string;
  data: Alarm[];
  onRemove: (columnId: ChartableColumn) => void;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1943'];

export function ColumnChart({
  columnId,
  label,
  data,
  onRemove,
}: ColumnChartProps) {
  const chartData = React.useMemo(() => {
    const counts: { [key: string]: number } = {};
    for (const row of data) {
      const value = String(row[columnId]);
      counts[value] = (counts[value] || 0) + 1;
    }
    return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value);
  }, [data, columnId]);

  const maxValue = React.useMemo(() => {
    return Math.max(...chartData.map(d => d.value), 0);
  }, [chartData]);

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold text-sm">{label} Distribution</h3>
        <button 
          onClick={() => onRemove(columnId)} 
          className="text-muted-foreground hover:text-foreground w-6 h-6 flex items-center justify-center rounded-full hover:bg-muted"
        >
          &times;
        </button>
      </div>
      <div className="p-4 flex-grow flex items-end gap-2">
        {chartData.length > 0 ? chartData.map((entry, index) => (
          <div key={entry.name} className="flex-1 flex flex-col items-center gap-1 group">
             <div className="text-xs font-bold text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
              {entry.value}
            </div>
            <div
              className="w-full rounded-t-sm"
              style={{
                height: `${(entry.value / maxValue) * 100}%`,
                backgroundColor: COLORS[index % COLORS.length],
              }}
            />
            <div className="text-xs text-center text-muted-foreground truncate w-full" title={entry.name}>
              {entry.name}
            </div>
          </div>
        )) : (
            <div className="w-full text-center text-sm text-muted-foreground">No data to display.</div>
        )}
      </div>
    </div>
  );
}
