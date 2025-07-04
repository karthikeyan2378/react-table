
"use client";

import * as React from "react";
import {
  Column,
  ColumnDef,
  ColumnFiltersState,
  ColumnOrderState,
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
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  type DragEndEvent,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  GripVertical,
  MoreHorizontal,
  Play,
  Plus,
  PlusCircle,
  RefreshCw,
  SlidersHorizontal,
  Square,
  Trash2,
  X,
  Check,
  Filter,
} from "lucide-react";

import type { Person } from "@/lib/data";
import { makeData } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
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

const statuses = [
  { value: "single", label: "Single" },
  { value: "complicated", label: "Complicated" },
  { value: "relationship", label: "Relationship" },
];

const filterableColumns = [
  { id: "firstName", name: "First Name" },
  { id: "lastName", name: "Last Name" },
  { id: "age", name: "Age" },
  { id: "visits", name: "Visits" },
  { id: "status", name: "Status" },
  { id: "progress", name: "Progress" },
];

interface DataTableFacetedFilterProps<TData, TValue> {
  column?: Column<TData, TValue>;
  title?: string;
  options: {
    label: string;
    value: string;
    icon?: React.ComponentType<{ className?: string }>;
  }[];
}

function DataTableFacetedFilter<TData, TValue>({
  column,
  title,
  options,
}: DataTableFacetedFilterProps<TData, TValue>) {
  const facets = column?.getFacetedUniqueValues();
  const selectedValues = new Set((column?.getFilterValue() as string[]) ?? []);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 border-dashed">
          <PlusCircle className="mr-2 h-4 w-4" />
          {title}
          {selectedValues?.size > 0 && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <Badge
                variant="secondary"
                className="rounded-sm px-1 font-normal lg:hidden"
              >
                {selectedValues.size}
              </Badge>
              <div className="hidden space-x-1 lg:flex">
                {selectedValues.size > 2 ? (
                  <Badge
                    variant="secondary"
                    className="rounded-sm px-1 font-normal"
                  >
                    {selectedValues.size} selected
                  </Badge>
                ) : (
                  options
                    .filter((option) => selectedValues.has(option.value))
                    .map((option) => (
                      <Badge
                        variant="secondary"
                        key={option.value}
                        className="rounded-sm px-1 font-normal"
                      >
                        {option.label}
                      </Badge>
                    ))
                )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandInput placeholder={title} />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selectedValues.has(option.value);
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => {
                      if (isSelected) {
                        selectedValues.delete(option.value);
                      } else {
                        selectedValues.add(option.value);
                      }
                      const filterValues = Array.from(selectedValues);
                      column?.setFilterValue(
                        filterValues.length ? filterValues : undefined
                      );
                    }}
                  >
                    <div
                      className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "opacity-50 [&_svg]:invisible"
                      )}
                    >
                      <Check className={cn("h-4 w-4")} />
                    </div>
                    {option.icon && (
                      <option.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                    )}
                    <span>{option.label}</span>
                    {facets?.get(option.value) && (
                      <span className="ml-auto flex h-4 w-4 items-center justify-center font-mono text-xs">
                        {facets.get(option.value)}
                      </span>
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {selectedValues.size > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => column?.setFilterValue(undefined)}
                    className="justify-center text-center"
                  >
                    Clear filters
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
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
          <SlidersHorizontal className="mr-2 h-4 w-4" />
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
            return (
              <DropdownMenuCheckboxItem
                key={column.id}
                className="capitalize"
                checked={column.getIsVisible()}
                onCheckedChange={(value) => column.toggleVisibility(!!value)}
              >
                {column.id}
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

  const handleFilterToggle = (columnId: string) => {
    const isCurrentlyActive = activeFilters.includes(columnId);
    if (isCurrentlyActive) {
      setActiveFilters((prev) => prev.filter((id) => id !== columnId));
      table.getColumn(columnId)?.setFilterValue(undefined);
    } else {
      setActiveFilters((prev) => [...prev, columnId]);
    }
  };

  const textFilterColumns = filterableColumns.filter(
    (col) => col.id !== "status"
  );

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2 flex-wrap gap-y-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              <Filter className="mr-2 h-4 w-4" />
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
                onCheckedChange={() => handleFilterToggle(col.id)}
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
                  onChange={(event) =>
                    table
                      .getColumn(col.id)
                      ?.setFilterValue(event.target.value || undefined)
                  }
                  className="h-8 w-[150px] lg:w-[250px]"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={() => handleFilterToggle(col.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            );
          }
          return null;
        })}

        {activeFilters.includes("status") && table.getColumn("status") && (
          <div className="flex items-center gap-1">
            <DataTableFacetedFilter
              column={table.getColumn("status")}
              title="Status"
              options={statuses}
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={() => handleFilterToggle("status")}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

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

const DraggableColumnHeader = ({
  header,
  children,
}: {
  header: Header<Person, unknown>;
  children: React.ReactNode;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: header.column.id,
    disabled: ["select", "actions", "drag-handle"].includes(header.column.id),
  });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 10 : 1,
    position: "relative",
  };

  const headerContent = (
    <div className="flex-1 flex items-center gap-2 pl-4 pr-2 py-3.5 h-full">
      {children}
    </div>
  );

  return (
    <TableHead
      ref={setNodeRef}
      colSpan={header.colSpan}
      style={{ ...style, width: header.getSize() }}
      className="p-0"
    >
      <div className="flex items-center h-full">
        {header.column.getCanSort() ? (
          <Button
            variant="ghost"
            onClick={header.column.getToggleSortingHandler()}
            className="w-full h-full p-0 m-0 justify-start"
            disabled={!header.column.getCanSort()}
            {...attributes}
            {...listeners}
          >
            {headerContent}
          </Button>
        ) : (
          <div {...attributes} {...listeners} className="cursor-grab h-full">
            {headerContent}
          </div>
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

export function DataTable() {
  const { toast } = useToast();
  const [data, setData] = React.useState(() => makeData(1000));
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [isStreaming, setIsStreaming] = React.useState(false);
  const [openActionMenu, setOpenActionMenu] = React.useState<string | null>(
    null
  );
  const [dialogRow, setDialogRow] = React.useState<Person | null>(null);

  const [paginationEnabled, setPaginationEnabled] = React.useState(true);
  const [sortingEnabled, setSortingEnabled] = React.useState(true);

  const addRow = React.useCallback((newRows: Person[]) => {
    setData((oldData) => [...newRows, ...oldData]);
  }, []);

  const updateRow = React.useCallback((updatedRows: Person[]) => {
    setData((oldData) =>
      oldData.map((row) => {
        const updatedRow = updatedRows.find((ur) => ur.id === row.id);
        return updatedRow ? { ...row, ...updatedRow } : row;
      })
    );
  }, []);

  const deleteRow = React.useCallback((rowIdsToDelete: number[]) => {
    setData((oldData) =>
      oldData.filter((row) => !rowIdsToDelete.includes(row.id))
    );
  }, []);

  React.useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(() => {
      addRow(makeData(1));
    }, 1000);

    return () => clearInterval(interval);
  }, [isStreaming, addRow]);

  const columns = React.useMemo<ColumnDef<Person>[]>(
    () => [
      {
        id: "drag-handle",
        header: () => <GripVertical className="h-4 w-4" />,
        cell: () => <GripVertical className="h-4 w-4 text-muted-foreground" />,
        size: 40,
        enableSorting: false,
        enableHiding: false,
      },
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
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
      {
        accessorKey: "id",
        header: ({ column }) => (
          <>
            ID
            {column.getCanSort() && <ArrowUpDown className="ml-2 h-4 w-4" />}
          </>
        ),
        size: 80,
      },
      {
        accessorKey: "firstName",
        header: ({ column }) => (
          <>
            First Name
            {column.getCanSort() && <ArrowUpDown className="ml-2 h-4 w-4" />}
          </>
        ),
      },
      {
        accessorKey: "lastName",
        header: ({ column }) => (
          <>
            Last Name
            {column.getCanSort() && <ArrowUpDown className="ml-2 h-4 w-4" />}
          </>
        ),
      },
      {
        accessorKey: "age",
        header: ({ column }) => (
          <>
            Age
            {column.getCanSort() && <ArrowUpDown className="ml-2 h-4 w-4" />}
          </>
        ),
        size: 80,
      },
      {
        accessorKey: "visits",
        header: ({ column }) => (
          <>
            Visits
            {column.getCanSort() && <ArrowUpDown className="ml-2 h-4 w-4" />}
          </>
        ),
        size: 80,
      },
      {
        accessorKey: "status",
        header: "Status",
        filterFn: (row, id, value) => {
          return value.includes(row.getValue(id));
        },
        cell: ({ row }) => {
          const status = row.original.status;
          return (
            <Badge
              variant={
                status === "complicated"
                  ? "destructive"
                  : status === "relationship"
                  ? "default"
                  : "secondary"
              }
              className="capitalize"
            >
              {status}
            </Badge>
          );
        },
      },
      {
        accessorKey: "progress",
        header: ({ column }) => (
          <>
            Profile Progress
            {column.getCanSort() && <ArrowUpDown className="ml-2 h-4 w-4" />}
          </>
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Progress value={row.original.progress} className="w-24" />
            <span>{row.original.progress}%</span>
          </div>
        ),
      },
      {
        id: "actions",
        cell: ({ row }) => (
          <DropdownMenu
            open={openActionMenu === String(row.original.id)}
            onOpenChange={(isOpen) =>
              setOpenActionMenu(isOpen ? String(row.original.id) : null)
            }
          >
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => {
                  navigator.clipboard.writeText(String(row.original.id));
                  toast({
                    title: "Copied!",
                    description: `Row ID ${row.original.id} copied to clipboard.`,
                  });
                }}
              >
                Copy row ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setDialogRow(row.original)}>
                View details
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => deleteRow([row.original.id])}
                className="text-red-600"
              >
                Delete row
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
        size: 50,
        enableSorting: false,
        enableHiding: false,
      },
    ],
    [toast, openActionMenu, deleteRow]
  );

  const columnOrderIds = React.useMemo(() => columns.map((c) => c.id!), [
    columns,
  ]);
  const [columnOrder, setColumnOrder] = React.useState<ColumnOrderState>(
    columnOrderIds
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnOrder,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onColumnOrderChange: setColumnOrder,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: paginationEnabled
      ? getPaginationRowModel()
      : undefined,
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    columnResizeMode: "onChange",
    enableSorting: sortingEnabled,
    initialState: {
      pagination: {
        pageSize: 20,
      },
    },
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setColumnOrder((currentOrder) => {
        const oldIndex = currentOrder.indexOf(active.id as string);
        const newIndex = currentOrder.indexOf(over.id as string);
        return arrayMove(currentOrder, oldIndex, newIndex);
      });
    }
  };

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {})
  );

  return (
    <div className="space-y-4">
      <DataTableToolbar table={table} />

      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center space-x-2">
          <Switch
            id="sorting-enable"
            checked={sortingEnabled}
            onCheckedChange={(enabled) => {
              if (!enabled) {
                setSorting([]);
              }
              setSortingEnabled(enabled);
            }}
          />
          <Label htmlFor="sorting-enable">Enable Sorting</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="pagination-enable"
            checked={paginationEnabled}
            onCheckedChange={setPaginationEnabled}
          />
          <Label htmlFor="pagination-enable">Enable Pagination</Label>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <Button
          onClick={() => {
            const newRows = makeData(1);
            addRow(newRows);
            toast({
              title: "Row added",
              description: `Added row ID ${newRows[0].id}.`,
            });
          }}
          variant="outline"
          size="sm"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Row
        </Button>
        <Button
          onClick={() => setIsStreaming((prev) => !prev)}
          variant="outline"
          size="sm"
          className="w-[180px]"
        >
          {isStreaming ? (
            <Square className="mr-2 h-4 w-4" />
          ) : (
            <Play className="mr-2 h-4 w-4" />
          )}
          {isStreaming ? "Stop Streaming" : "Start Streaming"}
        </Button>
        <Button
          onClick={() => {
            if (data.length === 0) {
              toast({
                variant: "destructive",
                title: "Cannot update",
                description: "Table is empty.",
              });
              return;
            }
            const randomIndex = Math.floor(Math.random() * data.length);
            const rowToUpdate = data[randomIndex];
            if (!rowToUpdate) return;
            const updatedRow = {
              ...rowToUpdate,
              visits: rowToUpdate.visits + 100,
              progress: Math.min(100, rowToUpdate.progress + 10),
            };
            updateRow([updatedRow]);
            toast({
              title: "Row updated",
              description: `Updated row ID ${updatedRow.id}.`,
            });
          }}
          variant="outline"
          size="sm"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Update Random
        </Button>
        <Button
          onClick={() => {
            const selectedRows = table.getFilteredSelectedRowModel().rows;
            if (selectedRows.length === 0) {
              toast({
                variant: "destructive",
                title: "No rows selected",
                description: "Please select rows to delete.",
              });
              return;
            }
            const idsToDelete = selectedRows.map((row) => row.original.id);
            deleteRow(idsToDelete);
            table.resetRowSelection();
            toast({
              title: "Rows deleted",
              description: `${idsToDelete.length} row(s) deleted.`,
            });
          }}
          variant="destructive"
          size="sm"
          disabled={table.getFilteredSelectedRowModel().rows.length === 0}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Selected
        </Button>
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

      <div className="rounded-md border">
        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          sensors={sensors}
        >
          <Table style={{ width: table.getCenterTotalSize() }}>
            <TableHeader className="sticky top-0 z-10 bg-card">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  <SortableContext
                    items={columnOrder}
                    strategy={horizontalListSortingStrategy}
                  >
                    {headerGroup.headers.map((header) => (
                      <DraggableColumnHeader key={header.id} header={header}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </DraggableColumnHeader>
                    ))}
                  </SortableContext>
                </TableRow>
              ))}
            </TableHeader>
            <TableBody
              onMouseLeave={() => setOpenActionMenu(null)}
            >
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    onDoubleClick={() => setDialogRow(row.original)}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      setOpenActionMenu(String(row.original.id));
                    }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        style={{ width: cell.column.getSize() }}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </DndContext>
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
                onValueChange={(value) => {
                  table.setPageSize(Number(value));
                }}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue
                    placeholder={table.getState().pagination.pageSize}
                  />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 50, 100, 500, 1000].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-[100px] items-center justify-center text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to first page</span>
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to previous page</span>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to next page</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to last page</span>
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
      <AlertDialog
        open={!!dialogRow}
        onOpenChange={(isOpen) => !isOpen && setDialogRow(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Row Details</AlertDialogTitle>
            <AlertDialogDescription>
              Viewing full data for row ID: {dialogRow?.id}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="max-h-96 overflow-y-auto rounded-md border bg-muted p-4">
            <pre>
              <code>{JSON.stringify(dialogRow, null, 2)}</code>
            </pre>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDialogRow(null)}>
              Close
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
