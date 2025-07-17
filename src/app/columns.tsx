
'use client';

import { type ColumnDef } from './types';
import { type Alarm, alarmConfig } from '../config/alarm-config';
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

const UpDownIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/></svg>
);
const UpIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>
);
const DownIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>
);


export const getColumns = (): ColumnDef<Alarm>[] => {
    const staticColumns: ColumnDef<Alarm>[] = [
      {
        id: "select",
        accessorKey: "select",
        header: ({ onToggleAllRowsSelected, isAllRowsSelected }) => (
            <input
                type="checkbox"
                className="cygnet-dt-checkbox"
                checked={isAllRowsSelected}
                onChange={(e) => onToggleAllRowsSelected(e.target.checked)}
                aria-label="Select all rows"
            />
        ),
        cell: ({ row, onToggleRowSelected, isSelected }) => (
          <input
            type="checkbox"
            className="cygnet-dt-checkbox"
            checked={isSelected}
            onChange={(e) => onToggleRowSelected(row, e.target.checked)}
            onClick={(e) => e.stopPropagation()}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        size: 60,
        minSize: 60,
      },
    ];

    const dynamicColumns = Object.entries(alarmConfig.fields).map(([key, config]) => {
      const columnDef: ColumnDef<Alarm> = {
        accessorKey: key as keyof Alarm,
        id: key,
        header: ({ column, onSort, sortState }) => {
            return (
              <>
                <div 
                  className="cygnet-dt-header-label"
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('text/plain', column.id);
                    e.stopPropagation();
                  }}
                >
                  <span>{config.label}</span>
                </div>
                <div className="cygnet-dt-header-controls">
                    {column.enableSorting !== false && (
                      <button
                        className="cygnet-dt-sorter-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSort(column.id);
                        }}
                      >
                        {sortState?.columnId !== column.id ? <UpDownIcon /> :
                         sortState?.direction === 'desc' ? <DownIcon /> : <UpIcon />}
                      </button>
                    )}
                </div>
              </>
            )
        },
        cell: ({ row, globalFilter, columnFilters }) => {
          const value = row[key as keyof Alarm] as any;
          const columnFilterValue = columnFilters?.find(f => f.id === key)?.value;
          
          const filters = [globalFilter, columnFilterValue].flat().filter(Boolean) as string[];
          
          let displayValue: string = String(value ?? '');
          
          if (config.columnType === 'dateTime' && value instanceof Date) {
            try {
                displayValue = value.toLocaleString();
            } catch (e) {
                displayValue = "Invalid Date";
            }
          }

          let content: React.ReactNode = highlightText(displayValue, filters);
          
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
      };
      return columnDef;
    });

    return [...staticColumns, ...dynamicColumns];
}
