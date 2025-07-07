
'use client';

import * as React from 'react';
import { makeData, newAlarm } from '../lib/data';
import { type Alarm, alarmConfig } from '../config/alarm-config';
import { DataTable } from '../FMComponents/data-table';
import { ColumnChart } from '../FMComponents/status-chart';
import { Button } from '../FMComponents/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../FMComponents/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

type ChartableColumn = keyof typeof alarmConfig.fields;

export default function Home() {
  const [data, setData] = React.useState<Alarm[]>([]);
  const [isStreaming, setIsStreaming] = React.useState(false);
  const [selectedRowIds, setSelectedRowIds] = React.useState<string[]>([]);
  const [isClient, setIsClient] = React.useState(false);
  const [activeCharts, setActiveCharts] = React.useState<ChartableColumn[]>(['Severity']);
  const { toast } = useToast();

  React.useEffect(() => {
    setData(makeData(100));
    setIsClient(true);
  }, []);

  const addRow = React.useCallback(() => {
    setData((oldData) => [newAlarm(), ...oldData]);
  }, []);

  const deleteSelectedRows = () => {
    if (selectedRowIds.length === 0) {
      toast({
        title: "No rows selected",
        description: "Please select rows to delete.",
        variant: "destructive"
      })
      return;
    }
    setData((oldData) =>
      oldData.filter((row) => !selectedRowIds.includes(row.AlarmID))
    );
    setSelectedRowIds([]);
    toast({
        title: "Rows Deleted",
        description: `${selectedRowIds.length} row(s) have been deleted.`
    })
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
          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-primary">
            Real-Time Alarm Dashboard
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            A config-driven data table for monitoring real-time alarm data with filtering, sorting, and charting.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 mb-4">
            <h2 className="text-xl font-semibold">Visualizations</h2>
             <div className="relative inline-block text-left">
                <DropdownMenu open={isChartDropdownOpen} onOpenChange={setChartDropdownOpen}>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                            Add Chart
                            <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        {summarizableColumns.map((key) => (
                            <DropdownMenuItem
                              key={key}
                              onClick={() => handleAddChart(key)}
                              disabled={activeCharts.includes(key)}
                            >
                              {alarmConfig.fields[key].label}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
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
          <Button onClick={addRow}>
            Add Alarm
          </Button>
          <Button
            variant="secondary"
            onClick={() => setIsStreaming((prev) => !prev)}
            className="w-[180px] justify-center"
          >
            {isStreaming ? '⏹ Stop Streaming' : '▶️ Start Streaming'}
          </Button>
          <Button
            variant="destructive"
            onClick={deleteSelectedRows}
            disabled={selectedRowIds.length === 0}
          >
            Delete Selected
          </Button>
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
