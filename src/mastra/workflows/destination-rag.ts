import { createStep, createWorkflow }
from '@mastra/core/workflows';
import { z } from 'zod';

import { mistral } from "@ai-sdk/mistral";
import { generateText } from 'ai';
const model = mistral("codestral-latest")

const destinationSchema = z.object({
  nom: z.string(),
  labels: z.object,
  accessibleHandicap: z.boolean
})

const userQuestionSchema = z.object({
  question: z.string()
})
const augmentedQuerySchema = userQuestionSchema
  .extend({
    destinations: z.array(destinationSchema)
  })
const resultSchema = augmentedQuerySchema.extend({
  answer: z.string()
})


function fetchRelevantDestinations(question: string) {
  if (question.match(/mastra/i)) {
    return [
      {
        "nom": "Randonnée camping en Lozère",
        "labels": ["sport", "montagne", "campagne"],
        "accessibleHandicap": "non"
      },{
        "nom": "5 étoiles à Chamonix option fondue",
        "labels": ["montagne", "détente"],
        "accessibleHandicap": "oui",
      }, {
        "nom": "5 étoiles à Chamonix option ski",
        "labels": ["montagne", "sport"],
        "accessibleHandicap": "non",
      },
      {
        "nom": "Palavas de paillotes en paillotes",
        "labels": ["plage", "ville", "détente", "paillote"],
        "accessibleHandicap": "oui",
      }, {
        "nom": "5 étoiles en rase campagne",
        "labels": ["campagne", "détente"],
        "accessibleHandicap": "oui",
      }
    ]
  }
  return []
}

const retrieval = createStep({
  id: "retrieval",
  description: "Retrieve destinations for user query",
  inputSchema: userQuestionSchema,
  outputSchema: augmentedQuerySchema,
  execute: async ({ inputData }) => {
    const destinations = fetchRelevantDestinations(inputData.question)
    return { ...inputData, destinations }
  }
})

const augmentedGeneration = createStep({
  id: "augmented-generation",
  description: "Run an augmented LLM call",
  inputSchema: augmentedQuerySchema,
  outputSchema: resultSchema,
  execute: async ({ inputData/*, mastra*/ }) => {

const prompt = `
  User asked the following question:
    <user_question>    
    ${inputData.question}
    </user_question>    
  We found the following relevant destinations:
    <relevant_destinations>
    ${inputData.destinations.length ? inputData.destinations.map(d => JSON.stringify(d, null, 2)).join("\n\n") : "No destinations matched the question."}
    </relevant_destinations>
  Answer the user question based on the relevant destinations.
  `

    // @ts-ignore
    const answer = await generateText({ model, prompt })
    // Alternative : apeller un agent Mastra
    //const answer = await mastra.getAgent("some-agent").generate([prompt])
    return {
      ...inputData,
      answer: answer.text
    }
  }

})

const ragWorkflow = createWorkflow({
  id: "rag",
  inputSchema: userQuestionSchema,
  outputSchema: augmentedQuerySchema,
})
  .then(retrieval)
  .then(augmentedGeneration)


ragWorkflow.commit()

export { ragWorkflow };
