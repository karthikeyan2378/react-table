
'use client';

import * as React from 'react';
import { makeData, newAlarm } from '../lib/data';
import { type Alarm, alarmConfig } from '../config/alarm-config';
import { DataTable, type ContextMenuItem, type FilterableColumn } from '../FMComponents/data-table';
import { ColumnChart } from '../FMComponents/status-chart';
import { Button } from '../FMComponents/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../FMComponents/ui/dropdown-menu';
import { ChevronDown, Edit } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { type Table as ReactTable, type ColumnFiltersState } from '@tanstack/react-table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../FMComponents/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '../FMComponents/ui/dialog';
import { Label } from '../FMComponents/ui/label';
import { Textarea } from '../FMComponents/ui/textarea';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ExcelJS from 'exceljs';
import { getExportableData } from '../lib/export';
import { getColumns } from './columns';


/**
 * The type definition for columns that can be used to generate charts.
 * This is derived from the keys of the `alarmConfig.fields`.
 */
type ChartableColumn = keyof typeof alarmConfig.fields;

/**
 * The main page component for the Alarm Dashboard application.
 * It manages the state for the data table, charts, and user interactions.
 */
export default function Home() {
  // State for the main data array for the table.
  const [data, setData] = React.useState<Alarm[]>([]);
  // State to control the real-time data streaming.
  const [isStreaming, setIsStreaming] = React.useState(false);
  // State to hold the currently selected rows from the data table.
  const [selectedRows, setSelectedRows] = React.useState<Alarm[]>([]);
  // State to ensure the component only renders on the client, avoiding hydration issues.
  const [isClient, setIsClient] = React.useState(false);
  // State to manage which charts are currently visible. Defaults to 'Severity'.
  const [activeCharts, setActiveCharts] = React.useState<ChartableColumn[]>(['Severity']);
  // Toast hook for displaying notifications.
  const { toast } = useToast();
  // React transition for non-blocking UI updates when adding new rows.
  const [isPending, startTransition] = React.useTransition();
  // State to hold the row data for the details dialog.
  const [dialogRow, setDialogRow] = React.useState<Alarm | null>(null);
  // State for the global search filter across all columns.
  const [globalFilter, setGlobalFilter] = React.useState('');
  // State to hold the TanStack Table instance once it's initialized.
  const [table, setTable] = React.useState<ReactTable<Alarm> | null>(null);
  // Ref for the scrollable container of the data table, used by the virtualizer.
  const tableContainerRef = React.useRef<HTMLDivElement>(null);
  // State for column-specific filters.
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  // State to manage the visibility of the charts panel.
  const [showCharts, setShowCharts] = React.useState(true);
  // State to manage the update dialog visibility.
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = React.useState(false);
  // State to hold the data of the row being updated.
  const [rowToUpdate, setRowToUpdate] = React.useState<Alarm | null>(null);

  /**
   * Memoized callback to get a unique ID for each row.
   * Required by TanStack Table for row identification.
   * It dynamically finds the column marked with `isRecId: true` in the config.
   */
  const getRowId = React.useCallback((row: Alarm) => {
    const recIdKey = Object.keys(alarmConfig.fields).find(
      (key) => alarmConfig.fields[key as keyof typeof alarmConfig.fields].isRecId
    );
    // Fallback to a default key if no recId is found, though one should always be configured.
    return recIdKey ? row[recIdKey as keyof Alarm] : row.AlarmID;
  }, []);
  
  /**
   * Memoized columns definition for the data table.
   */
  const columns = React.useMemo(() => getColumns(), []);

  /**
   * Effect to initialize the component on the client-side.
   * Generates initial data and sets `isClient` to true.
   */
  React.useEffect(() => {
    const initialData = makeData(100);
    setData(initialData);
    setIsClient(true);
  }, []);

  /**
   * Callback to add a new alarm row to the table.
   * Uses React's `startTransition` to prevent the UI from blocking.
   */
  const addRow = React.useCallback(() => {
    startTransition(() => {
      const alarm = newAlarm();
      alarm.NetworkLastModifiedTimeLong = new Date();
      setData((oldData) => [alarm, ...oldData]);
    });
  }, []);

  /**
   * Opens the update dialog and pre-fills it with the selected row's data.
   */
  const handleUpdateRow = () => {
    if (selectedRows.length !== 1) {
      toast({
        title: "Invalid selection",
        description: "Please select exactly one row to update.",
        variant: "destructive"
      });
      return;
    }
    setRowToUpdate(selectedRows[0]);
    setIsUpdateDialogOpen(true);
  };

  /**
   * Updates the data in the main state array after a row is edited.
   * @param updatedRow The row data that has been modified.
   */
  const onRowUpdate = (updatedRow: Alarm) => {
    const recId = getRowId(updatedRow);
    setData(currentData =>
      currentData.map(row => (getRowId(row) === recId ? updatedRow : row))
    );
    setIsUpdateDialogOpen(false);
    setRowToUpdate(null);
    toast({
      title: "Row Updated",
      description: "The alarm has been successfully updated."
    });
  };

  /**
   * Deletes the currently selected rows from the table.
   */
  const deleteSelectedRows = () => {
    if (selectedRows.length === 0) {
      toast({
        title: "No rows selected",
        description: "Please select rows to delete.",
        variant: "destructive"
      })
      return;
    }
    const selectedRowIds = selectedRows.map(r => getRowId(r));
    setData((oldData) =>
      oldData.filter((row) => !selectedRowIds.includes(getRowId(row)))
    );
    setSelectedRows([]);
    toast({
        title: "Rows Deleted",
        description: `${selectedRowIds.length} row(s) have been deleted.`
    })
  };

  /**
   * Effect to handle the data streaming functionality.
   * When `isStreaming` is true, it adds a new row every second.
   */
  React.useEffect(() => {
    if (!isStreaming) return;
    const interval = setInterval(() => {
      addRow();
    }, 1000);
    return () => clearInterval(interval);
  }, [isStreaming, addRow]);

  /**
   * Memoized list of columns that are suitable for summarization in charts.
   * Derived from the `alarmConfig`.
   */
  const summarizableColumns = React.useMemo(() => {
    return Object.entries(alarmConfig.fields)
      .filter(([, config]) => config.isSummarizedColumn)
      .map(([key]) => key as ChartableColumn);
  }, []);

  /**
   * Adds a new chart to the dashboard if it's not already active.
   * @param columnId The ID of the column to create a chart for.
   */
  const handleAddChart = (columnId: ChartableColumn) => {
    if (!activeCharts.includes(columnId)) {
      setActiveCharts([...activeCharts, columnId]);
    }
  };

  /**
   * Removes a chart from the dashboard.
   * @param columnId The ID of the column chart to remove.
   */
  const handleRemoveChart = (columnId: ChartableColumn) => {
    setActiveCharts(activeCharts.filter((id) => id !== columnId));
  };

  /**
   * Handles the click-to-filter action from a chart.
   * It adds or removes a value from the filter for the given column,
   * supporting multi-selection.
   * @param columnId The ID of the column to filter.
   * @param value The value to add or remove from the filter.
   */
  const handleChartFilter = (columnId: string, value: string) => {
      setColumnFilters((prevFilters) => {
          const existingFilter = prevFilters.find(f => f.id === columnId);
          const otherFilters = prevFilters.filter(f => f.id !== columnId);

          if (!existingFilter) {
              // No filter for this column yet, create a new one
              return [...otherFilters, { id: columnId, value: [value] }];
          }

          const currentValues = (existingFilter.value as string[]) || [];
          const newValues = currentValues.includes(value)
              ? currentValues.filter(v => v !== value) // Value exists, remove it (deselect)
              : [...currentValues, value]; // Value doesn't exist, add it (select)

          if (newValues.length === 0) {
              // If no values are left, remove the filter for this column entirely
              return otherFilters;
          }

          return [...otherFilters, { id: columnId, value: newValues }];
      });
  };
  
  /**
   * Memoized list of columns that are filterable in the toolbar.
   * Derived from the `alarmConfig`.
   */
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

  /**
   * Memoized object defining the initial visibility of columns.
   * Hides columns marked with `isColumnToHide` in the `alarmConfig`.
   */
  const initialColumnVisibility = React.useMemo(() => {
    return Object.entries(alarmConfig.fields)
      .filter(([, config]) => config.isColumnToHide)
      .reduce((acc, [key]) => {
        acc[key] = false;
        return acc;
      }, {} as any);
  }, []);
  
  /**
   * Memoized initial sorting state for the table.
   * Sorts by the column marked with `sortOrder: 'DESCENDING'` in the `alarmConfig`.
   */
  const initialSorting = React.useMemo(() => {
    const descendingCol = Object.entries(alarmConfig.fields).find(([,config]) => config.sortOrder === 'DESCENDING');
    return descendingCol ? [{ id: descendingCol[0], desc: true }] : [];
  }, []);

  /**
   * Memoized array of context menu items for table rows.
   */
  const contextMenuItems: ContextMenuItem<Alarm>[] = React.useMemo(() => [
    {
      label: 'View Details',
      onClick: (row) => setDialogRow(row),
    },
    {
      label: 'Copy Alarm ID',
      onClick: (row) => {
        const recId = getRowId(row);
        navigator.clipboard.writeText(recId);
        toast({ title: 'Copied!', description: `Row ID ${recId} copied to clipboard.` });
      }
    },
     {
      label: (
        <div className="flex items-center">
          <Edit className="mr-2 h-4 w-4" />
          Update Alarm
        </div>
      ),
      onClick: (row) => {
        setRowToUpdate(row);
        setIsUpdateDialogOpen(true);
      },
      separator: true,
    },
  ], [getRowId, toast]);

  /**
   * Exports the visible table data to a CSV file.
   */
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

  /**
   * Exports the visible table data to an Excel (XLSX) file.
   */
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
  
  /**
   * Exports the visible table data to a PDF file.
   */
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

  // Prevent rendering on the server.
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
        
        <div className="flex flex-col lg:flex-row gap-8">
            {/* Charts Column */}
            {showCharts && (
              <div className="lg:w-1/3 lg:order-first w-full order-last space-y-4">
                  <div className="flex flex-wrap items-center gap-4">
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
                   {activeCharts.map((columnId) => {
                      const activeFilter = columnFilters.find(f => f.id === columnId);
                      return (
                          <ColumnChart
                              key={columnId}
                              columnId={columnId}
                              label={alarmConfig.fields[columnId].label}
                              data={data} // Pass full dataset to chart
                              onRemove={handleRemoveChart}
                              onFilter={handleChartFilter}
                              activeFilters={(activeFilter?.value as string[]) || []}
                          />
                      );
                  })}
              </div>
            )}

            {/* Data Table Column */}
            <div className={showCharts ? "lg:w-2/3 w-full" : "w-full"}>
                <div className="p-2 rounded-lg border border-gray-200 bg-white text-gray-900 shadow-md">
                    <DataTable
                        tableContainerRef={tableContainerRef}
                        data={data}
                        columns={columns}
                        onSelectedRowsChange={setSelectedRows}
                        getRowId={getRowId}
                        filterableColumns={filterableColumns}
                        initialColumnVisibility={initialColumnVisibility}
                        initialSorting={initialSorting}
                        onRowDoubleClick={setDialogRow}
                        contextMenuItems={contextMenuItems}
                        globalFilter={globalFilter}
                        onGlobalFilterChange={setGlobalFilter}
                        columnFilters={columnFilters}
                        onColumnFiltersChange={setColumnFilters}
                        onTableReady={setTable}
                        onAddRow={addRow}
                        onUpdateRow={handleUpdateRow}
                        isStreaming={isStreaming}
                        onToggleStreaming={() => setIsStreaming((prev) => !prev)}
                        onDeleteSelectedRows={deleteSelectedRows}
                        onExportCsv={handleExportCsv}
                        onExportXlsx={handleExportXlsx}
                        onExportPdf={handleExportPdf}
                        showCharts={showCharts}
                        initialShowCharts={false}
                        onToggleCharts={setShowCharts}
                        tableTitle="Live Alarm Feed"
                        tableDescription="This table is driven by a central configuration and supports client-side filtering, sorting, and pagination."
                        maxHeightWithPagination="60vh"
                        maxHeightWithoutPagination="80vh"
                        initialRowsPerPage={50}
                        rowsPerPageOptions={[20, 50, 100, 200, 500]}
                        toolbarVisibility={{ 
                          toggleCharts: true,
                          updateRow: true,
                         }}
                    />
                </div>
            </div>
        </div>

        {/* View Details Dialog */}
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

        {/* Update Row Dialog */}
        <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Update Alarm</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="additionalText" className="text-right">
                  Additional Text
                </Label>
                <Textarea
                  id="additionalText"
                  defaultValue={rowToUpdate?.AdditionalText}
                  onChange={(e) => setRowToUpdate(prev => prev ? { ...prev, AdditionalText: e.target.value } : null)}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={() => rowToUpdate && onRowUpdate(rowToUpdate)}>Save changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </main>
    </div>
  );
}
