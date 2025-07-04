
"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnOrderState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  Header,
  SortingState,
  useReactTable,
  getSortedRowModel,
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
  GripVertical,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

import type { Person } from "@/lib/data";
import { makeData } from "@/lib/data";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

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
  });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 10 : 1,
    position: "relative",
  };

  return (
    <TableHead
      ref={setNodeRef}
      colSpan={header.colSpan}
      style={{ ...style, width: header.getSize() }}
      className="p-0"
    >
      <div className="flex items-center h-full">
        <div {...attributes} {...listeners} className="flex-1 flex items-center gap-2 pl-4 pr-2 py-3.5 h-full cursor-grab">
          {children}
        </div>
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

  const columns = React.useMemo<ColumnDef<Person>[]>(
    () => [
      {
        id: 'drag-handle',
        header: () => <GripVertical className="h-4 w-4" />,
        cell: () => <GripVertical className="h-4 w-4 text-muted-foreground" />,
        size: 40,
      },
      {
        accessorKey: "id",
        header: "ID",
        size: 60,
      },
      {
        accessorKey: "firstName",
        header: "First Name",
      },
      {
        accessorKey: "lastName",
        header: "Last Name",
      },
      {
        accessorKey: "age",
        header: "Age",
        size: 50,
      },
      {
        accessorKey: "visits",
        header: "Visits",
        size: 80,
      },
      {
        accessorKey: "status",
        header: "Status",
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
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Profile Progress
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  navigator.clipboard.writeText(String(row.original.id));
                  toast({ title: "Copied!", description: `Row ID ${row.original.id} copied to clipboard.` });
                }}
              >
                Copy row ID
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
        size: 50,
      },
    ],
    [toast]
  );
  
  const columnOrderIds = React.useMemo(() => columns.map(c => c.id!), [columns])
  const [columnOrder, setColumnOrder] = React.useState<ColumnOrderState>(columnOrderIds);

  const addRow = (newRows: Person[]) => {
    setData(oldData => [...newRows, ...oldData]);
    toast({ title: "Row added", description: `Added row ID ${newRows[0].id}.` });
  };

  const updateRow = (updatedRows: Person[]) => {
    setData(oldData =>
      oldData.map(row => {
        const updatedRow = updatedRows.find(ur => ur.id === row.id);
        return updatedRow ? { ...row, ...updatedRow } : row;
      })
    );
  };

  const deleteRow = (rowIdsToDelete: number[]) => {
    setData(oldData =>
      oldData.filter(row => !rowIdsToDelete.includes(row.id))
    );
  };

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnOrder,
    },
    onSortingChange: setSorting,
    onColumnOrderChange: setColumnOrder,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    columnResizeMode: "onChange",
    initialState: {
        pagination: {
            pageSize: 20,
        },
    }
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
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <Button onClick={() => addRow(makeData(1))} variant="outline">
          <Plus className="mr-2 h-4 w-4" />
          Add Row
        </Button>
        <Button
          onClick={() => {
            if (data.length === 0) {
              toast({ variant: "destructive", title: "Cannot update", description: "Table is empty." });
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
            toast({ title: "Row updated", description: `Updated row ID ${updatedRow.id}.` });
          }}
          variant="outline"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Update Random
        </Button>
        <Button
          onClick={() => {
            if (data.length === 0) {
              toast({ variant: "destructive", title: "Cannot delete", description: "Table is empty." });
              return;
            }
            const randomIndex = Math.floor(Math.random() * data.length);
            const rowToDelete = data[randomIndex];
            if (!rowToDelete) return;
            deleteRow([rowToDelete.id]);
            toast({ title: "Row deleted", description: `Deleted row ID ${rowToDelete.id}.` });
          }}
          variant="outline"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Random
        </Button>
        <div className="text-sm text-muted-foreground ml-auto">
          <span className="font-bold text-foreground">{data.length.toLocaleString()}</span> rows
        </div>
      </div>
      <div
        className="rounded-md border"
      >
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
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map(row => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map(cell => (
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
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </DndContext>
      </div>
      <div className="flex items-center justify-between py-4">
        <div className="flex-1 text-sm text-muted-foreground">
        </div>
        <div className="flex items-center space-x-6 lg:space-x-8">
            <div className="flex items-center space-x-2">
                <p className="text-sm font-medium">Rows per page</p>
                <Select
                    value={`${table.getState().pagination.pageSize}`}
                    onValueChange={(value) => {
                        table.setPageSize(Number(value))
                    }}
                >
                    <SelectTrigger className="h-8 w-[70px]">
                        <SelectValue placeholder={table.getState().pagination.pageSize} />
                    </SelectTrigger>
                    <SelectContent side="top">
                        {[10, 20, 50, 100].map((pageSize) => (
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
    </div>
  );
}
