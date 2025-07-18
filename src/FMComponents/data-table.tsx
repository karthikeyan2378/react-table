
'use client';

import * as React from "react";
import { highlightText } from '../lib/utils.tsx';
import './data-table.css';
import { useDropdown } from "@/hooks/use-dropdown.ts";
import type { Alarm } from "@/config/alarm-config.ts";
import type { ColumnDef, ColumnFiltersState, SortingState } from "@/app/types.ts";
import { useVirtualizer } from "@/hooks/use-virtualizer.ts";

/** Reusable Icons as Components **/
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>;
const FilterIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.5rem', color: 'hsl(var(--primary))' }}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>;
const PlusCircleIcon = ({ color = 'hsl(var(--primary))' }: {color?: string}) => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.5rem', color }}><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>;
const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="M6 6l12 12"/></svg>;
const PlusCircleToolbarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>;
const PlayIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="green" stroke="green" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>;
const StopIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="red" stroke="red" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>;
const PieChartIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>;
const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>;
const CsvIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.5rem' }}><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 12.5a.5.5 0 0 0-1 0v1a.5.5 0 0 0 1 0v-1Z"/><path d="M12 18H9.5a.5.5 0 0 1 0-1H12"/><path d="M9.5 12.5a.5.5 0 0 1 0-1H12v6"/><path d="m14 18 2-3-2-3"/></svg>;
const ExcelIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.5rem' }}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="m16 13-3 5-3-5"/></svg>;
const PdfIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.5rem' }}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M9 15v-2.5a2.5 2.5 0 0 1 5 0V15"/><path d="M12 18h-2.5a2.5 2.5 0 0 1 0-5H12"/></svg>;
const SettingsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2l-.15.08a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1 0-2l.15.08a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>;
const PageFirstIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m11 17-5-5 5-5"/><path d="m18 17-5-5 5-5"/></svg>;
const PagePrevIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>;
const PageNextIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>;
const PageLastIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 17 5-5-5-5"/><path d="m13 17 5-5-5-5"/></svg>;

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
 * A generic faceted filter component for categorical data.
 */
function DataTableFacetedFilter<TData>({
  columnId,
  title,
  options,
  onRemove,
  globalFilter,
  selectedValues,
  onFilterChange,
}: {
  columnId: string;
  title?: string;
  options: {
    label: string;
    value: string;
  }[];
  onRemove: () => void;
  globalFilter?: string;
  selectedValues: Set<string>;
  onFilterChange: (value: string, isSelected: boolean) => void;
}) {
  const { dropdownRef, isOpen, setIsOpen } = useDropdown();

  return (
    <div className="cygnet-dt-facet-filter-container">
        <div ref={dropdownRef} className="cygnet-dt-dropdown-container">
            <button className="cygnet-dt-button cygnet-dt-button--outline" onClick={() => setIsOpen(!isOpen)}>
                <PlusCircleIcon />
                {title}
            </button>
            {isOpen && (
                <div className="cygnet-dt-dropdown-content" style={{right: 'auto', left: 0}}>
                    {options.map((option) => {
                        const isSelected = selectedValues.has(option.value);
                        return (
                        <label key={option.value} className="cygnet-dt-dropdown-item cygnet-dt-dropdown-item--checkbox">
                            <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => onFilterChange(option.value, isSelected)}
                            />
                            {highlightText(option.label, globalFilter)}
                        </label>
                        );
                    })}
                    {selectedValues.size > 0 && (
                        <>
                        <div className="cygnet-dt-dropdown-separator" />
                        <button
                            onClick={() => {
                                selectedValues.forEach(value => onFilterChange(value, true));
                                setIsOpen(false);
                            }}
                            className="cygnet-dt-dropdown-item justify-center"
                        >
                            Clear filters
                        </button>
                        </>
                    )}
                </div>
            )}
        </div>

        {Array.from(selectedValues).map(value => (
            <span
                key={value}
                className="cygnet-dt-badge cygnet-dt-badge--filter"
                style={{ backgroundColor: '#6B7280' }}
            >
                {value}
                <button
                    className="cygnet-dt-badge-remove"
                    onClick={() => onFilterChange(value, true)}
                >
                    <XIcon />
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
 */
interface DataTableToolbarProps<TData> {
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
  columnFilters: ColumnFiltersState;
  onColumnFiltersChange: React.Dispatch<React.SetStateAction<ColumnFiltersState>>;
  columnVisibility: { [key: string]: boolean };
  onColumnVisibilityChange: (columnId: string, isVisible: boolean) => void;
  allColumns: ColumnDef<TData>[];
  selectedRowCount: number;
}

/**
 * The toolbar component for the DataTable.
 */
function DataTableToolbar<TData>({ 
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
  columnFilters,
  onColumnFiltersChange,
  columnVisibility,
  onColumnVisibilityChange,
  allColumns,
  selectedRowCount,
}: DataTableToolbarProps<TData>) {
  const isFiltered = columnFilters.length > 0 || !!globalFilter;
  const [activeFilters, setActiveFilters] = React.useState<string[]>([]);
  
  const { dropdownRef: addFilterRef, isOpen: isAddFilterOpen, setIsOpen: setIsAddFilterOpen } = useDropdown();
  const { dropdownRef: exportRef, isOpen: isExportOpen, setIsOpen: setIsExportOpen } = useDropdown();
  const { dropdownRef: viewOptionsRef, isOpen: isViewOptionsOpen, setIsOpen: setIsViewOptionsOpen } = useDropdown();

  const handleFilterToggle = (columnId: string, isActive?: boolean) => {
    if (isActive) {
       setActiveFilters((prev) => prev.filter((id) => id !== columnId));
       onColumnFiltersChange(prev => prev.filter(f => f.id !== columnId));
    } else {
       setActiveFilters((prev) => [...prev, columnId]);
    }
  };
  
  const clearAllFilters = () => {
    onColumnFiltersChange([]);
    onGlobalFilterChange("");
    setActiveFilters([]);
  };

  const textFilterColumns = filterableColumns.filter(col => col.type === 'text');
  const categoricalFilterColumns = filterableColumns.filter(col => col.type === 'categorical');

  const handleCategoricalFilterChange = (columnId: string, value: string, isSelected: boolean) => {
    onColumnFiltersChange(prev => {
        const otherFilters = prev.filter(f => f.id !== columnId);
        const existingFilter = prev.find(f => f.id === columnId);
        const currentValues = new Set((existingFilter?.value as string[]) || []);

        if (isSelected) {
            currentValues.delete(value);
        } else {
            currentValues.add(value);
        }

        if (currentValues.size === 0) {
            return otherFilters;
        }

        return [...otherFilters, { id: columnId, value: Array.from(currentValues) }];
    });
  };

  return (
    <div className="cygnet-dt-toolbar">
      {/* Left side: Filters */}
      <div className="cygnet-dt-toolbar-left">
          <div className="cygnet-dt-search-container">
              <div className="cygnet-dt-search-icon"><SearchIcon /></div>
              <input
                placeholder="Search all columns..."
                value={globalFilter ?? ""}
                onChange={(event) => onGlobalFilterChange(event.target.value)}
                className="cygnet-dt-input with-icon"
              />
          </div>
          
          <div ref={addFilterRef} className="cygnet-dt-dropdown-container">
            <button className="cygnet-dt-button cygnet-dt-button--outline" onClick={() => setIsAddFilterOpen(!isAddFilterOpen)}>
                <FilterIcon />
                Add Filter
            </button>
            {isAddFilterOpen && (
                <div className="cygnet-dt-dropdown-content" style={{right: 'auto', left: 0}}>
                    <div className="cygnet-dt-dropdown-label">Filter by column</div>
                    <div className="cygnet-dt-dropdown-separator" />
                    {filterableColumns.map((col) => (
                        <label key={col.id} className="cygnet-dt-dropdown-item cygnet-dt-dropdown-item--checkbox">
                            <input
                                type="checkbox"
                                checked={activeFilters.includes(col.id)}
                                onChange={() => handleFilterToggle(col.id, activeFilters.includes(col.id))}
                            />
                            {highlightText(col.name, globalFilter)}
                        </label>
                    ))}
                </div>
            )}
        </div>

        {textFilterColumns.map((col) => {
          if (activeFilters.includes(col.id)) {
            return (
              <div key={col.id} className="cygnet-dt-filter-container">
                <input
                  placeholder={`Filter ${col.name.toLowerCase()}...`}
                  value={(columnFilters.find(f => f.id === col.id)?.value as string) ?? ""}
                  onChange={(event) => {
                    const value = event.target.value;
                    onColumnFiltersChange(prev => {
                        const other = prev.filter(f => f.id !== col.id);
                        return value ? [...other, {id: col.id, value}] : other;
                    })
                  }}
                  className="cygnet-dt-input with-button"
                />
                <button
                    className="cygnet-dt-button cygnet-dt-button--ghost cygnet-dt-button--icon cygnet-dt-input-button"
                    onClick={() => handleFilterToggle(col.id, true)}
                >
                    <XIcon />
                </button>
              </div>
            );
          }
          return null;
        })}

        {categoricalFilterColumns.map(col => {
          if (activeFilters.includes(col.id) && col.options) {
            const selectedValues = new Set((columnFilters.find(f => f.id === col.id)?.value as string[]) || []);
            return (
              <DataTableFacetedFilter
                key={col.id}
                columnId={col.id}
                title={col.name}
                options={col.options}
                onRemove={() => handleFilterToggle(col.id, true)}
                globalFilter={globalFilter}
                selectedValues={selectedValues}
                onFilterChange={handleCategoricalFilterChange.bind(null, col.id)}
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
                  <XIcon />
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
                  <PlusCircleToolbarIcon />
                </button>
                <div className="cygnet-dt-tooltip-content">Add Alarm</div>
            </div>
          )}

           {toolbarVisibility.updateRow !== false && onUpdateRow && (
             <div className="cygnet-dt-tooltip-wrapper">
                <button className="cygnet-dt-button cygnet-dt-button--ghost cygnet-dt-button--icon" onClick={onUpdateRow} disabled={selectedRowCount !== 1}>
                  <EditIcon />
                </button>
                <div className="cygnet-dt-tooltip-content">Update Alarm</div>
            </div>
          )}

          {toolbarVisibility.toggleStreaming !== false && onToggleStreaming && (
            <div className="cygnet-dt-tooltip-wrapper">
                <button className="cygnet-dt-button cygnet-dt-button--ghost cygnet-dt-button--icon" onClick={onToggleStreaming}>
                  {isStreaming ? <StopIcon /> : <PlayIcon />}
                </button>
                <div className="cygnet-dt-tooltip-content">{isStreaming ? 'Stop Streaming' : 'Start Streaming'}</div>
            </div>
          )}

          {toolbarVisibility.deleteRows !== false && onDeleteSelectedRows && (
            <div className="cygnet-dt-tooltip-wrapper">
                <button className="cygnet-dt-button cygnet-dt-button--ghost cygnet-dt-button--icon" onClick={onDeleteSelectedRows} disabled={selectedRowCount === 0}>
                  <TrashIcon />
                </button>
                <div className="cygnet-dt-tooltip-content">Delete Selected</div>
            </div>
          )}

          {toolbarVisibility.toggleCharts !== false && (
             <div className="cygnet-dt-tooltip-wrapper">
                <button className="cygnet-dt-button cygnet-dt-button--ghost cygnet-dt-button--icon" onClick={() => onToggleCharts(!showCharts)}>
                  <PieChartIcon />
                </button>
                <div className="cygnet-dt-tooltip-content">{showCharts ? 'Hide Charts' : 'Show Charts'}</div>
            </div>
          )}
          
          {toolbarVisibility.exportData !== false && (onExportCsv || onExportXlsx || onExportPdf) && (
             <div ref={exportRef} className="cygnet-dt-dropdown-container">
                <button className="cygnet-dt-button cygnet-dt-button--ghost cygnet-dt-button--icon" onClick={() => setIsExportOpen(!isExportOpen)}>
                  <DownloadIcon />
                </button>
                {isExportOpen && (
                    <div className="cygnet-dt-dropdown-content">
                        {onExportCsv && <button onClick={() => { onExportCsv(); setIsExportOpen(false); }} className="cygnet-dt-dropdown-item"><CsvIcon />Export as CSV</button>}
                        {onExportXlsx && <button onClick={() => { onExportXlsx(); setIsExportOpen(false); }} className="cygnet-dt-dropdown-item"><ExcelIcon />Export as XLSX</button>}
                        {onExportPdf && <button onClick={() => { onExportPdf(); setIsExportOpen(false); }} className="cygnet-dt-dropdown-item"><PdfIcon />Export as PDF</button>}
                    </div>
                )}
            </div>
          )}

          {toolbarVisibility.viewOptions !== false && (
             <div ref={viewOptionsRef} className="cygnet-dt-dropdown-container">
                <button className="cygnet-dt-button cygnet-dt-button--ghost cygnet-dt-button--icon" onClick={() => setIsViewOptionsOpen(!isViewOptionsOpen)}>
                    <SettingsIcon />
                </button>
                {isViewOptionsOpen && (
                    <div className="cygnet-dt-dropdown-content">
                        <div className="cygnet-dt-dropdown-label">Table Settings</div>
                        <div className="cygnet-dt-dropdown-separator" />
                        {toolbarVisibility.toggleSorting !== false && (
                            <label className="cygnet-dt-dropdown-item cygnet-dt-dropdown-item--checkbox">
                                <input type="checkbox" checked={sortingEnabled} onChange={(e) => onSortingToggle(e.target.checked)} />
                                Enable Sorting
                            </label>
                        )}
                        {toolbarVisibility.togglePagination !== false && (
                            <label className="cygnet-dt-dropdown-item cygnet-dt-dropdown-item--checkbox">
                                <input type="checkbox" checked={paginationEnabled} onChange={(e) => onPaginationToggle(e.target.checked)} />
                                Enable Pagination
                            </label>
                        )}
                        {toolbarVisibility.toggleColumns !== false && (
                            <>
                            <div className="cygnet-dt-dropdown-separator" />
                            <div className="cygnet-dt-dropdown-label">Toggle Columns</div>
                            <div className="cygnet-dt-dropdown-separator" />
                            {allColumns
                                .filter((column) => column.accessorKey !== 'select')
                                .map((column) => {
                                    return (
                                        <label key={column.id} className="cygnet-dt-dropdown-item cygnet-dt-dropdown-item--checkbox">
                                            <input
                                                type="checkbox"
                                                checked={columnVisibility[column.id] !== false}
                                                onChange={(e) => onColumnVisibilityChange(column.id, !!e.target.checked)}
                                            />
                                            {column.id.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                        </label>
                                    );
                            })}
                            </>
                        )}
                    </div>
                )}
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
  initialColumnVisibility?: { [key: string]: boolean };
  initialSorting?: SortingState[];
  globalFilter: string;
  onGlobalFilterChange: (value: string) => void;
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
  onToggleCharts: (enabled: boolean) => void;
  frozenColumns: string[];
}

/**
 * The generic and highly configurable DataTable component, built from scratch.
 */
export function DataTable<TData extends { [key: string]: any }>({
  data,
  columns: initialColumns,
  getRowId,
  onSelectedRowsChange,
  contextMenuItems,
  onRowDoubleClick,
  filterableColumns = [],
  initialColumnVisibility = {},
  initialSorting = [],
  globalFilter,
  onGlobalFilterChange,
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
  frozenColumns,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = React.useState<SortingState | undefined>(initialSorting[0]);
  const [columnVisibility, setColumnVisibility] = React.useState<{ [key: string]: boolean }>(() => {
    const initial = { ...initialColumnVisibility };
    initialColumns.forEach(c => {
        if (initial[c.id] === undefined) {
            initial[c.id] = true;
        }
    });
    return initial;
  });
  const [selectedRowIds, setSelectedRowIds] = React.useState<Set<string>>(new Set());
  const { dropdownRef: contextMenuRef, isOpen: isContextMenuOpen, setIsOpen: setIsContextMenuOpen, position: contextMenuPosition, setPosition: setContextMenuPosition } = useDropdown();

  const [paginationEnabled, setPaginationEnabled] = React.useState(true);
  const [sortingEnabled, setSortingEnabled] = React.useState(true);
  
  const [columnOrder, setColumnOrder] = React.useState<string[]>(() => initialColumns.map(c => c.id));
  const [columnSizes, setColumnSizes] = React.useState<Record<string, number>>(() => {
    const sizes: Record<string, number> = {};
    initialColumns.forEach(c => {
        sizes[c.id] = c.size || 150;
    });
    return sizes;
  });

  const [isDragging, setIsDragging] = React.useState(false);
  const [dragStartRowIndex, setDragStartRowIndex] = React.useState<number | null>(null);
  const lastClickedRowIndex = React.useRef<number | null>(null);
  const [dragSelectionStart, setDragSelectionStart] = React.useState<Set<string>>(new Set());
  const [contextMenuRow, setContextMenuRow] = React.useState<TData | null>(null);

  const [currentPage, setCurrentPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(initialRowsPerPage);

  const columns = React.useMemo(() => {
    return columnOrder.map(colId => initialColumns.find(c => c.id === colId)!).filter(Boolean);
  }, [columnOrder, initialColumns]);

  const visibleColumns = React.useMemo(() => {
      return columns.filter(c => columnVisibility[c.id] !== false);
  }, [columns, columnVisibility]);

  const filteredData = React.useMemo(() => {
    let filtered = [...data];

    // Global filter
    if (globalFilter) {
      const lowerGlobalFilter = globalFilter.toLowerCase();
      filtered = filtered.filter(row => 
        Object.values(row).some(val => String(val).toLowerCase().includes(lowerGlobalFilter))
      );
    }

    // Column filters
    if (columnFilters.length > 0) {
        columnFilters.forEach(filter => {
            filtered = filtered.filter(row => {
                const rowValue = row[filter.id];
                if (Array.isArray(filter.value)) {
                    return filter.value.includes(rowValue);
                }
                return String(rowValue).toLowerCase().includes(String(filter.value).toLowerCase());
            });
        });
    }

    return filtered;
  }, [data, globalFilter, columnFilters]);

  const sortedData = React.useMemo(() => {
    if (!sorting || !sortingEnabled) return filteredData;
    const { columnId, direction } = sorting;
    return [...filteredData].sort((a, b) => {
      const aVal = a[columnId];
      const bVal = b[columnId];
      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sorting, sortingEnabled]);

  const paginatedData = React.useMemo(() => {
    if (!paginationEnabled) return sortedData;
    const start = currentPage * rowsPerPage;
    const end = start + rowsPerPage;
    return sortedData.slice(start, end);
  }, [sortedData, currentPage, rowsPerPage, paginationEnabled]);
  
  const pageCount = paginationEnabled ? Math.ceil(sortedData.length / rowsPerPage) : 1;

  const dataToRender = paginationEnabled ? paginatedData : sortedData;

  const getScrollElement = React.useCallback(() => tableContainerRef.current, [tableContainerRef]);
  const estimateSize = React.useCallback(() => 41, []);

  const rowVirtualizer = useVirtualizer({
      count: dataToRender.length,
      getScrollElement: getScrollElement,
      estimateSize: estimateSize,
  });
  
  React.useEffect(() => {
    if (currentPage >= pageCount) {
        setCurrentPage(Math.max(0, pageCount - 1));
    }
  }, [pageCount, currentPage]);

  const handleSort = (columnId: string) => {
    if (!sortingEnabled) return;
    setSorting(prev => {
        if (prev?.columnId === columnId) {
            if (prev.direction === 'asc') return { columnId, direction: 'desc' };
            return undefined;
        }
        return { columnId, direction: 'asc' };
    });
  };
  
  const updateSelectedRows = React.useCallback((newSelectedIds: Set<string>) => {
    setSelectedRowIds(newSelectedIds);
    const selected = Array.from(newSelectedIds)
      .map(id => data.find(row => getRowId(row) === id))
      .filter(Boolean) as TData[];
    onSelectedRowsChange(selected);
  }, [data, getRowId, onSelectedRowsChange]);

  const handleToggleRowSelected = (row: TData, isSelected: boolean) => {
    const newSet = new Set(selectedRowIds);
    const rowId = getRowId(row);
    if (isSelected) newSet.add(rowId);
    else newSet.delete(rowId);
    updateSelectedRows(newSet);
  };
  
  const handleRowClick = (rowIndex: number, e: React.MouseEvent) => {
    if (rowIndex >= dataToRender.length) return;
    const row = dataToRender[rowIndex];
    const rowId = getRowId(row);
    let newSelectedIds: Set<string>;

    if (e.metaKey || e.ctrlKey) {
        newSelectedIds = new Set(selectedRowIds);
        if (newSelectedIds.has(rowId)) newSelectedIds.delete(rowId);
        else newSelectedIds.add(rowId);
    } else if (e.shiftKey && lastClickedRowIndex.current !== null) {
        const start = Math.min(lastClickedRowIndex.current, rowIndex);
        const end = Math.max(lastClickedRowIndex.current, rowIndex);
        const rangeIds = dataToRender.slice(start, end + 1).map(getRowId);
        newSelectedIds = new Set([...selectedRowIds, ...rangeIds]);
    } else {
        newSelectedIds = new Set([rowId]);
    }
    updateSelectedRows(newSelectedIds);
    lastClickedRowIndex.current = rowIndex;
  };

  const handleMouseDownOnRow = (rowIndex: number) => {
    if (rowIndex >= dataToRender.length) return;
    setIsDragging(true);
    setDragStartRowIndex(rowIndex);
    const startRowId = getRowId(dataToRender[rowIndex]);
    setDragSelectionStart(new Set([startRowId]));
  };

  const handleMouseEnterRow = (rowIndex: number) => {
      if (!isDragging || dragStartRowIndex === null || rowIndex >= dataToRender.length) return;
      
      const newSelectedIds = new Set(dragSelectionStart);
      const start = Math.min(dragStartRowIndex, rowIndex);
      const end = Math.max(dragStartRowIndex, rowIndex);

      for (let i = start; i <= end; i++) {
          newSelectedIds.add(getRowId(dataToRender[i]));
      }
      updateSelectedRows(newSelectedIds);
  };
  
  React.useEffect(() => {
    const handleMouseUp = () => {
      setIsDragging(false);
      setDragStartRowIndex(null);
    };

    if (isDragging) {
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);


  const handleToggleAllRowsSelected = (isSelected: boolean) => {
    const allRowIds = isSelected ? new Set(dataToRender.map(getRowId)) : new Set<string>();
    updateSelectedRows(allRowIds);
  };

  const handleResize = (columnId: string, startX: number) => {
    const startWidth = columnSizes[columnId] || 150;
    
    const handleMouseMove = (e: MouseEvent) => {
        const newWidth = startWidth + (e.clientX - startX);
        setColumnSizes(prev => ({ ...prev, [columnId]: Math.max(newWidth, 50) }));
    };

    const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
    };

    document.body.style.cursor = 'col-resize';
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleColumnVisibilityChange = (columnId: string, isVisible: boolean) => {
    setColumnVisibility(prev => ({...prev, [columnId]: isVisible}));
  };
  
  const totalWidth = React.useMemo(() => visibleColumns.reduce((sum, col) => sum + (columnSizes[col.id] || 150), 0), [visibleColumns, columnSizes]);
  const frozenColumnOffsets = React.useMemo(() => {
    const offsets: { [key: string]: number } = {};
    let runningTotal = 0;
    visibleColumns.forEach(col => {
      if (frozenColumns.includes(col.id)) {
        offsets[col.id] = runningTotal;
        runningTotal += columnSizes[col.id] || col.size || 150;
      }
    });
    return offsets;
  }, [visibleColumns, frozenColumns, columnSizes]);
  

  return (
      <div className="cygnet-dt-container">
        {tableTitle && (
            <div className="cygnet-dt-header">
                <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>{tableTitle}</h2>
                {tableDescription && <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>{tableDescription}</p>}
            </div>
        )}
        
        <DataTableToolbar 
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
          columnFilters={columnFilters}
          onColumnFiltersChange={onColumnFiltersChange}
          columnVisibility={columnVisibility}
          onColumnVisibilityChange={handleColumnVisibilityChange}
          allColumns={initialColumns}
          selectedRowCount={selectedRowIds.size}
        />

        <div className="cygnet-dt-wrapper">
          <div
            ref={tableContainerRef}
            className="cygnet-dt-scroll-container"
            style={{
                maxHeight: paginationEnabled ? maxHeightWithPagination : maxHeightWithoutPagination,
            }}
          >
            <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, width: totalWidth, position: 'relative' }}>
              <div 
                style={{ 
                  position: 'sticky', 
                  top: 0, 
                  zIndex: 25, 
                  backgroundColor: '#f9fafb',
                  width: '100%'
                }}
              >
                      <div
                        className="cygnet-dt-header-row"
                        style={{ width: totalWidth }}
                      >
                        {visibleColumns.map((header) => {
                           const isFrozen = frozenColumns.includes(header.id);
                           const isLastFrozen = isFrozen && frozenColumns.indexOf(header.id) === frozenColumns.length - 1;
                           const stickyClasses = isFrozen ? `cygnet-dt-header-cell--sticky ${isLastFrozen ? 'cygnet-dt-header-cell--sticky-last' : ''}` : '';

                           return (
                           <div 
                             key={header.id} 
                             className={`cygnet-dt-cell-common ${stickyClasses}`}
                             style={{ 
                               width: columnSizes[header.id] || 150, 
                               minWidth: header.minSize,
                               left: isFrozen ? frozenColumnOffsets[header.id] : undefined,
                             }}
                             onDragOver={(e) => e.preventDefault()}
                             onDrop={(e) => {
                                 e.preventDefault();
                                 const draggedColumnId = e.dataTransfer.getData('text/plain');
                                 const targetColumnId = header.id;

                                 if (draggedColumnId && targetColumnId && draggedColumnId !== targetColumnId) {
                                     const isDraggedFrozen = frozenColumns.includes(draggedColumnId);
                                     const isTargetFrozen = frozenColumns.includes(targetColumnId);
                                     if (isDraggedFrozen === isTargetFrozen) {
                                         setColumnOrder(old => reorderColumn(draggedColumnId, targetColumnId, old));
                                     }
                                 }
                             }}
                           >
                              <div className="cygnet-dt-header-content">
                                 {header.header({
                                     column: header, 
                                     onSort: handleSort,
                                     sortState: sorting,
                                     isAllRowsSelected: selectedRowIds.size > 0 && selectedRowIds.size === dataToRender.length,
                                     onToggleAllRowsSelected: handleToggleAllRowsSelected
                                 })}
                               </div>
                               <div
                                  onMouseDown={(e) => { e.preventDefault(); handleResize(header.id, e.clientX); }}
                                  className="cygnet-dt-resizer"
                               >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
                               </div>
                           </div>
                         )})}
                      </div>
              </div>

              {rowVirtualizer.getVirtualItems().length > 0 ? (
                rowVirtualizer.getVirtualItems().map(virtualRow => {
                  const row = dataToRender[virtualRow.index];
                  if (!row) {
                    return null;
                  }
                  const rowId = getRowId(row);
                  const rowIsSelected = selectedRowIds.has(rowId);
                  return (
                      <div
                          key={rowId}
                          className="cygnet-dt-table-row"
                          data-index={virtualRow.index}
                          data-state={rowIsSelected ? "selected" : ""}
                          onClick={(e) => handleRowClick(virtualRow.index, e)}
                          onDoubleClick={() => onRowDoubleClick?.(row)}
                          onContextMenu={(e) => { 
                              e.preventDefault(); 
                              setContextMenuPosition({ x: e.clientX, y: e.clientY });
                              setContextMenuRow(row);
                              setIsContextMenuOpen(true);
                          }}
                          onMouseDown={() => handleMouseDownOnRow(virtualRow.index)}
                          onMouseEnter={() => handleMouseEnterRow(virtualRow.index)}
                          style={{
                            position: 'absolute',
                            transform: `translateY(${virtualRow.start}px)`,
                            top: 0,
                            left: 0,
                            width: totalWidth,
                            height: `${virtualRow.size}px`,
                            cursor: 'pointer'
                          }}
                        >
                          {visibleColumns.map((cell) => {
                              const isFrozen = frozenColumns.includes(cell.id);
                              const isLastFrozen = isFrozen && frozenColumns.indexOf(cell.id) === frozenColumns.length - 1;
                              const stickyClasses = isFrozen ? `cygnet-dt-table-cell--sticky ${isLastFrozen ? 'cygnet-dt-table-cell--sticky-last' : ''}` : '';

                              return (
                                <div 
                                  key={cell.id} 
                                  className={`cygnet-dt-cell-common cygnet-dt-table-cell ${stickyClasses}`}
                                  style={{ 
                                    width: columnSizes[cell.id] || 150,
                                    minWidth: cell.minSize,
                                    left: isFrozen ? frozenColumnOffsets[cell.id] : undefined,
                                  }}
                                >
                                  {cell.cell({
                                      row, 
                                      rowId,
                                      isSelected: rowIsSelected,
                                      onToggleRowSelected: handleToggleRowSelected,
                                      globalFilter, 
                                      columnFilters,
                                  })}
                                </div>
                              )
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
        
        {paginationEnabled && (
          <div className="cygnet-dt-pagination-container">
            <div className="cygnet-dt-footer-info">
              {selectedRowIds.size} of{" "}
              {sortedData.length} row(s) selected.
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: '2rem'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                    <p style={{fontSize: '0.875rem', fontWeight: 500}}>Rows per page</p>
                    <select
                    className="cygnet-dt-select"
                    value={rowsPerPage}
                    onChange={e => {
                        setRowsPerPage(Number(e.target.value))
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
                    Page {currentPage + 1} of {pageCount}
                </div>
                <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                    <button className="cygnet-dt-button cygnet-dt-button--outline cygnet-dt-button--icon" onClick={() => setCurrentPage(0)} disabled={currentPage === 0}><PageFirstIcon /></button>
                    <button className="cygnet-dt-button cygnet-dt-button--outline cygnet-dt-button--icon" onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 0}><PagePrevIcon /></button>
                    <button className="cygnet-dt-button cygnet-dt-button--outline cygnet-dt-button--icon" onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage >= pageCount - 1}><PageNextIcon /></button>
                    <button className="cygnet-dt-button cygnet-dt-button--outline cygnet-dt-button--icon" onClick={() => setCurrentPage(pageCount - 1)} disabled={currentPage >= pageCount - 1}><PageLastIcon /></button>
                </div>
                 <div style={{fontSize: '0.875rem', color: '#6b7280', textAlign: 'right', flexShrink: 0, paddingTop: '0.25rem'}}>
                    <span style={{fontWeight: 700, color: '#111827'}}>
                        {sortedData.length.toLocaleString()}
                    </span>
                    {" "}of{" "}
                    <span style={{fontWeight: 700, color: '#111827'}}>
                        {data.length.toLocaleString()}
                    </span>
                    {" "}rows
                </div>
            </div>
          </div>
        )}

        {!paginationEnabled && (
          <div className="cygnet-dt-pagination-container">
            <div className="cygnet-dt-footer-info">
              {selectedRowIds.size} of{" "}
              {sortedData.length} row(s) selected.
            </div>
          </div>
        )}

        {isContextMenuOpen && contextMenuItems && contextMenuRow && (
            <div
                ref={contextMenuRef}
                className="cygnet-dt-dropdown-content cygnet-dt-context-menu"
                style={{
                    display: 'block',
                    position: "fixed",
                    left: contextMenuPosition.x,
                    top: contextMenuPosition.y,
                }}
            >
                {contextMenuItems.map((item, index) => (
                    <React.Fragment key={index}>
                        <button className="cygnet-dt-dropdown-item" onClick={() => { item.onClick(contextMenuRow); setIsContextMenuOpen(false); }}>
                            {item.label}
                        </button>
                        {item.separator && <div className="cygnet-dt-dropdown-separator" />}
                    </React.Fragment>
                ))}
            </div>
        )}
      </div>
  );
}
