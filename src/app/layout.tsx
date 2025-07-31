import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Frnz Page Builder',
  description: 'Build your pages with ease.',
  icons: {},
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Space+Grotesk:wght@400;500;700&family=Source+Code+Pro&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <div className="flex flex-col min-h-screen">
          <main className="flex-grow">{children}</main>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
