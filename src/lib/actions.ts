'use server';

import { revalidatePath } from 'next/cache';
import { connectToDatabase } from './mongodb';
import type { Property, Enquiry } from './types';
import { ObjectId } from 'mongodb';

async function getPropertiesCollection() {
    const db = await connectToDatabase();
    return db.collection('properties');
}

async function getEnquiriesCollection() {
    const db = await connectToDatabase();
    return db.collection('enquiries');
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


export async function deleteProperty(id: string) {
    if (!ObjectId.isValid(id)) {
        throw new Error("Invalid ID format");
    }
    const collection = await getPropertiesCollection();
    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
        throw new Error("Property not found");
    }

    revalidatePath('/admin');
    revalidatePath('/');
}

export async function createEnquiry(enquiryData: Omit<Enquiry, 'id' | 'createdAt'>) {
    const collection = await getEnquiriesCollection();
    const result = await collection.insertOne({ ...enquiryData, createdAt: new Date() });
    
    if (!result.insertedId) {
        throw new Error('Failed to create enquiry');
    }

    // Revalidate the admin page for the property to show the new enquiry
    revalidatePath(`/admin/properties/${enquiryData.propertyId}`);
}
