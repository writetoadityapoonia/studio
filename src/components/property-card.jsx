

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, BedDouble, Bath, Ruler, Building } from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Button } from './ui/button';

export function PropertyCard({ property, view = 'grid' }) {

  const isListView = view === 'list';

  return (
    <Card className={cn(
        "flex overflow-hidden transition-all hover:shadow-lg w-full bg-card border-border group h-full",
        isListView ? "flex-row" : "flex-col"
    )}>
      <div className={cn("relative flex-shrink-0", isListView ? "w-1/3" : "w-full")}>
        <Carousel className="w-full h-full">
          <CarouselContent>
            {(property.images && property.images.length > 0) ? (
              property.images.map((src, index) => (
                <CarouselItem key={index}>
                  <Image
                    src={src}
                    alt={`${property.title} image ${index + 1}`}
                    width={800}
                    height={450}
                    className={cn("w-full object-cover", isListView ? "h-full aspect-video" : "h-56")}
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
                    className={cn("w-full object-cover", isListView ? "h-full aspect-video" : "h-56")}
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

      <CardContent className="p-4 flex flex-col flex-grow">
         <div className="flex-grow">
            <p className="text-2xl font-bold text-primary mb-2">{formatCurrency(property.price, 'INR')} Onwards</p>
            <h3 className="text-xl font-headline font-bold truncate">{property.title}</h3>
            <div className="flex items-center gap-2 text-muted-foreground mt-1 text-sm">
                <MapPin className="w-4 h-4" />
                <span className="truncate">{property.location}</span>
            </div>

            <div className={cn("mt-4 pt-4 border-t gap-4 text-sm", isListView ? "grid grid-cols-2" : "grid grid-cols-2")}>
                 {property.bedrooms > 0 && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <BedDouble className="w-5 h-5 text-primary"/>
                        <span>{property.bedrooms} Beds</span>
                    </div>
                 )}
                 {property.bathrooms > 0 && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Bath className="w-5 h-5 text-primary"/>
                        <span>{property.bathrooms} Baths</span>
                    </div>
                 )}
                 <div className="flex items-center gap-2 text-muted-foreground">
                    <Ruler className="w-5 h-5 text-primary"/>
                    <span>{property.area > 0 ? `${property.area} sqft` : 'N/A'}</span>
                </div>
                 <div className="flex items-center gap-2 text-muted-foreground">
                    <Building className="w-5 h-5 text-primary"/>
                    <Badge variant="outline">{property.type}</Badge>
                </div>
            </div>
         </div>

         <div className="flex justify-end mt-4">
             <Link href={`/properties/${property.id}`}>
                <Button>View Details</Button>
            </Link>
          </div>
      </CardContent>
    </Card>
  );
}
