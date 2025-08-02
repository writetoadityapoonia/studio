
'use server';

import { revalidatePath } from 'next/cache';
import { connectToDatabase } from './mongodb';
import { ObjectId } from 'mongodb';

async function getPropertiesCollection() {
    const db = await connectToDatabase();
    return db.collection('properties');
}

async function getEnquiriesCollection() {
    const db = await connectToDatabase();
    return db.collection('enquiries');
}

async function getPropertyTypesCollection() {
    const db = await connectToDatabase();
    return db.collection('property_types');
}


export async function createProperty(propertyData) {
    const collection = await getPropertiesCollection();
    const result = await collection.insertOne(propertyData);
    
    if (!result.insertedId) {
        throw new Error('Failed to create property');
    }

    revalidatePath('/admin');
    revalidatePath('/');
}

export async function updateProperty(propertyData) {
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


export async function deleteProperty(id) {
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

export async function createEnquiry(enquiryData) {
    const collection = await getEnquiriesCollection();
    const result = await collection.insertOne({ ...enquiryData, createdAt: new Date() });
    
    if (!result.insertedId) {
        throw new Error('Failed to create enquiry');
    }

    // Revalidate the admin page for the property to show the new enquiry
    revalidatePath(`/admin/properties/${enquiryData.propertyId}`);
}


export async function createPropertyType(typeData) {
    const collection = await getPropertyTypesCollection();
    // Check if a type with the same name already exists to prevent duplicates
    const existingType = await collection.findOne({ name: typeData.name });
    if (existingType) {
        throw new Error(`A property type with the name "${typeData.name}" already exists.`);
    }
    const result = await collection.insertOne(typeData);
    if (!result.insertedId) {
        throw new Error('Failed to create property type');
    }
    revalidatePath('/admin/settings');
    revalidatePath('/admin/properties/*');
}

export async function deletePropertyType(id) {
    if (!ObjectId.isValid(id)) {
        throw new Error("Invalid ID format");
    }
    const collection = await getPropertyTypesCollection();
    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
        throw new Error("Property type not found");
    }
    revalidatePath('/admin/settings');
    revalidatePath('/admin/properties/*');
}
