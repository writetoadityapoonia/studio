'use server';
/**
 * @fileOverview A flow for generating structured property details from raw text.
 *
 * - generatePropertyDetails - A function that takes raw text and returns structured data.
 * - GeneratePropertyDetailsInput - The input type for the generatePropertyDetails function.
 * - GeneratePropertyDetailsOutput - The return type for the generatePropertyDetails function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// Input Schema
export const GeneratePropertyDetailsInputSchema = z.object({
  rawText: z.string().describe('The raw, unstructured text describing a property.'),
});
export type GeneratePropertyDetailsInput = z.infer<typeof GeneratePropertyDetailsInputSchema>;

// Schemas for structured description
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


// Output Schema
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


// The exported wrapper function that calls the flow
export async function generatePropertyDetails(input: GeneratePropertyDetailsInput): Promise<GeneratePropertyDetailsOutput> {
  return generatePropertyDetailsFlow(input);
}


// The prompt definition
const propertyDetailsPrompt = ai.definePrompt({
  name: 'propertyDetailsPrompt',
  input: { schema: GeneratePropertyDetailsInputSchema },
  output: { schema: GeneratePropertyDetailsOutputSchema },
  prompt: `You are an expert real estate agent tasked with creating a compelling property listing.
Analyze the following raw text and extract the property details into a structured JSON format.

Your tasks:
1.  Extract the key details: title, location, price, type, bedrooms, bathrooms, and area (sqft).
2.  Summarize the description into a few paragraphs of text.
3.  Identify key features or amenities and present them in a table format. The table should have headers (e.g., "Feature", "Detail") and rows.
4.  Ensure all numeric fields (price, bedrooms, bathrooms, area) are numbers, not strings.

Raw Text:
{{{rawText}}}
`,
});

// The flow definition
const generatePropertyDetailsFlow = ai.defineFlow(
  {
    name: 'generatePropertyDetailsFlow',
    inputSchema: GeneratePropertyDetailsInputSchema,
    outputSchema: GeneratePropertyDetailsOutputSchema,
  },
  async (input) => {
    const { output } = await propertyDetailsPrompt(input);
    if (!output) {
        throw new Error("AI failed to generate a response.");
    }
    return output;
  }
);
