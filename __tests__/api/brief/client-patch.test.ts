import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------------------------------------------------------------------------
// Mocks — must be declared before importing the route handler
// ---------------------------------------------------------------------------

// Mock chain for SELECT (fetch existing brief)
const mockSelectSelect = vi.fn()
const mockSelectEq = vi.fn()
const mockSelectSingle = vi.fn()

// Mock chain for UPDATE: .update().eq('id', ...).select().single()
const mockUpdate = vi.fn()
const mockUpdateEq = vi.fn()
const mockUpdateSelect = vi.fn()
const mockUpdateSingle = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createServerClient: vi.fn(() => ({
    from: vi.fn(() => {
      return {
        select: mockSelectSelect,
        update: mockUpdate,
      }
    }),
  })),
}))

vi.mock('@/lib/supabase/helpers', () => ({
  parseBriefRow: vi.fn((row: unknown) => ({ ...row as Record<string, unknown>, _parsed: true })),
}))

import { PATCH } from '@/app/api/brief/[id]/route'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000'
const OWNER_ANON_ID = 'anon-owner-123'

function createPatchRequest(id: string, body: Record<string, unknown>): {
  request: Request
  params: Promise<{ id: string }>
} {
  return {
    request: new Request(`http://localhost/api/brief/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
    params: Promise.resolve({ id }),
  }
}

function makeBriefRow(overrides: Record<string, unknown> = {}) {
  return {
    id: VALID_UUID,
    anonymous_id: OWNER_ANON_ID,
    raw_input: 'Some raw input text',
    structured_brief: {
      context: { content: 'Old context', status: 'complete' },
      objective: { content: '', status: 'missing' },
      audience: { content: '', status: 'missing' },
      message: { content: '', status: 'missing' },
      tone: { content: '', status: 'missing' },
      deliverables: { content: '', status: 'missing' },
      budget: { content: '', status: 'missing' },
      timeline: { content: '', status: 'missing' },
      kpis: { content: '', status: 'missing' },
      references: { content: '', status: 'missing' },
    },
    audit_results: {},
    score: 10,
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
// Tests — PATCH /api/brief/[id] client_inputs (Brief Vivo)
// ---------------------------------------------------------------------------

describe('PATCH /api/brief/[id] — client_inputs (Brief Vivo)', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Default chain for SELECT: select() -> eq() -> single()
    mockSelectSelect.mockReturnValue({ eq: mockSelectEq })
    mockSelectEq.mockReturnValue({ single: mockSelectSingle })

    // Default chain for UPDATE: update() -> eq() -> select() -> single()
    mockUpdate.mockReturnValue({ eq: mockUpdateEq })
    mockUpdateEq.mockReturnValue({ select: mockUpdateSelect })
    mockUpdateSelect.mockReturnValue({ single: mockUpdateSingle })
  })

  it('atualiza client_inputs em brief compartilhado', async () => {
    const existingRow = makeBriefRow({ share_enabled: true, client_inputs: {} })
    mockSelectSingle.mockResolvedValue({ data: existingRow, error: null })

    const updatedRow = makeBriefRow({
      share_enabled: true,
      client_inputs: { budget: 'R$50k' },
    })
    mockUpdateSingle.mockResolvedValue({ data: updatedRow, error: null })

    const { request, params } = createPatchRequest(VALID_UUID, {
      client_inputs: { budget: 'R$50k' },
    })

    const res = await PATCH(request, { params })
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body).toHaveProperty('brief')
    // Verify update was called with merged client_inputs
    const updateArg = mockUpdate.mock.calls[0][0]
    expect(updateArg.client_inputs).toEqual({ budget: 'R$50k' })
  })

  it('rejeita client_inputs em brief não compartilhado', async () => {
    const existingRow = makeBriefRow({ share_enabled: false })
    mockSelectSingle.mockResolvedValue({ data: existingRow, error: null })

    const { request, params } = createPatchRequest(VALID_UUID, {
      client_inputs: { budget: 'R$50k' },
    })

    const res = await PATCH(request, { params })
    const body = await res.json()

    expect(res.status).toBe(403)
    expect(body).toHaveProperty('error')
    expect(typeof body.error).toBe('string')
    // Should NOT call update for non-shared brief
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('merge client_inputs com existentes', async () => {
    const existingRow = makeBriefRow({
      share_enabled: true,
      client_inputs: { tone: 'casual' },
    })
    mockSelectSingle.mockResolvedValue({ data: existingRow, error: null })

    const updatedRow = makeBriefRow({
      share_enabled: true,
      client_inputs: { tone: 'casual', budget: 'R$50k' },
    })
    mockUpdateSingle.mockResolvedValue({ data: updatedRow, error: null })

    const { request, params } = createPatchRequest(VALID_UUID, {
      client_inputs: { budget: 'R$50k' },
    })

    const res = await PATCH(request, { params })

    expect(res.status).toBe(200)
    // Verify the update call merged existing + new client_inputs
    const updateArg = mockUpdate.mock.calls[0][0]
    expect(updateArg.client_inputs).toEqual({ tone: 'casual', budget: 'R$50k' })
  })

  it('atualiza client_last_seen', async () => {
    const existingRow = makeBriefRow({
      share_enabled: true,
      client_inputs: {},
      client_last_seen: null,
    })
    mockSelectSingle.mockResolvedValue({ data: existingRow, error: null })

    const updatedRow = makeBriefRow({
      share_enabled: true,
      client_inputs: { budget: 'R$50k' },
      client_last_seen: '2026-03-28T12:00:00Z',
    })
    mockUpdateSingle.mockResolvedValue({ data: updatedRow, error: null })

    const beforeTime = new Date()

    const { request, params } = createPatchRequest(VALID_UUID, {
      client_inputs: { budget: 'R$50k' },
    })

    const res = await PATCH(request, { params })

    const afterTime = new Date()

    expect(res.status).toBe(200)
    // Verify the update payload includes client_last_seen with a recent ISO timestamp
    const updateArg = mockUpdate.mock.calls[0][0]
    expect(updateArg).toHaveProperty('client_last_seen')
    expect(typeof updateArg.client_last_seen).toBe('string')
    // Verify it's a valid ISO timestamp within a reasonable range
    const parsedDate = new Date(updateArg.client_last_seen)
    expect(parsedDate.getTime()).not.toBeNaN()
    expect(parsedDate.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime())
    expect(parsedDate.getTime()).toBeLessThanOrEqual(afterTime.getTime())
  })
})
