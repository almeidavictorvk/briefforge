import { NextResponse } from 'next/server'
import { streamObject } from 'ai'
import { briefSchema } from '@/lib/ai/schema'
import { getModel } from '@/lib/ai/openrouter'
import { auditSystemPrompt } from '@/lib/ai/prompts'

/**
 * Strip markdown code fences from LLM output.
 */
function stripMarkdownFences(text: string): string {
  let s = text.trim()
  s = s.replace(/^```(?:json)?\s*\n?/, '')
  s = s.replace(/\n?```\s*$/, '')
  return s.trim()
}

export async function POST(request: Request) {
  let body: { briefId?: string; structured_brief?: Record<string, unknown>; language?: string }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 }
    )
  }

  const { briefId, structured_brief, language } = body

  // Validate briefId
  if (!briefId || typeof briefId !== 'string' || briefId.trim().length === 0) {
    return NextResponse.json(
      { error: 'briefId is required and must be a non-empty string' },
      { status: 400 }
    )
  }

  // Validate structured_brief
  if (!structured_brief || typeof structured_brief !== 'object') {
    return NextResponse.json(
      { error: 'structured_brief is required and must be an object' },
      { status: 400 }
    )
  }

  // Default language to 'pt-BR' if not provided
  const resolvedLanguage = language && typeof language === 'string' ? language : 'pt-BR'

  try {
    const result = streamObject({
      model: getModel(),
      schema: briefSchema,
      system: auditSystemPrompt(resolvedLanguage),
      prompt: JSON.stringify(structured_brief),
    })

    // Collect full text, strip markdown fences, return clean JSON
    let fullText = ''
    for await (const textDelta of result.textStream) {
      fullText += textDelta
    }

    const cleanJson = stripMarkdownFences(fullText)

    if (!cleanJson) {
      console.error('[audit] Empty response from AI model')
      return NextResponse.json(
        { error: 'AI returned empty response. Please try again.' },
        { status: 502 }
      )
    }

    // Validate that the response is valid JSON before returning
    try {
      JSON.parse(cleanJson)
    } catch {
      console.error('[audit] Invalid JSON from AI model:', cleanJson.slice(0, 200))
      return NextResponse.json(
        { error: 'AI returned invalid response. Please try again.' },
        { status: 502 }
      )
    }

    return new Response(cleanJson, {
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    })
  } catch (err) {
    console.error('[audit] streamObject error:', err)
    return NextResponse.json(
      { error: 'Failed to re-audit brief. Please try again.' },
      { status: 500 }
    )
  }
}
