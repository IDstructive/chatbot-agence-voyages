import { createTool } from '@mastra/core/tools';
import { z } from 'zod';


export const travelTool = createTool({
  id: 'findDestinations',
  description: 'Get destinations based on users preferences',
  inputSchema: z.object({
    userPreferences: z.boolean(),
  }),
  outputSchema: z.array(z.object({
      nom: z.string(),
      labels: z.array(z.string()),
      accessibleHandicap: z.string()
    })
  ),
});

// const getDestination = (userPreferences)