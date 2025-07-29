import type { Property } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BedDouble, AreaChart, MapPin } from 'lucide-react';

type PropertyCardProps = {
  property: Property;
};

export function PropertyCard({ property }: PropertyCardProps) {
  const isPlot = property.type.toLowerCase() === 'plot';

  return (
    <Link href={`/properties/${property.slug}`} className="block group">
      <Card className="flex flex-col h-full overflow-hidden transition-all duration-300 group-hover:scale-105 group-hover:shadow-primary/20 group-hover:shadow-lg">
        <div className="relative h-56 w-full">
          <Image
            src={property.images[0]}
            alt={property.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
            data-ai-hint="house exterior"
          />
          <Badge variant="secondary" className="absolute top-2 right-2">{property.type}</Badge>
        </div>
        <CardHeader>
          <CardTitle className="font-headline text-xl leading-tight group-hover:text-primary transition-colors">
            {property.title}
          </CardTitle>
          <div className="flex items-center text-muted-foreground text-sm pt-1">
            <MapPin className="w-4 h-4 mr-2"/>
            <span>{property.location}</span>
          </div>
        </CardHeader>
        <CardContent className="flex-grow">
          <div className="flex justify-around text-sm text-center border-t border-b py-3 -mx-6 px-6 bg-secondary/30">
              {!isPlot && (
                <div className="flex flex-col items-center gap-1"><BedDouble className="w-5 h-5 text-primary"/><span>{property.bedrooms} BHK+</span></div>
              )}
              {property.landArea && (
                  <div className="flex flex-col items-center gap-1"><AreaChart className="w-5 h-5 text-primary"/><span>{property.landArea}</span></div>
              )}
          </div>
        </CardContent>
        <CardFooter>
          <p className="text-xl font-bold text-primary w-full text-center">
            {property.price}
          </p>
        </CardFooter>
      </Card>
    </Link>
  );
}
