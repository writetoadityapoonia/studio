'use server';
/**
 * @fileOverview A flow for generating property listings.
 * 
 * - generatePropertyListing - A function that generates a property description and amenities.
 * - GeneratePropertyListingInput - The input type for the generatePropertyListing function.
 * - GeneratePropertyListingOutput - The return type for the generatePropertyListing function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GeneratePropertyListingInputSchema = z.object({
  title: z.string(),
  type: z.string(),
  location: z.string(),
  price: z.number(),
  bedrooms: z.number(),
  bathrooms: z.number(),
  area: z.number(),
  keyFeatures: z.string().describe("A comma-separated list of key features or selling points for the property."),
});

export type GeneratePropertyListingInput = z.infer<typeof GeneratePropertyListingInputSchema>;

const GeneratePropertyListingOutputSchema = z.object({
    descriptionHtml: z.string().describe("A compelling, well-formatted HTML description for the property listing. It should be engaging and highlight the key features. Use <h3> tags for headings and <p> tags for paragraphs."),
    amenities: z.array(z.string()).describe("An array of 4-8 key amenities based on the property details and features."),
});

export type GeneratePropertyListingOutput = z.infer<typeof GeneratePropertyListingOutputSchema>;

export async function generatePropertyListing(input: GeneratePropertyListingInput): Promise<GeneratePropertyListingOutput> {
  return generateListingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateListingPrompt',
  input: { schema: GeneratePropertyListingInputSchema },
  output: { schema: GeneratePropertyListingOutputSchema },
  prompt: `You are a real estate marketing expert. Your task is to generate a compelling property listing.

Given the following property details, create a captivating HTML description and a list of key amenities.

Property Details:
- Title: {{title}}
- Type: {{type}}
- Location: {{location}}
- Price: \${{price}}
- Bedrooms: {{bedrooms}}
- Bathrooms: {{bathrooms}}
- Area: {{area}} sqft
- Key Features: {{keyFeatures}}

Generate the HTML description and a list of amenities based on these details.
The description should be engaging and persuasive. Use <h3> for the main heading and <p> for the body.
The amenities list should contain between 4 and 8 relevant items.`,
});

const generateListingFlow = ai.defineFlow(
  {
    name: 'generateListingFlow',
    inputSchema: GeneratePropertyListingInputSchema,
    outputSchema: GeneratePropertyListingOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
