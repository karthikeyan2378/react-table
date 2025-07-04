'use client';

import * as React from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell as RechartsCell,
  Pie,
  PieChart as RechartsPie,
  XAxis,
  YAxis,
} from 'recharts';

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
import { type Alarm, alarmConfig } from '@/config/alarm-config';
import { Button } from './ui/button';
import { BarChart3, PieChart as PieChartIcon, X, Donut } from 'lucide-react';
import { useMemo } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

interface ColumnChartProps {
  data: Alarm[];
  columnId: keyof Alarm;
  onRemove: (columnId: keyof Alarm) => void;
}

const getBinnedData = (
  data: Alarm[],
  columnId: keyof Alarm,
  binSize: number
) => {
  if (data.length === 0) return [];
  const counts = data.reduce((acc, item) => {
    const value = item[columnId] as number;
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
  const [chartType, setChartType] = React.useState<'pie' | 'bar' | 'doughnut'>('pie');

  const { chartData, chartConfig, title, description } = useMemo(() => {
    const config = alarmConfig.fields[columnId];
    let title = config?.label || 'Chart';
    let description = `Distribution of ${title}.`;
    let chartData: any[] = [];
    let baseChartConfig: ChartConfig = {
      count: { label: 'Count' },
    };

    if (config?.columnType === 'categorical' && config.options) {
      const colorKeys = Object.keys(config.options.reduce((acc, option) => ({...acc, [option.value]: true }), {}));
      const statusConfig: ChartConfig = {};
      colorKeys.forEach((key, index) => {
        statusConfig[key] = { label: key, color: `hsl(var(--chart-${(index % 5) + 1}))` };
      });
       Object.assign(baseChartConfig, statusConfig);

      const statusCounts = data.reduce(
        (acc, item) => {
          const value = item[columnId] as string;
          acc[value] = (acc[value] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );
      chartData = Object.entries(statusCounts).map(([status, count]) => ({
        name: status,
        count: count,
        fill: `var(--color-${status})`,
      }));
    } else { // Numerical data
      // Binning logic for numerical data
      const binSize = columnId === 'FlapCount' ? 5 : 10;
      chartData = getBinnedData(data, columnId, binSize);
      chartData.forEach((item, index) => {
        const colorKey = `chart-${(index % 5) + 1}`;
        const color = `hsl(var(--${colorKey}))`;
        item.fill = color;
        baseChartConfig[item.name] = { label: item.name, color: color };
      });
    }

    return { chartData, chartConfig: baseChartConfig, title, description };
  }, [data, columnId]);

  const renderChart = () => {
    if (chartType === 'pie' || chartType === 'doughnut') {
      return (
        <RechartsPie>
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          <Pie
            data={chartData}
            dataKey="count"
            nameKey="name"
            innerRadius={chartType === 'doughnut' ? 60 : 0}
            strokeWidth={5}
          >
            {chartData.map((entry, index) => (
              <RechartsCell
                key={`cell-${index}`}
                fill={entry.fill}
                className="stroke-background"
              />
            ))}
          </Pie>
          <ChartLegend content={<ChartLegendContent nameKey="name" />} />
        </RechartsPie>
      );
    }

    return (
      <BarChart
        data={chartData}
        margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
      >
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
        <Bar dataKey="count" radius={4}>
           {chartData.map((entry, index) => (
              <RechartsCell key={`cell-${index}`} fill={entry.fill} />
            ))}
        </Bar>
      </BarChart>
    );
  };

  return (
    <Card className="flex flex-col border shadow-sm">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-base font-medium">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={chartType}
            onValueChange={(value) => setChartType(value as 'pie' | 'bar' | 'doughnut')}
          >
            <SelectTrigger className="h-8 w-8 shrink-0 p-0 justify-center [&>span]:hidden">
              <span className="sr-only">Select chart type</span>
              {chartType === 'pie' ? (
                <PieChartIcon className="h-4 w-4" />
              ) : chartType === 'doughnut' ? (
                <Donut className="h-4 w-4" />
              ) : (
                <BarChart3 className="h-4 w-4" />
              )}
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pie">
                <div className="flex items-center gap-2">
                  <PieChartIcon className="h-4 w-4" />
                  <span>Pie Chart</span>
                </div>
              </SelectItem>
              <SelectItem value="doughnut">
                <div className="flex items-center gap-2">
                  <Donut className="h-4 w-4" />
                  <span>Doughnut Chart</span>
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
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={() => onRemove(columnId)}
          >
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
          {chartData.length > 0 ? (
            renderChart()
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">
                Not enough data to display chart.
              </p>
            </div>
          )}
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
