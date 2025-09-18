'use server';
/**
 * @fileOverview A plant problem diagnosis AI agent.
 *
 * - diagnosePlantHealth - A function that handles the plant diagnosis process.
 * - DiagnosePlantHealthInput - The input type for the diagnosePlantHealth function.
 * - DiagnosePlantHealthOutput - The return type for the diagnosePlantHealth function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DiagnosePlantHealthInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a plant, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type DiagnosePlantHealthInput = z.infer<typeof DiagnosePlantHealthInputSchema>;

const DiagnosePlantHealthOutputSchema = z.object({
  isPlant: z.boolean().describe('Whether the image contains a plant.'),
  plantName: z.string().describe('The common name of the identified plant.'),
  isHealthy: z.boolean().describe('Whether the plant appears to be healthy.'),
  disease: z
    .string()
    .describe(
      'The identified disease or pest, or a statement that the plant is healthy.'
    ),
  remedy: z.object({
    title: z.string().describe('A short, actionable title for the remedy.'),
    steps: z
      .array(z.string())
      .describe('A list of steps to take to address the issue.'),
  }),
  careTips: z.object({
    title: z
      .string()
      .describe('A short, actionable title for general care tips.'),
    steps: z
      .array(z.string())
      .describe(
        'A list of general care tips for this type of plant to prevent future issues.'
      ),
  }),
});
export type DiagnosePlantHealthOutput = z.infer<typeof DiagnosePlantHealthOutputSchema>;

export async function diagnosePlantHealth(input: DiagnosePlantHealthInput): Promise<DiagnosePlantHealthOutput> {
  return diagnosePlantHealthFlow(input);
}

const prompt = ai.definePrompt({
  name: 'diagnosePlantHealthPrompt',
  input: {schema: DiagnosePlantHealthInputSchema},
  output: {schema: DiagnosePlantHealthOutputSchema},
  prompt: `You are an expert plant pathologist and botanist. Your task is to analyze an image of a plant, identify it, assess its health, and provide a detailed diagnosis and treatment plan.

Analyze the provided image: {{media url=photoDataUri}}

1.  **Identification:** Determine if the image contains a plant. If it does, identify the common name of the plant. If it is not a plant, set 'isPlant' to false and stop.
2.  **Health Assessment:** Examine the plant for any signs of disease, pests, or nutrient deficiencies. Determine if the plant is healthy or not.
3.  **Diagnosis:** If the plant is not healthy, identify the specific disease, pest, or issue. If the plant is healthy, state that clearly.
4.  **Remedy:** Provide a clear, step-by-step treatment plan to resolve the identified issue. If the plant is healthy, provide a simple statement that no remedy is needed.
5.  **Care Tips:** Provide a list of general care tips for this specific type of plant to help the user maintain its health and prevent future problems.

Your response must be structured according to the output schema.
`,
});

const diagnosePlantHealthFlow = ai.defineFlow(
  {
    name: 'diagnosePlantHealthFlow',
    inputSchema: DiagnosePlantHealthInputSchema,
    outputSchema: DiagnosePlantHealthOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
