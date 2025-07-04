'use client';

import * as React from 'react';
import { useToast } from '@/hooks/use-toast';
import { makeData } from '@/lib/data';
import { type Alarm, alarmConfig } from '@/config/alarm-config';
import { DataTable } from '@/components/data-table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AreaChart,
  Play,
  Plus,
  RefreshCw,
  Square,
  Trash2,
} from 'lucide-react';
import { ColumnChart } from '@/components/status-chart';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { Icons } from '@/components/icons';

export default function Home() {
  const { toast } = useToast();
  const [data, setData] = React.useState<Alarm[]>([]);
  const [isStreaming, setIsStreaming] = React.useState(false);
  const [selectedRowIds, setSelectedRowIds] = React.useState<string[]>([]);
  const [activeCharts, setActiveCharts] = React.useState<Array<keyof Alarm>>([]);

  React.useEffect(() => {
    setData(makeData(1000));
  }, []);

  const chartableColumns = React.useMemo(() => {
    return Object.entries(alarmConfig.fields)
      .filter(([, config]) => config.isSummarizedColumn)
      .map(([key, config]) => ({
        id: key as keyof Alarm,
        name: config.label,
        icon: Icons[key as keyof typeof Icons] || AreaChart,
      }));
  }, []);

  const addChart = (columnId: keyof Alarm) => {
    if (!activeCharts.includes(columnId)) {
      setActiveCharts((prev) => [...prev, columnId]);
    }
  };

  const removeChart = (columnId: keyof Alarm) => {
    setActiveCharts((prev) => prev.filter((id) => id !== columnId));
  };

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

  const hasCharts = activeCharts.length > 0;

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
                <AreaChart className="mr-2 h-4 w-4" />
                Add Chart
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {chartableColumns.map((col) => (
                <DropdownMenuItem
                  key={col.id}
                  disabled={activeCharts.includes(col.id)}
                  onSelect={() => addChart(col.id)}
                >
                  <col.icon className="mr-2 h-4 w-4" />
                  {col.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
        </DropdownMenu>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {hasCharts && (
            <aside className="lg:col-span-1 flex flex-col gap-4">
              <Card className="flex flex-col p-4 gap-4">
                {activeCharts.map((columnId) => (
                    <ColumnChart
                      key={columnId}
                      data={data}
                      columnId={columnId}
                      onRemove={removeChart}
                    />
                  ))}
              </Card>
            </aside>
          )}
          <div className={cn("transition-all duration-300", hasCharts ? "lg:col-span-2" : "lg:col-span-3")}>
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
          </div>
        </div>
      </main>
    </div>
  );
}
