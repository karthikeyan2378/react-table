"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnOrderState,
  flexRender,
  getCoreRowModel,
  Header,
  SortingState,
  useReactTable,
  getSortedRowModel,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
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
  Pause,
  Play,
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
  const [isStreaming, setIsStreaming] = React.useState(false);
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

  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isStreaming) {
      interval = setInterval(() => {
        setData((old) => [...makeData(10), ...old]);
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isStreaming]);

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
    columnResizeMode: "onChange",
  });

  const tableContainerRef = React.useRef<HTMLDivElement>(null);
  const { rows } = table.getRowModel();
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 45, // Adjust this to your row height
    overscan: 20,
  });

  const virtualRows = rowVirtualizer.getVirtualItems();

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
      <div className="flex items-center gap-4">
        <Button onClick={() => setIsStreaming((prev) => !prev)} variant="outline" className="w-40">
          {isStreaming ? (
            <>
              <Pause className="mr-2 h-4 w-4" /> Pause Stream
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" /> Start Stream
            </>
          )}
        </Button>
        <div className="text-sm text-muted-foreground">
          <span className="font-bold text-foreground">{data.length.toLocaleString()}</span> rows
        </div>
      </div>
      <div
        ref={tableContainerRef}
        className="rounded-md border overflow-auto relative"
        style={{ height: "600px" }}
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
            <TableBody
              style={{
                height: `${rowVirtualizer.getTotalSize()}px`,
                position: "relative",
              }}
            >
              {virtualRows.map((virtualRow) => {
                const row = rows[virtualRow.index];
                return (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${virtualRow.start}px)`,
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
                );
              })}
            </TableBody>
          </Table>
        </DndContext>
      </div>
    </div>
  );
}
