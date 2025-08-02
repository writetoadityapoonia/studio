

'use client';

import { useState, useEffect } from 'react';
import { PropertyCard } from './property-card';
import { Button } from './ui/button';
import { getProperties } from '@/lib/data';

const PROPERTIES_PER_PAGE = 6;

export function PropertyList({ initialProperties, searchParams = {}, view = 'grid' }) {
  const [properties, setProperties] = useState(initialProperties);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialProperties.length === PROPERTIES_PER_PAGE);

  useEffect(() => {
    // When searchParams change, it means filters have been applied.
    // We need to reset the properties to the new initial set from the server.
    setProperties(initialProperties);
    setPage(1);
    setHasMore(initialProperties.length === PROPERTIES_PER_PAGE);
  }, [initialProperties]);

  const loadMore = async () => {
    const nextPage = page + 1;
    // Fetch all properties with the current filters
    const allFilteredProperties = await getProperties(searchParams);
    
    const newProperties = allFilteredProperties.slice(0, nextPage * PROPERTIES_PER_PAGE);
    
    setProperties(newProperties);
    setPage(nextPage);
    setHasMore(newProperties.length < allFilteredProperties.length);
  };
  
  const listClass = "flex flex-col gap-8";
  const gridClass = "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-8";

  return (
    <>
      <div className={view === 'list' ? listClass : gridClass}>
        {properties.map((property) => (
          <PropertyCard key={property.id} property={property} view={view} />
        ))}
      </div>
      {hasMore && (
        <div className="text-center mt-12">
          <Button onClick={loadMore} size="lg">
            Show More
          </Button>
        </div>
      )}
    </>
  );
}

    



