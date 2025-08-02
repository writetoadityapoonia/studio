
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, Mail, Building, Settings } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container mx-auto py-10">
       <div className="flex justify-start items-center gap-4 mb-8 border-b pb-4">
            <h1 className="text-3xl font-headline">Admin Panel</h1>
            <nav className="flex items-center gap-2">
                <Link href="/admin">
                    <Button variant="outline">
                        <Building className="mr-2" />
                        Properties
                    </Button>
                </Link>
                 <Link href="/admin/enquiries">
                    <Button variant="outline">
                        <Mail className="mr-2" />
                        Enquiries
                    </Button>
                </Link>
                <Link href="/admin/settings">
                    <Button variant="outline">
                        <Settings className="mr-2" />
                        Settings
                    </Button>
                </Link>
            </nav>
       </div>
      {children}
    </div>
  );
}
