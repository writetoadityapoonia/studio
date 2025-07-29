'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import type { Property } from '@/lib/types';
import { PropertyCard } from './property-card';
import { PropertyFilters } from './property-filters';
import { Button } from '@/components/ui/button';
import { haversineDistance } from '@/lib/utils';

const ITEMS_PER_PAGE = 6;
const SEARCH_RADIUS_KM = 15;

type PropertiesViewProps = {
  initialProperties: Property[];
  propertyTypes: string[];
  priceRange: [number, number];
};

export default function PropertiesView({ initialProperties, propertyTypes, priceRange }: PropertiesViewProps) {
  const [filters, setFilters] = useState({
    location: {
      description: '',
      lat: null as number | null,
      lng: null as number | null,
    },
    type: 'all',
    price: priceRange[1],
  });
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  useEffect(() => {
    // Reset price filter when the available range changes
    setFilters(f => ({ ...f, price: priceRange[1] }));
  }, [priceRange]);
  
  const handleFilterChange = useCallback((newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({...prev, ...newFilters}));
    setVisibleCount(ITEMS_PER_PAGE); // Reset pagination on filter change
  }, []);

  const filteredProperties = useMemo(() => {
    return initialProperties.filter((property) => {
      const typeMatch = filters.type === 'all' || property.type.toLowerCase() === filters.type.toLowerCase();
      const priceMatch = property.priceValue <= filters.price;
      
      const locationMatch = (() => {
        if (filters.location.lat && filters.location.lng) {
          const distance = haversineDistance(
            { lat: filters.location.lat, lng: filters.location.lng },
            property.coordinates
          );
          return distance <= SEARCH_RADIUS_KM;
        }
        // If no location is selected, try to match by the text description (fallback)
        if (filters.location.description) {
            return property.location.toLowerCase().includes(filters.location.description.toLowerCase());
        }
        return true; // If no location filter is applied, all locations match
      })();
      
      return locationMatch && typeMatch && priceMatch;
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
        <PropertyFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          propertyTypes={propertyTypes}
          priceRange={priceRange}
        />
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
