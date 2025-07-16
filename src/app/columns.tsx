
'use client';

import { type ColumnDef } from '@tanstack/react-table';
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
                className="cygnet-dt-checkbox"
                checked={table.getIsAllPageRowsSelected()}
                onChange={(value) => table.toggleAllPageRowsSelected(!!value.target.checked)}
                aria-label="Select all rows"
            />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            className="cygnet-dt-checkbox"
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
              <>
                <div className="cygnet-dt-header-label">
                  <span>{config.label}</span>
                </div>
                <div className="cygnet-dt-header-controls">
                    {column.getCanSort() && (
                      <div
                        className="cygnet-dt-sorter-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          column.toggleSorting(column.getIsSorted() === 'asc');
                        }}
                      >
                        {column.getIsSorted() === 'desc' ? (
                          <ArrowDown className="lucide" />
                        ) : column.getIsSorted() === 'asc' ? (
                          <ArrowUp className="lucide" />
                        ) : (
                          <ChevronsUpDown className="lucide" />
                        )}
                      </div>
                    )}
                </div>
              </>
            )
        },
        cell: ({ row, table, column }) => {
          const value = row.getValue(key) as any;
          const globalFilter = table.getState().globalFilter;
          const columnFilters = table.getState().columnFilters;
          const columnFilterValue = columnFilters?.find(f => f.id === column.id)?.value as string | string[] | undefined;
          
          const filters = [globalFilter, columnFilterValue].flat().filter(Boolean) as string[];
          
          let displayValue: string = String(value ?? '');
          let content: React.ReactNode = displayValue;

          if (config.columnType === 'dateTime' && value instanceof Date) {
            try {
                const formatString = config.formatType?.replace(/mi/g, 'mm') || 'PPpp';
                displayValue = format(value, formatString);
                content = displayValue;
            } catch (e) {
                displayValue = "Invalid Date";
                content = displayValue;
            }
          }

          if (filters.length > 0) {
            content = highlightText(displayValue, filters);
          }
          
          if (key === 'Severity') {
            return (
                <div className="cygnet-dt-tooltip-wrapper">
                  <span
                    className="cygnet-dt-badge"
                    style={{ backgroundColor: severityColors[value] || '#6B7280' }}
                  >
                    {content}
                  </span>
                  <div className="cygnet-dt-tooltip-content">Severity: {value}</div>
                </div>
            );
          }

          return (
            <div className="cygnet-dt-tooltip-wrapper">
                 <span className="truncate">
                     {content}
                 </span>
                 <div className="cygnet-dt-tooltip-content">{displayValue}</div>
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
