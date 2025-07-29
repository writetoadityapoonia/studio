export type Property = {
  id: string;
  title: string;
  price: number;
  location: string;
  address: string;
  type: 'Apartment' | 'House' | 'Villa';
  bedrooms: number;
  bathrooms: number;
  area: number;
  images: string[];
  descriptionHtml: string;
  amenities: string[];
  coordinates: {
    lat: number;
    lng: number;
  };
};
