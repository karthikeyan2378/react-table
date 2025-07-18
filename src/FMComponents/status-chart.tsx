
'use client';

import * as React from 'react';
import { type Alarm, alarmConfig } from '../config/alarm-config';
import './status-chart.css';
import { useDropdown } from '@/hooks/use-dropdown';
import { ResponsiveContainer, PieChart, Pie, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

/** Reusable Icons as Components **/
const PieChartIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>;
const BarChartIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="20" y2="10"/><line x1="18" x2="18" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="16"/></svg>;
const DonutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>;
const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="M6 6l12 12"/></svg>;

/**
 * Defines the types of charts that can be rendered.
 */
type ChartType = 'pie' | 'bar' | 'doughnut';

/**
 * Defines the columns from the alarm data that are suitable for charting.
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
  const { dropdownRef: chartTypeRef, isOpen: isChartTypeOpen, setIsOpen: setIsChartTypeOpen } = useDropdown();

  /**
   * Memoized calculation of chart data.
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
  const CurrentChartIcon = {
    pie: PieChartIcon,
    bar: BarChartIcon,
    doughnut: DonutIcon,
  }[chartType];
  
  const isNumerical = columnConfig.columnType === 'numerical';
  // Numerical charts are always bars, otherwise use the state-managed chart type.
  const finalChartType = isNumerical ? 'bar' : chartType;
  
  return (
    <div className="cygnet-chart-card">
      <div className="cygnet-chart-card-header">
        <h3 className="cygnet-chart-card-title">{label} Distribution</h3>
        <div className="cygnet-chart-card-actions">
          {/* Dropdown to switch between chart types, hidden for numerical charts */}
          {!isNumerical && (
            <div ref={chartTypeRef} className="cygnet-dt-dropdown-container">
              <button className="cygnet-dt-button cygnet-dt-button--ghost cygnet-dt-button--icon" onClick={() => setIsChartTypeOpen(!isChartTypeOpen)}>
                  <CurrentChartIcon />
              </button>
              {isChartTypeOpen && (
                <div className="cygnet-dt-dropdown-content">
                    <button className="cygnet-dt-dropdown-item" onClick={() => { setChartType('pie'); setIsChartTypeOpen(false); }}>
                        <PieChartIcon />
                        Pie Chart
                    </button>
                    <button className="cygnet-dt-dropdown-item" onClick={() => { setChartType('doughnut'); setIsChartTypeOpen(false); }}>
                        <DonutIcon />
                        Doughnut Chart
                    </button>
                    <button className="cygnet-dt-dropdown-item" onClick={() => { setChartType('bar'); setIsChartTypeOpen(false); }}>
                        <BarChartIcon />
                        Bar Chart
                    </button>
                </div>
              )}
            </div>
          )}
          {/* Button to remove the chart */}
          <button className="cygnet-dt-button cygnet-dt-button--ghost cygnet-dt-button--icon" onClick={() => onRemove(columnId)}>
            <XIcon />
          </button>
        </div>
      </div>
      <div className="cygnet-chart-card-content">
        <ResponsiveContainer width="100%" height="100%">
          {finalChartType === 'bar' ? (
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip wrapperStyle={{ fontSize: '12px', outline: 'none', border: 'none' }} />
              <Bar dataKey="value" onClick={(payload) => onFilter(columnId, payload.name)} outline="none">
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={getColor(entry.name, index)}
                    stroke={activeFilters.includes(entry.name) ? '#333' : 'none'}
                    strokeWidth={activeFilters.includes(entry.name) ? 2 : 0}
                  />
                ))}
              </Bar>
            </BarChart>
          ) : (
            <PieChart>
              <Tooltip wrapperStyle={{ fontSize: '12px', outline: 'none', border: 'none' }} />
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={finalChartType === 'doughnut' ? 70 : 80}
                innerRadius={finalChartType === 'doughnut' ? 40 : 0}
                fill="#8884d8"
                dataKey="value"
                onClick={(payload) => onFilter(columnId, payload.name)}
                outline="none"
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={getColor(entry.name, index)} 
                    stroke={activeFilters.includes(entry.name) ? '#333' : 'none'}
                    strokeWidth={activeFilters.includes(entry.name) ? 2 : 0}
                  />
                ))}
              </Pie>
            </PieChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/**
 * Memoized version of the ColumnChartComponent to prevent unnecessary re-renders.
 */
export const ColumnChart = React.memo(ColumnChartComponent);
