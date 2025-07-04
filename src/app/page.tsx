'use client';

import * as React from 'react';
import { useToast } from '@/hooks/use-toast';
import { makeData } from '@/lib/data';
import { type Alarm, alarmConfig } from '@/config/alarm-config';
import { DataTable } from '@/components/data-table';
import { ColumnChart } from '@/components/status-chart';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import {
  Play,
  Plus,
  RefreshCw,
  Square,
  Trash2,
  BarChart,
} from 'lucide-react';
import { Icons } from '@/components/icons';

type ChartConfig = {
  columnId: keyof typeof alarmConfig.fields;
  chartType: 'pie' | 'bar' | 'doughnut';
};

export default function Home() {
  const { toast } = useToast();
  const [data, setData] = React.useState<Alarm[]>([]);
  const [isStreaming, setIsStreaming] = React.useState(false);
  const [selectedRowIds, setSelectedRowIds] = React.useState<string[]>([]);
  const [activeCharts, setActiveCharts] = React.useState<ChartConfig[]>([]);
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setData(makeData(1000));
    setIsClient(true);
  }, []);

  const addRow = React.useCallback((newRows: Alarm[]) => {
    setData((oldData) => [...newRows, ...oldData]);
  }, []);

  const updateRow = React.useCallback((updatedRows: Alarm[]) => {
    setData((oldData) =>
      oldData.map((row) => {
        const updatedRow = updatedRows.find((ur) => ur.AlarmID === row.AlarmID);
        return updatedRow ? { ...row, ...updatedRow } : row;
      })
    );
  }, []);

  const deleteRow = React.useCallback((rowIdsToDelete: string[]) => {
    setData((oldData) =>
      oldData.filter((row) => !rowIdsToDelete.includes(row.AlarmID))
    );
    setSelectedRowIds([]);
  }, []);

  React.useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(() => {
      addRow(makeData(1));
    }, 1000);

    return () => clearInterval(interval);
  }, [isStreaming, addRow]);

  const handleAddRow = () => {
    const newRows = makeData(1);
    addRow(newRows);
    toast({
      title: 'Row added',
      description: `Added alarm ID ${newRows[0].AlarmID}.`,
    });
  };

  const handleUpdateRandomRow = () => {
    if (data.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Cannot update',
        description: 'Table is empty.',
      });
      return;
    }
    const randomIndex = Math.floor(Math.random() * data.length);
    const rowToUpdate = data[randomIndex];
    if (!rowToUpdate) return;
    const updatedRow = {
      ...rowToUpdate,
      FlapCount: (rowToUpdate.FlapCount || 0) + 1,
      State: 'Active',
    };
    updateRow([updatedRow]);
    toast({
      title: 'Alarm updated',
      description: `Updated alarm ID ${updatedRow.AlarmID}.`,
    });
  };

  const handleDeleteSelected = () => {
    if (selectedRowIds.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No rows selected',
        description: 'Please select rows to delete.',
      });
      return;
    }
    deleteRow(selectedRowIds);
    toast({
      title: 'Alarms deleted',
      description: `${selectedRowIds.length} alarm(s) deleted.`,
    });
  };

  const summarizableColumns = React.useMemo(() => {
    return Object.entries(alarmConfig.fields)
      .filter(([, config]) => config.isSummarizedColumn)
      .map(([id, config]) => ({
        id: id as keyof typeof alarmConfig.fields,
        label: config.label,
      }));
  }, []);

  const addChart = (columnId: keyof typeof alarmConfig.fields) => {
    if (!activeCharts.some((c) => c.columnId === columnId)) {
      setActiveCharts((prev) => [
        ...prev,
        { columnId, chartType: 'pie' },
      ]);
    }
  };

  const removeChart = (columnId: keyof typeof alarmConfig.fields) => {
    setActiveCharts((prev) => prev.filter((c) => c.columnId !== columnId));
  };

  const updateChartType = (
    columnId: keyof typeof alarmConfig.fields,
    chartType: 'pie' | 'bar' | 'doughnut'
  ) => {
    setActiveCharts((prev) =>
      prev.map((c) => (c.columnId === columnId ? { ...c, chartType } : c))
    );
  };
  
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
            A high-performance dashboard for monitoring and analyzing alarm data with real-time updates.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap mb-4">
          <Button onClick={handleAddRow} variant="outline" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Alarm
          </Button>
          <Button
            onClick={() => setIsStreaming((prev) => !prev)}
            variant="outline"
            size="sm"
            className="w-[180px]"
          >
            {isStreaming ? (
              <Square className="mr-2 h-4 w-4" />
            ) : (
              <Play className="mr-2 h-4 w-4" />
            )}
            {isStreaming ? 'Stop Streaming' : 'Start Streaming'}
          </Button>
          <Button onClick={handleUpdateRandomRow} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Update Random
          </Button>
          <Button
            onClick={handleDeleteSelected}
            variant="destructive"
            size="sm"
            disabled={selectedRowIds.length === 0}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Selected
          </Button>
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <BarChart className="mr-2 h-4 w-4" />
                Add Chart
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {summarizableColumns.map((col) => (
                <DropdownMenuItem
                  key={col.id}
                  onClick={() => addChart(col.id)}
                  disabled={activeCharts.some((c) => c.columnId === col.id)}
                >
                  <Icons.alarm className="mr-2 h-4 w-4" />
                  <span>{col.label}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <ResizablePanelGroup direction="horizontal" className="rounded-lg border">
          {activeCharts.length > 0 && (
            <>
              <ResizablePanel defaultSize={25} minSize={20}>
                <div className="p-4 space-y-4 h-full overflow-auto">
                  {activeCharts.map((chart) => (
                    <ColumnChart
                      key={chart.columnId}
                      columnId={chart.columnId}
                      label={alarmConfig.fields[chart.columnId].label}
                      data={data}
                      onRemove={removeChart}
                      onUpdateChartType={updateChartType}
                      initialChartType={chart.chartType}
                    />
                  ))}
                </div>
              </ResizablePanel>
              <ResizableHandle withHandle />
            </>
          )}
          <ResizablePanel defaultSize={activeCharts.length > 0 ? 75 : 100}>
            <Card className="shadow-2xl shadow-primary/10 h-full">
              <CardHeader>
                <CardTitle>Live Alarm Feed</CardTitle>
                <CardDescription>
                  This table is driven by a central configuration and supports dynamic filtering, sorting, and column reordering.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DataTable
                  data={data}
                  deleteRow={deleteRow}
                  onSelectedRowsChange={setSelectedRowIds}
                />
              </CardContent>
            </Card>
          </ResizablePanel>
        </ResizablePanelGroup>
      </main>
    </div>
  );
}