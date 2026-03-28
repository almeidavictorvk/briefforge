import { createOpenRouter } from '@openrouter/ai-sdk-provider'

const DEFAULT_MODEL = 'anthropic/claude-sonnet-4'

export const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY!,
})

export function getModel(modelId: string = DEFAULT_MODEL) {
  return openrouter.chat(modelId)
}
