
'use client';

import { useState, useEffect, useTransition, useMemo } from 'react';
import { PropertyCard } from './property-card';
import { Button } from './ui/button';
import { getProperties } from '@/lib/data';
import { Loader2 } from 'lucide-react';
import Fuse from 'fuse.js';

const PROPERTIES_PER_PAGE = 6;

export function PropertyList({ initialProperties, searchParams, view = 'grid' }) {
  const [properties, setProperties] = useState(initialProperties);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialProperties.length >= PROPERTIES_PER_PAGE);
  const [isPending, startTransition] = useTransition();

  const searchTerm = searchParams.get('search') || '';

  // Effect to handle changes in searchParams from filters, but not for client-side search
  useEffect(() => {
    // We only reset if the server-side filters have changed.
    // The client-side search will be handled by the `useMemo` below.
    const serverParams = new URLSearchParams(searchParams.toString());
    serverParams.delete('search');
    
    // A key to represent the state of server-side filters
    const serverFilterKey = serverParams.toString();

    // The effect will re-run if this key changes
    setProperties(initialProperties);
    setPage(1); 
    setHasMore(initialProperties.length >= PROPERTIES_PER_PAGE);
  }, [initialProperties]);

  const fuse = useMemo(() => {
    if (properties.length === 0) return null;
    return new Fuse(properties, {
        keys: ['title', 'location'],
        threshold: 0.3,
        ignoreLocation: true,
    });
  }, [properties]);

  const filteredProperties = useMemo(() => {
      if (!searchTerm || !fuse) {
          return properties;
      }
      return fuse.search(searchTerm).map(result => result.item);
  }, [searchTerm, fuse, properties]);


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

  if (filteredProperties.length === 0) {
      return (
          <div className="text-center py-12 text-muted-foreground lg:col-span-4">
              <p>No properties found matching your criteria.</p>
          </div>
      );
  }

  return (
    <>
      <div className={view === 'list' ? listClass : gridClass}>
        {filteredProperties.map((property) => (
          <PropertyCard key={property.id} property={property} view={view} />
        ))}
      </div>
      {hasMore && !searchTerm && ( // Don't show "load more" if user is searching
        <div className="text-center mt-12">
          <Button onClick={loadMore} size="lg" disabled={isPending}>
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Show More'}
          </Button>
        </div>
      )}
    </>
  );
}
