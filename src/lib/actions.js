
'use server';

import { revalidatePath } from 'next/cache';
import connectToDatabase from './mongoose';
import Property from '../models/property';
import { ObjectId } from 'mongodb'; // Keep for enquiries

async function getEnquiriesCollection() {
    // For now, keep enquiries in native mongo driver
    const { connection } = await connectToDatabase();
    return connection.db.collection('enquiries');
}

async function getPropertyTypesCollection() {
    const { connection } = await connectToDatabase();
    return connection.db.collection('property_types');
}


export async function createProperty(propertyData) {
    await connectToDatabase();
    const newProperty = new Property(propertyData);
    await newProperty.save();

    revalidatePath('/admin');
    revalidatePath('/');
}

export async function bulkCreateProperties(propertiesData) {
    await connectToDatabase();
    if (!Array.isArray(propertiesData) || propertiesData.length === 0) {
        throw new Error('No properties to upload.');
    }
    const result = await Property.insertMany(propertiesData);

    if (result.length !== propertiesData.length) {
        throw new Error('Some properties failed to upload.');
    }

    revalidatePath('/admin');
    revalidatePath('/');

    return { success: true, insertedCount: result.length };
}


export async function updateProperty({ id, ...propertyData }) {
    await connectToDatabase();
    const result = await Property.findByIdAndUpdate(id, propertyData, { new: true });

    if (!result) {
        throw new Error("Property not found");
    }

    revalidatePath('/admin');
    revalidatePath(`/properties/${id}`);
    revalidatePath('/');
}


export async function deleteProperty(id) {
    await connectToDatabase();
    const result = await Property.findByIdAndDelete(id);

    if (!result) {
        throw new Error("Property not found");
    }

    revalidatePath('/admin');
    revalidatePath('/');
}

export async function bulkDeleteProperties(ids) {
    await connectToDatabase();
    if (!Array.isArray(ids) || ids.length === 0) {
        throw new Error("No property IDs provided for deletion.");
    }

    const result = await Property.deleteMany({ _id: { $in: ids } });

    if (result.deletedCount === 0) {
        throw new Error("No properties found to delete.");
    }
    
    if (result.deletedCount < ids.length) {
         console.warn(`Warning: Not all selected properties were deleted. Expected ${ids.length}, deleted ${result.deletedCount}.`);
    }

    revalidatePath('/admin');
    revalidatePath('/');

    return { success: true, deletedCount: result.deletedCount };
}

export async function createEnquiry(enquiryData) {
    const collection = await getEnquiriesCollection();
    
    const enquiryToInsert = {
        ...enquiryData,
        propertyId: new ObjectId(enquiryData.propertyId),
        createdAt: new Date()
    };

    const result = await collection.insertOne(enquiryToInsert);
    
    if (!result.insertedId) {
        throw new Error('Failed to create enquiry');
    }

    revalidatePath(`/admin/enquiries`);
}


export async function createPropertyType(typeData) {
    const collection = await getPropertyTypesCollection();
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
    const collection = await getPropertyTypesCollection();
    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
        throw new Error("Property type not found");
    }
    revalidatePath('/admin/settings');
    revalidatePath('/admin/properties/*');
}
