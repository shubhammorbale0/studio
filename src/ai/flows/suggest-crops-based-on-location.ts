'use server';
/**
 * @fileOverview This file defines a Genkit flow for suggesting suitable crops based on location.
 *
 * - suggestCropsBasedOnLocation - A function that takes a location as input and returns crop recommendations.
 * - SuggestCropsBasedOnLocationInput - The input type for the suggestCropsBasedOnLocation function.
 * - SuggestCropsBasedOnLocationOutput - The return type for the suggestCropsBasedOnLocation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestCropsBasedOnLocationInputSchema = z.object({
  location: z.string().describe('The location for which to suggest crops.'),
});
export type SuggestCropsBasedOnLocationInput = z.infer<
  typeof SuggestCropsBasedOnLocationInputSchema
>;

const SuggestCropsBasedOnLocationOutputSchema = z.object({
  recommendedCrops: z
    .string()
    .describe('A list of recommended crops for the given location.'),
  fertilizers: z.string().describe('Fertilizer suggestions for the crops.'),
  irrigation: z.string().describe('Irrigation advice for the crops.'),
  pestManagement: z.string().describe('Pest management tips for the crops.'),
});
export type SuggestCropsBasedOnLocationOutput = z.infer<
  typeof SuggestCropsBasedOnLocationOutputSchema
>;

export async function suggestCropsBasedOnLocation(
  input: SuggestCropsBasedOnLocationInput
): Promise<SuggestCropsBasedOnLocationOutput> {
  return suggestCropsBasedOnLocationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestCropsBasedOnLocationPrompt',
  input: {schema: SuggestCropsBasedOnLocationInputSchema},
  output: {schema: SuggestCropsBasedOnLocationOutputSchema},
  prompt: `You are an AI-powered agriculture advisor helping farmers choose the best crops.

Recommend the most suitable crops based on the location: {{{location}}}. Also, suggest correct fertilizers, irrigation practices, and basic pest management for the chosen crops.
If some information is missing, make reasonable assumptions and clearly state them.
Always keep the answer short, simple, and practical so that farmers can easily understand and apply it.

Present the output in a structured format like:

✅ Recommended Crops:
🌱 Fertilizers:
💧 Irrigation:
🛡️ Pest Management:`,
});

const suggestCropsBasedOnLocationFlow = ai.defineFlow(
  {
    name: 'suggestCropsBasedOnLocationFlow',
    inputSchema: SuggestCropsBasedOnLocationInputSchema,
    outputSchema: SuggestCropsBasedOnLocationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
