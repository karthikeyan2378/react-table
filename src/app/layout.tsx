
import type {Metadata} from 'next';
import { LayoutComponent } from './layout-component';
import './globals.css';
import './custom-styles.css';
import '../FMComponents/css/data-table.css';
import '../FMComponents/css/status-chart.css';
import '../FMComponents/css/badge.css';
import '../FMComponents/property-page/css/details-page.css';


export const metadata: Metadata = {
  title: 'React Data Stream Table',
  description: 'A high-performance table for streaming data, supporting virtualization, column resizing, reordering, and real-time updates.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
      </head>
      <body className="antialiased">
        <LayoutComponent>{children}</LayoutComponent>
      </body>
    </html>
  );
}
