
import type {Metadata} from 'next';
import { LayoutComponent } from './layout-component';
import './custom-styles.css';

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
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body className="antialiased">
        <LayoutComponent>{children}</LayoutComponent>
      </body>
    </html>
  );
}
