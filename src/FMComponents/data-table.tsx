
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
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronsUpDown,
  Filter,
  PlusCircle,
  SlidersHorizontal,
  X,
  MoreVertical,
} from "lucide-react";
import { format } from "date-fns";
import { useVirtualizer } from '@tanstack/react-virtual';

import { type Alarm, alarmConfig } from "../config/alarm-config";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { cn } from "../lib/utils";
import { Separator } from "./ui/separator";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";


const filterableColumns = Object.entries(alarmConfig.fields)
  .map(([id, { label }]) => ({ id, name: label }));

const severityColors: Record<string, string> = {
  Critical: "bg-red-500",
  Major: "bg-orange-500",
  Minor: "bg-yellow-500",
  Warning: "bg-blue-500",
  Indeterminate: "bg-gray-500",
  Cleared: "bg-green-500",
};

interface DataTableFacetedFilterProps<TData, TValue> {
  column?: ReactTable<TData>['getColumn'];
  title?: string;
  options: {
    label: string;
    value: string;
  }[];
}

function DataTableFacetedFilter<TData, TValue>({
  column,
  title,
  options,
}: DataTableFacetedFilterProps<TData, TValue>) {
  const selectedValues = new Set((column?.getFilterValue() as string[]) ?? []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 border-dashed">
          <PlusCircle className="mr-2 h-4 w-4 text-blue-500" />
          {title}
          {selectedValues?.size > 0 && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <div className="hidden space-x-1 lg:flex">
                {options
                  .filter((option) => selectedValues.has(option.value))
                  .map((option) => (
                    <Badge
                      variant="secondary"
                      key={option.value}
                      className="rounded-sm px-1 font-normal"
                    >
                      {option.label}
                    </Badge>
                  ))}
              </div>
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[200px]" align="start">
        {options.map((option) => {
          const isSelected = selectedValues.has(option.value);
          return (
            <DropdownMenuCheckboxItem
              key={option.value}
              checked={isSelected}
              onCheckedChange={(checked) => {
                if (checked) {
                  selectedValues.add(option.value);
                } else {
                  selectedValues.delete(option.value);
                }
                const filterValues = Array.from(selectedValues);
                column?.setFilterValue(
                  filterValues.length ? filterValues : undefined
                );
              }}
            >
              <span>{option.label}</span>
            </DropdownMenuCheckboxItem>
          );
        })}
        {selectedValues.size > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() => column?.setFilterValue(undefined)}
              className="justify-center text-center"
            >
              Clear filters
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function DataTableToolbar<TData>({ table }: { table: ReactTable<TData> }) {
  const isFiltered = table.getState().columnFilters.length > 0;
  const [activeFilters, setActiveFilters] = React.useState<string[]>([]);

  const handleFilterToggle = (columnId: string, isActive?: boolean) => {
    if (isActive) {
       setActiveFilters((prev) => prev.filter((id) => id !== columnId));
       table.getColumn(columnId)?.setFilterValue(undefined);
    } else {
       setActiveFilters((prev) => [...prev, columnId]);
    }
  };

  const textFilterColumns = filterableColumns.filter(col => {
    const fieldConfig = alarmConfig.fields[col.id as keyof typeof alarmConfig.fields];
    return fieldConfig && fieldConfig.columnType !== 'categorical';
  });

  const categoricalFilterColumns = filterableColumns.filter(col => {
    const fieldConfig = alarmConfig.fields[col.id as keyof typeof alarmConfig.fields];
    return fieldConfig && fieldConfig.columnType === 'categorical';
  });

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2 flex-wrap gap-y-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              <Filter className="mr-2 h-4 w-4 text-blue-500" />
              Add Filter
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>Filter by column</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {filterableColumns.map((col) => (
              <DropdownMenuCheckboxItem
                key={col.id}
                checked={activeFilters.includes(col.id)}
                onCheckedChange={(checked) => handleFilterToggle(col.id, !checked)}
              >
                {col.name}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {textFilterColumns.map((col) => {
          if (activeFilters.includes(col.id)) {
            return (
              <div key={col.id} className="flex items-center gap-1">
                <Input
                  placeholder={`Filter ${col.name.toLowerCase()}...`}
                  value={
                    (table.getColumn(col.id)?.getFilterValue() as string) ?? ""
                  }
                  onChange={(event) => {
                    const value = event.target.value;
                    table.getColumn(col.id)?.setFilterValue(value || undefined);
                  }}
                  className="h-8 w-[150px] lg:w-[250px]"
                />
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => handleFilterToggle(col.id, true)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            );
          }
          return null;
        })}

        {categoricalFilterColumns.map(col => {
          const fieldConfig = alarmConfig.fields[col.id as keyof typeof alarmConfig.fields];
          if (activeFilters.includes(col.id) && table.getColumn(col.id) && fieldConfig?.options) {
            return (
              <div key={col.id} className="flex items-center gap-1">
                <DataTableFacetedFilter
                  column={table.getColumn(col.id)!}
                  title={col.name}
                  options={fieldConfig.options}
                />
                 <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => handleFilterToggle(col.id, true)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )
          }
          return null;
        })}

        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => {
              table.resetColumnFilters();
              setActiveFilters([]);
            }}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

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

interface DataTableProps {
  data: Alarm[];
  deleteRow: (rowIds: string[]) => void;
  onSelectedRowsChange: (rowIds: string[]) => void;
}

export function DataTable({ data, deleteRow, onSelectedRowsChange }: DataTableProps) {
  const initialSorting = React.useMemo(() => {
    const descendingCol = Object.entries(alarmConfig.fields).find(([,config]) => config.sortOrder === 'DESCENDING');
    return descendingCol ? [{ id: descendingCol[0], desc: true }] : [];
  }, []);

  const [sorting, setSorting] = React.useState<SortingState>(initialSorting);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  
  const initialVisibility = React.useMemo(() => {
    return Object.entries(alarmConfig.fields)
      .filter(([, config]) => config.isColumnToHide)
      .reduce((acc, [key]) => {
        acc[key] = false;
        return acc;
      }, {} as VisibilityState);
  }, []);
  
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>(initialVisibility);
  const [rowSelection, setRowSelection] = React.useState({});
  const [dialogRow, setDialogRow] = React.useState<Alarm | null>(null);

  const [paginationEnabled, setPaginationEnabled] = React.useState(true);
  const [sortingEnabled, setSortingEnabled] = React.useState(true);
  
  const columns = React.useMemo<ColumnDef<Alarm>[]>(() => {
    const staticColumns: ColumnDef<Alarm>[] = [
      {
        id: "select",
        header: ({ table }) => (
            <div className="flex items-center justify-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 -ml-2 hover:bg-transparent">
                    <SlidersHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[200px]">
                   <DropdownMenuLabel>Table Settings</DropdownMenuLabel>
                   <DropdownMenuSeparator />
                    <DropdownMenuCheckboxItem
                        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
                        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    >
                      Select/Deselect All
                    </DropdownMenuCheckboxItem>
                    {table.getState().sorting.length > 0 && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => table.resetSorting(true)}>
                          Clear All Sorts
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {table
                        .getAllColumns()
                        .filter(
                            (column) =>
                            typeof column.accessorFn !== "undefined" && column.getCanHide()
                        )
                        .map((column) => {
                            const config = alarmConfig.fields[column.id as keyof typeof alarmConfig.fields];
                            return (
                            <DropdownMenuCheckboxItem
                                key={column.id}
                                className="capitalize"
                                checked={column.getIsVisible()}
                                onCheckedChange={(value) => column.toggleVisibility(!!value)}
                            >
                                {config?.label || column.id}
                            </DropdownMenuCheckboxItem>
                            );
                    })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
        enableResizing: false,
        size: 60,
        minSize: 60,
      },
    ];

    const dynamicColumns = Object.entries(alarmConfig.fields).map(([key, config]) => {
      const columnDef: ColumnDef<Alarm> = {
        accessorKey: key,
        header: ({ column, table }) => {
            return (
              <div 
                onDrop={(e) => {
                  e.preventDefault();
                  const draggedColumnId = e.dataTransfer.getData('text/plain');
                  const targetColumnId = column.id;
                  if (draggedColumnId && draggedColumnId !== targetColumnId) {
                    table.setColumnOrder(
                      (old) => reorderColumn(draggedColumnId, targetColumnId, old)
                    );
                  }
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                }}
                className="flex items-center justify-between w-full h-full"
              >
                <div className="flex items-center gap-2">
                    <div
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', column.id);
                        e.stopPropagation();
                      }}
                      className="cursor-move"
                    >
                      <MoreVertical className="h-4 w-4 text-muted-foreground/70" />
                    </div>
                  <span className="font-semibold text-foreground">{config.label}</span>
                </div>
                <div className="flex items-center">
                  {column.getCanSort() && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 p-0 hover:bg-transparent"
                      onClick={(e) => {
                        e.stopPropagation();
                        if(sortingEnabled) {
                          column.toggleSorting(column.getIsSorted() === 'asc');
                        }
                      }}
                    >
                      {column.getIsSorted() === 'desc' ? (
                        <ArrowDown className="h-4 w-4" />
                      ) : column.getIsSorted() === 'asc' ? (
                        <ArrowUp className="h-4 w-4" />
                      ) : (
                        <ChevronsUpDown className="h-4 w-4 text-muted-foreground/50" />
                      )}
                    </Button>
                  )}
                </div>
              </div>
            )
        },
        cell: ({ row }) => {
          const value = row.getValue(key) as any;
          
          if (config.columnType === 'dateTime' && value instanceof Date) {
            try {
                const formatString = config.formatType?.replace(/mi/g, 'mm') || 'PPpp';
                return (
                  <Tooltip>
                    <TooltipTrigger asChild><span className="block truncate">{format(value, formatString)}</span></TooltipTrigger>
                    <TooltipContent><p>{format(value, formatString)}</p></TooltipContent>
                  </Tooltip>
                );
            } catch (e) {
                return <span className="block truncate text-red-500">Invalid Date</span>
            }
          }
          
          if (key === 'Severity') {
            return (
              <Tooltip>
                <TooltipTrigger>
                  <Badge className={cn("capitalize text-white", severityColors[value] || 'bg-gray-400')}>{value}</Badge>
                </TooltipTrigger>
                <TooltipContent><p>Severity: {value}</p></TooltipContent>
              </Tooltip>
            );
          }

          return (
             <Tooltip>
                <TooltipTrigger asChild><span className="block truncate">{String(value ?? '')}</span></TooltipTrigger>
                <TooltipContent><p>{String(value ?? '')}</p></TooltipContent>
              </Tooltip>
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
  }, [sortingEnabled]);
  
  const initialColumnOrder = React.useMemo(() => ['select', ...Object.keys(alarmConfig.fields)], []);
  const [columnOrder, setColumnOrder] = React.useState<string[]>(initialColumnOrder);
  
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      columnOrder,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
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
    initialState: {
      pagination: {
        pageSize: 20,
      },
    },
    getRowId: (row) => row.AlarmID,
  });

  React.useEffect(() => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    const selectedIds = selectedRows.map(row => row.original.AlarmID);
    onSelectedRowsChange(selectedIds);
  }, [rowSelection, onSelectedRowsChange, table]);

  const tableContainerRef = React.useRef<HTMLDivElement>(null);
  const { rows } = table.getRowModel();

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 53,
    overscan: 10,
  });

  const renderContextMenu = (row: Alarm) => (
    <DropdownMenuContent>
      <DropdownMenuItem onClick={() => setDialogRow(row)}>
        View Details
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => navigator.clipboard.writeText(row.AlarmID)}>
        Copy Alarm ID
      </DropdownMenuItem>
    </DropdownMenuContent>
  );

  return (
    <TooltipProvider>
      <div className="space-y-4">
        <DataTableToolbar table={table} />

        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center space-x-2">
            <Switch id="sorting-enable" checked={sortingEnabled} onCheckedChange={setSortingEnabled} />
            <Label htmlFor="sorting-enable">Enable Sorting</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="pagination-enable" checked={paginationEnabled} onCheckedChange={setPaginationEnabled} />
            <Label htmlFor="pagination-enable">Enable Pagination</Label>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="text-sm text-muted-foreground ml-auto">
            <span className="font-bold text-foreground">
              {table.getFilteredRowModel().rows.length.toLocaleString()}
            </span>{" "}
            of{" "}
            <span className="font-bold text-foreground">
              {data.length.toLocaleString()}
            </span>{" "}
            rows
          </div>
        </div>

        <div ref={tableContainerRef} className="rounded-md border overflow-auto relative max-h-[60vh]">
            <Table style={{ width: table.getTotalSize(), display: 'grid' }}>
              <TableHeader style={{ display: 'grid', position: 'sticky', top: 0, zIndex: 1, backgroundColor: 'hsl(var(--card))' }}>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="hover:bg-card flex w-full">
                      {headerGroup.headers.map((header) => (
                        <TableHead 
                          key={header.id} 
                          colSpan={header.colSpan}
                          style={{ width: header.getSize(), display: 'flex' }}
                        >
                           <div className="flex items-center h-full w-full flex-grow">
                              <div className="flex items-center pl-4 pr-1 py-3.5 h-full overflow-hidden flex-grow">
                                {header.isPlaceholder
                                  ? null
                                  : flexRender(
                                      header.column.columnDef.header,
                                      header.getContext()
                                    )}
                              </div>
                            </div>
                            {header.column.getCanResize() && (
                              <div
                                onMouseDown={header.getResizeHandler()}
                                onTouchStart={header.getResizeHandler()}
                                className={cn(
                                  "h-full w-1.5 cursor-col-resize select-none touch-none shrink-0",
                                  header.column.getIsResizing() ? "bg-primary" : ""
                                )}
                              />
                            )}
                        </TableHead>
                      ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody style={{ display: 'grid', height: `${rowVirtualizer.getTotalSize()}px`, position: 'relative' }}>
                {rowVirtualizer.getVirtualItems().length > 0 ? (
                  rowVirtualizer.getVirtualItems().map(virtualRow => {
                    const row = rows[virtualRow.index];
                    return (
                      <DropdownMenu key={row.id}>
                        <DropdownMenuTrigger asChild>
                          <TableRow
                            data-state={row.getIsSelected() && "selected"}
                            onDoubleClick={() => setDialogRow(row.original)}
                            onContextMenu={(e) => { e.preventDefault(); }}
                            style={{
                              display: 'flex',
                              position: 'absolute',
                              transform: `translateY(${virtualRow.start}px)`,
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: `${virtualRow.size}px`,
                            }}
                          >
                            {row.getVisibleCells().map((cell) => (
                              <TableCell key={cell.id} style={{ display: 'flex', alignItems: 'center', width: cell.column.getSize(), flexShrink: 0 }}>
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                              </TableCell>
                            ))}
                          </TableRow>
                        </DropdownMenuTrigger>
                        {renderContextMenu(row.original)}
                      </DropdownMenu>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">No results.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
        </div>
        
        {paginationEnabled && (
          <div className="flex items-center justify-between py-4">
            <div className="flex-1 text-sm text-muted-foreground">
              {table.getFilteredSelectedRowModel().rows.length} of{" "}
              {table.getFilteredRowModel().rows.length} row(s) selected.
            </div>
            <div className="flex items-center space-x-6 lg:space-x-8">
              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium">Rows per page</p>
                <Select
                  value={`${table.getState().pagination.pageSize}`}
                  onValueChange={(value) => table.setPageSize(Number(value))}
                >
                  <SelectTrigger className="h-8 w-[70px]"><SelectValue placeholder={table.getState().pagination.pageSize} /></SelectTrigger>
                  <SelectContent side="top">
                    {[10, 20, 50, 100, 500, 1000].map((pageSize) => (
                      <SelectItem key={pageSize} value={`${pageSize}`}>{pageSize}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" className="hidden h-8 w-8 p-0 lg:flex" onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}><ChevronsLeft className="h-4 w-4" /></Button>
                <Button variant="outline" className="h-8 w-8 p-0" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}><ChevronLeft className="h-4 w-4" /></Button>
                <Button variant="outline" className="h-8 w-8 p-0" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}><ChevronRight className="h-4 w-4" /></Button>
                <Button variant="outline" className="hidden h-8 w-8 p-0 lg:flex" onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()}><ChevronsRight className="h-4 w-4" /></Button>
              </div>
            </div>
          </div>
        )}

        <AlertDialog open={!!dialogRow} onOpenChange={(isOpen) => !isOpen && setDialogRow(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Alarm Details</AlertDialogTitle>
              <AlertDialogDescription>Viewing full data for Alarm ID: {dialogRow?.AlarmID}</AlertDialogDescription>
            </AlertDialogHeader>
            <div className="max-h-96 overflow-y-auto rounded-md border bg-muted p-4">
              <pre><code>{JSON.stringify(dialogRow, null, 2)}</code></pre>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDialogRow(null)}>Close</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
}
