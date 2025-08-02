

import { PropertyList } from '@/components/property-list';
import { getProperties, getPropertyTypes } from '@/lib/data';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { FilterSidebar } from '@/components/filter-sidebar';
import { Card } from '@/components/ui/card';

function PropertyListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
      {[...Array(3)].map((_, i) => (
        <Card key={i} className="flex flex-col overflow-hidden">
          <Skeleton className="w-full h-56" />
          <div className="p-4 flex flex-col flex-grow">
            <div className="flex-grow">
              <Skeleton className="h-6 w-1/3 mb-2" />
              <Skeleton className="h-7 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-4" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-20" />
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <Skeleton className="h-10 w-28" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

export default async function PropertiesPage({ searchParams }) {
  const initialProperties = await getProperties(searchParams);
  const propertyTypes = await getPropertyTypes();
  
  const hasSearchResults = searchParams.lat && searchParams.lng;

  return (
    <div className="container mx-auto px-4 py-8">
      <section className="text-center mb-12">
        {hasSearchResults ? (
            <h1 className="text-5xl font-headline font-bold mb-4">Properties Near Your Search</h1>
        ) : (
            <>
                <h1 className="text-5xl font-headline font-bold mb-4">Explore Our Listings</h1>
                <p className="text-xl text-muted-foreground">
                  Discover the finest properties available.
                </p>
            </>
        )}
      </section>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1">
          <FilterSidebar propertyTypes={propertyTypes} />
        </aside>
        <main className="lg:col-span-3">
          <Suspense fallback={<PropertyListSkeleton />}>
            <PropertyList initialProperties={initialProperties} searchParams={searchParams} />
          </Suspense>

          {initialProperties.length === 0 && (
              <div className="text-center py-12 text-muted-foreground lg:col-span-4">
                  <p>No properties found matching your criteria.</p>
              </div>
          )}
        </main>
      </div>
    </div>
  );
}

    


