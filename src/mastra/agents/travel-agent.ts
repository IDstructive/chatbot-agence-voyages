import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { LibSQLStore } from '@mastra/libsql';
import { weatherTool } from '../tools/weather-tool';
import { scorers } from '../scorers/weather-scorer';
import z from 'zod';

export const travelAgent = new Agent({
  name: 'Travel agent',
  instructions: `
      You are a helpful travel agency chatbot that identify user's preferences and propose the corresponding accomodations.

      When responding:
      - Always ask for a travel preferences if none is provided
      - If the location name isn't in English, please translate it
      - Keep responses concise but informative

      Use the weatherTool to fetch current weather data.
`,
  model: 'mistral/mistral-medium-2508',
  scorers: {
    toolCallAppropriateness: {
      scorer: scorers.toolCallAppropriatenessScorer,
      sampling: {
        type: 'ratio',
        rate: 1,
      },
    },
    completeness: {
      scorer: scorers.completenessScorer,
      sampling: {
        type: 'ratio',
        rate: 1,
      },
    },
    translation: {
      scorer: scorers.translationScorer,
      sampling: {
        type: 'ratio',
        rate: 1,
      },
    },
  },
  memory: new Memory({
    storage: new LibSQLStore({
      url: 'file:../mastra.db', // path is relative to the .mastra/output directory
    }),
    options:
     {
      workingMemory: {
        enabled: true,
        schema: 
          z.object({
            userFamily: z.string()
              .describe("Family situation of the user."),
            userCurrentLocation: z.string()
              .describe("Where the user live."),
            travelPreferences: z.string()
                .describe("The list of travel preferences of the user."),
            countriesUSerHAsAlreadyBeen: z.string()
              .describe("The list of countries the user has already been"),
          }),
      }
    },
  }),
});
