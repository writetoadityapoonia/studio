
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Search } from 'lucide-react';
import Autocomplete from 'react-google-autocomplete';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const [place, setPlace] = useState(null);
  const router = useRouter();

  const handleSearch = () => {
    if (place && place.geometry) {
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      router.push(`/?lat=${lat}&lng=${lng}`);
    }
  };

  const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const karnatakaBounds = {
    north: 18.46,
    south: 11.59,
    west: 74.05,
    east: 78.58,
  };


  return (
    <div className="container mx-auto px-4 py-8 flex-grow flex flex-col items-center justify-center text-center">
      <section className="mb-8 w-full max-w-2xl">
        <h1 className="text-5xl md:text-7xl font-headline font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
          Find Your Dream Property
        </h1>
        <p className="text-xl text-muted-foreground mx-auto mb-8">
          The finest real estate, curated exclusively for you. Explore premium listings and discover a new standard of living in India.
        </p>

        {GOOGLE_MAPS_API_KEY ? (
          <div className="flex flex-col sm:flex-row items-center gap-2 bg-background/50 backdrop-blur-sm p-4 rounded-lg border">
            <Search className="text-muted-foreground hidden sm:block"/>
             <Autocomplete
              apiKey={GOOGLE_MAPS_API_KEY}
              onPlaceSelected={(place) => setPlace(place)}
              options={{ 
                types: ["geocode"],
                componentRestrictions: { country: "in" },
                bounds: karnatakaBounds,
                strictBounds: false
              }}
              className={cn(
                "flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              )}
              placeholder="Enter a location in Karnataka to search nearby..."
            />
            <Button size="lg" onClick={handleSearch} disabled={!place}>
              <Search className="mr-2 sm:hidden" />
              Search
            </Button>
          </div>
        ) : (
           <p className="text-destructive text-center">Google Maps API key not configured. Search is disabled.</p>
        )}
      </section>

      <Link href="/">
        <Button size="lg" variant="link" className="mt-4">
          Or, Explore All Properties
          <ArrowRight className="ml-2" />
        </Button>
      </Link>
    </div>
  );
}

    
