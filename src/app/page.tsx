'use client';

import * as React from 'react';
import { useToast } from '@/hooks/use-toast';
import { makeData, type Person } from '@/lib/data';
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
  Users,
  CalendarDays,
  MousePointerClick,
  Gauge,
} from 'lucide-react';
import { ColumnChart } from '@/components/status-chart';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export default function Home() {
  const { toast } = useToast();
  const [data, setData] = React.useState(() => makeData(1000));
  const [isStreaming, setIsStreaming] = React.useState(false);
  const [selectedRowIds, setSelectedRowIds] = React.useState<number[]>([]);
  const [activeCharts, setActiveCharts] = React.useState<Array<keyof Person>>([]);

  const chartableColumns: Array<{ id: keyof Person; name: string; icon: React.ComponentType<{className?: string}> }> = [
    { id: 'status', name: 'Status', icon: Users },
    { id: 'age', name: 'Age', icon: CalendarDays },
    { id: 'visits', name: 'Visits', icon: MousePointerClick },
    { id: 'progress', name: 'Profile Progress', icon: Gauge },
  ];

  const addChart = (columnId: keyof Person) => {
    if (!activeCharts.includes(columnId)) {
      setActiveCharts((prev) => [...prev, columnId]);
    }
  };

  const removeChart = (columnId: keyof Person) => {
    setActiveCharts((prev) => prev.filter((id) => id !== columnId));
  };

  const addRow = React.useCallback((newRows: Person[]) => {
    setData((oldData) => [...newRows, ...oldData]);
  }, []);

  const updateRow = React.useCallback((updatedRows: Person[]) => {
    setData((oldData) =>
      oldData.map((row) => {
        const updatedRow = updatedRows.find((ur) => ur.id === row.id);
        return updatedRow ? { ...row, ...updatedRow } : row;
      })
    );
  }, []);

  const deleteRow = React.useCallback((rowIdsToDelete: number[]) => {
    setData((oldData) =>
      oldData.filter((row) => !rowIdsToDelete.includes(row.id))
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
      description: `Added row ID ${newRows[0].id}.`,
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
      visits: rowToUpdate.visits + 100,
      progress: Math.min(100, rowToUpdate.progress + 10),
    };
    updateRow([updatedRow]);
    toast({
      title: 'Row updated',
      description: `Updated row ID ${updatedRow.id}.`,
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
      title: 'Rows deleted',
      description: `${selectedRowIds.length} row(s) deleted.`,
    });
  };

  const hasCharts = activeCharts.length > 0;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl lg:text-5xl font-extrabold font-headline tracking-tight text-primary">
            React Data Stream Table
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            A high-performance table with real-time updates, advanced filtering, and data visualization.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap mb-4">
          <Button onClick={handleAddRow} variant="outline" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Row
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
          <div className={cn(hasCharts ? "lg:col-span-2" : "lg:col-span-3")}>
            <Card className="shadow-2xl shadow-primary/10 h-full">
              <CardHeader>
                <CardTitle>Live Data Feed</CardTitle>
                <CardDescription>
                  The table below supports dynamic filtering, sorting, column reordering and pagination.
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
