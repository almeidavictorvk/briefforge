import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------------------------------------------------------------------------
// Mocks — must be declared before importing the route handler
// ---------------------------------------------------------------------------

const mockSelect = vi.fn()
const mockEq = vi.fn()
const mockSingle = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createServerClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: mockSelect,
    })),
  })),
}))

vi.mock('@/lib/supabase/helpers', () => ({
  parseBriefRow: vi.fn((row: unknown) => ({ ...row as Record<string, unknown>, _parsed: true })),
}))

import { GET } from '@/app/api/brief/[id]/route'
import { parseBriefRow } from '@/lib/supabase/helpers'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000'

function createGetRequest(id: string): {
  request: Request
  params: Promise<{ id: string }>
} {
  return {
    request: new Request(`http://localhost/api/brief/${id}`, { method: 'GET' }),
    params: Promise.resolve({ id }),
  }
}

function makeBriefRow(overrides: Record<string, unknown> = {}) {
  return {
    id: VALID_UUID,
    anonymous_id: 'anon-123',
    raw_input: 'Some raw input text',
    structured_brief: {},
    audit_results: {},
    score: 75,
    field_scores: {},
    title: 'Test Brief',
    language: 'pt-BR',
    status: 'draft',
    share_enabled: false,
    client_inputs: {},
    client_last_seen: null,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    ...overrides,
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('GET /api/brief/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Default chain: select() -> eq() -> single()
    mockSelect.mockReturnValue({ eq: mockEq })
    mockEq.mockReturnValue({ single: mockSingle })
  })

  it('retorna brief existente com status 200', async () => {
    const briefRow = makeBriefRow()
    mockSingle.mockResolvedValue({ data: briefRow, error: null })

    const { request, params } = createGetRequest(VALID_UUID)
    const res = await GET(request, { params })
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body).toHaveProperty('brief')
    expect(parseBriefRow).toHaveBeenCalledWith(briefRow)
    expect(body.brief._parsed).toBe(true)
  })

  it('retorna 404 para brief inexistente', async () => {
    mockSingle.mockResolvedValue({ data: null, error: { code: 'PGRST116', message: 'not found' } })

    const { request, params } = createGetRequest(VALID_UUID)
    const res = await GET(request, { params })
    const body = await res.json()

    expect(res.status).toBe(404)
    expect(body).toHaveProperty('error')
    expect(typeof body.error).toBe('string')
  })

  it('retorna 400 para ID invalido (nao UUID)', async () => {
    const { request, params } = createGetRequest('not-a-valid-uuid')
    const res = await GET(request, { params })
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body).toHaveProperty('error')
    expect(typeof body.error).toBe('string')
    // Should NOT call Supabase for invalid UUID
    expect(mockSelect).not.toHaveBeenCalled()
  })
})
