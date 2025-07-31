'use client';

import { useState } from 'react';
import { PropertyCard } from './property-card';
import { Button } from './ui/button';
import { getProperties } from '@/lib/data';
import type { Property } from '@/lib/types';

interface PropertyListProps {
  initialProperties: Property[];
}

const PROPERTIES_PER_PAGE = 6;

export function PropertyList({ initialProperties }: PropertyListProps) {
  const [properties, setProperties] = useState(initialProperties.slice(0, PROPERTIES_PER_PAGE));
  const [hasMore, setHasMore] = useState(initialProperties.length > PROPERTIES_PER_PAGE);

  const loadMore = () => {
    const allProperties = getProperties();
    const nextProperties = allProperties.slice(0, properties.length + PROPERTIES_PER_PAGE);
    setProperties(nextProperties);
    setHasMore(allProperties.length > nextProperties.length);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
