import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8 flex-grow flex flex-col items-center justify-center text-center">
      <section className="mb-12">
        <h1 className="text-5xl md:text-7xl font-headline font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
          Find Your Dream Property
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          The finest real estate, curated exclusively for you. Explore premium listings and discover a new standard of living in India.
        </p>
      </section>
      <Link href="/">
        <Button size="lg">
          Explore Properties
          <ArrowRight className="ml-2" />
        </Button>
      </Link>
    </div>
  );
}
