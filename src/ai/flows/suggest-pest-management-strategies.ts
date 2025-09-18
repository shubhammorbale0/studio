'use server';
/**
 * @fileOverview Provides basic pest management strategies for a given crop.
 *
 * - suggestPestManagementStrategies - A function that suggests pest management strategies.
 * - SuggestPestManagementStrategiesInput - The input type for the suggestPestManagementStrategies function.
 * - SuggestPestManagementStrategiesOutput - The return type for the suggestPestManagementStrategies function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestPestManagementStrategiesInputSchema = z.object({
  crop: z.string().describe('The name of the crop.'),
  region: z.string().describe('The region where the crop is grown.'),
});
export type SuggestPestManagementStrategiesInput = z.infer<
  typeof SuggestPestManagementStrategiesInputSchema
>;

const SuggestPestManagementStrategiesOutputSchema = z.object({
  pestManagementStrategies: z
    .string()
    .describe('Basic pest management strategies for the crop.'),
});
export type SuggestPestManagementStrategiesOutput = z.infer<
  typeof SuggestPestManagementStrategiesOutputSchema
>;

export async function suggestPestManagementStrategies(
  input: SuggestPestManagementStrategiesInput
): Promise<SuggestPestManagementStrategiesOutput> {
  return suggestPestManagementStrategiesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestPestManagementStrategiesPrompt',
  input: {schema: SuggestPestManagementStrategiesInputSchema},
  output: {schema: SuggestPestManagementStrategiesOutputSchema},
  prompt: `You are an expert agriculture advisor. Provide basic pest management strategies for the following crop in the specified region.

Crop: {{{crop}}}
Region: {{{region}}}

Pest Management Strategies:`,
});

const suggestPestManagementStrategiesFlow = ai.defineFlow(
  {
    name: 'suggestPestManagementStrategiesFlow',
    inputSchema: SuggestPestManagementStrategiesInputSchema,
    outputSchema: SuggestPestManagementStrategiesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
