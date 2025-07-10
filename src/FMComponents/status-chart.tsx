
'use client';

import * as React from 'react';
import { Bar, BarChart, Pie, PieChart, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { X as XIcon, PieChart as PieChartIcon, BarChart2, Donut } from 'lucide-react';
import { type Alarm, alarmConfig } from '../config/alarm-config';

/**
 * Defines the types of charts that can be rendered.
 */
type ChartType = 'pie' | 'bar' | 'doughnut';

/**
 * Defines the columns from the alarm data that are suitable for charting.
 * It's derived from the keys of the `alarmConfig.fields`.
 */
type ChartableColumn = keyof typeof alarmConfig.fields;

/**
 * Props for the ColumnChart component.
 */
interface ColumnChartProps {
  /** The ID of the column to visualize, e.g., 'Severity' or 'ObjectType'. */
  columnId: ChartableColumn;
  /** The user-friendly label for the chart title. */
  label: string;
  /** The array of alarm data to be processed for the chart. */
  data: Alarm[];
  /** Callback function to remove the chart from the dashboard. */
  onRemove: (columnId: ChartableColumn) => void;
  /** Callback to apply a filter to the data table when a chart segment is clicked. */
  onFilter: (columnId: string, value: string) => void;
  /** An array of currently active filter values for this column. */
  activeFilters: string[];
}

/**
* An array of default colors used for the segments in charts if no specific colors are configured.
*/
const DEFAULT_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1943'];

/**
 * A reusable chart component that can display data distribution for a specific column
 * as a pie, doughnut, or bar chart. It supports configuration for colors and chart types
 * and allows filtering the main data table by clicking on chart segments.
 */
const ColumnChartComponent = ({
  columnId,
  label,
  data,
  onRemove,
  onFilter,
  activeFilters = [],
}: ColumnChartProps) => {
  const columnConfig = alarmConfig.fields[columnId];
  const initialChartType = columnConfig.chartConfig?.defaultChartType || 'pie';
  
  // State to manage the current chart type being displayed.
  const [chartType, setChartType] = React.useState<ChartType>(initialChartType);

  /**
   * Memoized calculation of chart data.
   * It processes the raw `data` prop and aggregates it into a format
   * suitable for Recharts, counting occurrences of each unique value in the specified column.
   * For numerical columns, it groups data into bins.
   */
  const chartData = React.useMemo(() => {
    if (columnConfig.columnType === 'numerical') {
      const values = data.map(row => Number(row[columnId])).filter(v => !isNaN(v));
      if (values.length === 0) return [];
      
      const max = Math.max(...values);
      const binCount = Math.min(10, Math.floor(Math.sqrt(values.length)));
      const binSize = Math.ceil(max / binCount) || 1;
      
      const bins: { [key: string]: number } = {};

      for (const value of values) {
        const binStart = Math.floor(value / binSize) * binSize;
        const binEnd = binStart + binSize - 1;
        const binName = `${binStart}-${binEnd}`;
        bins[binName] = (bins[binName] || 0) + 1;
      }
      return Object.entries(bins).map(([name, value]) => ({ name, value }));

    } else {
      const counts: { [key: string]: number } = {};
      for (const row of data) {
        const value = String(row[columnId]);
        counts[value] = (counts[value] || 0) + 1;
      }
      return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }
  }, [data, columnId, columnConfig.columnType]);
  
  /**
   * Retrieves the color for a specific data entry.
   * It first checks for a color configured in `alarm-config.ts`.
   * If not found, it falls back to the `DEFAULT_COLORS` array.
   * @param entryName The name of the data entry (e.g., 'Critical').
   * @param index The index of the data entry in the chartData array.
   * @returns The hex color code.
   */
  const getColor = (entryName: string, index: number) => {
    const configuredColors = columnConfig.chartConfig?.colors;
    if (configuredColors && configuredColors[entryName]) {
      return configuredColors[entryName];
    }
    return DEFAULT_COLORS[index % DEFAULT_COLORS.length];
  };

  /**
   * Icon component for the currently selected chart type.
   */
  const ChartIcon = {
    pie: PieChartIcon,
    bar: BarChart2,
    doughnut: Donut,
  }[chartType];
  
  const isNumerical = columnConfig.columnType === 'numerical';
  // Numerical charts are always bars, otherwise use the state-managed chart type.
  const finalChartType = isNumerical ? 'bar' : chartType;

  return (
    <Card className="h-auto">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{label} Distribution</CardTitle>
        <div className="flex items-center gap-1">
          {/* Dropdown to switch between chart types, hidden for numerical charts */}
          {!isNumerical && (
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
          )}
          {/* Button to remove the chart */}
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onRemove(columnId)}>
            <XIcon className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="h-[200px] w-full p-0">
        <ResponsiveContainer width="100%" height="100%">
          {finalChartType === 'bar' ? (
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 50 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" interval={0} height={1} tick={{ fontSize: 12 }} />
              <YAxis />
              <RechartsTooltip />
              <Bar dataKey="value" onClick={(payload) => onFilter(columnId, payload.name)}>
                 {chartData.map((entry, index) => {
                    const isSelected = activeFilters.includes(entry.name);
                    return (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={getColor(entry.name, index)} 
                        cursor="pointer" 
                        stroke={isSelected ? '#A9A9A9' : 'none'}
                        strokeWidth={2}
                        style={{ outline: 'none' }}
                      />
                    )
                })}
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
                innerRadius={finalChartType === 'doughnut' ? 40 : 0}
                fill="#8884d8"
                labelLine={false}
                label={false}
                onClick={(payload) => onFilter(columnId, payload.name)}
              >
                {chartData.map((entry, index) => {
                  const isSelected = activeFilters.includes(entry.name);
                  return (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={getColor(entry.name, index)} 
                      cursor="pointer" 
                      stroke={isSelected ? '#A9A9A9' : 'none'}
                      strokeWidth={2}
                      style={{ outline: 'none' }}
                    />
                  )
                })}
              </Pie>
              <RechartsTooltip />
            </PieChart>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

/**
 * Memoized version of the ColumnChartComponent to prevent unnecessary re-renders.
 */
export const ColumnChart = React.memo(ColumnChartComponent);
