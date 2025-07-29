'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { Filter } from 'lucide-react';

type PropertyFiltersProps = {
  filters: {
    location: string;
  };
  onFilterChange: (filters: { location: string }) => void;
};

function FiltersContent({ filters, onFilterChange }: PropertyFiltersProps) {
  return (
    <div className="p-4 space-y-6">
      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          placeholder="e.g., New York, NY"
          value={filters.location}
          onChange={(e) => onFilterChange({ ...filters, location: e.target.value })}
        />
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
          <Button variant="outline" className="flex items-center gap-2">
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
    <div className="w-full h-full bg-card p-4 rounded-lg shadow-sm">
      <h2 className="text-xl font-headline font-semibold mb-4">Filter Properties</h2>
      <FiltersContent {...props} />
    </div>
  );
}
