export type Property = {
  id: string;
  slug: string; // New field for URL-friendly identifier
  title: string;
  price: string; // e.g. "₹2.04 Crore Onwards"
  priceValue: number; // e.g. 20400000 - for filtering
  location: string;
  address: string;
  type: string;
  bedrooms: number;
  images: string[];
  descriptionHtml: string;
  amenities: string[];
  coordinates: {
    lat: number;
    lng: number;
  };
  landArea?: string;
  totalUnits?: number;
  towersAndBlocks?: string;
  possessionTime?: string;
  specifications?: string;
};
