'use client';

import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Logo />
        <nav className="hidden md:flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="#">Buy</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="#">Sell</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="#">Rent</Link>
          </Button>
        </nav>
        <Button>Contact Us</Button>
      </div>
    </header>
  );
}
