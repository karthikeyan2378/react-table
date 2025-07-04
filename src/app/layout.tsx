import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/FMComponents/ui/toaster";

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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
