import { PropertyList } from '@/components/property-list';
import { getProperties } from '@/lib/data';
import { Suspense } from 'react';

export default async function PropertiesPage() {
  const initialProperties = await getProperties();

  return (
    <div className="container mx-auto px-4 py-8">
      <section className="text-center mb-12">
        <h1 className="text-5xl font-headline font-bold mb-4">Explore Our Listings</h1>
        <p className="text-xl text-muted-foreground">
          Discover the finest properties available.
        </p>
      </section>
      
      <Suspense fallback={<p>Loading properties...</p>}>
        <PropertyList initialProperties={initialProperties} />
      </Suspense>
    </div>
  );
}
