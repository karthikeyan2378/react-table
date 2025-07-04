'use client';

import * as React from 'react';
import { Bar, BarChart, CartesianGrid, Pie, PieChart, Sector, XAxis, YAxis } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import type { Person } from '@/lib/data';
import { Button } from './ui/button';
import { X } from 'lucide-react';
import { useMemo } from 'react';


interface ColumnChartProps {
  data: Person[];
  columnId: keyof Person;
  onRemove: (columnId: keyof Person) => void;
}

const getBinnedData = (
  data: Person[],
  columnId: 'age' | 'visits' | 'progress',
  binSize: number
) => {
  if (data.length === 0) return [];
  const counts = data.reduce((acc, item) => {
    const value = item[columnId];
    if (typeof value !== 'number') return acc;
    const binStart = Math.floor(value / binSize) * binSize;
    const binEnd = binStart + binSize - 1;
    const binName = `${binStart}-${binEnd}`;
    acc[binName] = (acc[binName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(counts)
    .map(([name, count]) => ({ name, count, fill: 'var(--color-count)' }))
    .sort((a, b) => {
      const aStart = parseInt(a.name.split('-')[0], 10);
      const bStart = parseInt(b.name.split('-')[0], 10);
      return aStart - bStart;
    });
};


export function ColumnChart({ data, columnId, onRemove }: ColumnChartProps) {
  const [activeIndex, setActiveIndex] = React.useState<number | undefined>(undefined);

  const { chartData, chartConfig, title, description } = useMemo(() => {
    let title = '';
    let description = '';
    let chartData: any[] = [];
    let chartConfig: ChartConfig = {};

    switch (columnId) {
      case 'status':
        title = 'Status Distribution';
        description = 'A breakdown of relationship statuses.';
        chartConfig = {
            count: { label: 'Count' },
            single: { label: 'Single', color: 'hsl(var(--chart-1))' },
            complicated: { label: 'Complicated', color: 'hsl(var(--chart-2))' },
            relationship: { label: 'Relationship', color: 'hsl(var(--chart-3))' },
        };
        const statusCounts = data.reduce(
          (acc, person) => {
            acc[person.status] = (acc[person.status] || 0) + 1;
            return acc;
          },
          {} as Record<Person['status'], number>
        );
        chartData = Object.entries(statusCounts).map(([status, count]) => ({
          status: status.charAt(0).toUpperCase() + status.slice(1),
          count: count,
          fill: `var(--color-${status.toLowerCase()})`,
        }));
        break;
      
      case 'age':
        title = 'Age Distribution';
        description = 'A breakdown of age groups.';
        chartData = getBinnedData(data, 'age', 10);
        chartConfig = { count: { label: 'Count', color: 'hsl(var(--chart-1))' } };
        break;

      case 'visits':
        title = 'Visits Distribution';
        description = 'A breakdown of visit counts.';
        chartData = getBinnedData(data, 'visits', 100);
        chartConfig = { count: { label: 'Count', color: 'hsl(var(--chart-2))' } };
        break;
      
      case 'progress':
        title = 'Progress Distribution';
        description = 'A breakdown of profile progress.';
        chartData = getBinnedData(data, 'progress', 10);
        chartConfig = { count: { label: 'Count', color: 'hsl(var(--chart-3))' } };
        break;
    }
    return { chartData, chartConfig, title, description };
  }, [data, columnId]);

  const renderChart = () => {
    if (columnId === 'status') {
      return (
        <PieChart>
          <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
          <Pie
            data={chartData}
            dataKey="count"
            nameKey="status"
            innerRadius={60}
            strokeWidth={5}
            activeIndex={activeIndex}
            activeShape={({ outerRadius = 0, ...props }: any) => (
              <g>
                <Sector {...props} outerRadius={outerRadius + 10} />
              </g>
            )}
            onMouseLeave={() => setActiveIndex(undefined)}
            onMouseEnter={(_, index) => setActiveIndex(index)}
          >
          </Pie>
          <ChartLegend content={<ChartLegendContent nameKey="status" />} />
        </PieChart>
      );
    }

    if (['age', 'visits', 'progress'].includes(columnId)) {
      return (
        <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="name"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            fontSize={12}
          />
          <YAxis fontSize={12} />
          <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
          <Bar dataKey="count" radius={4} />
        </BarChart>
      );
    }
    return null;
  }

  return (
    <Card className="flex flex-col h-full shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className='space-y-1'>
          <CardTitle className='text-base font-medium'>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => onRemove(columnId)}>
          <X className="h-4 w-4" />
          <span className="sr-only">Remove chart</span>
        </Button>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-video max-h-[300px]"
        >
          {chartData.length > 0 ? renderChart() : <div className='flex items-center justify-center h-full'><p className='text-muted-foreground'>Not enough data to display chart.</p></div>}
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
