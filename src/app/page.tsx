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
  Play,
  Plus,
  RefreshCw,
  Square,
  Trash2,
} from 'lucide-react';
import { StatusChart } from '@/components/status-chart';

export default function Home() {
  const { toast } = useToast();
  const [data, setData] = React.useState(() => makeData(1000));
  const [isStreaming, setIsStreaming] = React.useState(false);
  const [selectedRowIds, setSelectedRowIds] = React.useState<number[]>([]);

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
        </div>

        <div className="flex flex-col lg:flex-row gap-4">
          <aside className="lg:w-1/3 xl:w-1/4">
            <StatusChart data={data} />
          </aside>
          <div className="lg:w-2/3 xl:w-3/4">
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
