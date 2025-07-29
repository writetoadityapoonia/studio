import type { Property } from './types';

const properties: Property[] = [
  {
    id: '1',
    title: 'Modern Downtown Loft',
    price: 1200000,
    location: 'New York, NY',
    address: '123 Main St, New York, NY 10001',
    type: 'Apartment',
    bedrooms: 2,
    bathrooms: 2,
    area: 1500,
    images: ['https://placehold.co/800x600', 'https://placehold.co/800x600', 'https://placehold.co/800x600'],
    descriptionHtml: `
      <h3 class="font-bold text-lg mb-2">Luxury Living in the Heart of the City</h3>
      <p>Experience the pinnacle of urban living in this stunning downtown loft. With floor-to-ceiling windows, this 2-bedroom, 2-bathroom apartment offers breathtaking city views and an open-concept living space perfect for entertaining. The modern kitchen is equipped with state-of-the-art appliances and custom cabinetry.</p>
      <p class="mt-4">Residents enjoy access to exclusive amenities, including a rooftop terrace, a fully-equipped fitness center, and 24-hour concierge service. Located just steps away from fine dining, shopping, and cultural landmarks.</p>
    `,
    amenities: ['Rooftop Terrace', 'Fitness Center', '24/7 Security', 'Concierge'],
    coordinates: { lat: 40.7128, lng: -74.006 },
    landArea: "1 Acre",
    totalUnits: 50,
    towersAndBlocks: "1 Block, G + 10 Floors",
    possessionTime: "Ready to move",
    specifications: `<h4>Structure</h4><ul><li>RCC framed structure</li></ul><h4>Flooring</h4><ul><li>Premium Vitrified Flooring</li></ul>`
  },
  {
    id: '2',
    title: 'Suburban Family Home',
    price: 750000,
    location: 'Austin, TX',
    address: '456 Oak Ave, Austin, TX 78701',
    type: 'House',
    bedrooms: 4,
    bathrooms: 3,
    area: 2800,
    images: ['https://placehold.co/800x600', 'https://placehold.co/800x600', 'https://placehold.co/800x600'],
    descriptionHtml: `
      <h3 class="font-bold text-lg mb-2">Your Dream Family Home</h3>
      <p>Nestled in a quiet, family-friendly neighborhood, this beautiful 4-bedroom house offers the perfect blend of comfort and style. The spacious backyard with a large patio is ideal for summer barbecues and outdoor activities. The interior features a gourmet kitchen, a cozy fireplace in the living room, and a master suite with a walk-in closet.</p>
      <p class="mt-4">This home is located in a top-rated school district and is close to parks, community pools, and shopping centers. Make this your forever home!</p>
    `,
    amenities: ['Large Backyard', 'Swimming Pool', '2-Car Garage', 'Fireplace'],
    coordinates: { lat: 30.2672, lng: -97.7431 },
    landArea: "0.5 Acres",
    totalUnits: 1,
    towersAndBlocks: "1 Block, G + 1 Floor",
    possessionTime: "Ready to move",
    specifications: `<h4>Structure</h4><ul><li>RCC framed structure</li></ul>`
  },
  {
    id: '3',
    title: 'Luxury Beachfront Villa',
    price: 3500000,
    location: 'Malibu, CA',
    address: '789 Pacific Coast Hwy, Malibu, CA 90265',
    type: 'Villa',
    bedrooms: 5,
    bathrooms: 6,
    area: 5000,
    images: ['https://placehold.co/800x600', 'https://placehold.co/800x600', 'https://placehold.co/800x600'],
    descriptionHtml: `
      <h3 class="font-bold text-lg mb-2">Oceanfront Paradise</h3>
      <p>Wake up to the sound of waves in this exquisite beachfront villa. Offering unparalleled ocean views from every room, this luxurious property features an infinity pool, a private path to the beach, and expansive terraces for soaking up the California sun. The open-plan living area and state-of-the-art kitchen are designed for the ultimate in luxury and entertainment.</p>
      <p class="mt-4">With 5 bedrooms, each with an en-suite bathroom, this villa is perfect for hosting guests or enjoying a private family retreat.</p>
    `,
    amenities: ['Infinity Pool', 'Private Beach Access', 'Home Theater', 'Ocean View'],
    coordinates: { lat: 34.0259, lng: -118.7798 },
    landArea: "2 Acres",
    totalUnits: 1,
    possessionTime: "Ready to move"
  },
  {
    id: '4',
    title: 'Chic Urban Apartment',
    price: 980000,
    location: 'San Francisco, CA',
    address: '321 Bay St, San Francisco, CA 94133',
    type: 'Apartment',
    bedrooms: 1,
    bathrooms: 1,
    area: 950,
    images: ['https://placehold.co/800x600', 'https://placehold.co/800x600', 'https://placehold.co/800x600'],
    descriptionHtml: `
      <h3 class="font-bold text-lg mb-2">Stylish City Pad</h3>
      <p>This chic 1-bedroom apartment in a historic San Francisco building has been fully renovated with modern finishes. It boasts high ceilings, hardwood floors, and a designer kitchen. The large windows flood the space with natural light.</p>
      <p class="mt-4">Enjoy the convenience of city living with cafes, boutiques, and public transport right at your doorstep.</p>
    `,
    amenities: ['Modern Kitchen', 'Hardwood Floors', 'High Ceilings', 'City View'],
    coordinates: { lat: 37.7749, lng: -122.4194 },
    landArea: "0.5 Acres",
    totalUnits: 20,
    possessionTime: "Ready to move"
  },
  {
    id: '5',
    title: 'Spacious Mountain Retreat',
    price: 1500000,
    location: 'Denver, CO',
    address: '101 Pine Ridge Rd, Denver, CO 80202',
    type: 'House',
    bedrooms: 5,
    bathrooms: 4,
    area: 4200,
    images: ['https://placehold.co/800x600', 'https://placehold.co/800x600', 'https://placehold.co/800x600'],
    descriptionHtml: `
      <h3 class="font-bold text-lg mb-2">Your Gateway to the Rockies</h3>
      <p>Escape to this spacious mountain retreat with stunning views of the Rocky Mountains. This custom-built house features a rustic yet elegant design with exposed wood beams, a stone fireplace, and large decks to enjoy the scenery. The open-concept kitchen and living area are perfect for gatherings.</p>
      <p class="mt-4">With easy access to hiking trails and ski resorts, this home is an outdoor enthusiast's dream.</p>
    `,
    amenities: ['Mountain View', 'Large Deck', 'Stone Fireplace', 'Hiking Trails Access'],
    coordinates: { lat: 39.7392, lng: -104.9903 },
    landArea: "5 Acres",
    totalUnits: 1,
    possessionTime: "Ready to move"
  },
  {
    id: '6',
    title: 'Elegant Seaside Villa',
    price: 2800000,
    location: 'Miami, FL',
    address: '555 Ocean Dr, Miami, FL 33139',
    type: 'Villa',
    bedrooms: 6,
    bathrooms: 7,
    area: 6000,
    images: ['https://placehold.co/800x600', 'https://placehold.co/800x600', 'https://placehold.co/800x600'],
    descriptionHtml: `
      <h3 class="font-bold text-lg mb-2">The Ultimate Miami Lifestyle</h3>
      <p>This elegant seaside villa embodies the luxury of Miami living. With direct ocean access, a private dock, and a stunning pool area, this property is an entertainer's dream. The interior is exquisitely designed with marble floors, a grand staircase, and a chef's kitchen.</p>
      <p class="mt-4">Located in a prestigious neighborhood, you are just minutes away from the vibrant nightlife and culture of South Beach.</p>
    `,
    amenities: ['Private Dock', 'Swimming Pool', 'Chef\'s Kitchen', 'Marble Floors'],
    coordinates: { lat: 25.7907, lng: -80.13 },
    landArea: "1.5 Acres",
    totalUnits: 1,
    possessionTime: "Ready to move"
  },
];

export async function getProperties(options?: { location?: string; type?: string }): Promise<Property[]> {
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
  
  let filteredProperties = properties;

  if (options?.location) {
    filteredProperties = filteredProperties.filter(p => p.location.toLowerCase().includes(options.location!.toLowerCase()));
  }

  if (options?.type && options.type !== 'all') {
    filteredProperties = filteredProperties.filter(p => p.type.toLowerCase() === options.type!.toLowerCase());
  }

  return filteredProperties;
}

export async function getPropertyById(id: string): Promise<Property | undefined> {
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
  return properties.find(p => p.id === id);
}
