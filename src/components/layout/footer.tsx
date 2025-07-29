import { Logo } from '@/components/logo';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t bg-card text-card-foreground">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Logo />
            <p className="mt-4 text-sm text-muted-foreground">
              Your dream home is just a click away.
            </p>
          </div>
          <div>
            <h3 className="font-headline font-semibold">Quick Links</h3>
            <ul className="mt-4 space-y-2">
              <li><Link href="#" className="text-sm hover:text-primary transition-colors">Buy</Link></li>
              <li><Link href="#" className="text-sm hover:text-primary transition-colors">Sell</Link></li>
              <li><Link href="#" className="text-sm hover:text-primary transition-colors">Rent</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-headline font-semibold">Company</h3>
            <ul className="mt-4 space-y-2">
              <li><Link href="#" className="text-sm hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="#" className="text-sm hover:text-primary transition-colors">Contact</Link></li>
              <li><Link href="#" className="text-sm hover:text-primary transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-headline font-semibold">Follow Us</h3>
            <div className="flex mt-4 space-x-4">
            </div>
          </div>
        </div>
        <div className="mt-8 border-t pt-4 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Frnz Estates. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
