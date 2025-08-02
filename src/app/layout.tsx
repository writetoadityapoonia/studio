import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Header } from '@/components/header';
import { Suspense } from 'react';
import { ProgressProvider } from '@/components/progress-provider';


export const metadata: Metadata = {
  title: 'Frnz Estates',
  description: 'The best properties, curated for you.',
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
        <ProgressProvider>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow flex flex-col">{children}</main>
            <Footer />
          </div>
        </ProgressProvider>
        <Toaster />
      </body>
    </html>
  );
}

function Footer() {
  return (
    <footer className="py-6 px-4 md:px-6 border-t bg-background">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 sm:flex-row">
        <p className="text-sm text-muted-foreground">&copy; 2024 Frnz Estates. All rights reserved.</p>
        <nav className="flex gap-4 sm:gap-6">
          <a className="text-sm hover:underline" href="#">
            Terms of Service
          </a>
          <a className="text-sm hover:underline" href="#">
            Privacy
          </a>
        </nav>
      </div>
    </footer>
  );
}
