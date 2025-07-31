'use server';

import { revalidatePath } from 'next/cache';
import { connectToDatabase } from './mongodb';
import type { Property } from './types';
import { ObjectId } from 'mongodb';

async function getPropertiesCollection() {
    const db = await connectToDatabase();
    return db.collection('properties');
}


export async function createProperty(propertyData: Omit<Property, 'id'>) {
    const collection = await getPropertiesCollection();
    const result = await collection.insertOne(propertyData);
    
    if (!result.insertedId) {
        throw new Error('Failed to create property');
    }

    revalidatePath('/admin');
    revalidatePath('/');
}

export async function updateProperty(propertyData: Property) {
    const collection = await getPropertiesCollection();
    const { id, ...dataToUpdate } = propertyData;
    
    const result = await collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: dataToUpdate }
    );

    if (result.matchedCount === 0) {
        throw new Error("Property not found");
    }

    revalidatePath('/admin');
    revalidatePath(`/properties/${id}`);
    revalidatePath('/');
}
