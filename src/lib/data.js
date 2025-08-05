
'use server';

import connectToDatabase from './mongoose';
import Property from '../models/property';
import { ObjectId } from 'mongodb'; // Keep for enquiries

async function getEnquiriesCollection() {
    const { connection } = await connectToDatabase();
    return connection.db.collection('enquiries');
}

async function getPropertyTypesCollection() {
    const { connection } = await connectToDatabase();
    return connection.db.collection('property_types');
}

function processDocument(doc) {
    if (!doc) return null;
    const plainDoc = doc.toObject({ virtuals: true, getters: true });
    plainDoc.id = plainDoc._id.toString();
    delete plainDoc._id;
    delete plainDoc.__v;
    return plainDoc;
}


export async function getProperties(searchParams = {}) {
  await connectToDatabase();
  const { lat, lng, type, minPrice, maxPrice, limit, page = 1, search } = searchParams;
  
  let query = {};

  if (lat && lng) {
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);
      const radiusInMeters = 15 * 1000; // 15km

      if (!isNaN(latitude) && !isNaN(longitude)) {
        query['location.coordinates'] = {
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
      query.propertyType = type;
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
  
  // This is a server-side text search if fuse.js isn't used or for initial load
  if (search) {
      query.$text = { $search: search };
  }
  
  let queryBuilder = Property.find(query).sort({ createdAt: -1 });

  if (limit) {
      const parsedLimit = parseInt(limit, 10);
      const parsedPage = parseInt(page, 10);
      queryBuilder = queryBuilder.skip((parsedPage - 1) * parsedLimit).limit(parsedLimit);
  }

  const properties = await queryBuilder.exec();
  return properties.map(p => processDocument(p));
}

export async function getPropertyById(id) {
    await connectToDatabase();
    if (!ObjectId.isValid(id)) {
        return null;
    }
    const property = await Property.findById(id);
    return processDocument(property);
}

export async function getEnquiriesForProperty(propertyId) {
    if (!ObjectId.isValid(propertyId)) {
        return [];
    }
    const collection = await getEnquiriesCollection();
    const enquiries = await collection.find({ propertyId: new ObjectId(propertyId) }).sort({ createdAt: -1 }).toArray();
    return enquiries.map(e => ({ ...e, id: e._id.toString() }));
}

export async function getAllEnquiriesWithPropertyInfo() {
    const collection = await getEnquiriesCollection();
    const enquiries = await collection.aggregate([
        { $sort: { createdAt: -1 } },
        {
            $lookup: {
                from: 'properties', // collection name is 'properties'
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

    // The result from aggregate is already plain objects, but let's ensure consistency
    return JSON.parse(JSON.stringify(enquiries));
}

export async function getPropertyTypes() {
  const collection = await getPropertyTypesCollection();
  const types = await collection.find({}).sort({ name: 1 }).toArray();
  // The result from find().toArray() is already plain objects, but let's ensure consistency
  return JSON.parse(JSON.stringify(types.map(t => ({...t, id: t._id.toString()}))));
}
