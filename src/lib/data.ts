import 'server-only';
import { db } from './firebase';
import type { Property, Enquiry } from './types';
import { revalidatePath } from 'next/cache';
import { FieldValue } from 'firebase-admin/firestore';

const createSlug = (title: string) => {
  return title
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9\s-]/g, '') 
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
};

const propertiesCollection = db.collection('properties');
const enquiriesCollection = db.collection('enquiries');

// Helper to convert Firestore doc to Property
const propertyFromDoc = (doc: FirebaseFirestore.DocumentSnapshot): Property => {
    const data = doc.data() as any;
    return {
        id: doc.id,
        ...data,
        // Firestore timestamps need to be converted to Dates if they exist.
        // For this app, we don't have them on Property, but this is how you'd do it.
    } as Property;
}

// Helper to convert Firestore doc to Enquiry
const enquiryFromDoc = (doc: FirebaseFirestore.DocumentSnapshot): Enquiry => {
    const data = doc.data() as any;
    return {
        id: doc.id,
        ...data,
        createdAt: (data.createdAt as FirebaseFirestore.Timestamp).toDate(),
    } as Enquiry;
}

// Properties
export async function getProperties(options?: { location?: string; type?: string }): Promise<Property[]> {
  let query: FirebaseFirestore.Query = propertiesCollection;

  // Note: Firestore requires creating indexes for compound queries.
  // If you filter by both location and type, you'll need an index in Firestore.
  if (options?.location) {
    // Firestore doesn't support case-insensitive `includes` queries directly.
    // A common workaround is to store a lowercased version of the field.
    // For simplicity here, we'll stick to exact matches or use more complex solutions like Algolia/Elasticsearch for real apps.
  }

  if (options?.type && options.type !== 'all') {
    query = query.where('type', '==', options.type);
  }

  const snapshot = await query.orderBy('title').get();
  return snapshot.docs.map(propertyFromDoc);
}

export async function getPropertyBySlug(slug: string): Promise<Property | undefined> {
  const snapshot = await propertiesCollection.where('slug', '==', slug).limit(1).get();
  if (snapshot.empty) {
    return undefined;
  }
  return propertyFromDoc(snapshot.docs[0]);
}

export async function createProperty(data: Omit<Property, 'id' | 'slug'>): Promise<Property> {
    const slug = createSlug(data.title);
    const newPropertyData = { ...data, slug };
    const docRef = await propertiesCollection.add(newPropertyData);
    
    revalidatePath('/admin');
    revalidatePath('/');

    return { id: docRef.id, ...newPropertyData };
}

export async function updateProperty(id: string, data: Partial<Omit<Property, 'id' | 'slug'>>): Promise<Property | null> {
    const docRef = propertiesCollection.doc(id);
    const doc = await docRef.get();
    if (!doc.exists) {
        return null;
    }

    const slug = data.title ? createSlug(data.title) : doc.data()?.slug;
    const updateData = { ...data, slug };

    await docRef.update(updateData);

    const updatedDoc = await docRef.get();
    const updatedProperty = propertyFromDoc(updatedDoc);

    revalidatePath('/admin');
    revalidatePath(`/admin/edit/${id}`);
    revalidatePath(`/properties/${updatedProperty.slug}`);
    revalidatePath('/');
    
    return updatedProperty;
}

export async function getPropertyById(id: string): Promise<Property | undefined> {
  const doc = await propertiesCollection.doc(id).get();
  return doc.exists ? propertyFromDoc(doc) : undefined;
}

export async function getUniquePropertyTypes(): Promise<string[]> {
  const snapshot = await propertiesCollection.select('type').get();
  const types = new Set(snapshot.docs.map(doc => doc.data().type as string));
  return Array.from(types);
}

export async function getPriceRange(): Promise<[number, number]> {
    // This can be inefficient on large datasets.
    // In a real app, you might maintain this in a separate 'metadata' document.
    const snapshot = await propertiesCollection.select('priceValue').get();
    if (snapshot.empty) return [0, 100000000];
    const prices = snapshot.docs.map(doc => doc.data().priceValue as number);
    return [Math.min(...prices), Math.max(...prices)];
}

// Enquiries
export async function getEnquiries(): Promise<Enquiry[]> {
  const snapshot = await enquiriesCollection.orderBy('createdAt', 'desc').get();
  return snapshot.docs.map(enquiryFromDoc);
}

export async function createEnquiry(data: Omit<Enquiry, 'id' | 'createdAt' | 'propertyTitle'>): Promise<Enquiry> {
    const property = await getPropertyById(data.propertyId);
    if (!property) {
        throw new Error('Property not found');
    }
    
    const newEnquiryData = {
        ...data,
        propertyTitle: property.title,
        createdAt: FieldValue.serverTimestamp(),
    };

    const docRef = await enquiriesCollection.add(newEnquiryData);

    revalidatePath('/admin');
    
    // We can't return the full object immediately because createdAt is set by the server
    // For the UI's purpose, this is often sufficient, or we could re-fetch the doc.
    return {
        id: docRef.id,
        ...data,
        propertyTitle: property.title,
        createdAt: new Date(), // Return local date as an optimistic value
    };
}
