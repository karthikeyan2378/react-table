
'use client';

import * as React from 'react';
import { type Alarm, alarmConfig } from '../config/alarm-config';
import './status-chart.css';
import { useDropdown } from '@/hooks/use-dropdown';

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

const PieSlice = ({ cx, cy, radius, startAngle, endAngle, fill, stroke, strokeWidth, onClick }: any) => {
    const start = {
      x: cx + radius * Math.cos(startAngle * Math.PI / 180),
      y: cy + radius * Math.sin(startAngle * Math.PI / 180)
    };
    const end = {
      x: cx + radius * Math.cos(endAngle * Math.PI / 180),
      y: cy + radius * Math.sin(endAngle * Math.PI / 180)
    };
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    const d = `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y} L ${cx} ${cy} Z`;
    return <path d={d} fill={fill} stroke={stroke} strokeWidth={strokeWidth} onClick={onClick} cursor="pointer" />;
};
  
const DonutSlice = ({ cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, stroke, strokeWidth, onClick }: any) => {
    const startOuter = { x: cx + outerRadius * Math.cos(startAngle * Math.PI / 180), y: cy + outerRadius * Math.sin(startAngle * Math.PI / 180) };
    const endOuter = { x: cx + outerRadius * Math.cos(endAngle * Math.PI / 180), y: cy + outerRadius * Math.sin(endAngle * Math.PI / 180) };
    const startInner = { x: cx + innerRadius * Math.cos(startAngle * Math.PI / 180), y: cy + innerRadius * Math.sin(startAngle * Math.PI / 180) };
    const endInner = { x: cx + innerRadius * Math.cos(endAngle * Math.PI / 180), y: cy + innerRadius * Math.sin(endAngle * Math.PI / 180) };
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  
    const d = `M ${startOuter.x} ${startOuter.y}
             A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${endOuter.x} ${endOuter.y}
             L ${endInner.x} ${endInner.y}
             A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${startInner.x} ${startInner.y}
             Z`;
    return <path d={d} fill={fill} stroke={stroke} strokeWidth={strokeWidth} onClick={onClick} cursor="pointer" />;
};

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
  
  const totalValue = chartData.reduce((sum, item) => sum + item.value, 0);

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
        <svg width="100%" height="100%" viewBox="0 0 300 180">
          {finalChartType === 'bar' ? (
            <g>
              {chartData.map((entry, index) => {
                const maxVal = Math.max(...chartData.map(d => d.value));
                const barWidth = 250 / chartData.length;
                const barHeight = (entry.value / maxVal) * 120;
                const isSelected = activeFilters.includes(entry.name);
                return (
                    <g key={index} transform={`translate(${20 + index * barWidth}, 0)`}>
                        <rect
                            x={barWidth * 0.1}
                            y={140 - barHeight}
                            width={barWidth * 0.8}
                            height={barHeight}
                            fill={getColor(entry.name, index)}
                            stroke={isSelected ? '#333' : 'none'}
                            strokeWidth={3}
                            onClick={() => onFilter(columnId, entry.name)}
                            cursor="pointer"
                        />
                        <text x={barWidth / 2} y={155} textAnchor="middle" fontSize="10">{entry.name}</text>
                    </g>
                );
              })}
            </g>
          ) : (
            <g transform="translate(150, 90)">
              {(() => {
                let currentAngle = 0;
                return chartData.map((entry, index) => {
                    const angle = (entry.value / totalValue) * 360;
                    const isSelected = activeFilters.includes(entry.name);
                    const sliceProps = {
                        cx: 0,
                        cy: 0,
                        startAngle: currentAngle,
                        endAngle: currentAngle + angle,
                        fill: getColor(entry.name, index),
                        stroke: isSelected ? '#333' : 'none',
                        strokeWidth: 3,
                        onClick: () => onFilter(columnId, entry.name),
                    };
                    currentAngle += angle;

                    if (finalChartType === 'pie') {
                        return <PieSlice key={index} {...sliceProps} radius={80} />;
                    } else { // doughnut
                        return <DonutSlice key={index} {...sliceProps} innerRadius={40} outerRadius={80} />;
                    }
                });
              })()}
            </g>
          )}
        </svg>
      </div>
    </div>
  );
}

/**
 * Memoized version of the ColumnChartComponent to prevent unnecessary re-renders.
 */
export const ColumnChart = React.memo(ColumnChartComponent);
