
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

export function FilterSidebar({ propertyTypes }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [isMobile, setIsMobile] = useState(false);
  const [filters, setFilters] = useState({
    type: searchParams.get('type') || '',
    minPrice: searchParams.get('minPrice') || PRICE_RANGE.min,
    maxPrice: searchParams.get('maxPrice') || PRICE_RANGE.max,
  });

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handlePriceChange = (value) => {
    setFilters(prev => ({ ...prev, minPrice: value[0], maxPrice: value[1] }));
  };
  
  const applyFilters = () => {
    const params = new URLSearchParams(searchParams);
    
    if (filters.type) {
        params.set('type', filters.type);
    } else {
        params.delete('type');
    }
    
    params.set('minPrice', filters.minPrice);
    params.set('maxPrice', filters.maxPrice);

    router.push(`/?${params.toString()}`);
  };

  const resetFilters = () => {
    setFilters({
        type: '',
        minPrice: PRICE_RANGE.min,
        maxPrice: PRICE_RANGE.max,
    });
     const params = new URLSearchParams(searchParams);
     params.delete('type');
     params.delete('minPrice');
     params.delete('maxPrice');
     router.push(`/?${params.toString()}`);
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
            value={filters.type}
            onValueChange={(value) => handleFilterChange('type', value)}
          >
            <SelectTrigger id="type-filter">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              {propertyTypes.map((type) => (
                <SelectItem key={type.id} value={type.name}>{type.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
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
            <Button onClick={resetFilters} variant="outline">Reset</Button>
        </div>
      </CardContent>
    </Card>
  );

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

