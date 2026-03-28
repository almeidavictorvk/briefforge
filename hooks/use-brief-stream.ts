'use client'

import { experimental_useObject as useObject } from '@ai-sdk/react'
import { briefSchema } from '@/lib/ai/schema'

export function useBriefStream() {
  const { object, submit, isLoading, error } = useObject({
    api: '/api/generate',
    schema: briefSchema,
  })

  const generate = (data: { rawInput: string; language: string }) => {
    submit(data)
  }

  return {
    brief: object,
    generate,
    isLoading,
    error,
  }
}
