'use server';
/**
 * @fileOverview A flow for generating structured property details from raw text using the Groq API.
 */

import { z } from 'zod';
import { GeneratePropertyDetailsInputSchema, GeneratePropertyDetailsOutputSchema } from './schemas';
import type { GeneratePropertyDetailsInput, GeneratePropertyDetailsOutput } from './schemas';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const systemPrompt = `You are an expert real estate agent tasked with creating a compelling property listing.
Analyze the following raw text and extract the property details into a structured JSON format.

Your tasks:
1.  Extract the key details: title, location, price, type, bedrooms, bathrooms, and area (sqft).
2.  Summarize the description into a few paragraphs of text.
3.  Identify key features or amenities and present them in a table format. The table should have headers (e.g., "Feature", "Detail") and rows.
4.  Ensure all numeric fields (price, bedrooms, bathrooms, area) are numbers, not strings.

You MUST respond with a valid JSON object that conforms to the following Zod schema. Do not include any other text or markdown formatting.
\`\`\`json
${JSON.stringify(GeneratePropertyDetailsOutputSchema.shape, null, 2)}
\`\`\`
`;

// The exported wrapper function that calls the Groq API
export async function generatePropertyDetails(input: GeneratePropertyDetailsInput): Promise<GeneratePropertyDetailsOutput> {
  try {
    const validatedInput = GeneratePropertyDetailsInputSchema.parse(input);

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: `Raw Text:\n${validatedInput.rawText}`,
        },
      ],
      model: 'llama3-8b-8192',
      temperature: 0.2,
      response_format: { type: 'json_object' },
    });

    const content = chatCompletion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Groq API returned no content.');
    }

    const parsedJson = JSON.parse(content);
    const validatedOutput = GeneratePropertyDetailsOutputSchema.parse(parsedJson);

    return validatedOutput;
  } catch (error) {
    console.error('Error generating property details with Groq:', error);
    if (error instanceof z.ZodError) {
        console.error("Zod validation failed:", error.issues);
    }
    // Re-throw a generic error to be caught by the client
    throw new Error('Failed to generate property details.');
  }
}
