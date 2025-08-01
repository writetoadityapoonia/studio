/**
 * @fileOverview Shared Zod schemas and TypeScript types for AI flows.
 */
import { z } from 'zod';

// Input Schema for generating property details
export const GeneratePropertyDetailsInputSchema = z.object({
  rawText: z.string().describe('The raw, unstructured text describing a property.'),
});
export type GeneratePropertyDetailsInput = z.infer<typeof GeneratePropertyDetailsInputSchema>;

// Schemas for structured description components (used in output)
const DescriptionTextSchema = z.object({
    type: z.literal('Text'),
    data: z.string().describe('A paragraph of text for the description.'),
});

const DescriptionTableSchema = z.object({
    type: z.literal('Table'),
    data: z.object({
        headers: z.array(z.string()).describe('The headers for the table.'),
        rows: z.array(z.array(z.string())).describe('The rows of the table, where each inner array is a row.'),
    }).describe('A table of features or amenities.'),
});

const DescriptionComponentSchema = z.union([DescriptionTextSchema, DescriptionTableSchema]);

// Output Schema for generating property details
export const GeneratePropertyDetailsOutputSchema = z.object({
  title: z.string().describe('A concise, attractive title for the property listing.'),
  location: z.string().describe('The full address or location of the property.'),
  price: z.number().describe('The monthly rental price as a number.'),
  type: z.string().describe('The type of property (e.g., Apartment, House, Condo).'),
  bedrooms: z.number().describe('The number of bedrooms.'),
  bathrooms: z.number().describe('The number of bathrooms.'),
  area: z.number().describe('The total square footage of the property.'),
  description: z.array(DescriptionComponentSchema).describe('A structured description of the property, composed of text paragraphs and tables of amenities.'),
});
export type GeneratePropertyDetailsOutput = z.infer<typeof GeneratePropertyDetailsOutputSchema>;
