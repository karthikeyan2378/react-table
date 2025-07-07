
'use client';

import * as React from "react";
import {
  Column,
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
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  PlusCircle,
  SlidersHorizontal,
  X,
  Filter,
} from "lucide-react";
import { format } from "date-fns";

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
import { useToast } from "../hooks/use-toast";
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
  column?: Column<TData, TValue>;
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


function DataTableViewOptions<TData>({
  table,
}: {
  table: ReactTable<TData>;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="ml-auto hidden h-8 lg:flex"
        >
          <SlidersHorizontal className="mr-2 h-4 w-4 text-blue-500" />
          View
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[150px]">
        <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
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
                  column={table.getColumn(col.id)}
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
      <DataTableViewOptions table={table} />
    </div>
  );
}

const DataTableHeader = ({
  header,
  children,
}: {
  header: Header<Alarm, unknown>;
  children: React.ReactNode;
}) => {
  const headerContent = (
    <div className="flex-1 flex items-center gap-2 pl-4 pr-2 py-3.5 h-full">
      {children}
    </div>
  );

  return (
    <TableHead
      colSpan={header.colSpan}
      style={{ width: header.getSize() }}
      className="p-0 sticky top-0 bg-card z-10"
    >
      <div className="flex items-center h-full">
        {header.column.getCanSort() ? (
          <Button
            variant="ghost"
            onClick={header.column.getToggleSortingHandler()}
            className="w-full h-full p-0 m-0 justify-start"
            disabled={!header.column.getCanSort()}
          >
            {headerContent}
          </Button>
        ) : (
          <div className="w-full h-full flex items-center">{headerContent}</div>
        )}
        <div
          onMouseDown={header.getResizeHandler()}
          onTouchStart={header.getResizeHandler()}
          className={cn(
            "h-full w-1.5 cursor-col-resize select-none touch-none",
            "hover:bg-primary/50",
            header.column.getIsResizing() ? "bg-primary" : ""
          )}
        />
      </div>
    </TableHead>
  );
};

interface DataTableProps {
  data: Alarm[];
  deleteRow: (rowIds: string[]) => void;
  onSelectedRowsChange: (rowIds: string[]) => void;
}

export function DataTable({ data, deleteRow, onSelectedRowsChange }: DataTableProps) {
  const { toast } = useToast();
  
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
  const [contextMenu, setContextMenu] = React.useState<{
    visible: boolean;
    x: number;
    y: number;
    row: Alarm | null;
  }>({ visible: false, x: 0, y: 0, row: null });

  const menuRef = React.useRef<HTMLDivElement>(null);

  const [paginationEnabled, setPaginationEnabled] = React.useState(true);
  const [sortingEnabled, setSortingEnabled] = React.useState(true);
  
  React.useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setContextMenu((prev) => ({ ...prev, visible: false, row: null }));
      }
    };
    if (contextMenu.visible) {
      document.addEventListener("click", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, [contextMenu.visible]);
  
  const columns = React.useMemo<ColumnDef<Alarm>[]>(() => {
    const staticColumns: ColumnDef<Alarm>[] = [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
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
        enableHiding: false,
        size: 40,
      },
    ];

    const dynamicColumns = Object.entries(alarmConfig.fields).map(([key, config]) => {
      const columnDef: ColumnDef<Alarm> = {
        accessorKey: key,
        header: ({ column }) => (
          <>
            <span className="text-blue-500">{config.label}</span>
            {column.getCanSort() && <ArrowUpDown className="ml-2 h-4 w-4" />}
          </>
        ),
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
  }, []);
  
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
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

        <div className="rounded-md border overflow-auto relative max-h-[60vh]">
            <Table style={{ width: table.getCenterTotalSize() }}>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <DataTableHeader key={header.id} header={header}>
                          {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                        </DataTableHeader>
                      ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      onDoubleClick={() => setDialogRow(row.original)}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        setContextMenu({ visible: true, x: e.clientX, y: e.clientY, row: row.original });
                      }}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} style={{ width: cell.column.getSize() }}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
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

        {contextMenu.visible && contextMenu.row && (
          <div
            ref={menuRef}
            style={{ top: contextMenu.y, left: contextMenu.x }}
            className="fixed z-50 min-w-[12rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
          >
            <div className="px-2 py-1.5 text-sm font-semibold">
              Actions for Alarm ID: {contextMenu.row.AlarmID}
            </div>
            <Separator className="my-1" />
            <button
              className="relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground"
              onClick={() => {
                navigator.clipboard.writeText(String(contextMenu.row?.AlarmID));
                toast({ title: "Copied!", description: `Alarm ID ${contextMenu.row?.AlarmID} copied.` });
                setContextMenu({ ...contextMenu, visible: false });
              }}
            >
              Copy Alarm ID
            </button>
            <button
              className="relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground"
              onClick={() => {
                setDialogRow(contextMenu.row);
                setContextMenu({ ...contextMenu, visible: false });
              }}
            >
              View details
            </button>
            <button
              className="relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm text-red-600 outline-none transition-colors hover:bg-accent hover:text-accent-foreground"
              onClick={() => {
                deleteRow([contextMenu.row!.AlarmID]);
                setContextMenu({ ...contextMenu, visible: false });
              }}
            >
              Delete row
            </button>
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
