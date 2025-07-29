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
  landArea: z.string().optional(),
  possessionTime: z.string().optional(),
});

export type GeneratePropertyListingInput = z.infer<typeof GeneratePropertyListingInputSchema>;

const GeneratePropertyListingOutputSchema = z.object({
    descriptionHtml: z.string().describe("A compelling, well-formatted HTML description for the property listing. It should be engaging and highlight the key features. Use <h3> tags for headings and <p> tags for paragraphs. Mention the project is located in the given location."),
    amenities: z.array(z.string()).describe("An array of 8-12 key amenities based on the property details and features provided."),
    specifications: z.string().describe("A detailed specification section in HTML format. Create a list of specifications covering Structure, Flooring, Doors, Plumbing & Sanitary, Security, and Electrical. Use <h4> for subheadings and <ul>/<li> for lists.")
});

export type GeneratePropertyListingOutput = z.infer<typeof GeneratePropertyListingOutputSchema>;

export async function generatePropertyListing(input: GeneratePropertyListingInput): Promise<GeneratePropertyListingOutput> {
  return generateListingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateListingPrompt',
  input: { schema: GeneratePropertyListingInputSchema },
  output: { schema: GeneratePropertyListingOutputSchema },
  prompt: `You are a real estate marketing expert. Your task is to generate a compelling property listing for a project named "{{title}}".

Given the following property details, create:
1.  A captivating HTML description.
2.  A list of 8-12 key amenities.
3.  A detailed HTML specification section.

Property Details:
- Title: {{title}}
- Type: {{type}}
- Location: {{location}}
- Starting Price: \${{price}}
- Bedrooms: {{bedrooms}}
- Bathrooms: {{bathrooms}}
- Area: {{area}} sqft
- Land Area: {{landArea}}
- Possession: {{possessionTime}}
- Key Features: {{keyFeatures}}

Generate the HTML description, a list of amenities, and the specifications based on these details.
The description should be engaging and persuasive. Use <h3> for the main heading and <p> for the body.
The amenities list should contain between 8 and 12 relevant items.
The specifications section must be in HTML, using <h4> for headings (like "Structure") and <ul>/<li> for the details under each heading.`,
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
