
'use client';

import { type ColumnDef } from '@tanstack/react-table';
import { type Alarm, alarmConfig } from '../config/alarm-config';
import { Checkbox } from '../FMComponents/ui/checkbox';
import { Button } from '../FMComponents/ui/button';
import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react';
import { format } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../FMComponents/ui/tooltip';
import { Badge } from '../FMComponents/ui/badge';
import { cn, highlightText } from '../lib/utils';

const severityColors: Record<string, string> = {
  Critical: "bg-red-500",
  Major: "bg-orange-500",
  Minor: "bg-yellow-500",
  Warning: "bg-blue-500",
  Indeterminate: "bg-gray-500",
  Cleared: "bg-green-500",
};

export const getColumns = (): ColumnDef<Alarm>[] => {
    const staticColumns: ColumnDef<Alarm>[] = [
      {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all rows"
            />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
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
              <div className="flex items-center justify-between w-full h-full">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-800">{config.label}</span>
                </div>
                <div className="flex items-center">
                  {column.getCanSort() && (
                    <div
                      className="flex items-center justify-center h-8 w-8 cursor-pointer"
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
                        <ChevronsUpDown className="h-4 w-4 text-gray-500/50" />
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
        },
        cell: ({ row, table }) => {
          const value = row.getValue(key) as any;
          const globalFilter = (table.options.meta as any)?.globalFilter || '';

          const cellText = String(value ?? '');
          const highlightedContent = highlightText(cellText, globalFilter);
          
          if (config.columnType === 'dateTime' && value instanceof Date) {
            try {
                const formatString = config.formatType?.replace(/mi/g, 'mm') || 'PPpp';
                const formattedDate = format(value, formatString);
                return (
                  <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild><span className="block truncate">{format(value, formatString)}</span></TooltipTrigger>
                    <TooltipContent><p>{format(value, formatString)}</p></TooltipContent>
                  </Tooltip>
                  </TooltipProvider>
                );
            } catch (e) {
                return <span className="block truncate text-red-500">Invalid Date</span>
            }
          }
          
          if (key === 'Severity') {
            return (
              <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Badge className={cn("capitalize text-white", severityColors[value] || 'bg-gray-400')}>{value}</Badge>
                </TooltipTrigger>
                <TooltipContent><p>Severity: {value}</p></TooltipContent>
              </Tooltip>
              </TooltipProvider>
            );
          }

          return (
            <TooltipProvider>
             <Tooltip>
                <TooltipTrigger asChild>
                    <span className="block truncate">
                        {highlightedContent}
                    </span>
                </TooltipTrigger>
                <TooltipContent><p>{cellText}</p></TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        },
        size: config.columnSize || 150,
        minSize: 120,
        filterFn: (row, id, filterValue) => {
          if (config.columnType === 'categorical') {
            return (filterValue as any[]).includes(row.getValue(id));
          }
          return String(row.getValue(id)).toLowerCase().includes(String(filterValue).toLowerCase());
        }
      };
      return columnDef;
    });

    return [...staticColumns, ...dynamicColumns];
}
