
'use client';

import * as React from 'react';
import { makeData, newAlarm } from '@/lib/data';
import { type Alarm, alarmConfig } from '@/config/alarm-config';
import { DataTable } from '@/FMComponents/data-table';
import { ColumnChart } from '@/FMComponents/status-chart';

type ChartableColumn = keyof typeof alarmConfig.fields;

export default function Home() {
  const [data, setData] = React.useState<Alarm[]>([]);
  const [isStreaming, setIsStreaming] = React.useState(false);
  const [selectedRowIds, setSelectedRowIds] = React.useState<string[]>([]);
  const [isClient, setIsClient] = React.useState(false);
  const [activeCharts, setActiveCharts] = React.useState<ChartableColumn[]>(['Severity']);

  React.useEffect(() => {
    setData(makeData(100));
    setIsClient(true);
  }, []);

  const addRow = React.useCallback(() => {
    setData((oldData) => [newAlarm(), ...oldData]);
  }, []);

  const deleteSelectedRows = () => {
    if (selectedRowIds.length === 0) {
      alert("Please select rows to delete.");
      return;
    }
    setData((oldData) =>
      oldData.filter((row) => !selectedRowIds.includes(row.AlarmID))
    );
    setSelectedRowIds([]);
  };

  React.useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(() => {
      addRow();
    }, 1000);

    return () => clearInterval(interval);
  }, [isStreaming, addRow]);

  const summarizableColumns = React.useMemo(() => {
    return Object.entries(alarmConfig.fields)
      .filter(([, config]) => config.isSummarizedColumn)
      .map(([key]) => key as ChartableColumn);
  }, []);

  const handleAddChart = (columnId: ChartableColumn) => {
    if (!activeCharts.includes(columnId)) {
      setActiveCharts([...activeCharts, columnId]);
    }
  };

  const handleRemoveChart = (columnId: ChartableColumn) => {
    setActiveCharts(activeCharts.filter((id) => id !== columnId));
  };

  const [isChartDropdownOpen, setChartDropdownOpen] = React.useState(false);

  if (!isClient) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl lg:text-5xl font-extrabold font-headline tracking-tight text-primary">
            Real-Time Alarm Dashboard
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            A dependency-free data table for monitoring real-time alarm data with filtering and charting.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 mb-4">
            <h2 className="text-xl font-semibold">Visualizations</h2>
             <div className="relative inline-block text-left">
                <div>
                  <button
                    type="button"
                    className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                    onClick={() => setChartDropdownOpen(!isChartDropdownOpen)}
                  >
                    Add Chart
                    <svg className="-mr-1 ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
                {isChartDropdownOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                    <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                      {summarizableColumns.map((key) => (
                        <button
                          key={key}
                          onClick={() => {
                            handleAddChart(key);
                            setChartDropdownOpen(false);
                          }}
                          disabled={activeCharts.includes(key)}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                          role="menuitem"
                        >
                          {alarmConfig.fields[key].label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {activeCharts.map((columnId) => (
                <ColumnChart
                    key={columnId}
                    columnId={columnId}
                    label={alarmConfig.fields[columnId].label}
                    data={data}
                    onRemove={handleRemoveChart}
                />
            ))}
        </div>


        <div className="flex items-center gap-2 flex-wrap mb-4">
          <button onClick={addRow} className="bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2 rounded-md text-sm inline-flex items-center">
            <span className="mr-2">+</span>
            Add Alarm
          </button>
          <button
            onClick={() => setIsStreaming((prev) => !prev)}
            className="bg-secondary text-secondary-foreground hover:bg-secondary/80 h-9 px-4 py-2 rounded-md text-sm inline-flex items-center w-[180px] justify-center"
          >
            {isStreaming ? '⏹ Stop' : '▶️ Start'} Streaming
          </button>
          <button
            onClick={deleteSelectedRows}
            disabled={selectedRowIds.length === 0}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 h-9 px-4 py-2 rounded-md text-sm inline-flex items-center disabled:opacity-50"
          >
            <span className="mr-2">🗑️</span>
            Delete Selected
          </button>
        </div>
        
        <div className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
            <h2 className="text-lg font-semibold mb-2">Live Alarm Feed</h2>
            <p className="text-sm text-muted-foreground mb-4">
                This table is driven by a central configuration and supports client-side filtering, sorting, and pagination.
            </p>
            <DataTable
                data={data}
                deleteRow={deleteSelectedRows}
                onSelectedRowsChange={setSelectedRowIds}
            />
        </div>
      </main>
    </div>
  );
}
