import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bath, BedDouble, Ruler } from 'lucide-react';
import type { Property } from '@/lib/types';

interface PropertyCardProps {
  property: Property;
}

export function PropertyCard({ property }: PropertyCardProps) {
  return (
    <Link href={`/properties/${property.id}`}>
      <Card className="overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
        <CardHeader className="p-0">
          <Image
            src={property.images[0]}
            alt={property.title}
            width={600}
            height={400}
            className="w-full h-48 object-cover"
            data-ai-hint="property image"
          />
        </CardHeader>
        <CardContent className="p-4">
          <Badge variant="secondary" className="mb-2">{property.type}</Badge>
          <CardTitle className="text-lg font-headline mb-2 truncate">{property.title}</CardTitle>
          <p className="text-muted-foreground text-sm truncate">{property.location}</p>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-between items-center text-sm">
           <div className="flex items-center gap-4 text-muted-foreground">
             <div className="flex items-center gap-1">
                <BedDouble className="w-4 h-4"/>
                <span>{property.bedrooms}</span>
             </div>
             <div className="flex items-center gap-1">
                <Bath className="w-4 h-4"/>
                <span>{property.bathrooms}</span>
             </div>
              <div className="flex items-center gap-1">
                <Ruler className="w-4 h-4"/>
                <span>{property.area} sqft</span>
             </div>
           </div>
           <p className="text-lg font-bold text-primary">${property.price.toLocaleString()}/mo</p>
        </CardFooter>
      </Card>
    </Link>
  );
}
