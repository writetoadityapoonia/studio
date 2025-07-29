import type { Property } from './types';
import { revalidatePath } from 'next/cache';

const createSlug = (title: string) => {
  return title
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9\s-]/g, '') 
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
};


// In-memory store with some initial data.
let properties: Property[] = [
  {
    id: '1',
    slug: 'concorde-mayfair',
    title: 'Concorde Mayfair',
    price: '₹2.04 Crore Onwards',
    priceValue: 20400000,
    location: 'Yelahanka, Bangalore',
    address: 'Sy.No.82, Allalasandra Village, Yelahanka Hobli, Bangalore North Taluk, Bangalore - 560065',
    type: 'Apartment',
    bedrooms: 3,
    images: [
      'https://placehold.co/800x600',
      'https://placehold.co/800x600',
      'https://placehold.co/800x600',
    ],
    descriptionHtml: '<h4>A New Benchmark in Luxury Living</h4><p>Concorde Mayfair is a brand new residential Apartment project launched in the vibrant neighborhood of Yelahanka, Bangalore. This residential enclave features the very best in Concorde Group’s luxury living segment, offering spacious 2 & 3 BHK Apartments with world-class features.</p><p>Surrounded by beautiful landscapes and ample open spaces, Concorde Mayfair provides a tranquil and elite living experience. The builder is guaranteed to bring a quality lifestyle to the community with brilliant architecture and an equivalent lifestyle.</p>',
    amenities: [
      'Fully Equipped Clubhouse',
      'Landscaped Gardens',
      'Gymnasium',
      'Swimming Pool',
      'Indoor Games Area',
      'Outdoor Sports Courts',
      'Children’s Play Area',
      'Party Area',
      'Health Center',
      'Yoga & Activity Area',
      'Jogging Track',
      'Retail Spaces',
      '24/7 Security with CCTV',
    ],
    coordinates: {
      lat: 13.1008,
      lng: 77.5963,
    },
    landArea: '3.17 Acres',
    totalUnits: 217,
    towersAndBlocks: '4 Blocks, 2B + G + 14 Floors',
    possessionTime: '2028 Onwards',
    specifications: '<h4>Structure</h4><ul><li>RCC framed structure with Concrete Solid Block Masonry.</li></ul><h4>Flooring</h4><ul><li>Premium Vitrified Flooring in Living and Dining areas.</li><li>Anti-Skid Ceramic Tile flooring in bathrooms and wet areas.</li></ul><h4>Doors</h4><ul><li>Main door with engineered frame and veneer finished shutter.</li><li>Bathroom doors with veneer finish outside and laminate inside.</li></ul><h4>Plumbing & Sanitary</h4><ul><li>Premium CP fittings from brands like Roca/Jaguar.</li><li>High-quality sanitary fixtures from brands like Toto/Hindware.</li><li>Rainwater Harvesting system integrated.</li></ul><h4>Security</h4><ul><li>24/7 security with intercom facility.</li><li>CCTV surveillance at all key vantage points.</li></ul><h4>Electrical</h4><ul><li>Grid power from BESCOM with premium modular switches.</li><li>100% DG backup for common areas, lifts, and pumps.</li></ul>',
  },
  {
    id: '2',
    slug: 'prestige-lakeside-habitat',
    title: 'Prestige Lakeside Habitat',
    price: '₹2.5 Crore Onwards',
    priceValue: 25000000,
    location: 'Whitefield, Bangalore',
    address: 'Whitefield-Sarjapur Road, Varthur, Bangalore',
    type: 'Villa',
    bedrooms: 4,
    images: [
      'https://placehold.co/800x600',
      'https://placehold.co/800x600'
    ],
    descriptionHtml: '<p>A sprawling luxury enclave by the Prestige Group overlooking the scenic Varthur Lake. One of Bangalore’s largest residential developments.</p>',
    amenities: [
      'Golf Course',
      'Skating Rink',
      'Tennis Court',
      'Cricket Pitch'
    ],
    coordinates: {
      lat: 12.9436,
      lng: 77.7499,
    },
    landArea: '102 Acres',
    totalUnits: 3697,
    possessionTime: 'Ready to Move',
  },
  {
    id: '3',
    slug: 'sobha-dream-acres',
    title: 'Sobha Dream Acres',
    price: '₹80 Lakhs Onwards',
    priceValue: 8000000,
    location: 'Panathur, Bangalore',
    address: 'Balagere Panathur Road, Bangalore',
    type: 'Apartment',
    bedrooms: 2,
    images: [
      'https://placehold.co/800x600'
    ],
    descriptionHtml: '<p>Sobha Dream Acres is a massive residential township that offers a fine blend of luxury and affordability, designed for the modern urbanite.</p>',
    amenities: [
      '5 Clubhouses',
      'Multiple Swimming Pools',
      'Co-working Space'
    ],
    coordinates: {
      lat: 12.9443,
      lng: 77.7153,
    },
    landArea: '81 Acres',
    possessionTime: 'Ready to Move',
  }
];

let nextId = 4; // Start IDs after the initial hardcoded ones.

export async function getProperties(options?: { location?: string; type?: string }): Promise<Property[]> {
  await new Promise(resolve => setTimeout(resolve, 100)); // Simulate network delay
  
  let filteredProperties = [...properties];

  if (options?.location) {
    filteredProperties = filteredProperties.filter(p => p.location.toLowerCase().includes(options.location!.toLowerCase()));
  }

  if (options?.type && options.type !== 'all') {
    filteredProperties = filteredProperties.filter(p => p.type.toLowerCase() === options.type!.toLowerCase());
  }

  return filteredProperties;
}

export async function getPropertyBySlug(slug: string): Promise<Property | undefined> {
  await new Promise(resolve => setTimeout(resolve, 100)); // Simulate network delay
  return properties.find(p => p.slug === slug);
}

export async function createProperty(data: Omit<Property, 'id' | 'slug'>): Promise<Property> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newProperty: Property = {
        id: String(nextId++),
        slug: createSlug(data.title),
        ...data
    };
    properties.unshift(newProperty); // Add to the beginning of the array
    revalidatePath('/admin');
    revalidatePath('/');
    return newProperty;
}

export async function updateProperty(id: string, data: Partial<Omit<Property, 'id'>>): Promise<Property | null> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const propertyIndex = properties.findIndex(p => p.id === id);
    if (propertyIndex === -1) {
        return null;
    }
    
    const slug = data.title ? createSlug(data.title) : properties[propertyIndex].slug;

    const updatedProperty = {
        ...properties[propertyIndex],
        ...data,
        slug,
    };
    properties[propertyIndex] = updatedProperty;
    revalidatePath('/admin');
    revalidatePath(`/admin/edit/${id}`);
    revalidatePath(`/properties/${slug}`);
    revalidatePath('/');
    return updatedProperty;
}

export async function getPropertyById(id: string): Promise<Property | undefined> {
  await new Promise(resolve => setTimeout(resolve, 100)); // Simulate network delay
  return properties.find(p => p.id === id);
}

export async function getUniquePropertyTypes(): Promise<string[]> {
  await new Promise(resolve => setTimeout(resolve, 100));
  const types = new Set(properties.map(p => p.type));
  return Array.from(types);
}

export async function getPriceRange(): Promise<[number, number]> {
    await new Promise(resolve => setTimeout(resolve, 100));
    if (properties.length === 0) return [0, 100000000];
    const prices = properties.map(p => p.priceValue);
    return [Math.min(...prices), Math.max(...prices)];
}
