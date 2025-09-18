'use server';

/**
 * @fileOverview Recommends fertilizers for the suggested crops based on soil conditions.
 *
 * - suggestFertilizers - A function that provides fertilizer suggestions based on crop and soil details.
 * - SuggestFertilizersInput - The input type for the suggestFertilizers function.
 * - SuggestFertilizersOutput - The return type for the suggestFertilizers function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestFertilizersInputSchema = z.object({
  crop: z.string().describe('The recommended crop.'),
  soilType: z.string().describe('The type of soil.'),
  soilPh: z.string().describe('The pH of the soil.'),
});
export type SuggestFertilizersInput = z.infer<typeof SuggestFertilizersInputSchema>;

const SuggestFertilizersOutputSchema = z.object({
  fertilizerSuggestions: z.string().describe('Suggestions for fertilizers to use for the crop and soil conditions.'),
});
export type SuggestFertilizersOutput = z.infer<typeof SuggestFertilizersOutputSchema>;

export async function suggestFertilizers(input: SuggestFertilizersInput): Promise<SuggestFertilizersOutput> {
  return suggestFertilizersFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestFertilizersPrompt',
  input: {schema: SuggestFertilizersInputSchema},
  output: {schema: SuggestFertilizersOutputSchema},
  prompt: `You are an expert agricultural advisor. Based on the recommended crop, soil type and pH, suggest the best fertilizers to use.

Crop: {{{crop}}}
Soil Type: {{{soilType}}}
Soil pH: {{{soilPh}}}

Provide a concise list of fertilizer suggestions optimized for the specified conditions.
`,
});

const suggestFertilizersFlow = ai.defineFlow(
  {
    name: 'suggestFertilizersFlow',
    inputSchema: SuggestFertilizersInputSchema,
    outputSchema: SuggestFertilizersOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
