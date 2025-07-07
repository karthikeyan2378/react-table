
"use client";

import * as React from 'react';
import { Bar, BarChart, Pie, PieChart, Cell, ResponsiveContainer, Legend, Tooltip as RechartsTooltip, XAxis, YAxis, CartesianGrid, Doughnut } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { X as XIcon, PieChart as PieChartIcon, BarChart2, Donut } from 'lucide-react';
import { type Alarm, alarmConfig } from '../config/alarm-config';

type ChartType = 'pie' | 'bar' | 'doughnut';
type ChartableColumn = keyof typeof alarmConfig.fields;


interface ColumnChartProps {
  columnId: ChartableColumn;
  label: string;
  data: Alarm[];
  onRemove: (columnId: ChartableColumn) => void;
  initialChartType?: ChartType;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1943'];

export function ColumnChart({
  columnId,
  label,
  data,
  onRemove,
  initialChartType = 'pie',
}: ColumnChartProps) {
  const [chartType, setChartType] = React.useState<ChartType>(initialChartType);

  const chartData = React.useMemo(() => {
    const counts: { [key: string]: number } = {};
    for (const row of data) {
      const value = String(row[columnId]);
      counts[value] = (counts[value] || 0) + 1;
    }
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [data, columnId]);

  const ChartIcon = {
    pie: PieChartIcon,
    bar: BarChart2,
    doughnut: Donut,
  }[chartType];

  return (
    <Card className="h-auto">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{label} Distribution</CardTitle>
        <div className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ChartIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setChartType('pie')}>
                <PieChartIcon className="mr-2 h-4 w-4" />
                Pie Chart
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setChartType('doughnut')}>
                <Donut className="mr-2 h-4 w-4" />
                Doughnut Chart
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setChartType('bar')}>
                <BarChart2 className="mr-2 h-4 w-4" />
                Bar Chart
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onRemove(columnId)}>
            <XIcon className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="h-[300px] w-full p-0">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'bar' ? (
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 75 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" interval={0} height={1} />
              <YAxis />
              <RechartsTooltip />
              <Bar dataKey="value" fill="#8884d8">
                 {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          ) : (
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                innerRadius={chartType === 'doughnut' ? 40 : 0}
                fill="#8884d8"
                labelLine={false}
                label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                  if (percent < 0.05) return null;
                  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                  const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                  const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                  return (
                    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central">
                      {`${(percent * 100).toFixed(0)}%`}
                    </text>
                  );
                }}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip />
              <Legend layout="vertical" align="right" verticalAlign="middle" wrapperStyle={{ right: -10 }} />
            </PieChart>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
