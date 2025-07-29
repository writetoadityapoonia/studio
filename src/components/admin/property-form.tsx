'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Property } from '@/lib/types';
import { generatePropertyListing, type GeneratePropertyListingInput } from '@/ai/flows/generate-listing-flow';
import { useState } from 'react';
import { LoaderCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const formSchema = z.object({
  title: z.string().min(5, { message: 'Title must be at least 5 characters.' }),
  price: z.coerce.number().min(1, { message: 'Price must be a positive number.' }),
  location: z.string().min(2, { message: 'Location is required.' }),
  address: z.string().min(10, { message: 'Address is required.' }),
  type: z.enum(['Apartment', 'House', 'Villa', 'Plot']),
  bedrooms: z.coerce.number().int().min(0, { message: 'Bedrooms cannot be negative.' }),
  bathrooms: z.coerce.number().int().min(0, { message: 'Bathrooms cannot be negative.' }),
  area: z.coerce.number().min(100, { message: 'Area must be at least 100 sqft.' }),
  images: z.string().min(1, {message: 'Please add at least one image URL'}).transform(val => val.split(',').map(s => s.trim())),
  descriptionHtml: z.string().min(20, { message: 'Description must be at least 20 characters.' }),
  amenities: z.string().min(1, {message: 'Please add at least one amenity'}).transform(val => val.split(',').map(s => s.trim())),
  lat: z.coerce.number(),
  lng: z.coerce.number(),
  keyFeatures: z.string().min(10, { message: 'Please provide some key features for generation.' }),
  // New fields
  landArea: z.string().optional(),
  totalUnits: z.coerce.number().optional(),
  towersAndBlocks: z.string().optional(),
  possessionTime: z.string().optional(),
  specifications: z.string().optional(),
});

type PropertyFormValues = z.infer<typeof formSchema>;

type PropertyFormProps = {
  property?: Property;
};

export function PropertyForm({ property }: PropertyFormProps) {
    const { toast } = useToast();
    const [isGenerating, setIsGenerating] = useState(false);

  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: property ? {
        ...property,
        images: property.images.join(', '),
        amenities: property.amenities.join(', '),
        lat: property.coordinates.lat,
        lng: property.coordinates.lng,
        keyFeatures: '',
    } : {
      title: '',
      price: 0,
      location: '',
      address: '',
      type: 'House',
      bedrooms: 3,
      bathrooms: 2,
      area: 2000,
      images: '',
      descriptionHtml: '',
      amenities: '',
      lat: 0,
      lng: 0,
      keyFeatures: '',
      landArea: '',
      totalUnits: 0,
      towersAndBlocks: '',
      possessionTime: '',
      specifications: '',
    },
  });

  async function handleGenerate() {
    const values = form.getValues();
    const input: GeneratePropertyListingInput = {
        title: values.title,
        type: values.type,
        location: values.location,
        price: values.price,
        bedrooms: values.bedrooms,
        bathrooms: values.bathrooms,
        area: values.area,
        keyFeatures: values.keyFeatures,
        landArea: values.landArea,
        possessionTime: values.possessionTime,
    };

    if (!input.keyFeatures) {
        form.setError('keyFeatures', {type: 'manual', message: 'Please provide some key features before generating.'});
        return;
    }
    
    setIsGenerating(true);
    try {
        const result = await generatePropertyListing(input);
        form.setValue('descriptionHtml', result.descriptionHtml, { shouldValidate: true });
        form.setValue('amenities', result.amenities.join(', '), { shouldValidate: true });
        form.setValue('specifications', result.specifications, { shouldValidate: true });
        toast({
            title: 'Content Generated!',
            description: 'The description, amenities, and specifications have been filled in.',
        })
    } catch(e) {
        toast({
            title: 'Generation Failed',
            description: 'Could not generate content. Please try again.',
            variant: 'destructive',
        });
    } finally {
        setIsGenerating(false);
    }
  }

  function onSubmit(values: PropertyFormValues) {
    console.log(values);
    // Here you would typically call a server action or API to save the property
    toast({
        title: `Property ${property ? 'Updated' : 'Created'}!`,
        description: `The property "${values.title}" has been successfully saved.`,
    });
    if (!property) {
        form.reset();
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
            <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Enter the primary details of the property or project.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project / Property Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Concorde Mayfair" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Starting Price ($)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="e.g., 2000000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Property Type</FormLabel>
                           <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a property type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="House">House</SelectItem>
                              <SelectItem value="Apartment">Apartment</SelectItem>
                              <SelectItem value="Villa">Villa</SelectItem>
                              <SelectItem value="Plot">Plot</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Location Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                 <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Yelahanka, Bangalore" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Address</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Yelahanka, Bellary Road, Airport Road, Bangalore" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <div className="grid grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="lat"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Latitude</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lng"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Longitude</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                </div>
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle>Project/Unit Details</CardTitle>
            </CardHeader>
             <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="bedrooms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bedrooms (starting from)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bathrooms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bathrooms (starting from)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="area"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Area (sqft, starting from)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="landArea"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Land Area</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 3.17 Acres" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="totalUnits"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Units</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 217" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="towersAndBlocks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Towers and Blocks</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 4 Blocks, 2B + G + 14 Floors" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="possessionTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Possession Time</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 2028 Onwards" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
             </CardContent>
        </Card>

        <Card className="bg-secondary/50">
            <CardHeader>
                 <CardTitle>AI Content Generation</CardTitle>
                 <CardDescription>Provide some key features, and we'll generate the description, amenities, and specifications for you.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <FormField
                  control={form.control}
                  name="keyFeatures"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Key Features & Highlights</FormLabel>
                      <FormControl>
                        <Textarea rows={4} placeholder="e.g., brand new residential project, luxury living, beautiful landscapes, excellent connectivity, brilliant architecture" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="button" variant="secondary" onClick={handleGenerate} disabled={isGenerating}>
                    {isGenerating && <LoaderCircle className="animate-spin mr-2" />}
                    Generate Content with AI
                </Button>
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle>Marketing Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="descriptionHtml"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>About the Project (Description)</FormLabel>
                      <FormControl>
                        <Textarea rows={8} placeholder="Provide a detailed description of the project. You can use HTML for formatting." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="amenities"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amenities</FormLabel>
                      <FormControl>
                        <Textarea rows={4} placeholder="Enter comma-separated amenities (e.g., Swimming Pool, Gym, Landscaped Gardens)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="specifications"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Specifications</FormLabel>
                      <FormControl>
                        <Textarea rows={8} placeholder="Provide project specifications. You can use HTML or Markdown for formatting." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="images"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image URLs</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Enter comma-separated image URLs" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </CardContent>
        </Card>
        
        <Separator />

        <div className="flex justify-end">
            <Button type="submit" size="lg">
              {property ? 'Save Changes' : 'Create Property'}
            </Button>
        </div>
      </form>
    </Form>
  );
}
