
'use client';

import * as React from 'react';
import { makeData, newAlarm } from '../lib/data';
import { type Alarm, alarmConfig } from '../config/alarm-config';
import { DataTable, type ContextMenuItem, type ToolbarVisibility, type FilterableColumn } from '../FMComponents/data-table';
import { ColumnChart } from '../FMComponents/status-chart';
import { Button } from '../FMComponents/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../FMComponents/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { type Table as ReactTable, type Row } from '@tanstack/react-table';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../FMComponents/ui/alert-dialog';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ExcelJS from 'exceljs';
import { getExportableData } from '../lib/export';
import { getColumns } from './columns';


type ChartableColumn = keyof typeof alarmConfig.fields;

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
  const [globalFilter, setGlobalFilter] = React.useState('');
  const [table, setTable] = React.useState<ReactTable<Alarm> | null>(null);
  const tableContainerRef = React.useRef<HTMLDivElement>(null);

  const getRowId = React.useCallback((row: Alarm) => row.AlarmID, []);
  
  const columns = React.useMemo(() => getColumns(), []);

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
      const alarm = newAlarm();
      alarm.NetworkLastModifiedTimeLong = new Date();
      setData((oldData) => [alarm, ...oldData]);
    });
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
  
  const filterableColumns: FilterableColumn[] = React.useMemo(() => {
    return Object.entries(alarmConfig.fields)
      .filter(([, config]) => config.isFilterable)
      .map(([id, { label, columnType, options }]) => ({
        id,
        name: label,
        type: columnType === 'categorical' ? 'categorical' : 'text',
        options: options || []
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

  const contextMenuItems: ContextMenuItem<Alarm>[] = React.useMemo(() => [
    {
      label: 'View Details',
      onClick: (row) => setDialogRow(row),
    },
    {
      label: 'Copy Alarm ID',
      onClick: (row) => navigator.clipboard.writeText(row.AlarmID),
    },
  ], []);

  const handleExportCsv = () => {
      const exportData = getExportableData(table, alarmConfig);
      if (!exportData) return;
      const { headers, body } = exportData;

      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += headers.join(",") + "\r\n";
      body.forEach(rowArray => {
          const row = rowArray.map(item => `"${item.replace(/"/g, '""')}"`).join(",");
          csvContent += row + "\r\n";
      });

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "alarms.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const handleExportXlsx = async () => {
      const exportData = getExportableData(table, alarmConfig);
      if (!exportData) return;
      const { headers, body } = exportData;

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Alarms");

      worksheet.columns = headers.map(header => ({ header: header, key: header, width: 25 }));
      
      const dataToExport = body.map(row => {
          const rowObject: { [key: string]: string } = {};
          headers.forEach((header, index) => {
              rowObject[header] = row[index];
          });
          return rowObject;
      });

      worksheet.addRows(dataToExport);

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "alarms.xlsx";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };
  
  const handleExportPdf = () => {
    const exportData = getExportableData(table, alarmConfig);
    if (!exportData) {
      toast({ title: "Error", description: "Could not get data for PDF export.", variant: "destructive" });
      return;
    }
    const { headers, body } = exportData;
    
    const doc = new jsPDF({ orientation: 'landscape' });
    autoTable(doc, {
        head: [headers],
        body: body,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [38, 109, 168] },
    });
    doc.save('alarms.pdf');
  };

  if (!isClient) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <main className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-blue-600">
            Real-Time Alarm Dashboard
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-500">
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
        
        <div className="p-2 rounded-lg border border-gray-200 bg-white text-gray-900 shadow-md">
            <DataTable
                tableContainerRef={tableContainerRef}
                data={data}
                columns={columns}
                onSelectedRowsChange={setSelectedRowIds}
                getRowId={getRowId}
                filterableColumns={filterableColumns}
                initialColumnVisibility={initialColumnVisibility}
                initialSorting={initialSorting}
                onRowDoubleClick={setDialogRow}
                contextMenuItems={contextMenuItems}
                globalFilter={globalFilter}
                onGlobalFilterChange={setGlobalFilter}
                onTableReady={setTable}
                onAddRow={addRow}
                isStreaming={isStreaming}
                onToggleStreaming={() => setIsStreaming((prev) => !prev)}
                onDeleteSelectedRows={deleteSelectedRows}
                onExportCsv={handleExportCsv}
                onExportXlsx={handleExportXlsx}
                onExportPdf={handleExportPdf}
                tableTitle="Live Alarm Feed"
                tableDescription="This table is driven by a central configuration and supports client-side filtering, sorting, and pagination."
                maxHeightWithPagination="60vh"
                maxHeightWithoutPagination="80vh"
                initialRowsPerPage={50}
                rowsPerPageOptions={[20, 50, 100, 200, 500]}
            />
        </div>

        <AlertDialog open={!!dialogRow} onOpenChange={(isOpen) => !isOpen && setDialogRow(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Item Details</AlertDialogTitle>
              <AlertDialogDescription>Viewing full data for the selected item.</AlertDialogDescription>
            </AlertDialogHeader>
            <div className="max-h-96 overflow-y-auto rounded-md border bg-gray-100 p-4">
              <pre><code>{JSON.stringify(dialogRow, null, 2)}</code></pre>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDialogRow(null)}>Close</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  );
}
