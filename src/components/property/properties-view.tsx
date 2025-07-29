'use client';

import { useState, useMemo } from 'react';
import type { Property } from '@/lib/types';
import { PropertyCard } from './property-card';
import { PropertyFilters } from './property-filters';
import { Button } from '@/components/ui/button';

const ITEMS_PER_PAGE = 6;

type PropertiesViewProps = {
  initialProperties: Property[];
};

export default function PropertiesView({ initialProperties }: PropertiesViewProps) {
  const [filters, setFilters] = useState({ location: '', type: 'all' });
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  const filteredProperties = useMemo(() => {
    return initialProperties.filter((property) => {
      const locationMatch = property.location.toLowerCase().includes(filters.location.toLowerCase());
      const typeMatch = filters.type === 'all' || property.type === filters.type;
      return locationMatch && typeMatch;
    });
  }, [initialProperties, filters]);

  const handleShowMore = () => {
    setVisibleCount((prev) => prev + ITEMS_PER_PAGE);
  };

  const visibleProperties = filteredProperties.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProperties.length;

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <aside className="w-full lg:w-1/4 xl:w-1/5">
        <PropertyFilters filters={filters} onFilterChange={setFilters} />
      </aside>
      <div className="w-full lg:w-3/4 xl:w-4/5">
        <div className="mb-8 flex items-center justify-between">
            <h1 className="text-3xl font-headline font-bold">Properties</h1>
            <span className="text-muted-foreground">{filteredProperties.length} results found</span>
        </div>
        
        {filteredProperties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {visibleProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-card rounded-lg">
            <h3 className="text-xl font-semibold">No Properties Found</h3>
            <p className="text-muted-foreground mt-2">Try adjusting your filters.</p>
          </div>
        )}

        {hasMore && (
          <div className="text-center mt-8">
            <Button size="lg" onClick={handleShowMore}>
              Show More
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
