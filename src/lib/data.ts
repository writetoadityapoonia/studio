// In-memory data store for properties.
// In a real application, this data would come from a database.

import type { Property } from './types';

const properties: Property[] = [
  {
    id: '1',
    title: 'Modern Apartment in Downtown',
    location: 'New York, NY',
    price: 3500,
    type: 'Apartment',
    bedrooms: 2,
    bathrooms: 2,
    area: 1200,
    images: [
        'https://placehold.co/600x400.png',
        'https://placehold.co/600x400.png',
        'https://placehold.co/600x400.png',
    ],
    description: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Property Details</title>
</head>
<body>
    <h2>Welcome to this beautiful modern apartment!</h2>
    <p>This stunning 2-bedroom, 2-bathroom apartment is located in the heart of downtown, offering breathtaking city views and unparalleled convenience. The open-concept living space is perfect for entertaining, featuring floor-to-ceiling windows that flood the apartment with natural light.</p>
    <button style="background-color: #6d28d9; color: white; padding: 0.5rem 1rem; border: none; border-radius: 0.25rem; cursor: pointer;">Request a Tour</button>
</body>
</html>
    `,
  },
  {
    id: '2',
    title: 'Cozy Suburban House',
    location: 'Austin, TX',
    price: 2800,
    type: 'House',
    bedrooms: 3,
    bathrooms: 2.5,
    area: 2100,
    images: ['https://placehold.co/600x400.png'],
    description: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Property Details</title>
</head>
<body>
    <h2>Charming suburban home with a spacious backyard.</h2>
    <p>Escape the hustle and bustle in this lovely 3-bedroom house. It features a large backyard, a modern kitchen, and a cozy fireplace. Perfect for families!</p>
</body>
</html>
    `,
  },
   {
    id: '3',
    title: 'Luxury Penthouse with Ocean View',
    location: 'Miami, FL',
    price: 7500,
    type: 'Penthouse',
    bedrooms: 4,
    bathrooms: 4,
    area: 3500,
    images: ['https://placehold.co/600x400.png', 'https://placehold.co/600x400.png'],
    description: '<p>Experience ultimate luxury in this breathtaking penthouse. Unobstructed ocean views, a private rooftop pool, and state-of-the-art amenities await. This is more than a home; it\'s a lifestyle.</p>',
  },
  {
    id: '4',
    title: 'Rustic Cabin in the Woods',
    location: 'Asheville, NC',
    price: 1500,
    type: 'Cabin',
    bedrooms: 1,
    bathrooms: 1,
    area: 800,
    images: ['https://placehold.co/600x400.png'],
    description: '<p>Get away from it all in this charming and rustic cabin. Surrounded by nature, it\'s the perfect retreat for hiking, relaxing, and enjoying the peace and quiet of the mountains.</p>',
  },
];

export function getProperties() {
  return properties;
}

export function getPropertyById(id: string) {
  return properties.find((p) => p.id === id);
}
