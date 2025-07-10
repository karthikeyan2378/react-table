# Real-Time Alarm Dashboard Components

This project contains a set of reusable components for displaying real-time data in a highly configurable table, complete with filtering, sorting, and charting capabilities. The main component, `DataTable`, has been architected to be generic and reusable.

The components are built with React and ShadCN UI and use the Tailwind CSS CDN for styling.

---

## Features

-   **Generic `DataTable` Component**: Render any data structure with a simple configuration.
-   **Virtualization**: Handles thousands of rows smoothly using TanStack Virtual.
-   **Client-Side Operations**: Fast filtering, sorting, and pagination.
-   **Column Customization**: Resizing, reordering, and hiding/showing columns.
-   **Advanced Selection**: Multi-row selection with Shift and Ctrl/Cmd keys, plus drag-to-select.
-   **Data Export**: Export the current view to CSV, Excel, or PDF.
-   **Config-Driven UI**: Table columns, filters, and charts are all driven by a central configuration file.
-   **Context Menu**: Right-click on rows for custom actions.
-   **Configurable Pagination**: Customize the initial page size and the "rows per page" options.
-   **Configurable Toolbar**: Show or hide individual toolbar controls like "Add Row" or "Export" via props.

---

## How to Use the `DataTable` Component

The `DataTable` component is generic and can be used to render any kind of data. All application-specific logic, such as column definitions and cell rendering, is passed in as props.

### Step 1: Import the Component

First, import the `DataTable` component into your React component file.

```tsx
import { DataTable } from './FMComponents/data-table'; // Adjust path if needed
```

### Step 2: Define Your Columns

The table's structure is defined by a `columns` array, which you create using the `ColumnDef` type from `@tanstack/react-table`. This is where you specify what each column displays.

```tsx
import { type ColumnDef } from '@tanstack/react-table';

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
    accessorKey: "status",
    header: "Status",
    // Use the `cell` property to customize rendering
    cell: ({ row }) => {
      const status = row.getValue("status");
      // Example of custom rendering (e.g., a colored badge)
      return <div className={`capitalize text-white p-1 rounded ${status === 'success' ? 'bg-green-500' : 'bg-yellow-500'}`}>{status}</div>;
    },
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "amount",
    header: "Amount",
    // Format numbers as currency
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);
      return <div className="font-medium">{formatted}</div>;
    },
  },
];
```

### Step 3: Render the DataTable

Pass your data and columns to the `DataTable` component. You must also provide a `getRowId` function that returns a unique identifier for each row, along with any other required state and handlers.

```tsx
import React from 'react';
import { DataTable, type ContextMenuItem, type ToolbarVisibility } from './FMComponents/data-table';
import { columns, type Payment } from './your-column-definitions';

// Sample data
const myData: Payment[] = [
  // ... your data array
];

function MyPageComponent() {
  const [selectedRowIds, setSelectedRowIds] = React.useState<string[]>([]);
  const [globalFilter, setGlobalFilter] = React.useState('');
  const [isStreaming, setIsStreaming] = React.useState(false);
  const tableContainerRef = React.useRef<HTMLDivElement>(null);

  // Define filterable columns for the toolbar
  const filterableColumns = [
    { id: 'status', name: 'Status', type: 'categorical', options: [] },
    { id: 'email', name: 'Email', type: 'text' },
  ];
  
  const handleAddRow = () => { /* ... logic to add a new row ... */ };
  const handleDeleteRows = () => { /* ... logic to delete selected rows ... */ };
  const handleExportCsv = () => { /* ... logic to export CSV ... */ };

  // Define context menu items
  const contextMenuItems: ContextMenuItem<Payment>[] = [
    {
      label: 'View Details',
      onClick: (rowData) => console.log('Viewing:', rowData),
    },
    {
      label: 'Copy ID',
      onClick: (rowData) => navigator.clipboard.writeText(rowData.id),
    }
  ];

  // Optionally, configure toolbar visibility
  const toolbarVisibility: ToolbarVisibility = {
    addRow: true,
    deleteRows: true,
    toggleStreaming: false, // Hide the streaming button
    exportData: true,
    viewOptions: true,
  };

  return (
    <DataTable
      data={myData}
      columns={columns}
      getRowId={(row) => row.id}
      tableContainerRef={tableContainerRef}
      onSelectedRowsChange={setSelectedRowIds}
      globalFilter={globalFilter}
      onGlobalFilterChange={setGlobalFilter}
      filterableColumns={filterableColumns}
      isStreaming={isStreaming}
      onToggleStreaming={() => setIsStreaming(prev => !prev)}
      onAddRow={handleAddRow}
      onDeleteSelectedRows={handleDeleteRows}
      onExportCsv={handleExportCsv}
      // ... other export handlers
      contextMenuItems={contextMenuItems}
      toolbarVisibility={toolbarVisibility}
      tableTitle="My Custom Table"
      tableDescription="This is an example of the DataTable component."
      maxHeightWithPagination="70vh"
      initialRowsPerPage={50}
      rowsPerPageOptions={[25, 50, 100]}
    />
  );
}
```

### DataTable Props

| Prop | Type | Description |
| --- | --- | --- |
| `data` | `TData[]` | **Required.** The array of data to display. |
| `columns` | `ColumnDef<TData>[]` | **Required.** The TanStack Table column definitions. |
| `getRowId` | `(row: TData) => string` | **Required.** A function that returns a unique ID for each row. |
| `tableContainerRef` | `React.RefObject<HTMLDivElement>` | **Required.** A ref to the scrollable table container, for virtualization. |
| `onSelectedRowsChange` | `(rows: TData[]) => void` | **Required.** Callback for when row selection changes. |
| `globalFilter` | `string` | **Required.** The current value of the global search filter. |
| `onGlobalFilterChange` | `(value: string) => void` | **Required.** Callback for when the global filter value changes. |
| `columnFilters` | `ColumnFiltersState` | **Required.** State for column-specific filters. |
| `onColumnFiltersChange` | `React.Dispatch<React.SetStateAction<ColumnFiltersState>>` | **Required.** Callback to update column-specific filters. |
| `filterableColumns` | `FilterableColumn[]` | Defines columns that can be filtered via the toolbar. |
| `isStreaming` | `boolean` | Indicates if data is currently streaming. |
| `onToggleStreaming` | `() => void` | Callback to toggle the data stream on or off. |
| `onAddRow` | `() => void` | Callback for adding a new row. |
| `onDeleteSelectedRows` | `() => void` | Callback for deleting selected rows. |
| `onExportCsv` | `() => void` | Callback for exporting data to CSV. |
| `onExportXlsx` | `() => void` | Callback for exporting data to XLSX. |
| `onExportPdf` | `() => void` | Callback for exporting data to PDF. |
| `contextMenuItems` | `ContextMenuItem<TData>[]` | An array of objects defining items for the row's context menu. |
| `toolbarVisibility` | `ToolbarVisibility` | An object to control the visibility of individual toolbar elements. Defaults to all visible. |
| `tableTitle` | `React.ReactNode` | A title to display above the table. |
| `tableDescription` | `React.ReactNode` | A description to display below the title. |
| `maxHeightWithPagination`| `string` | CSS `max-height` for the table when pagination is on. Default: `'60vh'`. |
| `maxHeightWithoutPagination` | `string` | CSS `max-height` for the table when pagination is off. Default: `'80vh'`. |
| `initialRowsPerPage` | `number` | The number of rows to display per page initially. Default: `20`. |
| `rowsPerPageOptions` | `number[]` | An array of numbers for the "Rows per page" dropdown. Default: `[10, 20, 50, 100, 500, 1000]` |
| `onTableReady` | `(table: ReactTable<TData>) => void` | Callback that provides the table instance once it's initialized. |


### ToolbarVisibility Object

The `toolbarVisibility` prop is an object with the following optional boolean properties. If a property is omitted, it defaults to `true`.

-   `addRow`: Show the "Add Row" button.
-   `deleteRows`: Show the "Delete Selected" button.
-   `toggleStreaming`: Show the "Start/Stop Streaming" button.
-   `exportData`: Show the "Export" dropdown menu.
-   `viewOptions`: Show the "View Options" dropdown menu.
-   `toggleSorting`: Show the "Enable Sorting" option within the View Options menu.
-   `togglePagination`: Show the "Enable Pagination" option within the View Options menu.
-   `toggleColumns`: Show the "Toggle Columns" list within the View Options menu.


---

## How to Integrate into Another React Project

If you want to use these components in a separate React application, you need to copy the files and set up the dependencies and styling.

### Step 1: Copy Component Files

Copy the following files and directories from this project into the `src` directory of your new project:

-   `src/FMComponents`
-   `src/hooks`
-   `src/lib`
-   `src/config`

### Step 2: Install Dependencies

Install the necessary packages. Open a terminal in your new project's root directory and run the following commands.

**Production Dependencies:**
```bash
npm install @radix-ui/react-alert-dialog @radix-ui/react-checkbox @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-label @radix-ui/react-scroll-area @radix-ui/react-select @radix-ui/react-separator @radix-ui/react-slot @radix-ui/react-switch @radix-ui/react-toast @radix-ui/react-tooltip @tanstack/react-table @tanstack/react-virtual class-variance-authority clsx date-fns exceljs jspdf jspdf-autotable lucide-react next react react-dom recharts tailwind-merge
```

**Development Dependencies (for TypeScript users):**
```bash
npm install -D @types/node @types/react @types/react-dom typescript
```

### Step 3: Configure Styling via CDN

This project uses the Tailwind CSS CDN for styling. Add the following script tag to the `<head>` of your main HTML file (e.g., `public/index.html` or your root layout component).

```html
<script src="https://cdn.tailwindcss.com"></script>
```
**Note**: Because this project uses the Tailwind CDN, it does not support theme customization (e.g., `tailwind.config.ts`) or plugins like `tailwindcss-animate`. All styles use standard Tailwind classes.

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
