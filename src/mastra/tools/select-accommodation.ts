import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { destinations } from './destinations-catalog';

const catalog = destinations

export const PreferenceSchema = z.object({
        "plage" : z.boolean().nullable(),
        "montagne" : z.boolean().nullable(),
        "ville" : z.boolean().nullable(),
        "sport" : z.boolean().nullable(),
        "detente" : z.boolean().nullable(),
        "acces_handicap" : z.boolean().nullable(),
    });

export const selectAccommodationTool = createTool({
  id: "select-accommodation",
  description: "Filters the catalog based on structured user preferences.",
  inputSchema: z.object({
    preferences: PreferenceSchema,
  }),
  execute: async ({ context }) => {
    const { preferences } = context;

    const activePreferences = Object.entries(preferences)
      .filter(([, value]) => value === true)
      .map(([key]) => key);

    if (activePreferences.length === 0) {
      return [];
    }

    let selection = catalog.filter(destination => 
      activePreferences.some(pref => destination.labels.includes(pref))
    );

    if (activePreferences.includes("acces_handicap")) {
      selection = selection.filter(destination => destination.accessibleHandicap)
    }

    return selection;
  },
});
