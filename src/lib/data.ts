'use server';

import { connectToDatabase } from './mongodb';
import type { Property } from './types';
import { ObjectId } from 'mongodb';

async function getPropertiesCollection() {
    const db = await connectToDatabase();
    return db.collection('properties');
}

function processProperty(p: any): Property {
    const { _id, ...rest } = p;
    return {
        ...rest,
        id: _id.toString(),
    } as Property;
}

export async function getProperties(): Promise<Property[]> {
  const collection = await getPropertiesCollection();
  const properties = await collection.find({}).sort({ _id: -1 }).toArray();

  // Map MongoDB _id to id and remove the original _id object
  return properties.map(processProperty);
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

  return processProperty(property);
}
