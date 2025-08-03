

'use server';

import { connectToDatabase } from './mongodb';
import { ObjectId } from 'mongodb';

async function getPropertiesCollection() {
    const db = await connectToDatabase();
    const collection = db.collection('properties');
    // Ensure indexes exist for faster queries
    await Promise.all([
        collection.createIndex({ locationPoint: '2dsphere' }),
        collection.createIndex({ type: 1, price: 1, _id: -1 }),
        collection.createIndex({ price: 1, _id: -1 })
    ]);
    return collection;
}

async function getEnquiriesCollection() {
    const db = await connectToDatabase();
    const collection = db.collection('enquiries');
    await collection.createIndex({ propertyId: 1, createdAt: -1 });
    return collection;
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
  const { lat, lng, type, minPrice, maxPrice, limit, page = 1 } = searchParams;
  const collection = await getPropertiesCollection();
  
  let query = {};

  if (lat && lng) {
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);
      const radiusInMeters = 15 * 1000; // 15km

      if (!isNaN(latitude) && !isNaN(longitude)) {
        query.locationPoint = {
            $near: {
                $geometry: {
                    type: "Point",
                    coordinates: [longitude, latitude]
                },
                $maxDistance: radiusInMeters
            }
        };
      }
  }

  if (type) {
      query.type = type;
  }
  
  if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice && parseFloat(minPrice) > 0) {
          query.price.$gte = parseFloat(minPrice);
      }
      if (maxPrice && parseFloat(maxPrice) < 100000000) { // Check against max range
          query.price.$lte = parseFloat(maxPrice);
      }
  }
  
  let cursor = collection.find(query).sort({ _id: -1 });

  if (limit) {
      const parsedLimit = parseInt(limit, 10);
      const parsedPage = parseInt(page, 10);
      cursor = cursor.skip((parsedPage - 1) * parsedLimit).limit(parsedLimit);
  }

  const properties = await cursor.toArray();
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
    const enquiries = await collection.find({ propertyId: new ObjectId(propertyId) }).sort({ createdAt: -1 }).toArray();
    return enquiries.map(e => processDocument(e));
}

export async function getAllEnquiriesWithPropertyInfo() {
    const collection = await getEnquiriesCollection();
    const enquiries = await collection.aggregate([
        { $sort: { createdAt: -1 } },
        {
            $lookup: {
                from: 'properties',
                localField: 'propertyId',
                foreignField: '_id',
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
