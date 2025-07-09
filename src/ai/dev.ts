
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

import './flows/summarize-alarms-flow';

export default genkit({
  plugins: [
    googleAI(),
  ],
  logLevel: 'debug',
  enableTracing: true,
});
