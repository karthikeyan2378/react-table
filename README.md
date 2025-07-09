
# Real-Time Alarm Dashboard Components

This project contains a set of reusable components for displaying real-time data in a highly configurable table, complete with filtering, sorting, and charting capabilities. The main component, `DataTable`, has been architected to be generic and reusable.

The components are built with React, ShadCN UI, and Tailwind CSS and have been refactored to use relative paths for easy integration into other projects.

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

Pass your data and columns to the `DataTable` component. You must also provide a `getRowId` function that returns a unique identifier for each row.

```tsx
import React from 'react';
import { DataTable } from './FMComponents/data-table';
import { columns, type Payment } from './your-column-definitions';

// Sample data
const myData: Payment[] = [
  // ... your data array
];

function MyPageComponent() {
  const [selectedRowIds, setSelectedRowIds] = React.useState<string[]>([]);

  return (
    <DataTable
      data={myData}
      columns={columns}
      getRowId={(row) => row.id}
      onSelectedRowsChange={setSelectedRowIds}
      // You can also pass a function to render a context menu for each row
      renderRowContextMenu={(row) => (
        <MyCustomContextMenu rowData={row} />
      )}
    />
  );
}
```

By following these steps, you can use the powerful, generic `DataTable` to display any data set with custom rendering, sorting, filtering, and more.

---

## How to Integrate into Another React Project

If you want to use these components in a separate React application, you need to copy the files and set up the dependencies and styling.

### Step 1: Copy Component Files and Configuration

Copy the following files and directories from this project into the `src` directory of your new project:

-   `src/FMComponents`
-   `src/hooks`
-   `src/lib`
-   `src/config`
-   Copy `tailwind.config.ts` and `postcss.config.mjs` to the root of your new project.

### Step 2: Install Dependencies

Install the necessary packages. Open a terminal in your new project's root directory and run the following commands:

**Install main dependencies:**
```bash
npm install @radix-ui/react-alert-dialog @radix-ui/react-checkbox @radix-ui/react-dropdown-menu @radix-ui/react-label @radix-ui/react-select @radix-ui/react-separator @radix-ui/react-slot @radix-ui/react-switch @radix-ui/react-toast @radix-ui/react-tooltip @tanstack/react-table @tanstack/react-virtual class-variance-authority clsx date-fns lucide-react recharts tailwind-merge tailwindcss-animate
```

**Install Tailwind CSS development dependencies:**
```bash
npm install -D tailwindcss postcss autoprefixer
```

### Step 3: Configure Styling

The components rely on CSS variables for their color theme. Copy the contents of this project's `src/app/globals.css` file into your own global stylesheet. It contains the necessary `@tailwind` directives and the `:root` and `.dark` theme definitions.

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 222 47% 97%;
    --foreground: 222 47% 11%;
    --primary: 195 100% 50%;
    /* ... (add all other CSS variables from the original globals.css) */
  }

  .dark {
    /* Optional: Add dark mode variables if needed */
  }
}
```

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
