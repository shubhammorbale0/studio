'use server';
/**
 * @fileOverview Provides advice on irrigation practices for a given crop and location.
 *
 * - adviseOnIrrigationPractices - A function that provides irrigation advice.
 * - AdviseOnIrrigationPracticesInput - The input type for the adviseOnIrrigationPractices function.
 * - AdviseOnIrrigationPracticesOutput - The return type for the adviseOnIrrigationPractices function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AdviseOnIrrigationPracticesInputSchema = z.object({
  crop: z.string().describe('The crop for which to provide irrigation advice.'),
  location: z.string().describe('The location where the crop is being grown.'),
});
export type AdviseOnIrrigationPracticesInput = z.infer<
  typeof AdviseOnIrrigationPracticesInputSchema
>;

const AdviseOnIrrigationPracticesOutputSchema = z.object({
  irrigationAdvice: z.string().describe('Advice on irrigation practices.'),
});
export type AdviseOnIrrigationPracticesOutput = z.infer<
  typeof AdviseOnIrrigationPracticesOutputSchema
>;

export async function adviseOnIrrigationPractices(
  input: AdviseOnIrrigationPracticesInput
): Promise<AdviseOnIrrigationPracticesOutput> {
  return adviseOnIrrigationPracticesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'adviseOnIrrigationPracticesPrompt',
  input: {schema: AdviseOnIrrigationPracticesInputSchema},
  output: {schema: AdviseOnIrrigationPracticesOutputSchema},
  prompt: `You are an expert agriculture advisor. Provide irrigation advice for the specified crop and location.

Crop: {{{crop}}}
Location: {{{location}}}

Format your response in a short, simple, and practical way that is easy for farmers to understand and apply.
Focus on the key irrigation practices that will optimize water usage and promote healthy crop growth.

Example Output:
Irrigation: Water deeply but infrequently, allowing the soil to dry slightly between waterings. Use drip irrigation to deliver water directly to the roots and minimize water loss through evaporation.`,
});

const adviseOnIrrigationPracticesFlow = ai.defineFlow(
  {
    name: 'adviseOnIrrigationPracticesFlow',
    inputSchema: AdviseOnIrrigationPracticesInputSchema,
    outputSchema: AdviseOnIrrigationPracticesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
