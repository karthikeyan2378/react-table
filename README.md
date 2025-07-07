# Real-Time Alarm Dashboard Components

This project contains a set of reusable components for displaying real-time data in a highly configurable table, complete with filtering, sorting, and charting capabilities.

The components are built with React, ShadCN UI, and Tailwind CSS and have been refactored to use relative paths for easy integration into other projects, regardless of the framework (Vite, Create React App, etc.).

## How to Integrate into Another React Project

Follow these steps to use these components in a separate React application.

### Step 1: Copy Component Files

Copy the following directories from this project into the `src` directory of your new project:

-   `src/FMComponents`
-   `src/config`
-   `src/hooks`
-   `src/lib`

Your new project's `src` folder should now contain these directories.

### Step 2: Install Dependencies

Install the necessary packages. Open a terminal in your new project's root directory and run the following command:

```bash
npm install @radix-ui/react-alert-dialog @radix-ui/react-checkbox @radix-ui/react-dropdown-menu @radix-ui/react-label @radix-ui/react-select @radix-ui/react-separator @radix-ui/react-slot @radix-ui/react-switch @radix-ui/react-toast @radix-ui/react-tooltip @tanstack/react-table class-variance-authority clsx date-fns lucide-react recharts tailwind-merge tailwindcss-animate
```

If your project uses TypeScript, you may also need the associated type definitions.

### Step 3: Configure Tailwind CSS

Properly setting up Tailwind is essential for the components' styling to work correctly.

**A. Create `tailwind.config.js`**

If you don't already have one, create a `tailwind.config.js` file at the root of your new project and add the following content. This defines the theme (colors, fonts, etc.) that the components rely on.

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}', // Make sure this path covers all your component files
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

**B. Update Global CSS File**

Open your main CSS file (e.g., `src/index.css` or `src/app.css`) and add the following at the top. This sets up the Tailwind directives and the CSS variables for the color theme.

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 222 47% 97%;
    --foreground: 222 47% 11%;
    --card: 0 0% 100%;
    --card-foreground: 222 47% 11%;
    --popover: 0 0% 100%;
    --popover-foreground: 222 47% 11%;
    --primary: 195 100% 50%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 210 40% 9.8%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 210 40% 45.1%;
    --accent: 146 51% 36%;
    --accent-foreground: 0 0% 98%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 195 100% 50%;
    --chart-1: 12 76% 61%;
    --chart-2: 173 58% 39%;
    --chart-3: 197 37% 24%;
    --chart-4: 43 74% 66%;
    --chart-5: 27 87% 67%;
    --radius: 0.5rem;
  }

  .dark {
    /* Optional: Add dark mode variables if needed */
    --background: 222 47% 11%;
    --foreground: 210 40% 98%;
    --card: 222 47% 11%;
    --card-foreground: 210 40% 98%;
    --popover: 222 47% 11%;
    --popover-foreground: 210 40% 98%;
    --primary: 195 100% 50%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 14.9%;
    --secondary-foreground: 210 40% 98%;
    --muted: 210 40% 14.9%;
    --muted-foreground: 210 40% 63.9%;
    --accent: 146 51% 36%;
    --accent-foreground: 0 0% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 0 0% 98%;
    --border: 214.3 31.8% 21.4%;
    --input: 214.3 31.8% 21.4%;
    --ring: 195 100% 50%;
    --chart-1: 220 70% 50%;
    --chart-2: 160 60% 45%;
    --chart-3: 30 80% 55%;
    --chart-4: 280 65% 60%;
    --chart-5: 340 75% 55%;
  }
}
```

### Step 4: Add the Toaster Provider

For notifications to work, you must add the `<Toaster />` component to the root of your application (e.g., inside `App.jsx` or your main layout component).

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

export default App;
```

### Step 5: Use the Components

You are now ready to use the components. You can use the `page.tsx` from this project as a template for how to implement the `DataTable` and `ColumnChart` in your own application.

By following these steps, you will have a fully functional and portable data table and charting system in your application.
