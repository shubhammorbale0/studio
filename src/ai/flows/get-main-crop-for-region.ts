'use server';
/**
 * @fileOverview Gets the main crop for a given region in India.
 *
 * - getMainCropForRegion - A function that returns the main crop for a region.
 * - GetMainCropForRegionInput - The input type for the function.
 * - GetMainCropForRegionOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetMainCropForRegionInputSchema = z.object({
  region: z.string().describe('The region in India.'),
});
export type GetMainCropForRegionInput = z.infer<typeof GetMainCropForRegionInputSchema>;

const GetMainCropForRegionOutputSchema = z.object({
  cropName: z.string().describe('The main crop grown in the region.'),
});
export type GetMainCropForRegionOutput = z.infer<typeof GetMainCropForRegionOutputSchema>;

export async function getMainCropForRegion(
  input: GetMainCropForRegionInput
): Promise<GetMainCropForRegionOutput> {
  return getMainCropForRegionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getMainCropForRegionPrompt',
  input: {schema: GetMainCropForRegionInputSchema},
  output: {schema: GetMainCropForRegionOutputSchema},
  prompt: `You are an agricultural expert for India. Given a region, name the single most prominent crop grown there.

Region: {{{region}}}

Respond with only the name of the crop. For example, if the region is Punjab, respond with "Wheat".
`,
});

const getMainCropForRegionFlow = ai.defineFlow(
  {
    name: 'getMainCropForRegionFlow',
    inputSchema: GetMainCropForRegionInputSchema,
    outputSchema: GetMainCropForRegionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
