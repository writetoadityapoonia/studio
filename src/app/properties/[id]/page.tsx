import { getPropertyById } from '@/lib/data';
import { notFound } from 'next/navigation';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Bath, BedDouble, Ruler, MapPin } from 'lucide-react';
import { DynamicIframe } from '@/components/dynamic-iframe';

export default async function PropertyPage({ params }: { params: { id: string } }) {
  const property = await getPropertyById(params.id);

  if (!property) {
    notFound();
  }

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

          <div className="bg-background rounded-lg">
            {/* The iframe will securely render the HTML from the page builder */}
            <DynamicIframe
              srcDoc={property.description}
              title="Property Description"
            />
          </div>
        </div>
        
        <div className="lg:col-span-1">
            <div className="sticky top-24 p-6 bg-card rounded-lg border">
                <h2 className="text-3xl font-bold text-primary mb-4">${property.price.toLocaleString()}<span className="text-base font-normal text-muted-foreground">/month</span></h2>
                
                <div className="grid grid-cols-2 gap-4 text-lg mb-6">
                    <div className="flex items-center gap-2">
                        <BedDouble className="w-6 h-6 text-primary"/>
                        <div>
                            <p className="font-bold">{property.bedrooms}</p>
                            <p className="text-sm text-muted-foreground">Beds</p>
                        </div>
                    </div>
                     <div className="flex items-center gap-2">
                        <Bath className="w-6 h-6 text-primary"/>
                         <div>
                            <p className="font-bold">{property.bathrooms}</p>
                            <p className="text-sm text-muted-foreground">Baths</p>
                        </div>
                    </div>
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

                <h3 className="text-xl font-bold mb-4">Make an Enquiry</h3>
                {/* Enquiry form can be added here */}
                 <p className="text-sm text-muted-foreground">Contact us to learn more about this amazing property.</p>
            </div>
        </div>
      </div>
    </div>
  );
}
