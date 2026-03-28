import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the AI modules BEFORE importing the route
vi.mock('ai', () => ({
  streamObject: vi.fn(),
}))

vi.mock('@/lib/ai/openrouter', () => ({
  openrouter: {},
  getModel: vi.fn(() => 'mock-model'),
}))

vi.mock('@/lib/ai/prompts', () => ({
  auditSystemPrompt: vi.fn(() => 'mock audit system prompt'),
}))

import { POST } from '@/app/api/audit/route'
import { streamObject } from 'ai'
import { auditSystemPrompt } from '@/lib/ai/prompts'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createRequest(body: Record<string, unknown>): Request {
  return new Request('http://localhost/api/audit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

const mockStructuredBrief = {
  title: 'Test Brief',
  fields: {
    context: { content: 'Some context', status: 'complete' },
    objective: { content: '', status: 'missing', suggestion: 'Define objective' },
    audience: { content: 'Young adults', status: 'complete' },
    message: { content: '', status: 'missing', suggestion: 'Define message' },
    tone: { content: 'Professional', status: 'complete' },
    deliverables: { content: '3 posts', status: 'partial', suggestion: 'Specify formats' },
    budget: { content: '', status: 'missing', suggestion: 'Set budget' },
    timeline: { content: 'Q1 2026', status: 'complete' },
    kpis: { content: '', status: 'missing', suggestion: 'Define KPIs' },
    references: { content: '', status: 'missing', suggestion: 'Add references' },
  },
  audit: {
    gaps: [],
    contradictions: [],
    overall_note: 'Brief needs work',
  },
  score: 35,
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('POST /api/audit', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('retorna stream com status 200', async () => {
    const mockResponse = new Response('streamed audit data', { status: 200 })
    vi.mocked(streamObject).mockResolvedValue({
      toTextStreamResponse: () => mockResponse,
    } as unknown as ReturnType<typeof streamObject>)

    const req = createRequest({
      briefId: 'abc-123',
      structured_brief: mockStructuredBrief,
      language: 'pt-BR',
    })

    const res = await POST(req)

    expect(res.status).toBe(200)
    expect(streamObject).toHaveBeenCalledOnce()
    expect(streamObject).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'mock-model',
        system: 'mock audit system prompt',
        prompt: JSON.stringify(mockStructuredBrief),
      })
    )
    expect(auditSystemPrompt).toHaveBeenCalledWith('pt-BR')
  })

  it('rejeita sem briefId (400)', async () => {
    const req = createRequest({
      structured_brief: mockStructuredBrief,
      language: 'pt-BR',
    })

    const res = await POST(req)
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body).toHaveProperty('error')
    expect(typeof body.error).toBe('string')
  })

  it('rejeita sem structured_brief (400)', async () => {
    const req = createRequest({
      briefId: 'abc-123',
      language: 'pt-BR',
    })

    const res = await POST(req)
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body).toHaveProperty('error')
    expect(typeof body.error).toBe('string')
  })

  it('trata erro da IA (500)', async () => {
    vi.mocked(streamObject).mockRejectedValue(new Error('OpenRouter API failed'))

    const req = createRequest({
      briefId: 'abc-123',
      structured_brief: mockStructuredBrief,
      language: 'pt-BR',
    })

    const res = await POST(req)
    const body = await res.json()

    expect(res.status).toBe(500)
    expect(body).toHaveProperty('error')
    // Should NOT expose internal error details
    expect(body.error).not.toContain('OpenRouter')
    expect(body.error).not.toContain('API failed')
  })
})
