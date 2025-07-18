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
-   **Data Export**: Export the current view to CSV, Excel, or PDF (requires `exceljs`, `jspdf`, `jspdf-autotable`).
-   **Config-Driven UI**: Table columns, filters, and charts are all driven by a central configuration file.
-   **Context Menu**: Right-click on rows for custom actions.
-   **Customizable Toolbar & Pagination**: Configure every aspect of the toolbar and pagination controls via props.
-   **Integrated Charting**: Visualize data distributions with integrated charts powered by `recharts`.

---

## How to Integrate into Another React Project

To use these components in a separate React application, you need to copy the files and set up the dependencies and styling.

### Step 1: Copy Component Files

Copy the entire `src/FMComponents` directory from this project into the `src` directory of your new project. You can also copy over the `src/hooks`, `src/lib`, and `src/config` directories if you wish to use the full functionality as-is.

### Step 2: Install Dependencies

This project uses `recharts` for charting and other packages for data export.

```bash
npm install recharts exceljs jspdf jspdf-autotable
```

### Step 3: Import CSS Files

This project uses custom CSS files for all styling. You must import these stylesheets into your application's main entry point or root layout component.

In your `src/app/layout.tsx` (or equivalent), add the following imports:
```tsx
import './globals.css';
import './custom-styles.css';
import '../FMComponents/css/data-table.css';
import '../FMComponents/css/status-chart.css';
import '../FMComponents/css/modal.css';
import '../FMComponents/css/button.css';
```

Make sure the paths are correct based on where you copied the files.

### Step 4: Add the Toaster Provider

For notifications to work, add the `<Toaster />` component to the root of your application (e.g., inside `App.jsx` or your main layout component).

```tsx
import { Toaster } from './FMComponents/Toaster'; // Adjust path if needed

function App() {
  return (
    <>
      {/* The rest of your application */}
      <Toaster />
    </>
  );
}
```
