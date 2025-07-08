
'use client';

import * as React from 'react';
import { makeData, newAlarm } from '../lib/data';
import { type Alarm, alarmConfig } from '../config/alarm-config';
import { DataTable } from '../FMComponents/data-table';
import { ColumnChart } from '../FMComponents/status-chart';
import { Button } from '../FMComponents/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuCheckboxItem, DropdownMenuLabel, DropdownMenuSeparator } from '../FMComponents/ui/dropdown-menu';
import { ChevronDown, ArrowDown, ArrowUp, ChevronsUpDown, SlidersHorizontal, MoreVertical } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { type ColumnDef } from '@tanstack/react-table';
import { Checkbox } from '../FMComponents/ui/checkbox';
import { format } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../FMComponents/ui/tooltip';
import { Badge } from '../FMComponents/ui/badge';
import { cn } from '../lib/utils';

type ChartableColumn = keyof typeof alarmConfig.fields;

const severityColors: Record<string, string> = {
  Critical: "bg-red-500",
  Major: "bg-orange-500",
  Minor: "bg-yellow-500",
  Warning: "bg-blue-500",
  Indeterminate: "bg-gray-500",
  Cleared: "bg-green-500",
};

export default function Home() {
  const [data, setData] = React.useState<Alarm[]>([]);
  const [chartData, setChartData] = React.useState<Alarm[]>([]);
  const [isStreaming, setIsStreaming] = React.useState(false);
  const [selectedRowIds, setSelectedRowIds] = React.useState<string[]>([]);
  const [isClient, setIsClient] = React.useState(false);
  const [activeCharts, setActiveCharts] = React.useState<ChartableColumn[]>(['Severity']);
  const { toast } = useToast();
  const chartUpdateDebounceRef = React.useRef<NodeJS.Timeout>();
  const [isPending, startTransition] = React.useTransition();
  const [dialogRow, setDialogRow] = React.useState<Alarm | null>(null);

  const getRowId = React.useCallback((row: Alarm) => row.AlarmID, []);

  const columns = React.useMemo<ColumnDef<Alarm>[]>(() => {
    const staticColumns: ColumnDef<Alarm>[] = [
      {
        id: "select",
        header: ({ table }) => (
            <div className="flex items-center justify-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 -ml-2 hover:bg-transparent">
                    <SlidersHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[200px]">
                   <DropdownMenuLabel>Table Settings</DropdownMenuLabel>
                   <DropdownMenuSeparator />
                    <DropdownMenuCheckboxItem
                        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
                        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    >
                      Select/Deselect All
                    </DropdownMenuCheckboxItem>
                    {table.getState().sorting.length > 0 && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => table.resetSorting(true)}>
                          Clear All Sorts
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {table
                        .getAllColumns()
                        .filter(
                            (column) =>
                            typeof column.accessorFn !== "undefined" && column.getCanHide()
                        )
                        .map((column) => {
                            const config = alarmConfig.fields[column.id as keyof typeof alarmConfig.fields];
                            return (
                            <DropdownMenuCheckboxItem
                                key={column.id}
                                className="capitalize"
                                checked={column.getIsVisible()}
                                onCheckedChange={(value) => column.toggleVisibility(!!value)}
                            >
                                {config?.label || column.id}
                            </DropdownMenuCheckboxItem>
                            );
                    })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
        enableResizing: false,
        size: 60,
        minSize: 60,
      },
    ];

    const dynamicColumns = Object.entries(alarmConfig.fields).map(([key, config]) => {
      const columnDef: ColumnDef<Alarm> = {
        accessorKey: key,
        id: key,
        header: ({ column }) => {
            return (
              <div className="flex items-center justify-between w-full h-full">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">{config.label}</span>
                </div>
                <div className="flex items-center">
                  {column.getCanSort() && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 p-0 hover:bg-transparent"
                      onClick={(e) => {
                        e.stopPropagation();
                        column.toggleSorting(column.getIsSorted() === 'asc');
                      }}
                    >
                      {column.getIsSorted() === 'desc' ? (
                        <ArrowDown className="h-4 w-4" />
                      ) : column.getIsSorted() === 'asc' ? (
                        <ArrowUp className="h-4 w-4" />
                      ) : (
                        <ChevronsUpDown className="h-4 w-4 text-muted-foreground/50" />
                      )}
                    </Button>
                  )}
                </div>
              </div>
            )
        },
        cell: ({ row }) => {
          const value = row.getValue(key) as any;
          
          if (config.columnType === 'dateTime' && value instanceof Date) {
            try {
                const formatString = config.formatType?.replace(/mi/g, 'mm') || 'PPpp';
                return (
                  <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild><span className="block truncate">{format(value, formatString)}</span></TooltipTrigger>
                    <TooltipContent><p>{format(value, formatString)}</p></TooltipContent>
                  </Tooltip>
                  </TooltipProvider>
                );
            } catch (e) {
                return <span className="block truncate text-red-500">Invalid Date</span>
            }
          }
          
          if (key === 'Severity') {
            return (
              <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Badge className={cn("capitalize text-white", severityColors[value] || 'bg-gray-400')}>{value}</Badge>
                </TooltipTrigger>
                <TooltipContent><p>Severity: {value}</p></TooltipContent>
              </Tooltip>
              </TooltipProvider>
            );
          }

          return (
            <TooltipProvider>
             <Tooltip>
                <TooltipTrigger asChild><span className="block truncate">{String(value ?? '')}</span></TooltipTrigger>
                <TooltipContent><p>{String(value ?? '')}</p></TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        },
        size: config.columnSize || 150,
        minSize: 120,
        filterFn: (row, id, filterValue) => {
          if (config.columnType === 'categorical') {
            return (filterValue as any[]).includes(row.getValue(id));
          }
          return String(row.getValue(id)).toLowerCase().includes(String(filterValue).toLowerCase());
        }
      };
      return columnDef;
    });

    return [...staticColumns, ...dynamicColumns];
  }, []);

  React.useEffect(() => {
    const initialData = makeData(100);
    setData(initialData);
    setChartData(initialData);
    setIsClient(true);
  }, []);

  React.useEffect(() => {
    if (chartUpdateDebounceRef.current) {
      clearTimeout(chartUpdateDebounceRef.current);
    }
    
    chartUpdateDebounceRef.current = setTimeout(() => {
      setChartData(data);
    }, 1000);

    return () => {
      if (chartUpdateDebounceRef.current) {
        clearTimeout(chartUpdateDebounceRef.current);
      }
    }
  }, [data]);

  const addRow = React.useCallback(() => {
    startTransition(() => {
      setData((oldData) => [newAlarm(), ...oldData]);
    });
  }, [startTransition]);

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
  
  const filterableColumns = React.useMemo(() => {
    return Object.entries(alarmConfig.fields)
      .map(([id, { label, columnType, options }]) => ({
        id,
        name: label,
        type: columnType === 'categorical' ? 'categorical' : 'text',
        options: options
      }));
  }, []);

  const initialColumnVisibility = React.useMemo(() => {
    return Object.entries(alarmConfig.fields)
      .filter(([, config]) => config.isColumnToHide)
      .reduce((acc, [key]) => {
        acc[key] = false;
        return acc;
      }, {} as any);
  }, []);
  
  const initialSorting = React.useMemo(() => {
    const descendingCol = Object.entries(alarmConfig.fields).find(([,config]) => config.sortOrder === 'DESCENDING');
    return descendingCol ? [{ id: descendingCol[0], desc: true }] : [];
  }, []);

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
                <DropdownMenu>
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
                    data={chartData}
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
                columns={columns}
                onSelectedRowsChange={setSelectedRowIds}
                getRowId={getRowId}
                filterableColumns={filterableColumns}
                initialColumnVisibility={initialColumnVisibility}
                initialSorting={initialSorting}
                renderRowContextMenu={(row) => (
                    <DropdownMenuContent
                        onContextMenu={(e) => e.preventDefault()}
                        onDoubleClick={(e) => {
                            e.preventDefault();
                            setDialogRow(row);
                        }}
                    >
                        <DropdownMenuItem onClick={() => setDialogRow(row)}>
                            View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(row.AlarmID)}>
                            Copy Alarm ID
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                )}
            />
        </div>
      </main>
    </div>
  );
}
