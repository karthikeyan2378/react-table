
"use client";

import * as React from "react";
import { type Alarm, alarmConfig } from "@/config/alarm-config";

type SortDirection = "asc" | "desc";

interface SortConfig {
  key: keyof Alarm;
  direction: SortDirection;
}

type FilterValue = string | Set<string>;
type Filters = Record<string, FilterValue>;

const severityColors: Record<string, string> = {
  Critical: "bg-red-500",
  Major: "bg-orange-500",
  Minor: "bg-yellow-500",
  Warning: "bg-blue-500",
  Indeterminate: "bg-gray-500",
  Cleared: "bg-green-500",
};

const columnsToShow = Object.entries(alarmConfig.fields)
  .filter(([, config]) => !config.isColumnToHide)
  .map(([key, config]) => ({
    key: key as keyof Alarm,
    label: config.label,
    size: config.columnSize || 150,
  }));
  
const filterableColumns = Object.entries(alarmConfig.fields).map(([id, { label, columnType, options }]) => ({
    id: id as keyof Alarm,
    name: label,
    type: columnType,
    options: options || [],
}));

interface DataTableProps {
  data: Alarm[];
  deleteRow: (rowIds: string[]) => void;
  onSelectedRowsChange: (rowIds:string[]) => void;
}

export function DataTable({
  data,
  deleteRow,
  onSelectedRowsChange,
}: DataTableProps) {
  const [filters, setFilters] = React.useState<Filters>({});
  const [sortConfig, setSortConfig] = React.useState<SortConfig | null>({ key: 'NetworkLastModifiedTimeLong', direction: 'desc' });
  const [currentPage, setCurrentPage] = React.useState(1);
  const [rowsPerPage, setRowsPerPage] = React.useState(20);
  const [selectedRows, setSelectedRows] = React.useState<Set<string>>(new Set());
  const [activeFilterDropdown, setActiveFilterDropdown] = React.useState<string | null>(null);
  const [addFilterDropdownOpen, setAddFilterDropdownOpen] = React.useState(false);

  const handleSort = (key: keyof Alarm) => {
    let direction: SortDirection = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };
  
  const toggleRowSelection = (rowId: string) => {
    const newSelection = new Set(selectedRows);
    if (newSelection.has(rowId)) {
      newSelection.delete(rowId);
    } else {
      newSelection.add(rowId);
    }
    setSelectedRows(newSelection);
  };

  const toggleAllRows = (pageRows: Alarm[]) => {
    const allSelected = pageRows.length > 0 && pageRows.every(row => selectedRows.has(row.AlarmID));
    const newSelection = new Set(selectedRows);
    if (allSelected) {
      pageRows.forEach(row => newSelection.delete(row.AlarmID));
    } else {
      pageRows.forEach(row => newSelection.add(row.AlarmID));
    }
    setSelectedRows(newSelection);
  };
  
  React.useEffect(() => {
    onSelectedRowsChange(Array.from(selectedRows));
  }, [selectedRows, onSelectedRowsChange]);

  const filteredData = React.useMemo(() => {
    if (Object.keys(filters).length === 0) {
      return data;
    }
    return data.filter(row => {
      return Object.entries(filters).every(([key, filterValue]) => {
        const rowValue = row[key as keyof Alarm];
        if (filterValue instanceof Set) { // Categorical filter
          return filterValue.size === 0 || filterValue.has(String(rowValue));
        }
        // Text filter
        return String(rowValue).toLowerCase().includes(String(filterValue).toLowerCase());
      });
    });
  }, [data, filters]);

  const sortedData = React.useMemo(() => {
    let sortableItems = [...filteredData];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;
        
        if (aValue < bValue) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [filteredData, sortConfig]);

  const paginatedData = React.useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return sortedData.slice(startIndex, startIndex + rowsPerPage);
  }, [sortedData, currentPage, rowsPerPage]);

  const totalPages = Math.ceil(sortedData.length / rowsPerPage);

  const handleAddFilter = (columnId: keyof Alarm, type: string | undefined) => {
      setFilters(prev => ({
          ...prev,
          [columnId]: type === 'categorical' ? new Set<string>() : ''
      }));
      setAddFilterDropdownOpen(false);
  };
  
  const handleRemoveFilter = (columnId: keyof Alarm) => {
      setFilters(prev => {
          const newFilters = {...prev};
          delete newFilters[columnId];
          return newFilters;
      });
  };

  const handleTextFilterChange = (columnId: keyof Alarm, value: string) => {
    setFilters(prev => ({...prev, [columnId]: value}));
  }

  const handleCategoricalFilterChange = (columnId: keyof Alarm, value: string) => {
      setFilters(prev => {
          const currentFilter = prev[columnId];
          if (currentFilter instanceof Set) {
              const newSet = new Set(currentFilter);
              if (newSet.has(value)) {
                  newSet.delete(value);
              } else {
                  newSet.add(value);
              }
              return {...prev, [columnId]: newSet};
          }
          return prev;
      });
  };


  const SortIcon = ({ direction }: { direction: SortDirection | null }) => {
    if (!direction) return <span className="w-4 h-4 opacity-30">↕</span>;
    return direction === 'asc' ? <span className="w-4 h-4">🔼</span> : <span className="w-4 h-4">🔽</span>;
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-2">
         <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                  <button onClick={() => setAddFilterDropdownOpen(p => !p)} className="h-9 px-3 rounded-md border bg-background flex items-center gap-2">
                      <span>+</span> Add Filter
                  </button>
                  {addFilterDropdownOpen && (
                      <div className="absolute top-full left-0 mt-1 bg-white border rounded-md shadow-lg z-20 max-h-60 overflow-y-auto">
                          {filterableColumns.map(col => (
                              <button 
                                key={col.id} 
                                onClick={() => handleAddFilter(col.id, col.type)}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                                disabled={filters.hasOwnProperty(col.id)}
                              >
                                {col.name}
                              </button>
                          ))}
                      </div>
                  )}
              </div>
              
              {Object.keys(filters).map(key => {
                  const colConfig = filterableColumns.find(c => c.id === key);
                  if (!colConfig) return null;

                  return (
                    <div key={key} className="flex items-center gap-1">
                      {colConfig.type === 'categorical' ? (
                          <div className="relative">
                              <button onClick={() => setActiveFilterDropdown(d => d === key ? null : key)} className="h-9 px-3 rounded-md border bg-background flex items-center gap-1">
                                  <span>{colConfig.name}</span>
                                  <span className="text-muted-foreground text-xs">{(filters[key] as Set<string>).size || 'Any'}</span>
                              </button>
                              {activeFilterDropdown === key && (
                                  <div className="absolute top-full left-0 mt-1 bg-white border rounded-md shadow-lg z-20 max-h-60 overflow-y-auto p-2">
                                      {colConfig.options.map(opt => (
                                          <label key={opt.value} className="flex items-center gap-2 p-1">
                                              <input type="checkbox"
                                                  checked={(filters[key] as Set<string>).has(opt.value)}
                                                  onChange={() => handleCategoricalFilterChange(key as keyof Alarm, opt.value)}
                                                  className="rounded border-gray-300"
                                              />
                                              <span>{opt.label}</span>
                                          </label>
                                      ))}
                                  </div>
                              )}
                          </div>
                      ) : (
                          <input
                              type="text"
                              placeholder={`Filter ${colConfig.name}...`}
                              value={filters[key] as string}
                              onChange={(e) => handleTextFilterChange(key as keyof Alarm, e.target.value)}
                              className="h-9 px-3 rounded-md border border-input bg-background w-40"
                          />
                      )}
                      <button onClick={() => handleRemoveFilter(key as keyof Alarm)} className="h-9 w-9 p-0 flex items-center justify-center rounded-md border hover:bg-destructive/10 text-destructive">&times;</button>
                    </div>
                  )
              })}
         </div>
      </div>

      {/* Table */}
      <div className="rounded-md border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr className="border-b">
              <th className="p-2 w-10">
                <input
                  type="checkbox"
                  className="rounded border-gray-300"
                  onChange={() => toggleAllRows(paginatedData)}
                  checked={paginatedData.length > 0 && paginatedData.every(row => selectedRows.has(row.AlarmID))}
                />
              </th>
              {columnsToShow.map((column) => (
                <th
                  key={column.key}
                  className="p-2 text-left font-medium text-muted-foreground cursor-pointer"
                  onClick={() => handleSort(column.key)}
                  style={{ minWidth: column.size, width: column.size }}
                >
                  <div className="flex items-center gap-2">
                    {column.label}
                    <SortIcon direction={sortConfig?.key === column.key ? sortConfig.direction : null} />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((row) => (
                <tr key={row.AlarmID} className="border-b hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <td className="p-2">
                     <input
                        type="checkbox"
                        className="rounded border-gray-300"
                        checked={selectedRows.has(row.AlarmID)}
                        onChange={() => toggleRowSelection(row.AlarmID)}
                      />
                  </td>
                  {columnsToShow.map((column) => {
                    const value = row[column.key];
                    const config = alarmConfig.fields[column.key as keyof typeof alarmConfig.fields];
                    let cellContent: React.ReactNode = String(value ?? '');
                    
                    if (config.columnType === 'dateTime' && value instanceof Date) {
                        cellContent = value.toLocaleString();
                    } else if (column.key === 'Severity' && typeof value === 'string') {
                        cellContent = (
                          <span className={`px-2 py-0.5 rounded-full text-xs text-white ${severityColors[value] || 'bg-gray-400'}`}>
                            {value}
                          </span>
                        );
                    }
                    
                    return (
                      <td key={column.key} className="p-2 align-middle truncate" style={{maxWidth: column.size}}>
                        {cellContent}
                      </td>
                    );
                  })}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columnsToShow.length + 2} className="h-24 text-center">
                  No results.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between py-4 text-sm">
        <div className="text-muted-foreground">
          {selectedRows.size} of {data.length} row(s) selected.
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span>Rows per page</span>
            <select
              value={rowsPerPage}
              onChange={(e) => setRowsPerPage(Number(e.target.value))}
              className="h-8 w-[70px] rounded-md border border-input bg-background px-2"
            >
              {[10, 20, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
          <div>
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="h-8 w-8 p-0 rounded-md border disabled:opacity-50"
            >
              {"<<"}
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="h-8 w-8 p-0 rounded-md border disabled:opacity-50"
            >
              {"<"}
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="h-8 w-8 p-0 rounded-md border disabled:opacity-50"
            >
              {">"}
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="h-8 w-8 p-0 rounded-md border disabled:opacity-50"
            >
              {">>"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
