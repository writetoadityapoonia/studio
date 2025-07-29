'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';
import { useIsMobile } from '@/hooks/use-mobile';
import { Filter } from 'lucide-react';
import { useMemo, useRef, useEffect } from 'react';
import { usePlacesWidget } from "react-google-autocomplete";

type LocationFilter = {
  description: string;
  lat: number | null;
  lng: number | null;
};

type Filters = {
  location: LocationFilter,
  type: string;
  price: number;
};

type PropertyFiltersProps = {
  filters: Filters;
  onFilterChange: (filters: Partial<Filters>) => void;
  propertyTypes: string[];
  priceRange: [number, number];
};

function formatPrice(value: number) {
  if (value >= 10000000) {
    return `₹${(value / 10000000).toFixed(2)} Cr`;
  }
  if (value >= 100000) {
    return `₹${(value / 100000).toFixed(1)} L`;
  }
  return `₹${value.toLocaleString('en-IN')}`;
}

function FiltersContent({ filters, onFilterChange, propertyTypes, priceRange }: PropertyFiltersProps) {
  const [minPrice, maxPrice] = priceRange;
  const locationInputRef = useRef<HTMLInputElement>(null);

  const handlePriceChange = (value: number[]) => {
    onFilterChange({ price: value[0] });
  };
  
  const handleTypeChange = (value: string) => {
    onFilterChange({ type: value });
  };
  
  const handleLocationTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDescription = e.target.value;
    onFilterChange({ 
      location: { 
        description: newDescription,
        lat: newDescription ? filters.location.lat : null,
        lng: newDescription ? filters.location.lng : null
      }
    });
  }

  const { ref: placesRef } = usePlacesWidget<HTMLInputElement>({
    apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    onPlaceSelected: (place) => {
      if (!place) return;
      
      const lat = place.geometry?.location?.lat() ?? null;
      const lng = place.geometry?.location?.lng() ?? null;
      
      onFilterChange({
        location: {
          description: place.formatted_address || '',
          lat,
          lng
        }
      });
    },
    options: {
      types: ["geocode"],
      fields: ["formatted_address", "geometry.location"],
      componentRestrictions: { country: "in" },
    }
  });

  // Manually assign the ref to the input element
  useEffect(() => {
    if (locationInputRef.current) {
        (placesRef as React.MutableRefObject<HTMLInputElement | null>).current = locationInputRef.current;
    }
  }, [placesRef]);


  const selectedPriceFormatted = useMemo(() => formatPrice(filters.price), [filters.price]);

  return (
    <div className="p-4 space-y-8">
      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          ref={locationInputRef}
          placeholder="Search for a city or area..."
          value={filters.location.description}
          onChange={handleLocationTextChange}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Property Type</Label>
        <Select value={filters.type} onValueChange={handleTypeChange}>
          <SelectTrigger id="type">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {propertyTypes.map((type) => (
              <SelectItem key={type} value={type.toLowerCase()}>{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        <div className='flex justify-between items-center'>
          <Label>Max Price</Label>
          <span className='text-sm font-medium'>{selectedPriceFormatted}</span>
        </div>
        <Slider
          value={[filters.price]}
          onValueChange={handlePriceChange}
          min={minPrice}
          max={maxPrice}
          step={100000} // 1 Lakh
        />
        <div className='flex justify-between text-xs text-muted-foreground'>
            <span>{formatPrice(minPrice)}</span>
            <span>{formatPrice(maxPrice)}</span>
        </div>
      </div>
    </div>
  );
}

export function PropertyFilters(props: PropertyFiltersProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2 w-full justify-center">
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <SheetHeader>
            <SheetTitle className="font-headline">Filter Properties</SheetTitle>
          </SheetHeader>
          <FiltersContent {...props} />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div className="w-full h-full bg-card p-4 rounded-lg shadow-sm sticky top-20">
      <h2 className="text-xl font-headline font-semibold mb-4">Filter Properties</h2>
      <FiltersContent {...props} />
    </div>
  );
}
