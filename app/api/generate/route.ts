import { NextResponse } from 'next/server'
import { streamObject } from 'ai'
import { briefSchema } from '@/lib/ai/schema'
import { getModel } from '@/lib/ai/openrouter'
import { generateSystemPrompt } from '@/lib/ai/prompts'

const VALID_LANGUAGES = ['pt-BR', 'en'] as const

/**
 * Strip markdown code fences from LLM output.
 * Models sometimes wrap JSON in ```json ... ``` fences.
 */
function stripMarkdownFences(text: string): string {
  let s = text.trim()
  // Remove opening fence: ```json or ```
  s = s.replace(/^```(?:json)?\s*\n?/, '')
  // Remove closing fence
  s = s.replace(/\n?```\s*$/, '')
  return s.trim()
}

export async function POST(request: Request) {
  let body: { rawInput?: string; language?: string }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 }
    )
  }

  const { rawInput, language } = body

  // Validate rawInput
  if (!rawInput || typeof rawInput !== 'string' || rawInput.trim().length === 0) {
    return NextResponse.json(
      { error: 'rawInput is required and must be a non-empty string' },
      { status: 400 }
    )
  }

  // Validate language
  if (
    !language ||
    typeof language !== 'string' ||
    !VALID_LANGUAGES.includes(language as (typeof VALID_LANGUAGES)[number])
  ) {
    return NextResponse.json(
      { error: 'language must be "pt-BR" or "en"' },
      { status: 400 }
    )
  }

  try {
    const result = streamObject({
      model: getModel(),
      schema: briefSchema,
      system: generateSystemPrompt(language),
      prompt: rawInput,
    })

    // Collect full text from the LLM, strip markdown fences, return clean JSON.
    // OpenRouter + Claude may wrap output in ```json ... ``` fences even with
    // json_schema response_format, which breaks both partialObjectStream and
    // client-side parsePartialJson.
    let fullText = ''
    for await (const textDelta of result.textStream) {
      fullText += textDelta
    }

    const cleanJson = stripMarkdownFences(fullText)

    return new Response(cleanJson, {
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    })
  } catch {
    return NextResponse.json(
      { error: 'Failed to generate brief. Please try again.' },
      { status: 500 }
    )
  }
}
