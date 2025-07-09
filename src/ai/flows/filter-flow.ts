'use server';
/**
 * @fileOverview A flow for translating natural language queries into structured table filters.
 *
 * - generateFilter: A function that takes a user query and returns a filter object.
 */

import { ai } from '@/ai/genkit';
import { alarmConfig } from '@/config/alarm-config';
import { z } from 'genkit';

const FilterInputSchema = z.string();
type FilterInput = z.infer<typeof FilterInputSchema>;

const FilterOutputSchema = z.array(
    z.object({
        id: z.string().describe('The column ID to filter.'),
        value: z.union([z.string(), z.array(z.string())]).describe('The value(s) to filter by.')
    })
).describe('An array of filter objects for react-table.');
type FilterOutput = z.infer<typeof FilterOutputSchema>;

// Extract filterable columns and their options from the alarm config
const filterableColumnsForPrompt = Object.entries(alarmConfig.fields)
    .filter(([, config]) => config.isFilterable)
    .map(([id, { label, columnType, options }]) => ({
        id,
        label,
        type: columnType,
        options: options?.map(opt => opt.value),
    }));

const generateFilterFlow = ai.defineFlow(
  {
    name: 'generateFilterFlow',
    inputSchema: FilterInputSchema,
    outputSchema: FilterOutputSchema,
  },
  async (query) => {
    const prompt = ai.definePrompt({
        name: 'filterGenerationPrompt',
        input: { schema: z.object({ query: z.string() }) },
        output: { schema: FilterOutputSchema },
        prompt: `You are an expert at converting natural language queries into structured JSON filters for a data table.
        The user will provide a query about alarms. Your task is to translate it into a filter array that conforms to the react-table format.
        
        Here is the schema of the available filterable columns:
        ${JSON.stringify(filterableColumnsForPrompt, null, 2)}

        - For columns of type 'categorical', the 'value' in the filter object must be an array of strings. The strings must exactly match one of the provided options for that column.
        - For columns of type 'text' (or any other type), the 'value' in the filter object should be a single string.
        - If the user's query doesn't seem to map to any filterable columns, return an empty array.
        - Only return filters for the columns provided in the schema.
        - Analyze the user's query and construct a filter object. For example, if the user asks for "critical and major alarms", you should create a filter for the 'Severity' column with a value of ['Critical', 'Major']. If they ask for "PTP object types", you create a filter for 'ObjectType' with value ['PTP'].

        User query: "{{query}}"
        `,
    });

    const { output } = await prompt({ query });
    return output ?? [];
  }
);

export async function generateFilter(query: FilterInput): Promise<FilterOutput> {
  return generateFilterFlow(query);
}
