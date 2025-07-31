'use server';

import { connectToDatabase } from './mongodb';
import type { Property } from './types';
import { ObjectId } from 'mongodb';

async function getPropertiesCollection() {
    const db = await connectToDatabase();
    return db.collection('properties');
}

export async function getProperties(): Promise<Property[]> {
  const collection = await getPropertiesCollection();
  const properties = await collection.find({}).sort({ _id: -1 }).toArray();

  // Map MongoDB _id to id and ensure all fields are strings as expected by the type
  return properties.map((p: any) => ({
    ...p,
    id: p._id.toString(),
  })) as Property[];
}

export async function getPropertyById(id: string): Promise<Property | null> {
  if (!ObjectId.isValid(id)) {
      return null;
  }
  const collection = await getPropertiesCollection();
  const property = await collection.findOne({ _id: new ObjectId(id) });

  if (!property) {
    return null;
  }

  return {
      ...property,
      id: property._id.toString(),
  } as unknown as Property;
}
