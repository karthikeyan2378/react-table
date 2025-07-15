
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
  ChevronDown,
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
} from "lucide-react";
import { useVirtualizer } from '@tanstack/react-virtual';
import { highlightText } from '../lib/utils.tsx';
import './data-table.css';
import { alarmConfig, type Alarm } from "@/config/alarm-config";


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
 * The type definition for columns that can be used to generate charts.
 */
type ChartableColumn = keyof typeof alarmConfig.fields;

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
  const severityConfig = alarmConfig.fields.Severity.chartConfig;
  const severityColors = severityConfig?.colors || {};

  const handleFilterChange = (value: string, isSelected: boolean) => {
    const newSelectedValues = new Set(selectedValues);
    if (isSelected) {
      newSelectedValues.delete(value);
    } else {
      newSelectedValues.add(value);
    }
    const filterValues = Array.from(newSelectedValues);
    column?.setFilterValue(filterValues.length ? filterValues : undefined);
  };


  return (
    <div className="cygnet-dt-facet-filter-container">
        <div className={`cygnet-dt-dropdown ${isOpen ? 'open' : ''}`} ref={dropdownRef}>
        <button className="cygnet-dt-button cygnet-dt-button--outline" style={{ height: '2.25rem' }} onClick={() => setIsOpen(!isOpen)}>
            <PlusCircle style={{ marginRight: '0.5rem', height: '1rem', width: '1rem', color: 'hsl(var(--primary))' }} />
            {title}
        </button>
        <div className="cygnet-dt-dropdown-content">
            {options.map((option) => {
                const isSelected = selectedValues.has(option.value);
                return (
                <div
                    key={option.value}
                    className="cygnet-dt-dropdown-item"
                    onClick={() => handleFilterChange(option.value, isSelected)}
                >
                    <input type="checkbox" className="cygnet-dt-checkbox" readOnly checked={isSelected} />
                    <span>{highlightText(option.label, globalFilter)}</span>
                </div>
                );
            })}
            {selectedValues.size > 0 && (
                <>
                <div className="cygnet-dt-dropdown-separator" />
                <div
                    onClick={() => column?.setFilterValue(undefined)}
                    className="cygnet-dt-dropdown-item" style={{justifyContent: 'center'}}
                >
                    Clear filters
                </div>
                </>
            )}
            </div>
        </div>

        {Array.from(selectedValues).map(value => (
            <span
                key={value}
                className="cygnet-dt-badge cygnet-dt-badge--filter"
                style={{ backgroundColor: (severityColors as any)[value] || '#6B7280' }}
            >
                {value}
                <button
                    className="cygnet-dt-badge-remove"
                    onClick={() => handleFilterChange(value, true)}
                >
                    <X size={12} />
                </button>
            </span>
        ))}
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
    <div className="cygnet-dt-toolbar">
      {/* Left side: Filters */}
      <div className="cygnet-dt-toolbar-left">
          <div className="cygnet-dt-search-container">
              <Search className="cygnet-dt-search-icon" />
              <input
                placeholder="Search all columns..."
                value={globalFilter ?? ""}
                onChange={(event) => onGlobalFilterChange(event.target.value)}
                className="cygnet-dt-input with-icon"
              />
          </div>

        <div className={`cygnet-dt-dropdown ${isFilterOpen ? 'open' : ''}`} ref={filterDropdownRef}>
            <button className="cygnet-dt-button cygnet-dt-button--outline" onClick={() => setFilterOpen(!isFilterOpen)}>
              <Filter style={{ marginRight: '0.5rem', height: '1rem', width: '1rem', color: 'hsl(var(--primary))' }} />
              Add Filter
            </button>
            <div className="cygnet-dt-dropdown-content">
              <div className="cygnet-dt-dropdown-label">Filter by column</div>
              <div className="cygnet-dt-dropdown-separator" />
              {filterableColumns.map((col) => (
                <div
                    key={col.id}
                    className="cygnet-dt-dropdown-item"
                    onClick={() => handleFilterToggle(col.id, activeFilters.includes(col.id))}
                >
                  <input
                    type="checkbox"
                    className="cygnet-dt-checkbox"
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
              <div key={col.id} className="cygnet-dt-filter-container">
                <input
                  placeholder={`Filter ${col.name.toLowerCase()}...`}
                  value={
                    (table.getColumn(col.id)?.getFilterValue() as string) ?? ""
                  }
                  onChange={(event) => {
                    const value = event.target.value;
                    table.getColumn(col.id)?.setFilterValue(value || undefined);
                  }}
                  className="cygnet-dt-input with-button"
                />
                <button
                    className="cygnet-dt-button cygnet-dt-button--ghost cygnet-dt-button--icon cygnet-dt-input-button"
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
            <div className="cygnet-dt-tooltip-wrapper">
                <button
                onClick={clearAllFilters}
                className="cygnet-dt-button cygnet-dt-button--ghost cygnet-dt-button--icon"
                >
                <X className="h-4 w-4" />
                </button>
                <div className="cygnet-dt-tooltip-content">Clear all filters</div>
           </div>
        )}
      </div>

      {/* Right side: Actions & Settings */}
      <div className="cygnet-dt-toolbar-right">
          {toolbarVisibility.addRow !== false && onAddRow && (
            <div className="cygnet-dt-tooltip-wrapper">
                <button className="cygnet-dt-button cygnet-dt-button--ghost cygnet-dt-button--icon" onClick={onAddRow}>
                  <PlusCircle className="h-4 w-4" />
                </button>
                <div className="cygnet-dt-tooltip-content">Add Alarm</div>
            </div>
          )}

           {toolbarVisibility.updateRow !== false && onUpdateRow && (
             <div className="cygnet-dt-tooltip-wrapper">
                <button className="cygnet-dt-button cygnet-dt-button--ghost cygnet-dt-button--icon" onClick={onUpdateRow} disabled={selectedRowCount !== 1}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                </button>
                <div className="cygnet-dt-tooltip-content">Update Alarm</div>
            </div>
          )}

          {toolbarVisibility.toggleStreaming !== false && onToggleStreaming && (
            <div className="cygnet-dt-tooltip-wrapper">
                <button className="cygnet-dt-button cygnet-dt-button--ghost cygnet-dt-button--icon" onClick={onToggleStreaming}>
                  {isStreaming ? <Square className="h-4 w-4 text-red-500" /> : <Play className="h-4 w-4 text-green-500" />}
                </button>
                <div className="cygnet-dt-tooltip-content">{isStreaming ? 'Stop Streaming' : 'Start Streaming'}</div>
            </div>
          )}

          {toolbarVisibility.deleteRows !== false && onDeleteSelectedRows && (
            <div className="cygnet-dt-tooltip-wrapper">
                <button className="cygnet-dt-button cygnet-dt-button--ghost cygnet-dt-button--icon" onClick={onDeleteSelectedRows} disabled={selectedRowCount === 0}>
                  <Trash2 className="h-4 w-4" />
                </button>
                <div className="cygnet-dt-tooltip-content">Delete Selected</div>
            </div>
          )}

          {toolbarVisibility.toggleCharts !== false && (
             <div className="cygnet-dt-tooltip-wrapper">
                <button className="cygnet-dt-button cygnet-dt-button--ghost cygnet-dt-button--icon" onClick={() => onToggleCharts(!showCharts)}>
                  <PieChart className="h-4 w-4" style={{color: showCharts ? 'hsl(var(--primary))' : 'inherit'}} />
                </button>
                <div className="cygnet-dt-tooltip-content">{showCharts ? 'Hide Charts' : 'Show Charts'}</div>
            </div>
          )}
          
          {toolbarVisibility.exportData !== false && (onExportCsv || onExportXlsx || onExportPdf) && (
            <div className={`cygnet-dt-dropdown ${isExportOpen ? 'open' : ''}`} ref={exportDropdownRef}>
                <div className="cygnet-dt-tooltip-wrapper">
                    <button className="cygnet-dt-button cygnet-dt-button--ghost cygnet-dt-button--icon" onClick={() => setExportOpen(!isExportOpen)}>
                        <Download className="h-4 w-4" />
                    </button>
                    <div className="cygnet-dt-tooltip-content">Export Data</div>
                </div>
              <div className="cygnet-dt-dropdown-content">
                  {onExportCsv && <div className="cygnet-dt-dropdown-item" onClick={onExportCsv}><FileText style={{ marginRight: '0.5rem', height: '1rem', width: '1rem' }} />Export as CSV</div>}
                  {onExportXlsx && <div className="cygnet-dt-dropdown-item" onClick={onExportXlsx}><FileSpreadsheet style={{ marginRight: '0.5rem', height: '1rem', width: '1rem' }} />Export as Excel</div>}
                  {onExportPdf && <div className="cygnet-dt-dropdown-item" onClick={onExportPdf}><File style={{ marginRight: '0.5rem', height: '1rem', width: '1rem' }} />Export as PDF</div>}
              </div>
            </div>
          )}

          {toolbarVisibility.viewOptions !== false && (
            <div className={`cygnet-dt-dropdown ${isViewOptionsOpen ? 'open' : ''}`} ref={viewOptionsDropdownRef}>
                <div className="cygnet-dt-tooltip-wrapper">
                    <button className="cygnet-dt-button cygnet-dt-button--ghost cygnet-dt-button--icon" onClick={() => setViewOptionsOpen(!isViewOptionsOpen)}>
                        <SlidersHorizontal className="h-4 w-4" />
                    </button>
                    <div className="cygnet-dt-tooltip-content">View Options</div>
                </div>
              <div className="cygnet-dt-dropdown-content">
                <div className="cygnet-dt-dropdown-label">Table Settings</div>
                <div className="cygnet-dt-dropdown-separator" />
                {toolbarVisibility.toggleSorting !== false && (
                  <div className="cygnet-dt-dropdown-item" onClick={() => onSortingToggle(!sortingEnabled)}>
                      <input type="checkbox" className="cygnet-dt-checkbox" readOnly checked={sortingEnabled} />
                      Enable Sorting
                  </div>
                )}
                {toolbarVisibility.togglePagination !== false && (
                  <div className="cygnet-dt-dropdown-item" onClick={() => onPaginationToggle(!paginationEnabled)}>
                      <input type="checkbox" className="cygnet-dt-checkbox" readOnly checked={paginationEnabled} />
                      Enable Pagination
                  </div>
                )}
                {toolbarVisibility.toggleColumns !== false && (
                  <>
                    <div className="cygnet-dt-dropdown-separator" />
                    <div className="cygnet-dt-dropdown-label">Toggle Columns</div>
                    <div className="cygnet-dt-dropdown-separator" />
                    {table
                        .getAllColumns()
                        .filter((column) => column.getCanHide())
                        .map((column) => {
                            const label = column.id.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                            return (
                            <div
                                key={column.id}
                                className="cygnet-dt-dropdown-item"
                                onClick={() => column.toggleVisibility(!column.getIsVisible())}
                            >
                                <input type="checkbox" className="cygnet-dt-checkbox" readOnly checked={column.getIsVisible()} />
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
  const [dragSelectionStart, setDragSelectionStart] = React.useState({});

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
  
  // Logic for frozen columns
  const columnDefs = columns as ColumnDef<TData, any>[];
  const frozenColumnIds = React.useMemo(() => {
    const frozen = columnDefs.filter(c => {
        const key = c.id || c.accessorKey;
        if (key === 'select') return true;
        const config = alarmConfig.fields[key as keyof typeof alarmConfig.fields];
        return config?.isColumnToFreeze;
    }).map(c => c.id || c.accessorKey);
    // Ensure the order matches the current column order state
    return table.getState().columnOrder.filter(id => frozen.includes(id as string));
  }, [columnDefs, table.getState().columnOrder]);

  const getStickyStyles = (columnId: string): React.CSSProperties => {
    const isFrozen = frozenColumnIds.includes(columnId);
    if (!isFrozen) return {};

    const colIndex = frozenColumnIds.indexOf(columnId);
    const offset = frozenColumnIds.slice(0, colIndex).reduce((acc, id) => {
        const col = table.getColumn(id);
        return acc + (col?.getSize() || 0);
    }, 0);

    return {
        left: `${offset}px`,
    };
  };

  const frozenColumnsWidth = React.useMemo(() => {
    return frozenColumnIds.reduce((acc, id) => {
      const col = table.getColumn(id);
      return acc + (col?.getSize() || 0);
    }, 0);
  }, [frozenColumnIds, table.getAllColumns()]);


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
    estimateSize: () => 41, // Estimate row height for performance.
    overscan: 10, // Render a few extra items above and below the viewport.
  });

  return (
      <div className="cygnet-dt-container">
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
            className="cygnet-dt-wrapper"
        >
          <div
            ref={tableContainerRef}
            className="cygnet-dt-scroll-container"
            style={{
                maxHeight: paginationEnabled ? maxHeightWithPagination : maxHeightWithoutPagination,
                paddingLeft: `${frozenColumnsWidth}px`,
                marginLeft: `-${frozenColumnsWidth}px`
            }}
          >
            <div style={{ width: '100%', position: 'relative' }}>
              <div style={{ position: 'sticky', top: 0, zIndex: 5, backgroundColor: '#f9fafb' }}>
                <div 
                  className="cygnet-dt-header-row"
                >
                    {table.getHeaderGroups().map((headerGroup) => (
                        <React.Fragment key={headerGroup.id}>
                          {headerGroup.headers.map((header) => {
                            const isFrozen = frozenColumnIds.includes(header.id);
                            const isLastFrozen = isFrozen && frozenColumnIds.indexOf(header.id) === frozenColumnIds.length - 1;
                            const headerClasses = [
                              'cygnet-dt-cell-common',
                              isFrozen ? 'cygnet-dt-header-cell--sticky' : '',
                              isLastFrozen ? 'cygnet-dt-header-cell--sticky-last' : ''
                            ].join(' ').trim();
                            
                            return (
                            <div 
                              key={header.id} 
                              className={headerClasses}
                              style={{ 
                                width: header.getSize(), 
                                minWidth: header.column.columnDef.minSize,
                                ...getStickyStyles(header.id) 
                              }}
                              onDrop={(e) => {
                                e.preventDefault();
                                const draggedColumnId = e.dataTransfer.getData('text/plain');
                                const targetColumnId = header.id;
                                
                                const isDraggedFrozen = frozenColumnIds.includes(draggedColumnId);
                                const isTargetFrozen = frozenColumnIds.includes(targetColumnId);

                                if (draggedColumnId && targetColumnId && draggedColumnId !== targetColumnId) {
                                    // Only allow reordering if both columns are in the same frozen state
                                    if (isDraggedFrozen === isTargetFrozen) {
                                        table.setColumnOrder(
                                            (old) => reorderColumn(draggedColumnId, targetColumnId, old)
                                        );
                                    }
                                }
                              }}
                              onDragOver={(e) => e.preventDefault()}
                            >
                               <div 
                                  className="cygnet-dt-header-content"
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
                                    className={`cygnet-dt-resizer ${header.column.getIsResizing() ? "is-resizing" : ""}`}
                                  >
                                    <MoreVertical className="lucide" />
                                  </div>
                                )}
                            </div>
                          )})}
                        </React.Fragment>
                    ))}
                </div>
              </div>
              <div 
                style={{ 
                    height: rows.length > 0 ? `${rowVirtualizer.getTotalSize()}px` : '60px', 
                    position: 'relative' 
                }}
              >
                {rows.length > 0 ? (
                  rowVirtualizer.getVirtualItems().map(virtualRow => {
                    const row = rows[virtualRow.index];
                    const rowIsSelected = row.getIsSelected();
                    return (
                        <div
                            key={row.id}
                            className="cygnet-dt-table-row"
                            data-state={rowIsSelected ? "selected" : ""}
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
                                setDragSelectionStart(rowSelection); // Store selection at drag start

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

                                    const newSelection: {[key: string]: boolean} = {...dragSelectionStart}; 
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
                              position: 'absolute',
                              transform: `translateY(${virtualRow.start}px)`,
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: `${virtualRow.size}px`,
                              cursor: 'pointer'
                            }}
                          >
                            {row.getVisibleCells().map((cell) => {
                                const isFrozen = frozenColumnIds.includes(cell.column.id);
                                const isLastFrozen = isFrozen && frozenColumnIds.indexOf(cell.column.id) === frozenColumnIds.length - 1;
                                const cellClasses = [
                                  'cygnet-dt-cell-common',
                                  'cygnet-dt-table-cell',
                                  isFrozen ? 'cygnet-dt-table-cell--sticky' : '',
                                  isLastFrozen ? 'cygnet-dt-table-cell--sticky-last' : ''
                                ].join(' ').trim();

                                return (
                                  <div 
                                    key={cell.id} 
                                    className={cellClasses}
                                    style={{ 
                                      width: cell.column.getSize(), 
                                      minWidth: cell.column.columnDef.minSize,
                                      ...getStickyStyles(cell.column.id)
                                    }}
                                  >
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                  </div>
                                );
                            })}
                        </div>
                    )
                  })
                ) : (
                  <div className="cygnet-dt-no-results">
                    No results.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {paginationEnabled && (
          <div className="cygnet-dt-pagination-container">
            <div className="cygnet-dt-footer-info">
              {table.getFilteredSelectedRowModel().rows.length} of{" "}
              {table.getFilteredRowModel().rows.length} row(s) selected.
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: '2rem'}}>
              <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                <p style={{fontSize: '0.875rem', fontWeight: 500}}>Rows per page</p>
                <select
                  className="cygnet-dt-select"
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
                <button className="cygnet-dt-button cygnet-dt-button--outline cygnet-dt-button--icon" onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}><ChevronsLeft className="h-4 w-4" /></button>
                <button className="cygnet-dt-button cygnet-dt-button--outline cygnet-dt-button--icon" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}><ChevronLeft className="h-4 w-4" /></button>
                <button className="cygnet-dt-button cygnet-dt-button--outline cygnet-dt-button--icon" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}><ChevronRight className="h-4 w-4" /></button>
                <button className="cygnet-dt-button cygnet-dt-button--outline cygnet-dt-button--icon" onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()}><ChevronsRight className="h-4 w-4" /></button>
              </div>
            </div>
          </div>
        )}

        {!paginationEnabled && (
          <div className="cygnet-dt-pagination-container">
            <div className="cygnet-dt-footer-info">
              {table.getFilteredSelectedRowModel().rows.length} of{" "}
              {table.getFilteredRowModel().rows.length} row(s) selected.
            </div>
          </div>
        )}

        {contextMenu && contextMenuItems && contextMenuItems.length > 0 && (
            <div
                ref={contextMenuRef}
                className="cygnet-dt-dropdown-content"
                style={{
                    display: 'block',
                    position: "fixed",
                    left: contextMenu.x,
                    top: contextMenu.y,
                }}
            >
                {contextMenuItems.map((item, index) => (
                    <React.Fragment key={index}>
                        <div className="cygnet-dt-dropdown-item" onClick={() => { item.onClick(contextMenu.row); setContextMenu(null); }}>
                            {item.label}
                        </div>
                        {item.separator && <div className="cygnet-dt-dropdown-separator" />}
                    </React.Fragment>
                ))}
            </div>
        )}
      </div>
  );
}
