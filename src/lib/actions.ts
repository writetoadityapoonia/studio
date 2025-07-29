'use server';

import { z } from 'zod';
import { createProperty, updateProperty } from './data';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const formSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(5, { message: 'Title must be at least 5 characters.' }),
  price: z.string().min(1, { message: 'Price is required.' }),
  priceValue: z.coerce.number().min(1, { message: 'Numeric price value is required.' }),
  address: z.string().min(10, { message: 'Address is required.' }),
  type: z.string().min(3, { message: 'Type must be at least 3 characters.' }),
  bedrooms: z.coerce.number().int().min(0, { message: 'Bedrooms cannot be negative.' }),
  images: z.string().min(1, {message: 'Please add at least one image URL'}).transform(val => val.split(',').map(s => s.trim())),
  descriptionHtml: z.string().min(20, { message: 'Description must be at least 20 characters.' }),
  amenities: z.string().min(1, {message: 'Please add at least one amenity'}).transform(val => val.split(',').map(s => s.trim())),
  lat: z.coerce.number(),
  lng: z.coerce.number(),
  location: z.string().min(2, { message: 'Location is required.' }),
  landArea: z.string().optional(),
  totalUnits: z.coerce.number().optional(),
  towersAndBlocks: z.string().optional(),
  possessionTime: z.string().optional(),
  specifications: z.string().optional(),
});


export type FormState = {
  message: string;
  errors?: Record<string, string[] | undefined>;
};


export async function saveProperty(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const rawData = Object.fromEntries(formData.entries());
  
  const validatedFields = formSchema.safeParse(rawData);

  if (!validatedFields.success) {
    console.log(validatedFields.error.flatten().fieldErrors);
    return {
      message: 'Validation failed. Please check the fields.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }
  
  const { id, ...dataForDb } = validatedFields.data;
  
  const propertyData = {
    ...dataForDb,
    coordinates: {
        lat: validatedFields.data.lat,
        lng: validatedFields.data.lng,
    }
  };

  try {
    if (id) {
      await updateProperty(id, propertyData);
    } else {
      await createProperty(propertyData);
    }
  } catch (e) {
    return { message: 'Database Error: Failed to save property.' };
  }

  // Revalidate paths to show updated data
  revalidatePath('/admin');
  revalidatePath('/');
  
  if(id) {
    revalidatePath(`/admin/edit/${id}`);
    const updatedProperty = validatedFields.data;
    const slug = updatedProperty.title.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-');
    revalidatePath(`/properties/${slug}`);
  }

  // Redirect after successful creation
  if (!id) {
    redirect('/admin');
  }
  
  return { message: `Successfully ${id ? 'updated' : 'created'} property.` };
}
