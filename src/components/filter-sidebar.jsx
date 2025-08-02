
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { SlidersHorizontal } from 'lucide-react';

const PRICE_RANGE = {
  min: 0,
  max: 100000000, // 10 Cr
  step: 100000, // 1 Lakh
};

function getInitialFilters(searchParams) {
    return {
        type: searchParams.get('type') || '',
        minPrice: parseInt(searchParams.get('minPrice') || PRICE_RANGE.min, 10),
        maxPrice: parseInt(searchParams.get('maxPrice') || PRICE_RANGE.max, 10),
    };
}


export function FilterSidebar({ propertyTypes }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [hasMounted, setHasMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [filters, setFilters] = useState(() => getInitialFilters(searchParams));
  
  useEffect(() => {
    setHasMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Sync state with URL if it changes (e.g., browser back/forward)
  useEffect(() => {
    setFilters(getInitialFilters(searchParams));
  }, [searchParams]);

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (filters.type) {
        params.set('type', filters.type);
    } else {
        params.delete('type');
    }
    
    // Only set price if it's different from the default
    if (filters.minPrice > PRICE_RANGE.min) {
        params.set('minPrice', filters.minPrice.toString());
    } else {
        params.delete('minPrice');
    }

    if (filters.maxPrice < PRICE_RANGE.max) {
        params.set('maxPrice', filters.maxPrice.toString());
    } else {
        params.delete('maxPrice');
    }
    
    // Reset page to 1 when filters change
    params.set('page', '1');

    router.push(`/?${params.toString()}`, { scroll: false });
  };


  const handleTypeChange = (value) => {
    setFilters(prev => ({ ...prev, type: value === 'all' ? '' : value }));
  };

  const handlePriceChange = (value) => {
    setFilters(prev => ({ ...prev, minPrice: value[0], maxPrice: value[1] }));
  };
  
  const resetFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('type');
    params.delete('minPrice');
    params.delete('maxPrice');
    params.delete('page');
    router.push(`/?${params.toString()}`, { scroll: false });
  }

  const FilterContent = () => (
    <Card className="sticky top-24">
      <CardHeader>
        <CardTitle>Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="type-filter">Property Type</Label>
          <Select
            value={filters.type || 'all'}
            onValueChange={handleTypeChange}
          >
            <SelectTrigger id="type-filter">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {propertyTypes.map((type) => (
                <SelectItem key={type.id} value={type.name}>{type.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          <Label>Price Range</Label>
          <Slider
            value={[filters.minPrice, filters.maxPrice]}
            onValueChange={handlePriceChange}
            min={PRICE_RANGE.min}
            max={PRICE_RANGE.max}
            step={PRICE_RANGE.step}
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{formatCurrency(filters.minPrice, 'INR')}</span>
            <span>{formatCurrency(filters.maxPrice, 'INR')}</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
            <Button onClick={applyFilters}>Apply Filters</Button>
            <Button onClick={resetFilters} variant="outline">Reset Filters</Button>
        </div>
      </CardContent>
    </Card>
  );

  if (!hasMounted) {
    return (
        <Card className="sticky top-24">
            <CardHeader><CardTitle>Filters</CardTitle></CardHeader>
            <CardContent><div className="h-64 w-full animate-pulse bg-muted rounded-md" /></CardContent>
        </Card>
    );
  }

  if (isMobile) {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline" className="w-full">
                    <SlidersHorizontal className="mr-2" />
                    Filters
                </Button>
            </SheetTrigger>
            <SheetContent side="left">
                <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="p-4">
                    <FilterContent />
                </div>
            </SheetContent>
        </Sheet>
    );
  }

  return <FilterContent />;
}
