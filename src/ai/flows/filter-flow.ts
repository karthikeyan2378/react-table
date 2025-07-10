
'use server';
/**
 * @fileOverview An AI flow for converting natural language into table filters.
 *
 * - generateFilter - A function that takes a user's query and returns a structured filter object.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { alarmConfig } from '@/config/alarm-config';

// Dynamically generate the list of valid column IDs from the config
const validColumnIds = Object.keys(alarmConfig.fields);

const FilterSchema = z.object({
  id: z.enum(validColumnIds as [string, ...string[]]).describe('The column ID to filter on.'),
  value: z.union([z.string(), z.array(z.string())]).describe('The value(s) to filter by.'),
});

const FilterOutputSchema = z.array(FilterSchema);

export type FilterOutput = z.infer<typeof FilterOutputSchema>;

export async function generateFilter(query: string): Promise<FilterOutput> {
  return filterFlow(query);
}

const filterFlow = ai.defineFlow(
  {
    name: 'filterFlow',
    inputSchema: z.string(),
    outputSchema: FilterOutputSchema,
  },
  async (query) => {
    const prompt = ai.definePrompt({
      name: 'filterPrompt',
      input: { schema: z.string() },
      output: { schema: FilterOutputSchema },
      model: 'googleai/gemini-1.5-flash-latest',
      prompt: `You are an expert at converting natural language queries into structured JSON filters for a data table.
The user will provide a query about filtering alarms.
You must convert their query into a JSON array of filter objects.
Each object must have an 'id' and a 'value'.

The 'id' must be one of the following valid column names:
${validColumnIds.join(', ')}

The 'value' should be a string or an array of strings.
For categorical columns like 'Severity' or 'AlarmName', if the user asks for multiple values (e.g., "critical or major"), the 'value' must be an array of those strings.
For text columns, the 'value' should be a single string to search for.

Analyze the user's query: "${query}"

Return only the JSON array of filter objects.`,
    });

    const { output } = await prompt(query);
    return output ?? [];
  }
);

    