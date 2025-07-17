
import type React from 'react';

export type ColumnFiltersState = {
  id: string;
  value: unknown;
}[];

export type SortingState = {
  columnId: string;
  direction: 'asc' | 'desc';
};

export interface ColumnDef<TData> {
  id: string;
  accessorKey: keyof TData | 'select';
  header: (props: HeaderContext<TData>) => React.ReactNode;
  cell: (props: CellContext<TData>) => React.ReactNode;
  size?: number;
  minSize?: number;
  enableSorting?: boolean;
  enableResizing?: boolean;
}

export interface HeaderContext<TData> {
    column: ColumnDef<TData>;
    onSort: (columnId: string) => void;
    sortState?: SortingState;
    isAllRowsSelected?: boolean;
    onToggleAllRowsSelected?: (value: boolean) => void;
}

export interface CellContext<TData> {
    row: TData;
    rowId: string;
    isSelected: boolean;
    onToggleRowSelected: (row: TData, isSelected: boolean) => void;
    globalFilter?: string;
    columnFilters?: ColumnFiltersState;
}
