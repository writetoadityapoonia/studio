

import { getPropertyById } from '@/lib/data';
import { notFound } from 'next/navigation';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Bath, BedDouble, Ruler, MapPin, Building, Home, Clock, Compass, Phone } from 'lucide-react';
import { DescriptionRenderer } from '@/components/description-renderer';
import { formatCurrency } from '@/lib/utils';
import { EnquiryForm } from '@/components/enquiry-form';
import { Separator } from '@/components/ui/separator';


export default async function PropertyPage({ params }) {
  const property = await getPropertyById(params.id);

  if (!property) {
    notFound();
  }

  const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const hasCoordinates = property.location?.coordinates;
  const mapSrc = GOOGLE_MAPS_API_KEY && hasCoordinates 
    ? `https://maps.googleapis.com/maps/api/staticmap?center=${property.location.lat},${property.location.lng}&zoom=15&size=600x400&maptype=roadmap&markers=color:red%7C${property.location.lat},${property.location.lng}&key=${GOOGLE_MAPS_API_KEY}`
    : 'https://placehold.co/600x400.png';


  return (
    <div className="container mx-auto py-12 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Carousel className="w-full mb-8">
            <CarouselContent>
              {(property.images || []).length > 0 ? (
                property.images.map((src, index) => (
                  <CarouselItem key={index}>
                    <Image
                      src={src}
                      alt={`${property.title} image ${index + 1}`}
                      width={1200}
                      height={800}
                      className="w-full h-[500px] object-cover rounded-lg"
                      data-ai-hint="property image"
                    />
                  </CarouselItem>
                ))
              ) : (
                <CarouselItem>
                   <Image
                      src="https://placehold.co/1200x800.png"
                      alt="Placeholder image"
                      width={1200}
                      height={800}
                      className="w-full h-[500px] object-cover rounded-lg"
                      data-ai-hint="property placeholder"
                    />
                </CarouselItem>
              )}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
          
          <div className="flex justify-between items-start mb-4">
              <div>
                <Badge variant="secondary" className="mb-2">{property.propertyType}</Badge>
                <h1 className="text-4xl font-headline font-bold">{property.title}</h1>
                <div className="flex items-center gap-2 text-muted-foreground mt-1">
                    <MapPin className="w-5 h-5" />
                    <span>{property.location.address}</span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                  <div className="text-3xl font-bold text-primary">{formatCurrency(property.price, 'INR')}</div>
                  <div className="text-muted-foreground">{property.projectName}</div>
              </div>
          </div>
          
          <Separator className="my-6" />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center mb-8">
             <div className="p-4 bg-muted rounded-lg"><BedDouble className="mx-auto mb-1 text-primary"/> {property.bhk}</div>
             <div className="p-4 bg-muted rounded-lg"><Home className="mx-auto mb-1 text-primary"/> {property.furnishing}</div>
             <div className="p-4 bg-muted rounded-lg"><Ruler className="mx-auto mb-1 text-primary"/> {property.builtUpArea} sqft</div>
             <div className="p-4 bg-muted rounded-lg"><Clock className="mx-auto mb-1 text-primary"/> {property.age}</div>
          </div>
          
          <div className="prose prose-invert max-w-none mb-8">
             <DescriptionRenderer description={property.description} />
          </div>

          {property.amenities && property.amenities.length > 0 && (
            <>
              <h3 className="text-2xl font-bold mb-4">Amenities</h3>
              <div className="flex flex-wrap gap-2">
                {property.amenities.map(amenity => (
                  <Badge key={amenity} variant="outline">{amenity}</Badge>
                ))}
              </div>
            </>
          )}

        </div>
        
        <div className="lg:col-span-1">
            <div className="sticky top-24 p-6 bg-card rounded-lg border space-y-6">
                <h2 className="text-2xl font-bold">Property Details</h2>
                
                <ul className="space-y-2 text-sm">
                    <li className="flex justify-between"><span>Price:</span> <span className="font-medium">{formatCurrency(property.price, 'INR')}</span></li>
                    <li className="flex justify-between"><span>Area:</span> <span className="font-medium">{property.builtUpArea} sqft</span></li>
                    <li className="flex justify-between"><span>Configuration:</span> <span className="font-medium">{property.bhk}</span></li>
                    <li className="flex justify-between"><span>Floor:</span> <span className="font-medium">{property.floor}</span></li>
                    <li className="flex justify-between"><span>Facing:</span> <span className="font-medium">{property.facing}</span></li>
                    <li className="flex justify-between"><span>Age:</span> <span className="font-medium">{property.age}</span></li>
                </ul>

                <Separator />

                <EnquiryForm propertyId={property.id} />
                
                <div className="text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
                    <Phone className="w-4 h-4"/>
                    <span>{property.ownerContact}</span>
                </div>

                <div>
                    <h3 className="font-bold text-lg mb-2">Location</h3>
                    <div className="aspect-video w-full">
                         <Image 
                            src={mapSrc}
                            alt={`Map of ${property.title}`}
                            width={600}
                            height={400}
                            className="w-full h-full object-cover rounded-lg"
                            data-ai-hint="map location"
                        />
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
