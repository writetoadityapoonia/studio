'use client';

import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Property } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePlacesWidget } from "react-google-autocomplete";
import { saveProperty, PropertyFormState } from '@/lib/actions';

const formSchema = z.object({
  title: z.string().min(5, { message: 'Title must be at least 5 characters.' }),
  price: z.string().min(1, { message: 'Price is required.' }),
  priceValue: z.coerce.number().min(1, { message: 'Numeric price value is required.' }),
  address: z.string().min(10, { message: 'Address is required.' }),
  type: z.string().min(3, { message: 'Type must be at least 3 characters.' }),
  bedrooms: z.coerce.number().int().min(0, { message: 'Bedrooms cannot be negative.' }),
  images: z.string().min(1, {message: 'Please add at least one image URL'}),
  descriptionHtml: z.string().min(20, { message: 'Description must be at least 20 characters.' }),
  amenities: z.string().min(1, {message: 'Please add at least one amenity'}),
  lat: z.coerce.number(),
  lng: z.coerce.number(),
  location: z.string().min(2, { message: 'Location is required.' }),
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

function SubmitButton({ isEditing }: { isEditing: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" size="lg" disabled={pending}>
      {pending ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create Property')}
    </Button>
  );
}

export function PropertyForm({ property }: PropertyFormProps) {
  const { toast } = useToast();
  const isEditing = !!property;

  const initialState: PropertyFormState = { message: '' };
  const [state, dispatch] = useActionState(saveProperty, initialState);

  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: property ? {
        ...property,
        images: property.images.join(', '),
        amenities: property.amenities.join(', '),
        lat: property.coordinates.lat,
        lng: property.coordinates.lng,
    } : {
      title: '',
      price: '',
      priceValue: 0,
      location: '',
      address: '',
      type: 'Apartment',
      bedrooms: 3,
      images: '',
      descriptionHtml: '',
      amenities: '',
      lat: 0,
      lng: 0,
      landArea: '',
      totalUnits: 0,
      towersAndBlocks: '',
      possessionTime: '',
      specifications: '',
    },
    mode: 'all',
  });
  
  useEffect(() => {
    if (state.message) {
      toast({
        title: state.message.includes('Successfully') ? 'Success!' : 'Error',
        description: state.message,
        variant: state.message.includes('Successfully') ? 'default' : 'destructive',
      });
    }
    if (state.errors) {
        Object.entries(state.errors).forEach(([field, errors]) => {
            if (errors) {
                form.setError(field as keyof PropertyFormValues, {
                    type: 'manual',
                    message: errors.join(', '),
                });
            }
        });
    }
  }, [state, toast, form]);

  const { ref: placesRef } = usePlacesWidget<HTMLInputElement>({
    apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    onPlaceSelected: (place) => {
      if (!place) return;
      
      const lat = place.geometry?.location?.lat();
      const lng = place.geometry?.location?.lng();
      const address = place.formatted_address || '';
      
      let location = '';
      const localityComponent = place.address_components?.find(c => c.types.includes('locality'));
      const stateComponent = place.address_components?.find(c => c.types.includes('administrative_area_level_1'));

      if (localityComponent && stateComponent) {
        location = `${localityComponent.long_name}, ${stateComponent.short_name}`;
      } else {
        location = place.address_components?.[0]?.long_name || '';
      }
      
      form.setValue('address', address, { shouldValidate: true });
      form.setValue('location', location, { shouldValidate: true });
      if(lat) form.setValue('lat', lat, { shouldValidate: true });
      if(lng) form.setValue('lng', lng, { shouldValidate: true });
    },
    options: {
      types: ["address"],
      fields: ["address_components", "formatted_address", "geometry.location"],
      componentRestrictions: { country: "in" },
    }
  });


  const handleFormSubmit = (data: PropertyFormValues) => {
      const formData = new FormData();
      
      if (property) {
        formData.append('id', property.id);
      }
      Object.entries(data).forEach(([key, value]) => {
          if (Array.isArray(value)) {
              formData.append(key, value.join(', '));
          } else if (value !== undefined && value !== null) {
              formData.append(key, String(value));
          }
      });
      
      dispatch(formData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
        {property?.id && <input type="hidden" name="id" value={property.id} />}
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
                          <FormLabel>Price (Text)</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., ₹2.04 Crore Onwards" {...field} />
                          </FormControl>
                           <FormDescription>The user-facing price text.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="priceValue"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price (Numeric)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="e.g., 20400000" {...field} />
                          </FormControl>
                          <FormDescription>For filtering. 1 Crore = 10000000.</FormDescription>
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
                          <FormControl>
                            <Input placeholder="e.g., Apartment, Villa, Plot" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                </div>
                 <FormField
                  control={form.control}
                  name="images"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image URLs</FormLabel>
                       <FormControl>
                        <Textarea placeholder="Enter comma-separated image URLs" {...field} />
                      </FormControl>
                      <FormDescription>
                        Enter multiple image URLs separated by commas.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Location Details</CardTitle>
                 <CardDescription>Search for an address and the fields below will be auto-filled.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <FormItem>
                  <FormLabel>Search Location</FormLabel>
                  <FormControl>
                    <Input placeholder="Start typing an address..." ref={placesRef} />
                  </FormControl>
                </FormItem>

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Address</FormLabel>
                      <FormControl>
                        <Input readOnly placeholder="e.g., Yelahanka, Bellary Road, Airport Road, Bangalore" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                 <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input readOnly placeholder="e.g., Yelahanka, Bangalore" {...field} />
                      </FormControl>
                      <FormDescription>A short, user-friendly location name (e.g., for filtering).</FormDescription>
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
                            <Input readOnly type="number" {...field} />
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
                            <Input readOnly type="number" {...field} />
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
                <CardDescription>All fields in this section are optional.</CardDescription>
            </CardHeader>
             <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="bedrooms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit Types (e.g., 2, 3 BHK)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                       <FormDescription>Starting from (e.g., 2 for 2BHK)</FormDescription>
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
                      <FormLabel>Towers & Blocks</FormLabel>
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

        <Card>
            <CardHeader>
                <CardTitle>Description & Amenities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="descriptionHtml"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea rows={6} placeholder="Enter a detailed description (HTML is supported)" {...field} />
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
                        <Textarea placeholder="Enter comma-separated amenities" {...field} />
                      </FormControl>
                      <FormDescription>
                        Enter multiple amenities separated by commas.
                      </FormDescription>
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
                        <Textarea rows={10} placeholder="Enter property specifications (HTML is supported)" {...field} />
                      </FormControl>
                      <FormDescription>
                        Use HTML for rich formatting (h4, ul, li tags).
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </CardContent>
        </Card>

        <SubmitButton isEditing={isEditing} />
      </form>
    </Form>
  );
}
