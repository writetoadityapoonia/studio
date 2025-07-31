'use server';

import { revalidatePath } from 'next/cache';
import { getProperties } from './data';
import type { Property } from './types';
import { v4 as uuidv4 } from 'uuid';

const properties = getProperties();

// This file contains server actions that can be called from client components.

/**
 * A server action to create a new property.
 * @param propertyData The data for the new property.
 */
export async function createProperty(propertyData: Omit<Property, 'id'>) {
    const newProperty: Property = {
        id: uuidv4(),
        ...propertyData
    };
    properties.unshift(newProperty); // Add to the beginning of the array
    console.log('--- CREATED NEW PROPERTY ---');
    console.log(newProperty);
    revalidatePath('/admin');
    revalidatePath('/');
}

/**
 * A server action to update an existing property.
 * @param propertyData The data for the property to update.
 */
export async function updateProperty(propertyData: Property) {
    const index = properties.findIndex(p => p.id === propertyData.id);
    if (index !== -1) {
        properties[index] = propertyData;
        console.log('--- UPDATED PROPERTY ---');
        console.log(propertyData);
        revalidatePath('/admin');
        revalidatePath(`/properties/${propertyData.id}`);
        revalidatePath('/');
    } else {
        throw new Error("Property not found");
    }
}
