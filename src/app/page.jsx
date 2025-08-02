import { PropertyList } from '@/components/property-list';
import { getProperties } from '@/lib/data';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

function PropertyListSkeleton() {
  return (
    <div className="space-y-8">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="grid grid-cols-1 md:grid-cols-2 overflow-hidden rounded-lg border bg-card">
           <Skeleton className="w-full h-64" />
           <div className="p-6 flex flex-col justify-between">
              <div>
                <Skeleton className="h-8 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-4" />
                <Skeleton className="h-10 w-1/3 mb-4" />
                <div className="flex items-center gap-6">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-5 w-20" />
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <Skeleton className="h-10 w-28" />
              </div>
           </div>
        </div>
      ))}
    </div>
  )
}

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
      
      <Suspense fallback={<PropertyListSkeleton />}>
        <PropertyList initialProperties={initialProperties} />
      </Suspense>
    </div>
  );
}
