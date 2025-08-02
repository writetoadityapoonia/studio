
'use client';

import { useState, useEffect } from 'react';
import { PropertyCard } from './property-card';
import { Button } from './ui/button';
import { getProperties } from '@/lib/data';

const PROPERTIES_PER_PAGE = 6;

export function PropertyList({ initialProperties }) {
  const [properties, setProperties] = useState([]);
  const [loadedCount, setLoadedCount] = useState(PROPERTIES_PER_PAGE);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    // Set initial properties from server props
    setProperties(initialProperties.slice(0, PROPERTIES_PER_PAGE));
    setHasMore(initialProperties.length > PROPERTIES_PER_PAGE);
  }, [initialProperties]);

  const loadMore = async () => {
    // Fetch all properties again to get the latest data
    const allProperties = await getProperties();
    const nextLoadedCount = loadedCount + PROPERTIES_PER_PAGE;
    setProperties(allProperties.slice(0, nextLoadedCount));
    setLoadedCount(nextLoadedCount);
    setHasMore(allProperties.length > nextLoadedCount);
  };

  return (
    <>
      <div className="space-y-8">
        {properties.map((property) => (
          <PropertyCard key={property.id} property={property} />
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
