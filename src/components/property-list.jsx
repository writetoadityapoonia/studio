
'use client';

import { useState, useEffect, useTransition } from 'react';
import { PropertyCard } from './property-card';
import { Button } from './ui/button';
import { getProperties } from '@/lib/data';
import { Loader2 } from 'lucide-react';

const PROPERTIES_PER_PAGE = 6;

export function PropertyList({ initialProperties, searchParams, view = 'grid' }) {
  const [properties, setProperties] = useState(initialProperties);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialProperties.length >= PROPERTIES_PER_PAGE);
  const [isPending, startTransition] = useTransition();

  // Effect to handle changes in searchParams from filters
  useEffect(() => {
    setProperties(initialProperties);
    setPage(1); 
    setHasMore(initialProperties.length >= PROPERTIES_PER_PAGE);
  }, [initialProperties]);

  const loadMore = () => {
    startTransition(async () => {
        const nextPage = page + 1;
        
        const params = Object.fromEntries(searchParams.entries());
        const newProperties = await getProperties({
            ...params,
            limit: PROPERTIES_PER_PAGE,
            page: nextPage
        });

        if (newProperties.length > 0) {
            setProperties(prev => [...prev, ...newProperties]);
            setPage(nextPage);
        }

        if (newProperties.length < PROPERTIES_PER_PAGE) {
            setHasMore(false);
        }
    });
  };
  
  const listClass = "flex flex-col gap-8";
  const gridClass = "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-8";

  if (properties.length === 0) {
      return (
          <div className="text-center py-12 text-muted-foreground lg:col-span-4">
              <p>No properties found matching your criteria.</p>
          </div>
      );
  }

  return (
    <>
      <div className={view === 'list' ? listClass : gridClass}>
        {properties.map((property) => (
          <PropertyCard key={property.id} property={property} view={view} />
        ))}
      </div>
      {hasMore && (
        <div className="text-center mt-12">
          <Button onClick={loadMore} size="lg" disabled={isPending}>
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Show More'}
          </Button>
        </div>
      )}
    </>
  );
}
