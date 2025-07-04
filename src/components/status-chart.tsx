'use client';

import * as React from 'react';
import { Pie, PieChart, Sector } from 'recharts';

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

const chartConfig = {
  count: {
    label: 'Count',
  },
  single: {
    label: 'Single',
    color: 'hsl(var(--chart-1))',
  },
  complicated: {
    label: 'Complicated',
    color: 'hsl(var(--chart-2))',
  },
  relationship: {
    label: 'Relationship',
    color: 'hsl(var(--chart-3))',
  },
} satisfies ChartConfig;

interface StatusChartProps {
  data: Person[];
}

export function StatusChart({ data }: StatusChartProps) {
  const [activeIndex, setActiveIndex] = React.useState<number | undefined>(undefined);

  const chartData = React.useMemo(() => {
    if (!data) return [];
    const statusCounts = data.reduce(
      (acc, person) => {
        acc[person.status] = (acc[person.status] || 0) + 1;
        return acc;
      },
      {} as Record<Person['status'], number>
    );

    return Object.entries(statusCounts).map(([status, count]) => ({
      status: status.charAt(0).toUpperCase() + status.slice(1),
      count: count,
      fill: `var(--color-${status})`,
    }));
  }, [data]);

  const totalCount = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.count, 0);
  }, [chartData]);

  return (
    <Card className="flex flex-col h-full shadow-lg">
      <CardHeader>
        <CardTitle>Status Distribution</CardTitle>
        <CardDescription>
          A breakdown of relationship statuses in the dataset.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[300px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="status"
              innerRadius={60}
              strokeWidth={5}
              activeIndex={activeIndex}
              activeShape={({
                outerRadius = 0,
                ...props
              }: any) => (
                <g>
                  <Sector {...props} outerRadius={outerRadius + 10} />
                </g>
              )}
              onMouseLeave={() => setActiveIndex(undefined)}
              onMouseEnter={(_, index) => setActiveIndex(index)}
            />
            <ChartLegend
              content={<ChartLegendContent nameKey="status" />}
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardContent className="pb-6">
        <div className="text-center text-sm text-muted-foreground mt-2">
            Total Rows: {totalCount.toLocaleString()}
        </div>
      </CardContent>
    </Card>
  );
}
