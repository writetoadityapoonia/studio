

export interface Property {
  id: string;
  title: string;
  location: string;
  price: number;
  type: string;
  developer: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  images: string[];
  description: string;
}

export interface Enquiry {
  id: string;
  propertyId: string;
  name: string;
  email: string;
  phone: string;
  createdAt: Date;
}

export interface EnquiryWithPropertyInfo extends Omit<Enquiry, 'propertyId'> {
    property?: {
        id: string;
        title: string;
    }
}

export interface PropertyType {
    id: string;
    name: string;
}

    