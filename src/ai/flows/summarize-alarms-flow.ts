
'use server';
/**
 * @fileOverview An AI flow for summarizing alarm data.
 *
 * - summarizeAlarms - A function that handles the alarm summarization process.
 * - SummarizeAlarmsInput - The input type for the summarizeAlarms function.
 * - SummarizeAlarmsOutput - The return type for the summarizeAlarms function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit/zod';
import { type Alarm } from '@/config/alarm-config';

// We define a simpler schema for the flow input to avoid sending massive objects
// and to be explicit about what the AI should consider.
const AlarmSummaryItemSchema = z.object({
  Severity: z.string(),
  ObjectLabel: z.string(),
  NELabel: z.string(),
  AlarmName: z.string(),
  NetworkRaisedTimeLong: z.string().describe("The ISO 8601 timestamp of when the alarm was raised."),
  State: z.string(),
  FlapCount: z.number(),
});

export const SummarizeAlarmsInputSchema = z.object({
  alarms: z.array(AlarmSummaryItemSchema),
});
export type SummarizeAlarmsInput = z.infer<typeof SummarizeAlarmsInputSchema>;

export const SummarizeAlarmsOutputSchema = z.object({
  analysis: z
    .string()
    .describe('A concise, expert-level analysis of the provided alarms.'),
});
export type SummarizeAlarmsOutput = z.infer<typeof SummarizeAlarmsOutputSchema>;

export async function summarizeAlarms(
  input: { alarms: Alarm[] }
): Promise<SummarizeAlarmsOutput> {
  // Convert full Alarm objects to the leaner format expected by the flow.
  const flowInput: SummarizeAlarmsInput = {
    alarms: input.alarms.map((alarm) => ({
      Severity: alarm.Severity,
      ObjectLabel: alarm.ObjectLabel,
      NELabel: alarm.NELabel,
      AlarmName: alarm.AlarmName,
      NetworkRaisedTimeLong: alarm.NetworkRaisedTimeLong.toISOString(),
      State: alarm.State,
      FlapCount: alarm.FlapCount,
    })),
  };
  return summarizeAlarmsFlow(flowInput);
}

const summarizeAlarmsPrompt = ai.definePrompt({
  name: 'summarizeAlarmsPrompt',
  input: { schema: SummarizeAlarmsInputSchema },
  output: { schema: SummarizeAlarmsOutputSchema },
  prompt: `You are an expert network operations analyst. Your task is to analyze a list of network alarms and provide a concise, insightful summary.

Focus on identifying patterns, correlations, and potential root causes. Do not just list the alarms. Synthesize the information into a high-level analysis.

Consider the following:
- Are there clusters of alarms on the same device (ObjectLabel or NELabel)?
- Are there many alarms of the same type (AlarmName) or severity?
- Are there any flapping alarms (high FlapCount)? This might indicate an unstable link or device.
- Is there a correlation in the timing of the alarms?

Based on the data below, provide your expert analysis.

Alarms:
{{#each alarms}}
- Severity: {{Severity}}, Name: {{AlarmName}}, Object: {{ObjectLabel}}, NE: {{NELabel}}, State: {{State}}, Flap Count: {{FlapCount}}, Time: {{NetworkRaisedTimeLong}}
{{/each}}
`,
});

const summarizeAlarmsFlow = ai.defineFlow(
  {
    name: 'summarizeAlarmsFlow',
    inputSchema: SummarizeAlarmsInputSchema,
    outputSchema: SummarizeAlarmsOutputSchema,
  },
  async (input) => {
    const { output } = await summarizeAlarmsPrompt(input);
    return output!;
  }
);
