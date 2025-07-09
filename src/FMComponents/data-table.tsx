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
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Filter,
  MoreVertical,
  PlusCircle,
  X,
} from "lucide-react";
import { useVirtualizer } from '@tanstack/react-virtual';

import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
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
import { Checkbox } from './ui/checkbox';

// A generic faceted filter component.
interface DataTableFacetedFilterProps<TData> {
  column?: ReactTable<TData>['getColumn'];
  title?: string;
  options: {
    label: string;
    value: string;
  }[];
}

function DataTableFacetedFilter<TData>({
  column,
  title,
  options,
}: DataTableFacetedFilterProps<TData>) {
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

// A generic toolbar that receives filterable column definitions as props.
interface FilterableColumn {
    id: string;
    name: string;
    type: 'text' | 'categorical';
    options?: { label: string; value: string }[];
}

interface DataTableToolbarProps<TData> {
  table: ReactTable<TData>;
  filterableColumns: FilterableColumn[];
}

function DataTableToolbar<TData>({ table, filterableColumns }: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0 || !!table.getState().globalFilter;
  const [activeFilters, setActiveFilters] = React.useState<string[]>([]);

  const handleFilterToggle = (columnId: string, isActive?: boolean) => {
    if (isActive) {
       setActiveFilters((prev) => prev.filter((id) => id !== columnId));
       table.getColumn(columnId)?.setFilterValue(undefined);
    } else {
       setActiveFilters((prev) => [...prev, columnId]);
    }
  };

  const textFilterColumns = filterableColumns.filter(col => col.type === 'text');
  const categoricalFilterColumns = filterableColumns.filter(col => col.type === 'categorical');

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2 flex-wrap gap-y-2">
        <Input
          placeholder="Search all columns..."
          value={(table.getState().globalFilter as string) ?? ""}
          onChange={(event) => table.setGlobalFilter(event.target.value)}
          className="h-8 w-[150px] lg:w-[250px]"
        />
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
          if (activeFilters.includes(col.id) && table.getColumn(col.id) && col.options) {
            return (
              <div key={col.id} className="flex items-center gap-1">
                <DataTableFacetedFilter
                  column={table.getColumn(col.id)!}
                  title={col.name}
                  options={col.options}
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
              table.setGlobalFilter("");
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

// A pure helper function for reordering columns in an array.
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

// Generic DataTable component props.
interface DataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData>[];
  getRowId: (row: TData) => string;
  onSelectedRowsChange: (rowIds: string[]) => void;
  renderRowContextMenu?: (row: TData) => React.ReactNode;
  onRowDoubleClick?: (row: TData) => void;
  filterableColumns?: FilterableColumn[];
  initialColumnVisibility?: VisibilityState;
  initialSorting?: SortingState;
}

// The generic DataTable component.
export function DataTable<TData>({
  data,
  columns,
  getRowId,
  onSelectedRowsChange,
  renderRowContextMenu,
  onRowDoubleClick,
  filterableColumns = [],
  initialColumnVisibility = {},
  initialSorting = [],
}: DataTableProps<TData>) {
  const [sorting, setSorting] = React.useState<SortingState>(initialSorting);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>(initialColumnVisibility);
  const [rowSelection, setRowSelection] = React.useState({});
  const [contextMenu, setContextMenu] = React.useState<{ x: number; y: number; row: TData } | null>(null);

  const [paginationEnabled, setPaginationEnabled] = React.useState(true);
  const [sortingEnabled, setSortingEnabled] = React.useState(true);
  
  const [columnOrder, setColumnOrder] = React.useState<string[]>(() =>
    columns.map(c => (c.id ?? (c as any).accessorKey)!).filter(Boolean)
  );
  
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragStartRowIndex, setDragStartRowIndex] = React.useState<number | null>(null);
  const lastClickedRowIndex = React.useRef<number | null>(null);

  React.useEffect(() => {
    const handleMouseUp = () => {
        setIsDragging(false);
        setDragStartRowIndex(null);
    };
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
        window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const tableState = React.useMemo(() => ({
    sorting,
    columnVisibility,
    rowSelection,
    columnFilters,
    columnOrder,
    globalFilter,
  }), [sorting, columnVisibility, rowSelection, columnFilters, columnOrder, globalFilter]);

  const tableInitialState = React.useMemo(() => ({
    pagination: {
        pageSize: 20,
    },
  }), []);
  
  const table = useReactTable({
    data,
    columns,
    state: tableState,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
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
    enableMultiRowSelection: true,
    getRowId,
    initialState: tableInitialState,
  });

  React.useEffect(() => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    const selectedIds = selectedRows.map(row => getRowId(row.original));
    onSelectedRowsChange(selectedIds);
  }, [rowSelection, onSelectedRowsChange, table, getRowId]);

  const tableContainerRef = React.useRef<HTMLDivElement>(null);
  const { rows } = table.getRowModel();

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 53,
    overscan: 10,
  });

  return (
      <div className="space-y-4">
        <DataTableToolbar table={table} filterableColumns={filterableColumns} />

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
                  <TableRow 
                    key={headerGroup.id} 
                    className="hover:bg-card flex w-full"
                  >
                      {headerGroup.headers.map((header) => (
                        <TableHead 
                          key={header.id} 
                          colSpan={header.colSpan}
                          data-column-id={header.id}
                          style={{ width: header.getSize(), display: 'flex', flexShrink: 0, minWidth: header.column.columnDef.minSize }}
                          onDrop={(e) => {
                            e.preventDefault();
                            const draggedColumnId = e.dataTransfer.getData('text/plain');
                            const targetColumnId = header.id;
                            if (draggedColumnId && targetColumnId && draggedColumnId !== targetColumnId) {
                                table.setColumnOrder(
                                    (old) => reorderColumn(draggedColumnId, targetColumnId, old)
                                );
                            }
                          }}
                          onDragOver={(e) => e.preventDefault()}
                        >
                           <div 
                              className="flex-grow flex items-center h-full overflow-hidden"
                              draggable
                              onDragStart={(e) => {
                                e.dataTransfer.setData('text/plain', header.id);
                                e.stopPropagation();
                              }}
                            >
                              {header.isPlaceholder
                                ? null
                                : flexRender(
                                    header.column.columnDef.header,
                                    header.getContext()
                                  )}
                            </div>
                            {header.column.getCanResize() && (
                              <div
                                onMouseDown={header.getResizeHandler()}
                                onTouchStart={header.getResizeHandler()}
                                className={cn(
                                  "w-1.5 h-full cursor-col-resize select-none touch-none shrink-0 bg-border/50 hover:bg-primary/80",
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
                        <TableRow
                            key={row.id}
                            data-state={row.getIsSelected() && "selected"}
                            onDoubleClick={() => onRowDoubleClick?.(row.original)}
                            onContextMenu={(e) => { 
                                e.preventDefault(); 
                                setContextMenu({
                                    x: e.clientX,
                                    y: e.clientY,
                                    row: row.original
                                });
                            }}
                            onMouseDown={(e) => {
                                e.preventDefault(); // Prevent text selection
                                const rowIndex = virtualRow.index;
                                
                                setIsDragging(true);
                                setDragStartRowIndex(rowIndex);

                                if (e.shiftKey && lastClickedRowIndex.current !== null) {
                                    const start = Math.min(lastClickedRowIndex.current, rowIndex);
                                    const end = Math.max(lastClickedRowIndex.current, rowIndex);
                                    
                                    const newSelection = {}; // Shift-click replaces current selection
                                    for(let i = start; i <= end; i++) {
                                        const rowId = rows[i]?.id;
                                        if (rowId) {
                                            newSelection[rowId] = true;
                                        }
                                    }
                                    table.setRowSelection(newSelection);
                                } else if (e.metaKey || e.ctrlKey) {
                                    const newSelection = { ...rowSelection };
                                    if (newSelection[row.id]) {
                                        delete newSelection[row.id];
                                    } else {
                                        newSelection[row.id] = true;
                                    }
                                    table.setRowSelection(newSelection);
                                    lastClickedRowIndex.current = rowIndex;
                                } else {
                                    // Normal click
                                    table.setRowSelection({ [row.id]: true });
                                    lastClickedRowIndex.current = rowIndex;
                                }
                            }}
                            onMouseEnter={() => {
                                if (isDragging && dragStartRowIndex !== null) {
                                    const rowIndex = virtualRow.index;
                                    const start = Math.min(dragStartRowIndex, rowIndex);
                                    const end = Math.max(dragStartRowIndex, rowIndex);

                                    const newSelection = {}; // Drag select creates a new selection
                                    for(let i = start; i <= end; i++) {
                                        const rowId = rows[i]?.id;
                                        if (rowId) {
                                            newSelection[rowId] = true;
                                        }
                                    }
                                    table.setRowSelection(newSelection);
                                }
                            }}
                            style={{
                              display: 'flex',
                              position: 'absolute',
                              transform: `translateY(${virtualRow.start}px)`,
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: `${virtualRow.size}px`,
                              cursor: 'pointer'
                            }}
                          >
                            {row.getVisibleCells().map((cell) => (
                              <TableCell key={cell.id} style={{ display: 'flex', alignItems: 'center', width: cell.column.getSize(), flexShrink: 0, minWidth: cell.column.columnDef.minSize }}>
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                              </TableCell>
                            ))}
                        </TableRow>
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

        <DropdownMenu
            open={!!contextMenu}
            onOpenChange={(isOpen) => {
            if (!isOpen) {
                setContextMenu(null);
            }
            }}
            modal={false}
        >
            <DropdownMenuTrigger
                style={{
                    position: "fixed",
                    left: contextMenu?.x,
                    top: contextMenu?.y,
                    width: 1,
                    height: 1,
                    opacity: 0,
                    pointerEvents: "none",
                }}
            />
            {contextMenu?.row && renderRowContextMenu && renderRowContextMenu(contextMenu.row)}
        </DropdownMenu>
      </div>
  );
}

    