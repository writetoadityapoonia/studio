import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen container mx-auto px-4 py-8 text-center">
      <h1 className="text-5xl font-headline font-bold mb-4">Welcome to the Page Builder</h1>
      <p className="text-xl text-muted-foreground mb-8">
        The future of page creation is here. Start building your amazing pages now.
      </p>
      <Button asChild size="lg">
        <Link href="/builder">Go to Builder</Link>
      </Button>
    </div>
  );
}
