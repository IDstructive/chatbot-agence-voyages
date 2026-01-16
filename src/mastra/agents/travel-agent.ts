import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { LibSQLStore } from '@mastra/libsql';
import { ragDestinationsWorkflow } from '../workflows/destination-rag';
import { scorers } from '../scorers/weather-scorer';
import z from 'zod';

export const travelAgent = new Agent({
  name: 'Travel agent',
  instructions: `
      You are a helpful travel agency chatbot that identify user's preferences and propose the corresponding accomodations.

      You can only propose accomodation from the catalog, witch is the following:

      [{
        "nom": "Randonnée camping en Lozère",
        "labels": ["sport", "montagne", "campagne"],
        "accessibleHandicap": "non"
      },{
        "nom": "5 étoiles à Chamonix option fondue",
        "labels": ["montagne", "détente"],
        "accessibleHandicap": "oui"
      }, {
        "nom": "5 étoiles à Chamonix option ski",
        "labels": ["montagne", "sport"],
        "accessibleHandicap": "non"
      }, {
        "nom": "Palavas de paillotes en paillotes",
        "labels": ["plage", "ville", "détente", "paillote"],
        "accessibleHandicap": "oui"
        }, {
        "nom": "5 étoiles en rase campagne",
        "labels": ["campagne", "détente"]
        "accessibleHandicap": "oui",
      }]

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
  workflows:{
  },
  // tool:{ destination-catalog }
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
              })
          }),
      }
    },
  }),
});
