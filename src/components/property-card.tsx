
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin } from 'lucide-react';
import type { Property } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Button } from './ui/button';

interface PropertyCardProps {
  property: Property;
}

export function PropertyCard({ property }: PropertyCardProps) {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg w-full bg-card border-border">
      <div className="grid grid-cols-1 md:grid-cols-2">
        <Carousel className="w-full">
          <CarouselContent>
            {property.images.map((src, index) => (
              <CarouselItem key={index}>
                <Image
                  src={src}
                  alt={`${property.title} image ${index + 1}`}
                  width={600}
                  height={400}
                  className="w-full h-64 object-cover"
                  data-ai-hint="property image"
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-4" />
          <CarouselNext className="right-4" />
        </Carousel>

        <div className="p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-2xl font-headline font-bold mb-2">{property.title}</h3>
            <div className="flex items-center gap-2 text-muted-foreground mb-4">
                <MapPin className="w-4 h-4" />
                <span>{property.location}</span>
            </div>
             <p className="text-3xl font-bold text-primary mb-4">{formatCurrency(property.price, 'INR')} Onwards</p>
             {property.developer && (
                <Badge variant="secondary">{property.developer}</Badge>
             )}
          </div>
          <div className="flex justify-end mt-4">
             <Link href={`/properties/${property.id}`}>
                <Button>View More</Button>
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
}
