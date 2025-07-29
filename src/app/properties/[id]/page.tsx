import { getPropertyById } from '@/lib/data';
import { notFound } from 'next/navigation';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BedDouble, Bath, AreaChart, MapPin, CheckCircle } from 'lucide-react';
import { MapDisplay } from '@/components/property/map-display';
import { EnquiryForm } from '@/components/property/enquiry-form';
import { Separator } from '@/components/ui/separator';

type PropertyPageProps = {
  params: {
    id: string;
  };
};

export default async function PropertyPage({ params }: PropertyPageProps) {
  const property = await getPropertyById(params.id);

  if (!property) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Image Carousel */}
          <Carousel className="w-full mb-8 rounded-lg overflow-hidden shadow-lg">
            <CarouselContent>
              {property.images.map((src, index) => (
                <CarouselItem key={index}>
                  <div className="relative h-96">
                    <Image src={src} alt={`${property.title} image ${index + 1}`} fill className="object-cover" data-ai-hint="house interior" />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-4" />
            <CarouselNext className="right-4" />
          </Carousel>

          {/* Title and basic info */}
          <div className="mb-6">
            <div className='flex justify-between items-start'>
                <div>
                    <h1 className="text-4xl font-headline font-bold mb-2">{property.title}</h1>
                    <div className="flex items-center text-muted-foreground text-lg">
                        <MapPin className="w-5 h-5 mr-2" />
                        <span>{property.address}</span>
                    </div>
                </div>
                <Badge variant="secondary" className="text-lg">{property.type}</Badge>
            </div>
            <p className="text-4xl font-bold text-primary mt-4">${property.price.toLocaleString()}</p>
          </div>

          <Separator className="my-8" />

          {/* Key Details Card */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="font-headline">Key Details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-4 bg-secondary rounded-lg">
                <BedDouble className="w-8 h-8 mx-auto mb-2 text-primary" />
                <p className="font-semibold">{property.bedrooms} Bedrooms</p>
              </div>
              <div className="p-4 bg-secondary rounded-lg">
                <Bath className="w-8 h-8 mx-auto mb-2 text-primary" />
                <p className="font-semibold">{property.bathrooms} Bathrooms</p>
              </div>
              <div className="p-4 bg-secondary rounded-lg">
                <AreaChart className="w-8 h-8 mx-auto mb-2 text-primary" />
                <p className="font-semibold">{property.area} sqft</p>
              </div>
              <div className="p-4 bg-secondary rounded-lg">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 text-primary" />
                <p className="font-semibold">{property.type}</p>
              </div>
            </CardContent>
          </Card>
          
          {/* Description */}
          <div className="mb-8">
             <h2 className="text-2xl font-headline font-semibold mb-4">About this property</h2>
             <div className="prose prose-invert max-w-none text-muted-foreground">
                <iframe
                    srcDoc={`<style>body{color:hsl(var(--muted-foreground)); font-family: Inter, sans-serif;}</style>${property.descriptionHtml}`}
                    className="w-full h-48 border-0"
                    sandbox=""
                />
             </div>
          </div>
          
          {/* Amenities */}
          <div className="mb-8">
            <h2 className="text-2xl font-headline font-semibold mb-4">Amenities</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {property.amenities.map(amenity => (
                <div key={amenity} className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary"/>
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-8">
          {/* Enquiry Form */}
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Make an Enquiry</CardTitle>
            </CardHeader>
            <CardContent>
              <EnquiryForm />
            </CardContent>
          </Card>

          {/* Map */}
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Location</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80 rounded-lg overflow-hidden">
                <MapDisplay coordinates={property.coordinates} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
