import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetTrigger, SheetContent } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { Logo } from './logo';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Logo />
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="pr-0">
                <Logo />
                <div className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
                  <div className="flex flex-col space-y-3">
                     <Link href="/home" className="text-lg font-medium">Home</Link>
                     <Link href="/" className="text-lg font-medium">Properties</Link>
                     <Link href="/admin" className="text-lg font-medium">Admin</Link>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
          <nav className="hidden items-center gap-6 text-sm md:flex">
             <Link href="/home" className="font-medium text-foreground/60 transition-colors hover:text-foreground/80">Home</Link>
             <Link href="/" className="font-medium text-foreground/60 transition-colors hover:text-foreground/80">Properties</Link>
             <Link href="/admin" className="font-medium text-foreground/60 transition-colors hover:text-foreground/80">Admin</Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
