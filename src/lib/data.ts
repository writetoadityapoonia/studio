
'use server';

import { connectToDatabase } from './mongodb';
import type { Property, Enquiry, EnquiryWithPropertyInfo, PropertyType } from './types';
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

function processDocument(doc: any) {
    if (!doc) return null;
    const { _id, ...rest } = doc;
    return { ...rest, id: _id.toString() };
}


export async function getProperties(): Promise<Property[]> {
  const collection = await getPropertiesCollection();
  const properties = await collection.find({}).sort({ _id: -1 }).toArray();
  return properties.map(p => processDocument(p) as Property);
}

export async function getPropertyById(id: string): Promise<Property | null> {
  if (!ObjectId.isValid(id)) {
      return null;
  }
  const collection = await getPropertiesCollection();
  const property = await collection.findOne({ _id: new ObjectId(id) });
  return processDocument(property) as Property | null;
}

export async function getEnquiriesForProperty(propertyId: string): Promise<Enquiry[]> {
    if (!ObjectId.isValid(propertyId)) {
        return [];
    }
    const collection = await getEnquiriesCollection();
    const enquiries = await collection.find({ propertyId }).sort({ createdAt: -1 }).toArray();
    return enquiries.map(e => processDocument(e) as Enquiry);
}

export async function getAllEnquiriesWithPropertyInfo(): Promise<EnquiryWithPropertyInfo[]> {
    const collection = await getEnquiriesCollection();
    const enquiries = await collection.aggregate([
        { $sort: { createdAt: -1 } },
        {
            $lookup: {
                from: 'properties',
                let: { propertyIdObj: { $toObjectId: '$propertyId' } },
                pipeline: [
                    { $match: { $expr: { $eq: ['$_id', '$$propertyIdObj'] } } }
                ],
                as: 'propertyInfo'
            }
        },
        {
            $unwind: {
                path: '$propertyInfo',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $addFields: {
                'id': { $toString: '$_id' },
                'property': {
                    'id': { $toString: '$propertyInfo._id' },
                    'title': '$propertyInfo.title'
                }
            }
        },
        {
            $project: {
                '_id': 0,
                'propertyId': 0,
                'propertyInfo': 0
            }
        }
    ]).toArray();

    return enquiries as EnquiryWithPropertyInfo[];
}

export async function getPropertyTypes(): Promise<PropertyType[]> {
  const collection = await getPropertyTypesCollection();
  const types = await collection.find({}).sort({ name: 1 }).toArray();
  return types.map(t => processDocument(t) as PropertyType);
}

    