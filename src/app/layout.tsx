
import type {Metadata} from 'next';
import './globals.css';
import { LayoutComponent } from './layout-component';

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
