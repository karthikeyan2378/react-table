
"use client";

import * as React from "react";
import { type Alarm, alarmConfig } from "@/config/alarm-config";

type SortDirection = "asc" | "desc";

interface SortConfig {
  key: keyof Alarm;
  direction: SortDirection;
}

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

interface DataTableProps {
  data: Alarm[];
  deleteRow: (rowIds: string[]) => void;
  onSelectedRowsChange: (rowIds: string[]) => void;
}

export function DataTable({
  data,
  deleteRow,
  onSelectedRowsChange,
}: DataTableProps) {
  const [filter, setFilter] = React.useState("");
  const [sortConfig, setSortConfig] = React.useState<SortConfig | null>({ key: 'NetworkLastModifiedTimeLong', direction: 'desc' });
  const [currentPage, setCurrentPage] = React.useState(1);
  const [rowsPerPage, setRowsPerPage] = React.useState(20);
  const [selectedRows, setSelectedRows] = React.useState<Set<string>>(new Set());

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
    const allSelected = pageRows.every(row => selectedRows.has(row.AlarmID));
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
    return data.filter((row) =>
      Object.values(row).some((value) =>
        String(value).toLowerCase().includes(filter.toLowerCase())
      )
    );
  }, [data, filter]);

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

  const SortIcon = ({ direction }: { direction: SortDirection | null }) => {
    if (!direction) return <span className="w-4 h-4 opacity-30">↕</span>;
    return direction === 'asc' ? <span className="w-4 h-4">🔼</span> : <span className="w-4 h-4">🔽</span>;
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <input
          type="text"
          placeholder="Filter all columns..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="h-9 px-3 rounded-md border border-input bg-background w-full md:w-1/3"
        />
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
                <td colSpan={columnsToShow.length + 1} className="h-24 text-center">
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
