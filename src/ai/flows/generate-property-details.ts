'use server';
/**
 * @fileOverview A flow for generating structured property details from raw text.
 *
 * This file only exports the server-side function `generatePropertyDetails`.
 * Schemas and types are defined in `schemas.ts`.
 */

import { ai } from '@/ai/genkit';
import { GeneratePropertyDetailsInputSchema, GeneratePropertyDetailsOutputSchema } from './schemas';
import type { GeneratePropertyDetailsInput, GeneratePropertyDetailsOutput } from './schemas';
import { googleAI } from '@genkit-ai/googleai';


// The exported wrapper function that calls the flow
export async function generatePropertyDetails(input: GeneratePropertyDetailsInput): Promise<GeneratePropertyDetailsOutput> {
  return generatePropertyDetailsFlow(input);
}


// The prompt definition
const propertyDetailsPrompt = ai.definePrompt({
  name: 'propertyDetailsPrompt',
  input: { schema: GeneratePropertyDetailsInputSchema },
  output: { schema: GeneratePropertyDetailsOutputSchema },
  model: googleAI.model('gemini-pro'),
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
