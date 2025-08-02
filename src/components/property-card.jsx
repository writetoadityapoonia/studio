
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, BedDouble, Bath, Ruler } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Button } from './ui/button';

export function PropertyCard({ property }) {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg w-full bg-card border-border group">
      <div className="relative">
        <Carousel className="w-full">
          <CarouselContent>
            {(property.images && property.images.length > 0) ? (
              property.images.map((src, index) => (
                <CarouselItem key={index}>
                  <Image
                    src={src}
                    alt={`${property.title} image ${index + 1}`}
                    width={800}
                    height={450}
                    className="w-full h-64 object-cover"
                    data-ai-hint="property image"
                  />
                </CarouselItem>
              ))
            ) : (
                 <CarouselItem>
                  <Image
                    src="https://placehold.co/800x450.png"
                    alt="Placeholder image"
                    width={800}
                    height={450}
                    className="w-full h-64 object-cover"
                    data-ai-hint="property placeholder"
                  />
                </CarouselItem>
            )}
          </CarouselContent>
           <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
           <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
        </Carousel>
        {property.developer && (
            <Badge variant="secondary" className="absolute top-4 left-4 z-10">{property.developer}</Badge>
        )}
      </div>

      <CardContent className="p-6">
        <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
                <h3 className="text-2xl font-headline font-bold truncate">{property.title}</h3>
                <div className="flex items-center gap-2 text-muted-foreground mt-1">
                    <MapPin className="w-4 h-4" />
                    <span className="truncate">{property.location}</span>
                </div>
            </div>

            <div className="col-span-2">
                 <p className="text-3xl font-bold text-primary">{formatCurrency(property.price, 'INR')} Onwards</p>
            </div>
            
            <div className="flex items-center gap-2">
                <BedDouble className="w-5 h-5 text-primary"/>
                <span className="text-sm text-muted-foreground">{property.bedrooms > 0 ? `${property.bedrooms} Beds` : 'N/A'}</span>
            </div>

            <div className="flex items-center gap-2">
                <Bath className="w-5 h-5 text-primary"/>
                <span className="text-sm text-muted-foreground">{property.bathrooms > 0 ? `${property.bathrooms} Baths` : 'N/A'}</span>
            </div>

            <div className="flex items-center gap-2">
                <Ruler className="w-5 h-5 text-primary"/>
                <span className="text-sm text-muted-foreground">{property.area > 0 ? `${property.area} sqft` : 'N/A'}</span>
            </div>

             <div className="flex items-center gap-2">
                <Badge variant="outline">{property.type}</Badge>
            </div>

        </div>
         <div className="flex justify-end mt-6">
             <Link href={`/properties/${property.id}`}>
                <Button>View Details</Button>
            </Link>
          </div>
      </CardContent>
    </Card>
  );
}
