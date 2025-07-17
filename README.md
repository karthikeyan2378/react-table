# Real-Time Data Table Components

This project contains a highly configurable, high-performance data table built from scratch using React. It is designed to be a lightweight, dependency-free solution for displaying and interacting with large, real-time datasets.

All core functionalities, including virtualization, sorting, filtering, column resizing, and row selection, have been custom-built to provide a fast and seamless user experience without relying on heavy external table libraries.

---

## Features

-   **From-Scratch Generic `DataTable`**: Render any data structure with a simple configuration. No external table libraries needed.
-   **Custom Row Virtualization**: Handles thousands of rows smoothly by rendering only the visible items.
-   **Client-Side Operations**: Fast filtering, sorting, and pagination.
-   **Full Column Customization**: Resize, reorder, and hide/show columns with native drag-and-drop.
-   **Advanced Selection**: Multi-row selection with Shift and Ctrl/Cmd keys, plus drag-to-select.
-   **Frozen Columns**: "Freeze" columns to the left side of the table for better context while scrolling horizontally.
-   **Data Export**: Export the current view to CSV, Excel, or PDF.
-   **Config-Driven UI**: Table columns, filters, and charts are all driven by a central configuration file.
-   **Context Menu**: Right-click on rows for custom actions.
-   **Customizable Toolbar & Pagination**: Configure every aspect of the toolbar and pagination controls via props.

---

## How to Use the `DataTable` Component

The `DataTable` component is generic and can be used to render any kind of data. All application-specific logic, such as column definitions and cell rendering, is passed in as props.

### Step 1: Import the Component

First, import the `DataTable` component and its related types into your React component file.

```tsx
import { DataTable } from './FMComponents/data-table'; // Adjust path if needed
import { type ColumnDef } from './types'; // Import custom ColumnDef type
```

### Step 2: Define Your Columns

The table's structure is defined by a `columns` array. This is where you specify the `id`, `accessorKey`, and how to render the `header` and `cell` for each column.

```tsx
// Define the shape of your data
export type Payment = {
  id: string;
  amount: number;
  status: "pending" | "processing" | "success" | "failed";
  email: string;
};

// Create the columns array
export const columns: ColumnDef<Payment>[] = [
  {
    id: "status",
    accessorKey: "status",
    header: ({ onSort, sortState }) => <button onClick={() => onSort('status')}>Status</button>,
    cell: ({ row }) => {
      const status = row.status;
      // Example of custom rendering (e.g., a colored badge)
      return <div className={`capitalize text-white p-1 rounded ${status === 'success' ? 'bg-green-500' : 'bg-yellow-500'}`}>{status}</div>;
    },
    size: 150, // Default width
  },
  {
    id: "email",
    accessorKey: "email",
    header: ({ onSort, sortState }) => <button onClick={() => onSort('email')}>Email</button>,
    cell: ({ row }) => <div>{row.email}</div>,
    size: 250,
  },
  // ... other columns
];
```

### Step 3: Render the DataTable

Pass your data and columns to the `DataTable` component. You must also provide a `getRowId` function that returns a unique identifier for each row, along with the required state and handlers.

```tsx
import React from 'react';
import { DataTable } from './FMComponents/data-table';
import { columns, type Payment } from './your-column-definitions';

// Sample data
const myData: Payment[] = [ /* ... your data array ... */ ];

function MyPageComponent() {
  const [selectedRows, setSelectedRows] = React.useState<Payment[]>([]);
  const [globalFilter, setGlobalFilter] = React.useState('');
  const [columnFilters, setColumnFilters] = React.useState([]);
  const [isStreaming, setIsStreaming] = React.useState(false);
  const tableContainerRef = React.useRef<HTMLDivElement>(null);

  return (
    <DataTable
      data={myData}
      columns={columns}
      getRowId={(row) => row.id}
      tableContainerRef={tableContainerRef}
      onSelectedRowsChange={setSelectedRows}
      globalFilter={globalFilter}
      onGlobalFilterChange={setGlobalFilter}
      columnFilters={columnFilters}
      onColumnFiltersChange={setColumnFilters}
      frozenColumns={['select', 'status']} // Example of frozen columns
      // ... other props
    />
  );
}
```

### DataTable Props

| Prop | Type | Description |
| --- | --- | --- |
| `data` | `TData[]` | **Required.** The array of data to display. |
| `columns` | `ColumnDef<TData>[]` | **Required.** The custom column definitions. |
| `getRowId` | `(row: TData) => string` | **Required.** A function that returns a unique ID for each row. |
| `tableContainerRef` | `React.RefObject<HTMLDivElement>` | **Required.** A ref to the scrollable table container, for virtualization. |
| `onSelectedRowsChange`| `(rows: TData[]) => void` | **Required.** Callback for when row selection changes. |
| `globalFilter` | `string` | **Required.** The current value of the global search filter. |
| `onGlobalFilterChange` | `(value: string) => void` | **Required.** Callback for when the global filter value changes. |
| `columnFilters` | `ColumnFiltersState` | **Required.** State for column-specific filters. |
| `onColumnFiltersChange`| `React.Dispatch<...>` | **Required.** Callback to update column-specific filters. |
| `frozenColumns` | `string[]` | An array of column IDs to freeze to the left. |
| `filterableColumns` | `FilterableColumn[]` | Defines columns that can be filtered via the toolbar. |
| `contextMenuItems` | `ContextMenuItem<TData>[]`| An array of objects defining items for the row's context menu. |
| `onRowDoubleClick` | `(row: TData) => void` | Callback for when a row is double-clicked. |
| `toolbarVisibility` | `ToolbarVisibility` | An object to control the visibility of individual toolbar elements. |
| `isStreaming` | `boolean` | Indicates if data is currently streaming. |
| `onToggleStreaming` | `() => void` | Callback to toggle the data stream on or off. |
| `onAddRow` | `() => void` | Callback for adding a new row. |
| `onUpdateRow` | `() => void` | Callback for updating the selected row. |
| `onDeleteSelectedRows`| `() => void` | Callback for deleting selected rows. |
| `onExportCsv` | `() => void` | Callback for exporting data to CSV. |
| `onExportXlsx` | `() => void` | Callback for exporting data to XLSX. |
| `onExportPdf` | `() => void` | Callback for exporting data to PDF. |
| `tableTitle` | `React.ReactNode` | A title to display above the table. |
| `tableDescription` | `React.ReactNode` | A description to display below the title. |
| `maxHeightWithPagination`| `string` | CSS `max-height` for the table when pagination is on. Default: `'60vh'`. |
| `initialRowsPerPage` | `number` | The number of rows to display per page initially. Default: `20`. |

---

## How to Integrate into Another React Project

To use these components in a separate React application, you need to copy the files and set up the dependencies and styling.

### Step 1: Copy Component Files

Copy the following files and directories from this project into the `src` directory of your new project:

-   `src/FMComponents`
-   `src/hooks`
-   `src/lib`
-   `src/config`
-   `src/app/types.ts` (or wherever you want to keep your type definitions)

### Step 2: Install Dependencies

For data export functionality, you need to install a few packages. Other features are dependency-free.

```bash
npm install exceljs jspdf jspdf-autotable
```

### Step 3: Import CSS Files

This project uses custom CSS files for all styling. You must import these stylesheets into your application's main entry point or root layout component.

In your `src/app/layout.tsx` (or equivalent), add the following imports:
```tsx
import './globals.css';
import './custom-styles.css';
import '../FMComponents/data-table.css';
import '../FMComponents/status-chart.css';
import '../FMComponents/ui/modal.css';
import '../FMComponents/ui/button.css';
```

Make sure the paths are correct based on where you copied the files.

### Step 4: Add the Toaster Provider

For notifications to work, add the `<Toaster />` component to the root of your application (e.g., inside `App.jsx` or your main layout component).

```tsx
import { Toaster } from './FMComponents/ui/toaster'; // Adjust path if needed

function App() {
  return (
    <>
      {/* The rest of your application */}
      <Toaster />
    </>
  );
}
```
