import { PropertyList } from '@/components/property-list';
import { getProperties } from '@/lib/data';
import { Suspense } from 'react';

export default function Home() {
  const initialProperties = getProperties();

  return (
    <div className="container mx-auto px-4 py-8">
      <section className="text-center mb-12">
        <h1 className="text-5xl font-headline font-bold mb-4">Find Your Dream Property</h1>
        <p className="text-xl text-muted-foreground">
          The best properties, curated for you.
        </p>
      </section>
      
      <Suspense fallback={<p>Loading properties...</p>}>
        <PropertyList initialProperties={initialProperties} />
      </Suspense>
    </div>
  );
}
