

'use client';

import { useState, useEffect } from 'react';
import { PropertyCard } from './property-card';
import { Button } from './ui/button';
import { getProperties } from '@/lib/data';

const PROPERTIES_PER_PAGE = 6;

export function PropertyList({ initialProperties, searchParams = {}, view = 'grid' }) {
  const [properties, setProperties] = useState([]);
  const [loadedCount, setLoadedCount] = useState(PROPERTIES_PER_PAGE);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    // Set initial properties from server props
    setProperties(initialProperties.slice(0, PROPERTIES_PER_PAGE));
    setHasMore(initialProperties.length > PROPERTIES_PER_PAGE);
  }, [initialProperties]);

  const loadMore = async () => {
    const { lat, lng } = searchParams;
    // Fetch all properties again to get the latest data with the same search params
    const allProperties = await getProperties({ lat, lng, ...searchParams });
    const nextLoadedCount = loadedCount + PROPERTIES_PER_PAGE;
    setProperties(allProperties.slice(0, nextLoadedCount));
    setLoadedCount(nextLoadedCount);
    setHasMore(allProperties.length > nextLoadedCount);
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

    


