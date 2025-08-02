

'use server';

import { connectToDatabase } from './mongodb';
import { ObjectId } from 'mongodb';

async function getPropertiesCollection() {
    const db = await connectToDatabase();
    // Ensure 2dsphere index exists on locationPoint for geo-queries
    await db.collection('properties').createIndex({ locationPoint: '2dsphere' });
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

function processDocument(doc) {
    if (!doc) return null;
    const { _id, ...rest } = doc;
    return { ...rest, id: _id.toString() };
}


export async function getProperties(searchParams = {}) {
  const { lat, lng } = searchParams;
  const collection = await getPropertiesCollection();
  
  let query = {};
  if (lat && lng) {
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);
      const radiusInMeters = 15 * 1000; // 15km

      if (!isNaN(latitude) && !isNaN(longitude)) {
        query = {
            locationPoint: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [longitude, latitude]
                    },
                    $maxDistance: radiusInMeters
                }
            }
        };
      }
  }
  
  const properties = await collection.find(query).sort({ _id: -1 }).toArray();
  return properties.map(p => processDocument(p));
}

export async function getPropertyById(id) {
  if (!ObjectId.isValid(id)) {
      return null;
  }
  const collection = await getPropertiesCollection();
  const property = await collection.findOne({ _id: new ObjectId(id) });
  return processDocument(property);
}

export async function getEnquiriesForProperty(propertyId) {
    if (!ObjectId.isValid(propertyId)) {
        return [];
    }
    const collection = await getEnquiriesCollection();
    const enquiries = await collection.find({ propertyId }).sort({ createdAt: -1 }).toArray();
    return enquiries.map(e => processDocument(e));
}

export async function getAllEnquiriesWithPropertyInfo() {
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

    return enquiries;
}

export async function getPropertyTypes() {
  const collection = await getPropertyTypesCollection();
  const types = await collection.find({}).sort({ name: 1 }).toArray();
  return types.map(t => processDocument(t));
}

    
