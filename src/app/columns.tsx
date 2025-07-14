
'use client';

import { type ColumnDef, type ColumnFiltersState } from '@tanstack/react-table';
import { type Alarm, alarmConfig } from '../config/alarm-config';
import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react';
import { format } from 'date-fns';
import { highlightText } from '../lib/utils.tsx';
import React from 'react';

const severityColors: Record<string, string> = {
  Critical: "#EF4444",
  Major: "#F97316",
  Minor: "#EAB308",
  Warning: "#3B82F6",
  Indeterminate: "#6B7280",
  Cleared: "#22C55E",
};

export const getColumns = (): ColumnDef<Alarm>[] => {
    const staticColumns: ColumnDef<Alarm>[] = [
      {
        id: "select",
        header: ({ table }) => (
            <input
                type="checkbox"
                className="dt-checkbox"
                checked={table.getIsAllPageRowsSelected()}
                onChange={(value) => table.toggleAllPageRowsSelected(!!value.target.checked)}
                aria-label="Select all rows"
            />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            className="dt-checkbox"
            checked={row.getIsSelected()}
            onChange={(value) => row.toggleSelected(!!value.target.checked)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
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
              <div className="dt-header-content">
                <div className="dt-header-label">
                  <span>{config.label}</span>
                </div>
                <div className="dt-header-sorter">
                  {column.getCanSort() && (
                    <div
                      className="dt-sorter-button"
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
                        <ChevronsUpDown className="h-4 w-4" />
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
        },
        cell: ({ row, table, column }) => {
          const value = row.getValue(key) as any;
          const { globalFilter, columnFilters } = (table.options.meta || {}) as { globalFilter?: string; columnFilters?: ColumnFiltersState };

          const columnFilterValue = columnFilters?.find(f => f.id === column.id)?.value as string | string[] | undefined;
          
          let highlightedContent: React.ReactNode = String(value ?? '');
          
          if (globalFilter) {
            highlightedContent = highlightText(highlightedContent, globalFilter);
          }

          if (columnFilterValue) {
            highlightedContent = highlightText(highlightedContent, columnFilterValue);
          }
          
          if (config.columnType === 'dateTime' && value instanceof Date) {
            try {
                const formatString = config.formatType?.replace(/mi/g, 'mm') || 'PPpp';
                const formattedDate = format(value, formatString);
                return (
                    <div className="dt-tooltip-wrapper">
                        <span className="truncate">{formattedDate}</span>
                        <div className="dt-tooltip-content">{formattedDate}</div>
                    </div>
                );
            } catch (e) {
                return <span className="truncate text-red-500">Invalid Date</span>
            }
          }
          
          if (key === 'Severity') {
            return (
                <div className="dt-tooltip-wrapper">
                  <span
                    className="dt-badge"
                    style={{ backgroundColor: severityColors[value] || '#6B7280' }}
                  >
                    {highlightedContent}
                  </span>
                  <div className="dt-tooltip-content">Severity: {value}</div>
                </div>
            );
          }

          return (
            <div className="dt-tooltip-wrapper">
                 <span className="truncate">
                     {highlightedContent}
                 </span>
                 <div className="dt-tooltip-content">{String(value ?? '')}</div>
            </div>
          );
        },
        size: config.columnSize || 150,
        minSize: 120,
        filterFn: (row, id, filterValue) => {
          if (Array.isArray(filterValue) && filterValue.length > 0) {
            return filterValue.includes(row.getValue(id));
          }
          return String(row.getValue(id)).toLowerCase().includes(String(filterValue).toLowerCase());
        }
      };
      return columnDef;
    });

    return [...staticColumns, ...dynamicColumns];
}
