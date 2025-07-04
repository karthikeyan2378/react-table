
'use client';

import * as React from 'react';
import { makeData, newAlarm } from '@/lib/data';
import { type Alarm } from '@/config/alarm-config';
import { DataTable } from '@/FMComponents/data-table';

export default function Home() {
  const [data, setData] = React.useState<Alarm[]>([]);
  const [isStreaming, setIsStreaming] = React.useState(false);
  const [selectedRowIds, setSelectedRowIds] = React.useState<string[]>([]);
  const [isClient, setIsClient] = React.useState(false);

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
            A simple, dependency-free data table for monitoring real-time alarm data.
          </p>
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
