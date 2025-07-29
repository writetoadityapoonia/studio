export type Property = {
  id: string;
  title: string;
  price: number;
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
  // New project-specific fields
  landArea?: string; // e.g., "3.17 Acres"
  totalUnits?: number;
  towersAndBlocks?: string; // e.g., "4 Blocks, 2B + G + 14 Floors"
  possessionTime?: string; // e.g., "2028 Onwards"
  specifications?: string; // To hold specifications as HTML or Markdown
};
