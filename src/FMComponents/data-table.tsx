
'use client';

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  Header,
  SortingState,
  Table as ReactTable,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Download,
  File,
  FileSpreadsheet,
  FileText,
  Filter,
  MoreVertical,
  PieChart,
  PlusCircle,
  Search,
  SlidersHorizontal,
  Play,
  Square,
  Trash2,
  X,
  Edit,
} from "lucide-react";
import { useVirtualizer } from '@tanstack/react-virtual';
import { highlightText } from '../lib/utils.tsx';
import './data-table.css';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";

/**
 * Interface defining the structure for a filterable column.
 */
export interface FilterableColumn {
  id: string;
  name: string;
  type: 'text' | 'categorical';
  options?: { value: string; label: string }[];
}

/**
 * Custom Dropdown Hook
 */
const useDropdown = (ref: React.RefObject<HTMLDivElement>) => {
    const [isOpen, setIsOpen] = React.useState(false);

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [ref]);

    return { isOpen, setIsOpen };
};


/**
 * A generic faceted filter component for categorical data.
 */
function DataTableFacetedFilter<TData>({
  column,
  title,
  options,
  onRemove,
  globalFilter,
}: {
  column?: ReactTable<TData>['getColumn'];
  title?: string;
  options: {
    label: string;
    value: string;
  }[];
  onRemove: () => void;
  globalFilter?: string;
}) {
  const selectedValues = new Set((column?.getFilterValue() as string[]) ?? []);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const { isOpen, setIsOpen } = useDropdown(dropdownRef);

  return (
    <div className={`dt-dropdown ${isOpen ? 'open' : ''}`} ref={dropdownRef}>
      <button className="dt-button dt-button--outline" style={{ height: '2.25rem' }} onClick={() => setIsOpen(!isOpen)}>
        <PlusCircle style={{ marginRight: '0.5rem', height: '1rem', width: '1rem', color: 'hsl(var(--primary))' }} />
        {title}
        {selectedValues?.size > 0 && (
          <>
            <div style={{width: '1px', height: '1rem', backgroundColor: '#e5e7eb', margin: '0 0.5rem'}} />
            <span className="dt-badge" style={{ backgroundColor: '#e5e7eb', color: '#1f2937' }}>
              {selectedValues.size}
            </span>
          </>
        )}
      </button>
      <div className="dt-dropdown-content">
          {options.map((option) => {
            const isSelected = selectedValues.has(option.value);
            return (
              <div
                key={option.value}
                className="dt-dropdown-item"
                onClick={() => {
                  if (isSelected) {
                    selectedValues.delete(option.value);
                  } else {
                    selectedValues.add(option.value);
                  }
                  const filterValues = Array.from(selectedValues);
                  column?.setFilterValue(
                    filterValues.length ? filterValues : undefined
                  );
                }}
              >
                <input type="checkbox" className="dt-checkbox" readOnly checked={isSelected} />
                <span>{highlightText(option.label, globalFilter)}</span>
              </div>
            );
          })}
          {selectedValues.size > 0 && (
            <>
              <div className="dt-dropdown-separator" />
              <div
                onClick={() => column?.setFilterValue(undefined)}
                className="dt-dropdown-item" style={{justifyContent: 'center'}}
              >
                Clear filters
              </div>
            </>
          )}
        </div>
    </div>
  );
}


/**
 * Interface to control the visibility of various toolbar elements.
 */
export interface ToolbarVisibility {
  addRow?: boolean;
  updateRow?: boolean;
  deleteRows?: boolean;
  toggleStreaming?: boolean;
  exportData?: boolean;
  viewOptions?: boolean;
  toggleSorting?: boolean;
  togglePagination?: boolean;
  toggleColumns?: boolean;
  toggleCharts?: boolean;
}

/**
 * Props for the DataTableToolbar component.
 * @template TData The type of data in the table.
 */
interface DataTableToolbarProps<TData> {
  table: ReactTable<TData>;
  filterableColumns: FilterableColumn[];
  globalFilter: string;
  onGlobalFilterChange: (value: string) => void;
  onAddRow?: () => void;
  onUpdateRow?: () => void;
  isStreaming?: boolean;
  onToggleStreaming?: () => void;
  onDeleteSelectedRows?: () => void;
  onExportCsv?: () => void;
  onExportXlsx?: () => void;
  onExportPdf?: () => void;
  sortingEnabled: boolean;
  onSortingToggle: (enabled: boolean) => void;
  paginationEnabled: boolean;
  onPaginationToggle: (enabled: boolean) => void;
  showCharts: boolean;
  onToggleCharts: (enabled: boolean) => void;
  toolbarVisibility: ToolbarVisibility;
}

/**
 * The toolbar component for the DataTable.
 */
function DataTableToolbar<TData>({ 
  table, 
  filterableColumns, 
  globalFilter, 
  onGlobalFilterChange,
  onAddRow,
  onUpdateRow,
  isStreaming,
  onToggleStreaming,
  onDeleteSelectedRows,
  onExportCsv,
  onExportXlsx,
  onExportPdf,
  sortingEnabled,
  onSortingToggle,
  paginationEnabled,
  onPaginationToggle,
  showCharts,
  onToggleCharts,
  toolbarVisibility,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0 || !!globalFilter;
  const [activeFilters, setActiveFilters] = React.useState<string[]>([]);
  const selectedRowCount = table.getFilteredSelectedRowModel().rows.length;

  const filterDropdownRef = React.useRef<HTMLDivElement>(null);
  const { isOpen: isFilterOpen, setIsOpen: setFilterOpen } = useDropdown(filterDropdownRef);
  const exportDropdownRef = React.useRef<HTMLDivElement>(null);
  const { isOpen: isExportOpen, setIsOpen: setExportOpen } = useDropdown(exportDropdownRef);
  const viewOptionsDropdownRef = React.useRef<HTMLDivElement>(null);
  const { isOpen: isViewOptionsOpen, setIsOpen: setViewOptionsOpen } = useDropdown(viewOptionsDropdownRef);

  const handleFilterToggle = (columnId: string, isActive?: boolean) => {
    if (isActive) {
       setActiveFilters((prev) => prev.filter((id) => id !== columnId));
       table.getColumn(columnId)?.setFilterValue(undefined);
    } else {
       setActiveFilters((prev) => [...prev, columnId]);
    }
  };
  
  const clearAllFilters = () => {
    table.resetColumnFilters();
    onGlobalFilterChange("");
    setActiveFilters([]);
  };

  const textFilterColumns = filterableColumns.filter(col => col.type === 'text');
  const categoricalFilterColumns = filterableColumns.filter(col => col.type === 'categorical');

  return (
    <div className="dt-toolbar">
      {/* Left side: Filters */}
      <div className="dt-toolbar-left">
          <div className="dt-search-container">
              <Search className="dt-search-icon" />
              <input
                placeholder="Search all columns..."
                value={globalFilter ?? ""}
                onChange={(event) => onGlobalFilterChange(event.target.value)}
                className="dt-input with-icon"
              />
          </div>

        <div className={`dt-dropdown ${isFilterOpen ? 'open' : ''}`} ref={filterDropdownRef}>
            <button className="dt-button dt-button--outline" onClick={() => setFilterOpen(!isFilterOpen)}>
              <Filter style={{ marginRight: '0.5rem', height: '1rem', width: '1rem', color: 'hsl(var(--primary))' }} />
              Add Filter
            </button>
            <div className="dt-dropdown-content">
              <div className="dt-dropdown-label">Filter by column</div>
              <div className="dt-dropdown-separator" />
              {filterableColumns.map((col) => (
                <div
                    key={col.id}
                    className="dt-dropdown-item"
                    onClick={() => handleFilterToggle(col.id, activeFilters.includes(col.id))}
                >
                  <input
                    type="checkbox"
                    className="dt-checkbox"
                    readOnly
                    checked={activeFilters.includes(col.id)}
                  />
                  {highlightText(col.name, globalFilter)}
                </div>
              ))}
            </div>
        </div>

        {textFilterColumns.map((col) => {
          if (activeFilters.includes(col.id)) {
            return (
              <div key={col.id} className="dt-filter-container">
                <input
                  placeholder={`Filter ${col.name.toLowerCase()}...`}
                  value={
                    (table.getColumn(col.id)?.getFilterValue() as string) ?? ""
                  }
                  onChange={(event) => {
                    const value = event.target.value;
                    table.getColumn(col.id)?.setFilterValue(value || undefined);
                  }}
                  className="dt-input with-button"
                />
                <button
                    className="dt-button dt-button--ghost dt-button--icon dt-input-button"
                    onClick={() => handleFilterToggle(col.id, true)}
                >
                    <X className="h-4 w-4" />
                </button>
              </div>
            );
          }
          return null;
        })}

        {categoricalFilterColumns.map(col => {
          if (activeFilters.includes(col.id) && table.getColumn(col.id) && col.options) {
            return (
              <DataTableFacetedFilter
                key={col.id}
                column={table.getColumn(col.id)!}
                title={col.name}
                options={col.options}
                onRemove={() => handleFilterToggle(col.id, true)}
                globalFilter={globalFilter}
              />
            )
          }
          return null;
        })}

        {isFiltered && (
            <div className="dt-tooltip-wrapper">
                <button
                onClick={clearAllFilters}
                className="dt-button dt-button--ghost dt-button--icon"
                >
                <X className="h-4 w-4" />
                </button>
                <div className="dt-tooltip-content">Clear all filters</div>
           </div>
        )}
      </div>

      {/* Right side: Actions & Settings */}
      <div className="dt-toolbar-right">
          {toolbarVisibility.addRow !== false && onAddRow && (
            <div className="dt-tooltip-wrapper">
                <button className="dt-button dt-button--ghost dt-button--icon" onClick={onAddRow}>
                  <PlusCircle className="h-4 w-4" />
                </button>
                <div className="dt-tooltip-content">Add Alarm</div>
            </div>
          )}

           {toolbarVisibility.updateRow !== false && onUpdateRow && (
             <div className="dt-tooltip-wrapper">
                <button className="dt-button dt-button--ghost dt-button--icon" onClick={onUpdateRow} disabled={selectedRowCount !== 1}>
                  <Edit className="h-4 w-4" />
                </button>
                <div className="dt-tooltip-content">Update Alarm</div>
            </div>
          )}

          {toolbarVisibility.toggleStreaming !== false && onToggleStreaming && (
            <div className="dt-tooltip-wrapper">
                <button className="dt-button dt-button--ghost dt-button--icon" onClick={onToggleStreaming}>
                  {isStreaming ? <Square className="h-4 w-4 text-red-500" /> : <Play className="h-4 w-4 text-green-500" />}
                </button>
                <div className="dt-tooltip-content">{isStreaming ? 'Stop Streaming' : 'Start Streaming'}</div>
            </div>
          )}

          {toolbarVisibility.deleteRows !== false && onDeleteSelectedRows && (
            <div className="dt-tooltip-wrapper">
                <button className="dt-button dt-button--ghost dt-button--icon" onClick={onDeleteSelectedRows} disabled={selectedRowCount === 0}>
                  <Trash2 className="h-4 w-4" />
                </button>
                <div className="dt-tooltip-content">Delete Selected</div>
            </div>
          )}

          {toolbarVisibility.toggleCharts !== false && (
             <div className="dt-tooltip-wrapper">
                <button className="dt-button dt-button--ghost dt-button--icon" onClick={() => onToggleCharts(!showCharts)}>
                  <PieChart className="h-4 w-4" style={{color: showCharts ? 'hsl(var(--primary))' : 'inherit'}} />
                </button>
                <div className="dt-tooltip-content">{showCharts ? 'Hide Charts' : 'Show Charts'}</div>
            </div>
          )}
          
          {toolbarVisibility.exportData !== false && (onExportCsv || onExportXlsx || onExportPdf) && (
            <div className={`dt-dropdown ${isExportOpen ? 'open' : ''}`} ref={exportDropdownRef}>
                <div className="dt-tooltip-wrapper">
                    <button className="dt-button dt-button--ghost dt-button--icon" onClick={() => setExportOpen(!isExportOpen)}>
                        <Download className="h-4 w-4" />
                    </button>
                    <div className="dt-tooltip-content">Export Data</div>
                </div>
              <div className="dt-dropdown-content">
                  {onExportCsv && <div className="dt-dropdown-item" onClick={onExportCsv}><FileText style={{ marginRight: '0.5rem', height: '1rem', width: '1rem' }} />Export as CSV</div>}
                  {onExportXlsx && <div className="dt-dropdown-item" onClick={onExportXlsx}><FileSpreadsheet style={{ marginRight: '0.5rem', height: '1rem', width: '1rem' }} />Export as Excel</div>}
                  {onExportPdf && <div className="dt-dropdown-item" onClick={onExportPdf}><File style={{ marginRight: '0.5rem', height: '1rem', width: '1rem' }} />Export as PDF</div>}
              </div>
            </div>
          )}

          {toolbarVisibility.viewOptions !== false && (
            <div className={`dt-dropdown ${isViewOptionsOpen ? 'open' : ''}`} ref={viewOptionsDropdownRef}>
                <div className="dt-tooltip-wrapper">
                    <button className="dt-button dt-button--ghost dt-button--icon" onClick={() => setViewOptionsOpen(!isViewOptionsOpen)}>
                        <SlidersHorizontal className="h-4 w-4" />
                    </button>
                    <div className="dt-tooltip-content">View Options</div>
                </div>
              <div className="dt-dropdown-content">
                <div className="dt-dropdown-label">Table Settings</div>
                <div className="dt-dropdown-separator" />
                {toolbarVisibility.toggleSorting !== false && (
                  <div className="dt-dropdown-item" onClick={() => onSortingToggle(!sortingEnabled)}>
                      <input type="checkbox" className="dt-checkbox" readOnly checked={sortingEnabled} />
                      Enable Sorting
                  </div>
                )}
                {toolbarVisibility.togglePagination !== false && (
                  <div className="dt-dropdown-item" onClick={() => onPaginationToggle(!paginationEnabled)}>
                      <input type="checkbox" className="dt-checkbox" readOnly checked={paginationEnabled} />
                      Enable Pagination
                  </div>
                )}
                {toolbarVisibility.toggleColumns !== false && (
                  <>
                    <div className="dt-dropdown-separator" />
                    <div className="dt-dropdown-label">Toggle Columns</div>
                    <div className="dt-dropdown-separator" />
                    {table
                        .getAllColumns()
                        .filter((column) => column.getCanHide())
                        .map((column) => {
                            const label = column.id.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                            return (
                            <div
                                key={column.id}
                                className="dt-dropdown-item"
                                onClick={() => column.toggleVisibility(!column.getIsVisible())}
                            >
                                <input type="checkbox" className="dt-checkbox" readOnly checked={column.getIsVisible()} />
                                {label}
                            </div>
                            );
                    })}
                  </>
                )}
              </div>
            </div>
          )}
      </div>
    </div>
  );
}


/**
 * A pure helper function for reordering columns in an array.
 */
const reorderColumn = (
  draggedColumnId: string,
  targetColumnId: string,
  columnOrder: string[]
): string[] => {
  const newColumnOrder = [...columnOrder];
  const draggedColumnIndex = newColumnOrder.indexOf(draggedColumnId);
  const targetColumnIndex = newColumnOrder.indexOf(targetColumnId);
  
  if (draggedColumnIndex > -1 && targetColumnIndex > -1) {
    const [removed] = newColumnOrder.splice(draggedColumnIndex, 1);
    newColumnOrder.splice(targetColumnIndex, 0, removed);
  }
  
  return newColumnOrder;
};

/**
 * Interface defining the structure for a context menu item.
 */
export interface ContextMenuItem<TData> {
  label: React.ReactNode;
  onClick: (row: TData) => void;
  separator?: boolean;
}

/**
 * Props for the main DataTable component.
 */
interface DataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData>[];
  getRowId: (row: TData) => string;
  onSelectedRowsChange: (rows: TData[]) => void;
  contextMenuItems?: ContextMenuItem<TData>[];
  onRowDoubleClick?: (row: TData) => void;
  filterableColumns?: FilterableColumn[];
  initialColumnVisibility?: VisibilityState;
  initialSorting?: SortingState;
  globalFilter: string;
  onGlobalFilterChange: (value: string) => void;
  onTableReady?: (table: ReactTable<TData>) => void;
  tableContainerRef: React.RefObject<HTMLDivElement>;
  onAddRow?: () => void;
  onUpdateRow?: () => void;
  isStreaming?: boolean;
  onToggleStreaming?: () => void;
  onDeleteSelectedRows?: () => void;
  onExportCsv?: () => void;
  onExportXlsx?: () => void;
  onExportPdf?: () => void;
  tableTitle?: React.ReactNode;
  tableDescription?: React.ReactNode;
  maxHeightWithPagination?: string;
  maxHeightWithoutPagination?: string;
  initialRowsPerPage?: number;
  rowsPerPageOptions?: number[];
  toolbarVisibility?: ToolbarVisibility;
  columnFilters: ColumnFiltersState;
  onColumnFiltersChange: React.Dispatch<React.SetStateAction<ColumnFiltersState>>;
  showCharts: boolean;
  initialShowCharts?: boolean;
  onToggleCharts: (enabled: boolean) => void;
}

/**
 * The generic and highly configurable DataTable component.
 */
export function DataTable<TData>({
  data,
  columns,
  getRowId,
  onSelectedRowsChange,
  contextMenuItems,
  onRowDoubleClick,
  filterableColumns = [],
  initialColumnVisibility = {},
  initialSorting = [],
  globalFilter,
  onGlobalFilterChange,
  onTableReady,
  tableContainerRef,
  onAddRow,
  onUpdateRow,
  isStreaming,
  onToggleStreaming,
  onDeleteSelectedRows,
  onExportCsv,
  onExportXlsx,
  onExportPdf,
  tableTitle,
  tableDescription,
  maxHeightWithPagination = '60vh',
  maxHeightWithoutPagination = '80vh',
  initialRowsPerPage = 20,
  rowsPerPageOptions = [10, 20, 50, 100, 500, 1000],
  toolbarVisibility = {},
  columnFilters,
  onColumnFiltersChange,
  showCharts,
  onToggleCharts,
}: DataTableProps<TData>) {
  // State for sorting, column visibility, row selection, and context menu.
  const [sorting, setSorting] = React.useState<SortingState>(initialSorting);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>(initialColumnVisibility);
  const [rowSelection, setRowSelection] = React.useState({});
  const [contextMenu, setContextMenu] = React.useState<{ x: number; y: number; row: TData } | null>(null);
  const contextMenuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target as Node)) {
        setContextMenu(null);
      }
    };
    if (contextMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [contextMenu]);


  // State for toggling table features like pagination and sorting.
  const [paginationEnabled, setPaginationEnabled] = React.useState(true);
  const [sortingEnabled, setSortingEnabled] = React.useState(true);
  
  // State for column order, enabling drag-and-drop reordering.
  const [columnOrder, setColumnOrder] = React.useState<string[]>(() =>
    columns.map(c => (c.id ?? (c as any).accessorKey)!).filter(Boolean)
  );
  
  // State for handling drag-to-select functionality.
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragStartRowIndex, setDragStartRowIndex] = React.useState<number | null>(null);
  const lastClickedRowIndex = React.useRef<number | null>(null);

  // Effect to clean up drag-to-select state.
  React.useEffect(() => {
    const handleMouseUp = () => {
        setIsDragging(false);
        setDragStartRowIndex(null);
    };
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
        window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // Memoize the table state to avoid unnecessary re-renders.
  const tableState = React.useMemo(() => ({
    sorting,
    columnVisibility,
    rowSelection,
    columnFilters,
    columnOrder,
    globalFilter,
  }), [sorting, columnVisibility, rowSelection, columnFilters, columnOrder, globalFilter]);

  // Memoize the initial table state, specifically for pagination.
  const tableInitialState = React.useMemo(() => ({
    pagination: {
        pageSize: initialRowsPerPage,
    },
  }), [initialRowsPerPage]);
  
  // The core TanStack Table instance.
  const table = useReactTable({
    data,
    columns,
    state: tableState,
    onSortingChange: setSorting,
    onColumnFiltersChange: onColumnFiltersChange,
    onGlobalFilterChange: onGlobalFilterChange,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onColumnOrderChange: setColumnOrder,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: paginationEnabled ? getPaginationRowModel() : undefined,
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    columnResizeMode: "onChange",
    enableSorting: sortingEnabled,
    enableMultiRowSelection: true,
    getRowId,
    initialState: tableInitialState,
    meta: {
      globalFilter,
      columnFilters,
    }
  });

  // Effect to adjust page size when pagination is disabled.
  React.useEffect(() => {
    if (!paginationEnabled) {
      table.setPageSize(data.length);
    } else {
      table.setPageSize(initialRowsPerPage);
    }
  }, [paginationEnabled, data.length, table, initialRowsPerPage]);
  
  // Effect to notify the parent component when the table instance is ready.
  React.useEffect(() => {
    if (onTableReady) {
        onTableReady(table);
    }
  }, [onTableReady, table]);

  // Effect to notify the parent component about changes in row selection.
  React.useEffect(() => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    onSelectedRowsChange(selectedRows.map(row => row.original));
  }, [rowSelection, onSelectedRowsChange, table]);

  const { rows } = table.getRowModel();

  // The TanStack Virtualizer instance for handling large datasets efficiently.
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 53, // Estimate row height for performance.
    overscan: 10, // Render a few extra items above and below the viewport.
  });

  return (
      <div className="data-table-container">
        <div style={{display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem'}}>
            <div>
                {tableTitle && <h2 style={{fontSize: '1.125rem', fontWeight: 600}}>{tableTitle}</h2>}
                {tableDescription && <p style={{fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem'}}>{tableDescription}</p>}
            </div>
            <div style={{fontSize: '0.875rem', color: '#6b7280', textAlign: 'right', flexShrink: 0, paddingTop: '0.25rem'}}>
                <span style={{fontWeight: 700, color: '#111827'}}>
                    {table.getFilteredRowModel().rows.length.toLocaleString()}
                </span>
                {" "}of{" "}
                <span style={{fontWeight: 700, color: '#111827'}}>
                    {data.length.toLocaleString()}
                </span>
                {" "}rows
            </div>
        </div>

        <DataTableToolbar 
          table={table} 
          filterableColumns={filterableColumns} 
          globalFilter={globalFilter} 
          onGlobalFilterChange={onGlobalFilterChange}
          onAddRow={onAddRow}
          onUpdateRow={onUpdateRow}
          isStreaming={isStreaming}
          onToggleStreaming={onToggleStreaming}
          onDeleteSelectedRows={onDeleteSelectedRows}
          onExportCsv={onExportCsv}
          onExportXlsx={onExportXlsx}
          onExportPdf={onExportPdf}
          sortingEnabled={sortingEnabled}
          onSortingToggle={setSortingEnabled}
          paginationEnabled={paginationEnabled}
          onPaginationToggle={setPaginationEnabled}
          showCharts={showCharts}
          onToggleCharts={onToggleCharts}
          toolbarVisibility={toolbarVisibility}
        />

        <div 
            className="data-table-wrapper"
        >
          <div
            ref={tableContainerRef}
            className="data-table-scroll-container"
            style={{
                maxHeight: paginationEnabled ? maxHeightWithPagination : maxHeightWithoutPagination,
            }}
          >
            <Table style={{ width: table.getTotalSize(), display: 'grid' }}>
              <TableHeader style={{ display: 'grid', position: 'sticky', top: 0, zIndex: 5, backgroundColor: '#f9fafb' }}>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow 
                    key={headerGroup.id} 
                    style={{display: 'flex', width: '100%'}}
                  >
                      {headerGroup.headers.map((header) => (
                        <TableHead 
                          key={header.id} 
                          colSpan={header.colSpan}
                          style={{ width: header.getSize(), display: 'flex', flexShrink: 0, minWidth: header.column.columnDef.minSize }}
                          onDrop={(e) => {
                            e.preventDefault();
                            const draggedColumnId = e.dataTransfer.getData('text/plain');
                            const targetColumnId = header.id;
                            if (draggedColumnId && targetColumnId && draggedColumnId !== targetColumnId) {
                                table.setColumnOrder(
                                    (old) => reorderColumn(draggedColumnId, targetColumnId, old)
                                );
                            }
                          }}
                          onDragOver={(e) => e.preventDefault()}
                        >
                           <div 
                              style={{flexGrow: 1, display: 'flex', alignItems: 'center', height: '100%', overflow: 'hidden'}}
                              draggable
                              onDragStart={(e) => {
                                e.dataTransfer.setData('text/plain', header.id);
                                e.stopPropagation();
                              }}
                            >
                              {header.isPlaceholder
                                ? null
                                : flexRender(
                                    header.column.columnDef.header,
                                    header.getContext()
                                  )}
                            </div>
                            {header.column.getCanResize() && (
                              <div
                                onMouseDown={header.getResizeHandler()}
                                onTouchStart={header.getResizeHandler()}
                                className={`dt-resizer ${header.column.getIsResizing() ? "is-resizing" : ""}`}
                              >
                                <MoreVertical className="h-4 w-4 text-gray-400" />
                              </div>
                            )}
                        </TableHead>
                      ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody 
                style={{ 
                    display: 'grid', 
                    height: rows.length > 0 ? `${rowVirtualizer.getTotalSize()}px` : '60px', 
                    position: 'relative' 
                }}
              >
                {rows.length > 0 ? (
                  rowVirtualizer.getVirtualItems().map(virtualRow => {
                    const row = rows[virtualRow.index];
                    return (
                        <TableRow
                            key={row.id}
                            data-state={row.getIsSelected() ? "selected" : ""}
                            onDoubleClick={() => onRowDoubleClick?.(row.original)}
                            onContextMenu={(e) => { 
                                e.preventDefault(); 
                                setContextMenu({
                                    x: e.clientX,
                                    y: e.clientY,
                                    row: row.original
                                });
                            }}
                            onMouseDown={(e) => {
                                const target = e.target as HTMLElement;
                                if (target.closest('[role="checkbox"]')) {
                                  return;
                                }
                                e.preventDefault(); // Prevent text selection
                                const rowIndex = virtualRow.index;
                                
                                setIsDragging(true);
                                setDragStartRowIndex(rowIndex);

                                if (e.shiftKey && lastClickedRowIndex.current !== null) {
                                    const start = Math.min(lastClickedRowIndex.current, rowIndex);
                                    const end = Math.max(lastClickedRowIndex.current, rowIndex);
                                    
                                    const newSelection: {[key: string]: boolean} = {}; 
                                    for(let i = start; i <= end; i++) {
                                        const rowId = rows[i]?.id;
                                        if (rowId) {
                                            newSelection[rowId] = true;
                                        }
                                    }
                                    table.setRowSelection(newSelection);
                                } else if (e.metaKey || e.ctrlKey) {
                                    const newSelection = { ...rowSelection };
                                    if ((newSelection as any)[row.id]) {
                                        delete (newSelection as any)[row.id];
                                    } else {
                                        (newSelection as any)[row.id] = true;
                                    }
                                    table.setRowSelection(newSelection);
                                    lastClickedRowIndex.current = rowIndex;
                                } else {
                                    table.setRowSelection({ [row.id]: true });
                                    lastClickedRowIndex.current = rowIndex;
                                }
                            }}
                            onMouseEnter={() => {
                                if (isDragging && dragStartRowIndex !== null) {
                                    const rowIndex = virtualRow.index;
                                    const start = Math.min(dragStartRowIndex, rowIndex);
                                    const end = Math.max(dragStartRowIndex, rowIndex);

                                    const newSelection: {[key: string]: boolean} = {}; 
                                    for(let i = start; i <= end; i++) {
                                        const rowId = rows[i]?.id;
                                        if (rowId) {
                                            newSelection[rowId] = true;
                                        }
                                    }
                                    table.setRowSelection(newSelection);
                                }
                            }}
                            style={{
                              display: 'flex',
                              position: 'absolute',
                              transform: `translateY(${virtualRow.start}px)`,
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: `${virtualRow.size}px`,
                              cursor: 'pointer'
                            }}
                          >
                            {row.getVisibleCells().map((cell) => (
                              <TableCell key={cell.id} style={{ display: 'flex', alignItems: 'center', width: cell.column.getSize(), flexShrink: 0, minWidth: cell.column.columnDef.minSize }}>
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                              </TableCell>
                            ))}
                        </TableRow>
                    )
                  })
                ) : (
                  <TableRow style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '60px' }}>
                    <TableCell>No results.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
        
        {paginationEnabled && (
          <div className="data-table-pagination-container">
            <div className="data-table-footer-info">
              {table.getFilteredSelectedRowModel().rows.length} of{" "}
              {table.getFilteredRowModel().rows.length} row(s) selected.
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: '2rem'}}>
              <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                <p style={{fontSize: '0.875rem', fontWeight: 500}}>Rows per page</p>
                <select
                  className="dt-select"
                  style={{width: '70px'}}
                  value={table.getState().pagination.pageSize}
                  onChange={e => {
                    table.setPageSize(Number(e.target.value))
                  }}
                >
                  {rowsPerPageOptions.map(pageSize => (
                    <option key={pageSize} value={pageSize}>
                      {pageSize}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{display: 'flex', width: '100px', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', fontWeight: 500}}>
                Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
              </div>
              <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                <button className="dt-button dt-button--outline dt-button--icon" style={{display: 'none'}} onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}><ChevronsLeft className="h-4 w-4" /></button>
                <button className="dt-button dt-button--outline dt-button--icon" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}><ChevronLeft className="h-4 w-4" /></button>
                <button className="dt-button dt-button--outline dt-button--icon" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}><ChevronRight className="h-4 w-4" /></button>
                <button className="dt-button dt-button--outline dt-button--icon" style={{display: 'none'}} onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()}><ChevronsRight className="h-4 w-4" /></button>
              </div>
            </div>
          </div>
        )}

        {!paginationEnabled && (
          <div className="data-table-pagination-container">
            <div className="data-table-footer-info">
              {table.getFilteredSelectedRowModel().rows.length} of{" "}
              {table.getFilteredRowModel().rows.length} row(s) selected.
            </div>
          </div>
        )}

        {contextMenu && contextMenuItems && contextMenuItems.length > 0 && (
            <div
                ref={contextMenuRef}
                className="dt-dropdown-content"
                style={{
                    display: 'block',
                    position: "fixed",
                    left: contextMenu.x,
                    top: contextMenu.y,
                }}
            >
                {contextMenuItems.map((item, index) => (
                    <React.Fragment key={index}>
                        <div className="dt-dropdown-item" onClick={() => { item.onClick(contextMenu.row); setContextMenu(null); }}>
                            {item.label}
                        </div>
                        {item.separator && <div className="dt-dropdown-separator" />}
                    </React.Fragment>
                ))}
            </div>
        )}
      </div>
  );
}
