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
    <Card className="flex flex-col h-full overflow-hidden transition-transform duration-300 hover:scale-105 hover:shadow-primary/20 hover:shadow-lg">
      <Link href={`/properties/${property.id}`} className="block">
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
      </Link>
      <CardHeader>
        <Link href={`/properties/${property.id}`} className="block">
            <CardTitle className="font-headline text-xl leading-tight hover:text-primary transition-colors">
              {property.title}
            </CardTitle>
        </Link>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex items-center text-muted-foreground mb-4">
          <MapPin className="w-4 h-4 mr-2"/>
          <span>{property.location}</span>
        </div>
        <div className="flex justify-around text-sm text-muted-foreground">
            {!isPlot && (
              <div className="flex items-center gap-2"><BedDouble className="w-4 h-4 text-primary"/><span>{property.bedrooms} BHK+</span></div>
            )}
            {property.landArea && (
                <div className="flex items-center gap-2"><AreaChart className="w-4 h-4 text-primary"/><span>{property.landArea}</span></div>
            )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <p className="text-2xl font-bold text-primary">
          ${property.price.toLocaleString()}
        </p>
        <Button asChild>
          <Link href={`/properties/${property.id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
