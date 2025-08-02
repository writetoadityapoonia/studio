
'use server';

/**
 * @fileOverview An AI flow to generate a structured property description
 * from unstructured plain text.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import {
  BuilderComponent,
  TextComponent,
  ButtonComponent,
  TableComponent,
  ImageComponent,
  SpacerComponent,
  DividerComponent,
} from '@/components/builder-elements';
import { v4 as uuidv4 } from 'uuid';

// Define the Zod schemas for each component type.
// These schemas match the types in builder-elements.tsx.
const TextComponentSchema = z.object({
  type: z.literal('Text'),
  text: z.string(),
  size: z.enum(['sm', 'md', 'lg', 'xl']).default('md'),
  align: z.enum(['left', 'center', 'right']).default('left'),
  color: z.enum(['default', 'primary', 'muted']).default('default'),
  style: z.array(z.enum(['bold', 'italic'])).default([]),
});

const ButtonComponentSchema = z.object({
  type: z.literal('Button'),
  text: z.string(),
  href: z.string().default(''),
  variant: z.enum(['default', 'destructive', 'outline', 'secondary', 'ghost', 'link']).default('default'),
  size: z.enum(['default', 'sm', 'lg', 'icon']).default('default'),
});

const TableComponentSchema = z.object({
  type: z.literal('Table'),
  headers: z.array(z.string()),
  rows: z.array(z.array(z.string())),
});

const ImageComponentSchema = z.object({
  type: z.literal('Image'),
  src: z.string(),
  alt: z.string(),
});

const SpacerComponentSchema = z.object({
    type: z.literal('Spacer'),
    size: z.enum(['sm', 'md', 'lg']).default('md'),
});

const DividerComponentSchema = z.object({
    type: z.literal('Divider'),
});


// A discriminated union allows the AI to choose which component type to use.
const BuilderComponentSchema = z.discriminatedUnion('type', [
  TextComponentSchema,
  ButtonComponentSchema,
  TableComponentSchema,
  ImageComponentSchema,
  SpacerComponentSchema,
  DividerComponentSchema
]);

// Define the input and output schemas for the flow.
export const GenerateDescriptionInputSchema = z.string();
export const GenerateDescriptionOutputSchema = z.object({
  components: z.array(BuilderComponentSchema),
});

export type GenerateDescriptionInput = z.infer<typeof GenerateDescriptionInputSchema>;
export type GenerateDescriptionOutput = z.infer<typeof GenerateDescriptionOutputSchema>;


// The main prompt for the AI model.
const prompt = ai.definePrompt({
  name: 'generateDescriptionPrompt',
  input: { schema: GenerateDescriptionInputSchema },
  output: { schema: GenerateDescriptionOutputSchema },
  prompt: `
    You are an expert real estate content structurer. Your task is to take a raw text block
    about a property and convert it into a structured array of components based on the
    provided schemas.

    Analyze the text and break it down into logical blocks: paragraphs, headings, tables, etc.
    For each block, create the most appropriate component object.

    - Use 'Text' components for paragraphs and headings. Use different sizes for headings vs. body text.
    - Use 'Table' components for tabular data. Identify the headers and rows correctly.
    - If you see lists of features or amenities, format them as a 'Text' component with clear formatting.
    - Do not invent any information. All content must come from the source text.

    Here is the raw text to process:
    {{{prompt}}}
  `,
});

// Define the Genkit flow.
const generateDescriptionFlow = ai.defineFlow(
  {
    name: 'generateDescriptionFlow',
    inputSchema: GenerateDescriptionInputSchema,
    outputSchema: GenerateDescriptionOutputSchema,
  },
  async (text) => {
    const { output } = await prompt(text);
    if (!output) {
      throw new Error('AI failed to generate a structured description.');
    }
    // Add unique IDs to each component, as this is required by the builder UI.
    const componentsWithIds = output.components.map((c) => ({ ...c, id: uuidv4() }));
    return { components: componentsWithIds as BuilderComponent[] };
  }
);


// Export a wrapper function to be called from the client-side code.
export async function generateDescription(
  input: GenerateDescriptionInput
): Promise<GenerateDescriptionOutput> {
  return await generateDescriptionFlow(input);
}
