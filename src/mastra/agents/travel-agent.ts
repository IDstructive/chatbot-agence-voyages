import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { LibSQLStore } from '@mastra/libsql';
import { scorers } from '../scorers/weather-scorer';
import z from 'zod';
import { selectAccommodationTool } from '../tools/select-accommodation';

export const travelAgent = new Agent({
  name: 'Travel agent',
  instructions: `
      You are a helpful travel agency chatbot that identify user's preferences and propose the corresponding accomodations.

      1. Chat with the user to find out their destination type and desired amenities.
      2. Once you have this information, call the 'select-accommodation' tool.
      3. You MUST extract the preferences from our conversation history and format them 
        exactly as the tool's input schema requires.
      4 If the number of corresponding accommodation exceeds 5, display the most relevant at first and ask the user if her want to see more.


      If a user reject an accomation you proposed, never suggest it again, except if it's preferences have changed. 

      Update the users' preferences in your working memory after each call, by updating them with:
        - null if not mentionned, or no strong opinion formulated
        - true if the user had a positive attitude
        - false if the user rejected that

      A word with a meaning close to a preference name can inlfuence the state of this one.

      When responding:
      - Always ask for a travel preferences if none is provided
      - If the location name isn't in English, please translate it
      - Keep responses concise but informative
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
  tools:{ selectAccommodationTool },
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
            preferences: z.object({
              "plage" : z.boolean().nullable(),
              "montagne" : z.boolean().nullable(),
              "ville" : z.boolean().nullable(),
              "sport" : z.boolean().nullable(),
              "detente" : z.boolean().nullable(),
              "culturel" : z.boolean().nullable(),
              "sport extreme" : z.boolean().nullable(),
              "été" : z.boolean().nullable(),
              "hiver" : z.boolean().nullable(),
              "avion" : z.boolean().nullable(),
              })
          }),
      }
    },
  }),
});
