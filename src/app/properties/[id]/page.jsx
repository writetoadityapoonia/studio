
import { getPropertyById } from '@/lib/data';
import { notFound } from 'next/navigation';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Bath, BedDouble, Ruler, MapPin } from 'lucide-react';
import { DescriptionRenderer } from '@/components/description-renderer';
import { formatCurrency } from '@/lib/utils';
import { EnquiryForm } from '@/components/enquiry-form';


export default async function PropertyPage({ params }) {
  const property = await getPropertyById(params.id);

  if (!property) {
    notFound();
  }

  const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const hasCoordinates = property.latitude && property.longitude;
  const mapSrc = GOOGLE_MAPS_API_KEY && hasCoordinates 
    ? `https://maps.googleapis.com/maps/api/staticmap?center=${property.latitude},${property.longitude}&zoom=15&size=600x400&maptype=roadmap&markers=color:red%7C${property.latitude},${property.longitude}&key=${GOOGLE_MAPS_API_KEY}`
    : 'https://placehold.co/600x400.png';


  return (
    <div className="container mx-auto py-12 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Carousel className="w-full mb-8">
            <CarouselContent>
              {property.images.map((src, index) => (
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
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
          
          <h1 className="text-4xl font-headline font-bold mb-2">{property.title}</h1>
          <div className="flex items-center gap-2 text-muted-foreground mb-6">
            <MapPin className="w-5 h-5" />
            <span>{property.location}</span>
          </div>
          
          <div className="prose prose-invert max-w-none">
             <DescriptionRenderer description={property.description} />
          </div>

        </div>
        
        <div className="lg:col-span-1">
            <div className="sticky top-24 p-6 bg-card rounded-lg border space-y-6">
                <h2 className="text-3xl font-bold text-primary">{formatCurrency(property.price, 'INR')}</h2>
                
                <div className="grid grid-cols-2 gap-4 text-lg">
                    {property.bedrooms > 0 && (
                        <div className="flex items-center gap-2">
                            <BedDouble className="w-6 h-6 text-primary"/>
                            <div>
                                <p className="font-bold">{property.bedrooms}</p>
                                <p className="text-sm text-muted-foreground">Beds</p>
                            </div>
                        </div>
                    )}
                     {property.bathrooms > 0 && (
                        <div className="flex items-center gap-2">
                            <Bath className="w-6 h-6 text-primary"/>
                            <div>
                                <p className="font-bold">{property.bathrooms}</p>
                                <p className="text-sm text-muted-foreground">Baths</p>
                            </div>
                        </div>
                    )}
                     <div className="flex items-center gap-2">
                        <Ruler className="w-6 h-6 text-primary"/>
                         <div>
                            <p className="font-bold">{property.area}</p>
                            <p className="text-sm text-muted-foreground">sqft</p>
                        </div>
                    </div>
                     <div className="flex items-center gap-2">
                        <Badge variant="secondary">{property.type}</Badge>
                    </div>
                </div>

                <EnquiryForm propertyId={property.id} />

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