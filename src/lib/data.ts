import type { Property } from './types';
import { revalidatePath } from 'next/cache';

// In-memory store, starting empty.
let properties: Property[] = [];
let nextId = 7; // Start IDs after the initial hardcoded ones if they were there.

export async function getProperties(options?: { location?: string; type?: string }): Promise<Property[]> {
  await new Promise(resolve => setTimeout(resolve, 100)); // Simulate network delay
  
  let filteredProperties = [...properties];

  if (options?.location) {
    filteredProperties = filteredProperties.filter(p => p.location.toLowerCase().includes(options.location!.toLowerCase()));
  }

  if (options?.type && options.type !== 'all') {
    filteredProperties = filteredProperties.filter(p => p.type.toLowerCase() === options.type!.toLowerCase());
  }

  return filteredProperties;
}

export async function getPropertyById(id: string): Promise<Property | undefined> {
  await new Promise(resolve => setTimeout(resolve, 100)); // Simulate network delay
  return properties.find(p => p.id === id);
}

export async function createProperty(data: Omit<Property, 'id'>): Promise<Property> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newProperty: Property = {
        id: String(nextId++),
        ...data
    };
    properties.push(newProperty);
    revalidatePath('/admin');
    revalidatePath('/');
    return newProperty;
}

export async function updateProperty(id: string, data: Partial<Omit<Property, 'id'>>): Promise<Property | null> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const propertyIndex = properties.findIndex(p => p.id === id);
    if (propertyIndex === -1) {
        return null;
    }
    const updatedProperty = {
        ...properties[propertyIndex],
        ...data,
    };
    properties[propertyIndex] = updatedProperty;
    revalidatePath('/admin');
    revalidatePath(`/admin/edit/${id}`);
    revalidatePath(`/properties/${id}`);
    revalidatePath('/');
    return updatedProperty;
}
