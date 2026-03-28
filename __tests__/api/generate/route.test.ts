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
  generateSystemPrompt: vi.fn(() => 'mock system prompt'),
}))

import { POST } from '@/app/api/generate/route'
import { streamObject } from 'ai'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createRequest(body: Record<string, unknown>): Request {
  return new Request('http://localhost/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('POST /api/generate', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('retorna stream com input valido', async () => {
    const mockResponse = new Response('streamed data', { status: 200 })
    vi.mocked(streamObject).mockResolvedValue({
      toTextStreamResponse: () => mockResponse,
    } as unknown as ReturnType<typeof streamObject>)

    const req = createRequest({
      rawInput: 'texto teste com mais de 10 chars',
      language: 'pt-BR',
    })

    const res = await POST(req)

    expect(res.status).toBe(200)
    expect(streamObject).toHaveBeenCalledOnce()
    expect(streamObject).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'mock-model',
        system: 'mock system prompt',
        prompt: 'texto teste com mais de 10 chars',
      })
    )
  })

  it('rejeita input vazio', async () => {
    const req = createRequest({
      rawInput: '',
      language: 'pt-BR',
    })

    const res = await POST(req)
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body).toHaveProperty('error')
    expect(typeof body.error).toBe('string')
  })

  it('rejeita sem rawInput', async () => {
    const req = createRequest({
      language: 'pt-BR',
    })

    const res = await POST(req)
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body).toHaveProperty('error')
  })

  it('rejeita language invalida', async () => {
    const req = createRequest({
      rawInput: 'texto teste com conteudo suficiente',
      language: 'fr',
    })

    const res = await POST(req)
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body).toHaveProperty('error')
  })

  it('trata erro da IA gracefully', async () => {
    vi.mocked(streamObject).mockRejectedValue(new Error('OpenRouter API failed'))

    const req = createRequest({
      rawInput: 'texto teste com mais de 10 chars',
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
