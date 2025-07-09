
'use server';
/**
 * @fileOverview A flow for generating code based on provided data and a prompt.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const CodeGeneratorInputSchema = z.object({
  prompt: z.string().describe('The user\'s instruction for what code to generate.'),
  data: z.any().describe('The data to be used as context for code generation, usually an array of objects.'),
});

export type CodeGeneratorInput = z.infer<typeof CodeGeneratorInputSchema>;

const CodeGeneratorOutputSchema = z.string().describe('The generated code as a string.');
export type CodeGeneratorOutput = z.infer<typeof CodeGeneratorOutputSchema>;

export async function generateCode(input: CodeGeneratorInput): Promise<CodeGeneratorOutput> {
  return generateCodeFlow(input);
}

const generateCodeFlow = ai.defineFlow(
  {
    name: 'generateCodeFlow',
    inputSchema: CodeGeneratorInputSchema,
    outputSchema: CodeGeneratorOutputSchema,
  },
  async (input) => {
    const prompt = ai.definePrompt({
        name: 'codeGeneratorPrompt',
        model: 'googleai/gemini-1.5-flash-latest',
        input: { schema: CodeGeneratorInputSchema },
        output: { format: "code" },
        prompt: `You are an expert programmer. A user has provided a data structure and a prompt.
        Your task is to generate a single block of code that satisfies the user's request based on the provided data.
        Do not add any explanatory text, comments, or markdown formatting around the code.
        Only return the raw code itself.

        User Prompt: "{{prompt}}"
        
        Data Structure (sample):
        \`\`\`json
        {{jsonStringify data.[0]}}
        \`\`\`

        Full Data (for context):
        \`\`\`json
        {{jsonStringify data}}
        \`\`\`
        `,
    });

    const { output } = await prompt(input);
    return output ?? '';
  }
);
