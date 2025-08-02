import { getPropertyById } from '@/lib/data';
import { notFound } from 'next/navigation';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Bath, BedDouble, Ruler, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { BuilderComponent, parseDescription } from '@/components/builder-elements';

function DescriptionRenderer({ components }: { components: BuilderComponent[] }) {
  return (
    <div className="space-y-4">
      {components.map((component) => {
        switch (component.type) {
          case 'Text':
            const fontSizeMap = { sm: 'text-sm', md: 'text-base', lg: 'text-lg', xl: 'text-xl' };
            return <p key={component.id} className={cn(fontSizeMap[component.size])}>{component.text}</p>;
          case 'Button':
            return <Button key={component.id}>{component.text}</Button>;
          case 'Table':
            if (!Array.isArray(component.headers) || !Array.isArray(component.rows)) {
              return <div key={component.id} className="text-destructive">Invalid table data.</div>;
            }
            if (component.headers.length === 0 || component.rows.length === 0) {
              return <div key={component.id} className="text-muted-foreground">Empty table.</div>
            }
            return (
              <div key={component.id} className="overflow-x-auto my-4">
                <table className="w-full text-sm text-left border-collapse border border-border">
                  <thead className="bg-muted/50">
                    <tr>
                      {component.headers.map((h, i) => <th key={i} className="p-2 font-medium border border-border">{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {component.rows.map((row, i) => (
                      <tr key={i} className="border-b border-border">
                        {row.map((cell, j) => <td key={j} className="p-2 border border-border">{cell}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}


export default async function PropertyPage({ params }: { params: { id: string } }) {
  const property = await getPropertyById(params.id);

  if (!property) {
    notFound();
  }

  const descriptionComponents = parseDescription(property.description);

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
            <DescriptionRenderer components={descriptionComponents} />
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
