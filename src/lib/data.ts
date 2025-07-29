import type { Property } from './types';

const properties: Property[] = [
  {
    id: '1',
    title: 'Modern Downtown Loft',
    price: '₹1.2 Cr Onwards',
    location: 'Mumbai, MH',
    address: '123 Dalal Street, Mumbai, MH 400001',
    type: 'Apartment',
    bedrooms: 2,
    images: ['https://placehold.co/800x600', 'https://placehold.co/800x600', 'https://placehold.co/800x600'],
    descriptionHtml: `
      <h3 class="font-bold text-lg mb-2">Luxury Living in the Heart of the City</h3>
      <p>Experience the pinnacle of urban living in this stunning downtown loft. With floor-to-ceiling windows, this 2-bedroom, 2-bathroom apartment offers breathtaking city views and an open-concept living space perfect for entertaining. The modern kitchen is equipped with state-of-the-art appliances and custom cabinetry.</p>
      <p class="mt-4">Residents enjoy access to exclusive amenities, including a rooftop terrace, a fully-equipped fitness center, and 24-hour concierge service. Located just steps away from fine dining, shopping, and cultural landmarks.</p>
    `,
    amenities: ['Rooftop Terrace', 'Fitness Center', '24/7 Security', 'Concierge'],
    coordinates: { lat: 19.0760, lng: 72.8777 },
    landArea: "1 Acre",
    totalUnits: 50,
    towersAndBlocks: "1 Block, G + 10 Floors",
    possessionTime: "Ready to move",
    specifications: `<h4>Structure</h4><ul><li>RCC framed structure</li></ul><h4>Flooring</h4><ul><li>Premium Vitrified Flooring</li></ul>`
  },
  {
    id: '2',
    title: 'Suburban Family Home',
    price: '₹75 Lakh Onwards',
    location: 'Gurgaon, HR',
    address: '456 Oak Ave, Gurgaon, HR 122001',
    type: 'House',
    bedrooms: 4,
    images: ['https://placehold.co/800x600', 'https://placehold.co/800x600', 'https://placehold.co/800x600'],
    descriptionHtml: `
      <h3 class="font-bold text-lg mb-2">Your Dream Family Home</h3>
      <p>Nestled in a quiet, family-friendly neighborhood, this beautiful 4-bedroom house offers the perfect blend of comfort and style. The spacious backyard with a large patio is ideal for summer barbecues and outdoor activities. The interior features a gourmet kitchen, a cozy fireplace in the living room, and a master suite with a walk-in closet.</p>
      <p class="mt-4">This home is located in a top-rated school district and is close to parks, community pools, and shopping centers. Make this your forever home!</p>
    `,
    amenities: ['Large Backyard', 'Swimming Pool', '2-Car Garage', 'Fireplace'],
    coordinates: { lat: 28.4595, lng: 77.0266 },
    landArea: "0.5 Acres",
    totalUnits: 1,
    towersAndBlocks: "1 Block, G + 1 Floor",
    possessionTime: "Ready to move",
    specifications: `<h4>Structure</h4><ul><li>RCC framed structure</li></ul>`
  },
  {
    id: '3',
    title: 'Luxury Beachfront Villa',
    price: '₹3.5 Cr Onwards',
    location: 'Goa',
    address: '789 Baga Beach Rd, Goa 403516',
    type: 'Villa',
    bedrooms: 5,
    images: ['https://placehold.co/800x600', 'https://placehold.co/800x600', 'https://placehold.co/800x600'],
    descriptionHtml: `
      <h3 class="font-bold text-lg mb-2">Oceanfront Paradise</h3>
      <p>Wake up to the sound of waves in this exquisite beachfront villa. Offering unparalleled ocean views from every room, this luxurious property features an infinity pool, a private path to the beach, and expansive terraces for soaking up the sun. The open-plan living area and state-of-the-art kitchen are designed for the ultimate in luxury and entertainment.</p>
      <p class="mt-4">With 5 bedrooms, each with an en-suite bathroom, this villa is perfect for hosting guests or enjoying a private family retreat.</p>
    `,
    amenities: ['Infinity Pool', 'Private Beach Access', 'Home Theater', 'Ocean View'],
    coordinates: { lat: 15.5562, lng: 73.7517 },
    landArea: "2 Acres",
    totalUnits: 1,
    possessionTime: "Ready to move"
  },
  {
    id: '4',
    title: 'Chic Urban Apartment',
    price: '₹98 Lakh Onwards',
    location: 'Bangalore, KA',
    address: '321 Koramangala St, Bangalore, KA 560034',
    type: 'Apartment',
    bedrooms: 1,
    images: ['https://placehold.co/800x600', 'https://placehold.co/800x600', 'https://placehold.co/800x600'],
    descriptionHtml: `
      <h3 class="font-bold text-lg mb-2">Stylish City Pad</h3>
      <p>This chic 1-bedroom apartment in a historic Bangalore building has been fully renovated with modern finishes. It boasts high ceilings, hardwood floors, and a designer kitchen. The large windows flood the space with natural light.</p>
      <p class="mt-4">Enjoy the convenience of city living with cafes, boutiques, and public transport right at your doorstep.</p>
    `,
    amenities: ['Modern Kitchen', 'Hardwood Floors', 'High Ceilings', 'City View'],
    coordinates: { lat: 12.9716, lng: 77.5946 },
    landArea: "0.5 Acres",
    totalUnits: 20,
    possessionTime: "Ready to move"
  },
  {
    id: '5',
    title: 'Spacious Mountain Retreat',
    price: '₹1.5 Cr Onwards',
    location: 'Shimla, HP',
    address: '101 Pine Ridge Rd, Shimla, HP 171001',
    type: 'House',
    bedrooms: 5,
    images: ['https://placehold.co/800x600', 'https://placehold.co/800x600', 'https://placehold.co/800x600'],
    descriptionHtml: `
      <h3 class="font-bold text-lg mb-2">Your Gateway to the Himalayas</h3>
      <p>Escape to this spacious mountain retreat with stunning views of the Himalayas. This custom-built house features a rustic yet elegant design with exposed wood beams, a stone fireplace, and large decks to enjoy the scenery. The open-concept kitchen and living area are perfect for gatherings.</p>
      <p class="mt-4">With easy access to hiking trails and a serene environment, this home is an outdoor enthusiast's dream.</p>
    `,
    amenities: ['Mountain View', 'Large Deck', 'Stone Fireplace', 'Hiking Trails Access'],
    coordinates: { lat: 31.1048, lng: 77.1734 },
    landArea: "5 Acres",
    totalUnits: 1,
    possessionTime: "Ready to move"
  },
  {
    id: '6',
    title: 'Elegant Backwater Villa',
    price: '₹2.8 Cr Onwards',
    location: 'Kochi, KL',
    address: '555 Vembanad Lake, Kochi, KL 682013',
    type: 'Villa',
    bedrooms: 6,
    images: ['https://placehold.co/800x600', 'https://placehold.co/800x600', 'https://placehold.co/800x600'],
    descriptionHtml: `
      <h3 class="font-bold text-lg mb-2">The Ultimate Kerala Lifestyle</h3>
      <p>This elegant backwater villa embodies the luxury of Kerala living. With direct backwater access, a private boat jetty, and a stunning pool area, this property is an entertainer's dream. The interior is exquisitely designed with traditional architecture, marble floors, and a chef's kitchen.</p>
      <p class="mt-4">Located in a prestigious neighborhood, you are just minutes away from the vibrant culture of Fort Kochi.</p>
    `,
    amenities: ['Private Jetty', 'Swimming Pool', 'Chef\'s Kitchen', 'Marble Floors'],
    coordinates: { lat: 9.9312, lng: 76.2673 },
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
