'use server';

/**
 * @fileOverview An AI-powered CV enhancement tool that provides feedback and suggestions on CV content.
 *
 * - cvEnhancementTool - A function that handles the CV enhancement process.
 * - CvEnhancementToolInput - The input type for the cvEnhancementTool function.
 * - CvEnhancementToolOutput - The return type for the cvEnhancementTool function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CvEnhancementToolInputSchema = z.object({
  cvContent: z
    .string()
    .describe('The content of the CV to be reviewed.'),
  jobDescription: z
    .string()
    .optional()
    .describe('Optional: The job description the CV is being tailored for.'),
});
export type CvEnhancementToolInput = z.infer<typeof CvEnhancementToolInputSchema>;

const CvEnhancementToolOutputSchema = z.object({
  feedback: z.string().describe('AI-powered feedback and suggestions on the CV content.'),
});
export type CvEnhancementToolOutput = z.infer<typeof CvEnhancementToolOutputSchema>;

export async function cvEnhancementTool(input: CvEnhancementToolInput): Promise<CvEnhancementToolOutput> {
  return cvEnhancementToolFlow(input);
}

const prompt = ai.definePrompt({
  name: 'cvEnhancementToolPrompt',
  input: {schema: CvEnhancementToolInputSchema},
  output: {schema: CvEnhancementToolOutputSchema},
  prompt: `You are an expert career coach specializing in providing feedback on CVs.

You will use the provided CV content to provide constructive criticism and actionable suggestions.

If a job description is provided, tailor the feedback to be specific to that job description, and highlight areas where the CV could be better aligned.

CV Content: {{{cvContent}}}

Job Description (if provided): {{{jobDescription}}}

Provide your feedback in a clear and concise manner.
`,
});

const cvEnhancementToolFlow = ai.defineFlow(
  {
    name: 'cvEnhancementToolFlow',
    inputSchema: CvEnhancementToolInputSchema,
    outputSchema: CvEnhancementToolOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
