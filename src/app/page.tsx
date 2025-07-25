
'use client';

import * as React from 'react';
import { makeData, newAlarm } from '../lib/data';
import { type Alarm, alarmConfig } from '../config/alarm-config';
import { DataTable, type ContextMenuItem } from '../FMComponents/data-table';
import { type FilterableColumn } from '../FMComponents/data-table-faceted-filter';
import { ColumnChart } from '../FMComponents/status-chart';
import { type ColumnFiltersState } from './types';
import { getExportableData } from '../lib/export';
import { getColumns } from './columns';
import { useDropdown } from '@/hooks/use-dropdown';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import ExcelJS from 'exceljs';
import { PropertyPage } from '@/FMComponents/property-page/PropertyPage';


/**
 * The type definition for columns that can be used to generate charts.
 * This is derived from the keys of the `alarmConfig.fields`.
 */
type ChartableColumn = keyof typeof alarmConfig.fields;

const PieChartIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.5rem' }}><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>
);

const EditIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
);

const PropertyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="8" y1="13" x2="16" y2="13"></line><line x1="8" y1="17" x2="16" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
);

/**
 * The main page component for the Alarm Dashboard application.
 * It manages the state for the data table, charts, and user interactions.
 */
export default function Home() {
  // State for the main data array for the table. Initialize with data.
  const [data, setData] = React.useState<Alarm[]>([]);
  // State to control the real-time data streaming.
  const [isStreaming, setIsStreaming] = React.useState(false);
  // State to hold the currently selected rows from the data table.
  const [selectedRows, setSelectedRows] = React.useState<Alarm[]>([]);
  // State to manage which charts are currently visible. Defaults to 'Severity'.
  const [activeCharts, setActiveCharts] = React.useState<ChartableColumn[]>(['Severity']);
  // React transition for non-blocking UI updates when adding new rows.
  const [isPending, startTransition] = React.useTransition();
  // State for the global search filter across all columns.
  const [globalFilter, setGlobalFilter] = React.useState('');
  // Ref for the scrollable container of the data table, used by the virtualizer.
  const tableContainerRef = React.useRef<HTMLDivElement>(null);
  // State for column-specific filters.
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  // State to manage the visibility of the charts panel.
  const [showCharts, setShowCharts] = React.useState(true);
  // State to hold the data of the row being updated.
  const [rowToUpdate, setRowToUpdate] = React.useState<Alarm | null>(null);
  const { dropdownRef: addChartRef, isOpen: isAddChartOpen, setIsOpen: setIsAddChartOpen } = useDropdown();
  // State for the property page modal. If not null, the property page is shown.
  const [propertyPageRow, setPropertyPageRow] = React.useState<Alarm | null>(null);
  
  React.useEffect(() => {
    // Generate data on the client side to avoid hydration mismatches
    setData(makeData(100));
  }, []);

  /**
   * Memoized callback to get a unique ID for each row.
   * Required for row identification.
   * It dynamically finds the column marked with `isRecId: true` in the config.
   */
  const getRowId = React.useCallback((row: Alarm) => {
    if (!row) return `-undefined`;
    const recIdKey = Object.keys(alarmConfig.fields).find(
      (key) => alarmConfig.fields[key as keyof typeof alarmConfig.fields].isRecId
    );
    // Fallback to a default key if no recId is found, though one should always be configured.
    return recIdKey ? String(row[recIdKey as keyof Alarm]) : String(row.AlarmID);
  }, []);
  
  /**
   * Memoized columns definition for the data table.
   */
  const columns = React.useMemo(() => getColumns(), []);

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
  }, [startTransition]);

  /**
   * Opens the update dialog and pre-fills it with the selected row's data.
   */
  const handleUpdateRow = React.useCallback(() => {
    if (selectedRows.length !== 1) {
      console.error("Please select exactly one row to update.");
      return;
    }
    setRowToUpdate(selectedRows[0]);
  }, [selectedRows]);

  /**
   * Updates the data in the main state array after a row is edited.
   * @param updatedRow The row data that has been modified.
   */
  const onRowUpdate = React.useCallback((updatedRow: Alarm) => {
    const recId = getRowId(updatedRow);
    setData(currentData =>
      currentData.map(row => (getRowId(row) === recId ? updatedRow : row))
    );
    setRowToUpdate(null);
  }, [getRowId]);

  /**
   * Deletes the currently selected rows from the table after confirmation.
   */
  const handleConfirmDelete = React.useCallback(() => {
    const selectedRowIds = new Set(selectedRows.map(r => getRowId(r)));
    setData((oldData) =>
      oldData.filter((row) => !selectedRowIds.has(getRowId(row)))
    );
    setSelectedRows([]);
  }, [selectedRows, getRowId]);

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
   * Callback to regenerate the table data.
   */
  const handleRefresh = React.useCallback(() => {
    setData(makeData(100));
  }, []);

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
    setIsAddChartOpen(false);
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
    const alarmNameOptions = alarmConfig.fields.AlarmName.options || [];
    
    // Simulate a backend search for the "Alarm Name" filter
    const searchAlarmNames = async (query: string): Promise<{ value: string; label: string }[]> => {
        console.log(`Searching for: "${query}"`);
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500)); 
        
        if (!query) {
            return alarmNameOptions.slice(0, 10); // Return top 10 if query is empty
        }
        
        const lowerCaseQuery = query.toLowerCase();
        const filtered = alarmNameOptions.filter(opt => 
            opt.label.toLowerCase().includes(lowerCaseQuery)
        );
        
        console.log(`Found ${filtered.length} results.`);
        return filtered;
    };

    return Object.entries(alarmConfig.fields)
      .filter(([, config]) => config.isFilterable)
      .map(([id, { label, columnType, options }]) => {
        const filter: FilterableColumn = {
            id,
            name: label,
            type: columnType === 'categorical' ? 'categorical' : 'text',
        };

        if (id === 'AlarmName') {
            // Use the async search function for this specific filter
            filter.onSearch = searchAlarmNames;
        } else if (columnType === 'categorical') {
            // Use the static options for other categorical filters
            filter.options = options || [];
        }

        return filter;
      });
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
      }, {} as { [key: string]: boolean });
  }, []);
  
  /**
   * Memoized initial sorting state for the table.
   * Sorts by the column marked with `sortOrder: 'DESCENDING'` in the `alarmConfig`.
   */
  const initialSorting = React.useMemo(() => {
    const descendingCol = Object.entries(alarmConfig.fields).find(([,config]) => config.sortOrder === 'DESCENDING');
    return descendingCol ? [{ columnId: descendingCol[0], direction: 'desc' as const }] : [];
  }, []);

  const frozenColumns = React.useMemo(() => {
    const frozen = Object.entries(alarmConfig.fields)
        .filter(([, config]) => config.isColumnToFreeze)
        .map(([key]) => key);
    return ['select', ...frozen];
  }, []);

  /**
   * Memoized array of context menu items for table rows.
   */
  const contextMenuItems: ContextMenuItem<Alarm>[] = React.useMemo(() => [
    {
      label: 'Copy Alarm ID',
      onClick: (row) => {
        const recId = getRowId(row);
        navigator.clipboard.writeText(recId);
        console.log(`Row ID ${recId} copied to clipboard.`);
      }
    },
    {
      label: (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <PropertyIcon />
          Show Properties
        </div>
      ),
      onClick: (row) => setPropertyPageRow(row),
      separator: true,
    },
     {
      label: (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <EditIcon />
          Update Alarm
        </div>
      ),
      onClick: (row) => {
        setRowToUpdate(row);
      },
    },
  ], [getRowId]);

  /**
   * Exports the visible table data to a CSV file.
   */
  const handleExportCsv = React.useCallback(() => {
      const exportData = getExportableData(data, columns, columnFilters, globalFilter);
      if (!exportData) return;
      const { headers, body } = exportData;

      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += headers.join(",") + "\r\n";
      body.forEach(rowArray => {
          const row = rowArray.map(item => `"${String(item).replace(/"/g, '""')}"`).join(",");
          csvContent += row + "\r\n";
      });

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "alarms.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  }, [data, columns, columnFilters, globalFilter]);

  const handleExportXlsx = React.useCallback(async () => {
    const exportData = getExportableData(data, columns, columnFilters, globalFilter);
    if (!exportData) return;
    const { headers, body } = exportData;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Alarms');
    worksheet.addRow(headers);
    body.forEach(row => worksheet.addRow(row));
    
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'alarms.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [data, columns, columnFilters, globalFilter]);

  const handleExportPdf = React.useCallback(() => {
    const exportData = getExportableData(data, columns, columnFilters, globalFilter);
    if (!exportData) return;
    const { headers, body } = exportData;

    const doc = new jsPDF();
    (doc as any).autoTable({
        head: [headers],
        body: body,
    });
    doc.save('alarms.pdf');
  }, [data, columns, columnFilters, globalFilter]);

  return (
    <div className="cygnet-page-container">
      <main className="cygnet-main-content">
        {propertyPageRow ? (
          <PropertyPage
            rowData={propertyPageRow}
            onBack={() => setPropertyPageRow(null)}
          />
        ) : (
          <>
            <div className="cygnet-page-header">
              <h1>Live Streaming Alarm Dashboard</h1>
              <p>
                A high-performance, real-time dashboard for network alarms, built with Next.js and React. 
                Features a virtualized data table capable of handling thousands of streaming updates per second, 
                advanced client-side filtering, sorting, and dynamic charting.
              </p>
            </div>
            <div className="cygnet-content-layout">
              {/* Charts Column */}
              {showCharts && (
                <div className="cygnet-charts-column">
                  <div className="cygnet-charts-header">
                    <h2>Charts</h2>
                    <div ref={addChartRef} className="cygnet-dt-dropdown-container">
                      <button className="cygnet-dt-button cygnet-dt-button--outline" onClick={() => setIsAddChartOpen(!isAddChartOpen)}>
                        <PieChartIcon />
                        Add Chart
                      </button>
                      {isAddChartOpen && (
                        <div className="cygnet-dt-dropdown-content">
                          {summarizableColumns.map((key) => (
                            <button
                              key={key}
                              className="cygnet-dt-dropdown-item"
                              disabled={activeCharts.includes(key)}
                              onClick={() => handleAddChart(key)}
                            >
                              {(alarmConfig.fields as any)[key].label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="cygnet-charts-grid">
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
                </div>
              )}

              {/* Data Table Column */}
              <div className="cygnet-table-card">
                <DataTable
                  tableContainerRef={tableContainerRef}
                  data={data}
                  columns={columns}
                  onSelectedRowsChange={setSelectedRows}
                  getRowId={getRowId}
                  filterableColumns={filterableColumns}
                  initialColumnVisibility={initialColumnVisibility}
                  initialSorting={initialSorting}
                  onRowDoubleClick={(row) => setPropertyPageRow(row)}
                  contextMenuItems={contextMenuItems}
                  globalFilter={globalFilter}
                  onGlobalFilterChange={setGlobalFilter}
                  columnFilters={columnFilters}
                  onColumnFiltersChange={setColumnFilters}
                  onAddRow={addRow}
                  onUpdateRow={handleUpdateRow}
                  isStreaming={isStreaming}
                  onToggleStreaming={() => setIsStreaming((prev) => !prev)}
                  onDeleteSelectedRows={handleConfirmDelete}
                  onExportCsv={handleExportCsv}
                  onExportXlsx={handleExportXlsx}
                  onExportPdf={handleExportPdf}
                  onRefresh={handleRefresh}
                  showCharts={showCharts}
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
                    refreshData: true,
                  }}
                  frozenColumns={frozenColumns}
                />
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
