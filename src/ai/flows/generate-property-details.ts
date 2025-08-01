'use server';
/**
 * @fileOverview A Genkit flow for generating structured property details from raw text.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { GeneratePropertyDetailsInputSchema, GeneratePropertyDetailsOutputSchema } from './schemas';
import type { GeneratePropertyDetailsInput, GeneratePropertyDetailsOutput } from './schemas';

const generatePropertyDetailsPrompt = ai.definePrompt({
    name: 'generatePropertyDetailsPrompt',
    input: { schema: GeneratePropertyDetailsInputSchema },
    output: { schema: GeneratePropertyDetailsOutputSchema },
    model: 'gemini-1.5-flash',
    prompt: `You are an expert real estate agent tasked with creating a compelling property listing.
Analyze the following raw text and extract the property details into a structured JSON format.

Your tasks:
1.  Extract the key details: title, location, price, type, bedrooms, bathrooms, and area (sqft).
2.  Summarize the description into a few paragraphs of text.
3.  Identify key features or amenities and present them in a table format. The table should have headers (e.g., "Feature", "Detail") and rows.
4.  Ensure all numeric fields (price, bedrooms, bathrooms, area) are numbers, not strings.

You MUST respond with a valid JSON object. Do not include any other text or markdown formatting.

Raw Text:
{{{rawText}}}
`,
    config: {
        temperature: 0.2,
    },
});


const generatePropertyDetailsFlow = ai.defineFlow(
  {
    name: 'generatePropertyDetailsFlow',
    inputSchema: GeneratePropertyDetailsInputSchema,
    outputSchema: GeneratePropertyDetailsOutputSchema,
  },
  async (input) => {
    const { output } = await generatePropertyDetailsPrompt(input);
    if (!output) {
      throw new Error('AI failed to generate a response.');
    }
    return output;
  }
);

export async function generatePropertyDetails(input: GeneratePropertyDetailsInput): Promise<GeneratePropertyDetailsOutput> {
  try {
    return await generatePropertyDetailsFlow(input);
  } catch (error) {
    console.error("Error in generatePropertyDetails flow:", error);
    throw new Error('Failed to generate property details. Please check the server logs.');
  }
}
