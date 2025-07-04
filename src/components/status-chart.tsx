'use client';

import * as React from 'react';
import { Bar, BarChart, CartesianGrid, Pie, PieChart as RechartsPie, Sector, XAxis, YAxis } from 'recharts';

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
import { BarChart3, PieChart as PieChartIcon, X } from 'lucide-react';
import { useMemo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';


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
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => {
      const aStart = parseInt(a.name.split('-')[0], 10);
      const bStart = parseInt(b.name.split('-')[0], 10);
      return aStart - bStart;
    });
};


export function ColumnChart({ data, columnId, onRemove }: ColumnChartProps) {
  const [activeIndex, setActiveIndex] = React.useState<number | undefined>(undefined);
  const [chartType, setChartType] = React.useState<'pie' | 'bar'>('pie');

  const { chartData, chartConfig, title, description } = useMemo(() => {
    let title = '';
    let description = '';
    let chartData: any[] = [];
    let chartConfig: ChartConfig = {
      count: { label: 'Count' }
    };

    switch (columnId) {
      case 'status':
        title = 'Status Distribution';
        description = 'A breakdown of relationship statuses.';
        const statusConfig: ChartConfig = {
          single: { label: 'Single', color: 'hsl(var(--chart-1))' },
          complicated: { label: 'Complicated', color: 'hsl(var(--chart-2))' },
          relationship: { label: 'Relationship', color: 'hsl(var(--chart-3))' },
        };
        Object.assign(chartConfig, statusConfig);

        const statusCounts = data.reduce(
          (acc, person) => {
            acc[person.status] = (acc[person.status] || 0) + 1;
            return acc;
          },
          {} as Record<Person['status'], number>
        );
        chartData = Object.entries(statusCounts).map(([status, count]) => ({
          name: status.charAt(0).toUpperCase() + status.slice(1),
          count: count,
          fill: `var(--color-${status.toLowerCase()})`,
        }));
        break;
      
      case 'age':
        title = 'Age Distribution';
        description = 'A breakdown of age groups.';
        chartData = getBinnedData(data, 'age', 10);
        chartConfig.count.color = 'hsl(var(--chart-1))';
        break;

      case 'visits':
        title = 'Visits Distribution';
        description = 'A breakdown of visit counts.';
        chartData = getBinnedData(data, 'visits', 100);
        chartConfig.count.color = 'hsl(var(--chart-2))';
        break;
      
      case 'progress':
        title = 'Progress Distribution';
        description = 'A breakdown of profile progress.';
        chartData = getBinnedData(data, 'progress', 10);
        chartConfig.count.color = 'hsl(var(--chart-3))';
        break;
    }

    if (columnId !== 'status') {
      chartData.forEach((item, index) => {
        const colorKey = `chart-${(index % 5) + 1}`;
        const color = `hsl(var(--${colorKey}))`;
        item.fill = color;
        chartConfig[item.name] = { label: item.name, color: color };
      });
    }

    return { chartData, chartConfig, title, description };
  }, [data, columnId]);

  const renderChart = () => {
    if (chartType === 'pie') {
      return (
        <RechartsPie>
          <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
          <Pie
            data={chartData}
            dataKey="count"
            nameKey="name"
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
          <ChartLegend content={<ChartLegendContent nameKey="name" />} />
        </RechartsPie>
      );
    }

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

  return (
    <Card className="flex flex-col border shadow-sm">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className='space-y-1'>
          <CardTitle className='text-base font-medium'>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <div className="flex items-center gap-2">
           <Select value={chartType} onValueChange={(value) => setChartType(value as 'pie' | 'bar')}>
            <SelectTrigger className="h-8 w-auto shrink-0 gap-2 px-2">
              {chartType === 'pie' ? <PieChartIcon className="h-4 w-4" /> : <BarChart3 className="h-4 w-4" />}
              <SelectValue placeholder="Chart Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pie">
                 <div className="flex items-center gap-2">
                  <PieChartIcon className="h-4 w-4" />
                  <span>Pie Chart</span>
                </div>
              </SelectItem>
              <SelectItem value="bar">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  <span>Bar Chart</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => onRemove(columnId)}>
            <X className="h-4 w-4" />
            <span className="sr-only">Remove chart</span>
          </Button>
        </div>
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
