'use server';
/**
 * @fileOverview This file defines a Genkit flow for suggesting suitable crops based on various agricultural conditions.
 *
 * - suggestCrops - A function that takes agricultural conditions as input and returns crop recommendations.
 * - SuggestCropsInput - The input type for the suggestCrops function.
 * - SuggestCropsOutput - The return type for the suggestCrops function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestCropsInputSchema = z.object({
  soilType: z.string().describe('The type of soil.'),
  soilPh: z.number().describe('The pH of the soil.'),
  temperature: z.number().describe('Average temperature in °C.'),
  rainfall: z.number().describe('Average rainfall in mm.'),
  season: z.string().describe('The current growing season.'),
  region: z.string().describe('The region where the crops will be grown.'),
  language: z.string().describe('The language for the response (e.g., "en", "hi", "mr").'),
  crop: z.string().optional().describe('An optional specific crop to get advice for.'),
  photoDataUri: z
    .string()
    .optional()
    .describe(
      "An optional photo of the farmland, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type SuggestCropsInput = z.infer<typeof SuggestCropsInputSchema>;

const SuggestCropsOutputSchema = z.object({
  recommendedCrops: z
    .string()
    .describe('A list of recommended crops for the given conditions.'),
  fertilizers: z.string().describe('Fertilizer suggestions for the crops.'),
  irrigation: z.string().describe('Irrigation advice for the crops.'),
  pestManagement: z.string().describe('Pest management tips for the crops.'),
});
export type SuggestCropsOutput = z.infer<typeof SuggestCropsOutputSchema>;

export async function suggestCrops(
  input: SuggestCropsInput
): Promise<SuggestCropsOutput> {
  return suggestCropsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestCropsPrompt',
  input: {schema: SuggestCropsInputSchema},
  output: {schema: SuggestCropsOutputSchema},
  prompt: `You are an AI-powered agriculture advisor helping farmers in India choose the best crops.

The user will provide seasons as 'Summer', 'Winter', or 'Rainy'. You must map these to the appropriate Indian agricultural seasons:
- 'Rainy' corresponds to the Kharif season (monsoon crops).
- 'Winter' corresponds to the Rabi season (winter crops).
- 'Summer' corresponds to the Zaid season (summer crops).

Based on the following conditions, recommend the most suitable crops to grow.
- Soil Type: {{{soilType}}}
- Soil pH: {{{soilPh}}}
- Average Temperature: {{{temperature}}}°C
- Rainfall: {{{rainfall}}} mm
- Season: {{{season}}}
- Region: {{{region}}}
{{#if crop}}
- Specific Crop: {{{crop}}}
Focus your recommendations on this specific crop if it is suitable for the other conditions.
{{/if}}
{{#if photoDataUri}}
- Farmland Image: {{media url=photoDataUri}}
Use the image to visually assess the land and refine your recommendations.
{{/if}}

Provide four distinct outputs:
1.  **recommendedCrops**: Suggest a list of the most suitable crops. If a specific crop was provided, confirm its suitability.
2.  **fertilizers**: Suggest suitable fertilizers for the recommended crops.
3.  **irrigation**: Provide irrigation practices for the recommended crops.
4.  **pestManagement**: Offer pest management tips for the recommended crops.

If some information is missing, make reasonable assumptions and clearly state them.
Always keep the answer short, simple, and practical so that farmers can easily understand and apply it.

CRITICAL: Generate the entire response in the requested language: {{{language}}}.
`,
});

const suggestCropsFlow = ai.defineFlow(
  {
    name: 'suggestCropsFlow',
    inputSchema: SuggestCropsInputSchema,
    outputSchema: SuggestCropsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
