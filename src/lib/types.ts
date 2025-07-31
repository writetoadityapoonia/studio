export interface Property {
  id: string;
  title: string;
  location: string;
  price: number;
  type: string;
  bedrooms: number;
  bathrooms: number | string;
  area: number;
  images: string[];
  description: string;
}
