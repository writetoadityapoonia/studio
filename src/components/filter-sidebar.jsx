
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { SlidersHorizontal } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';
import { Input } from './ui/input';

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
  const debouncedFilters = useDebounce(filters, 500);

  useEffect(() => {
    setHasMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // Sync state with URL if it changes (e.g., browser back/forward)
    setFilters(getInitialFilters(searchParams));
  }, [searchParams]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Avoid pushing router state if filters haven't changed
    const currentType = params.get('type') || '';
    const currentMinPrice = parseInt(params.get('minPrice') || PRICE_RANGE.min, 10);
    const currentMaxPrice = parseInt(params.get('maxPrice') || PRICE_RANGE.max, 10);

    if (
        debouncedFilters.type === currentType &&
        debouncedFilters.minPrice === currentMinPrice &&
        debouncedFilters.maxPrice === currentMaxPrice
    ) {
        return;
    }
    
    if (debouncedFilters.type) {
        params.set('type', debouncedFilters.type);
    } else {
        params.delete('type');
    }
    
    // Only set price if it's different from the default
    if (debouncedFilters.minPrice > PRICE_RANGE.min) {
        params.set('minPrice', debouncedFilters.minPrice.toString());
    } else {
        params.delete('minPrice');
    }

    if (debouncedFilters.maxPrice < PRICE_RANGE.max) {
        params.set('maxPrice', debouncedFilters.maxPrice.toString());
    } else {
        params.delete('maxPrice');
    }
    
    // Reset page to 1 when filters change
    params.set('page', '1');

    router.push(`/?${params.toString()}`, { scroll: false });

  }, [debouncedFilters, router, searchParams]);


  const handleTypeChange = (value) => {
    setFilters(prev => ({ ...prev, type: value === 'all' ? '' : value }));
  };

  const handlePriceInputChange = (field, value) => {
    const parsedValue = parseInt(value, 10);
    if (!isNaN(parsedValue)) {
      setFilters(prev => ({ ...prev, [field]: parsedValue }));
    }
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
          <div className="flex gap-2">
             <div className="space-y-1">
                <Label htmlFor="min-price" className="text-xs text-muted-foreground">Min Price</Label>
                <Input
                    id="min-price"
                    type="number"
                    value={filters.minPrice}
                    onChange={(e) => handlePriceInputChange('minPrice', e.target.value)}
                    step={PRICE_RANGE.step}
                    min={PRICE_RANGE.min}
                    max={PRICE_RANGE.max}
                />
             </div>
             <div className="space-y-1">
                <Label htmlFor="max-price" className="text-xs text-muted-foreground">Max Price</Label>
                <Input
                    id="max-price"
                    type="number"
                    value={filters.maxPrice}
                    onChange={(e) => handlePriceInputChange('maxPrice', e.target.value)}
                    step={PRICE_RANGE.step}
                    min={PRICE_RANGE.min}
                    max={PRICE_RANGE.max}
                />
             </div>
          </div>
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
