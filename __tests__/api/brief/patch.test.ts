import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------------------------------------------------------------------------
// Mocks — must be declared before importing the route handler
// ---------------------------------------------------------------------------

// Mock chain for SELECT (fetch existing brief for ownership check)
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
    from: vi.fn((table: string) => {
      // The from() call is used for both select and update operations.
      // We differentiate by which methods are called on the returned object.
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
import { parseBriefRow } from '@/lib/supabase/helpers'

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
// Tests
// ---------------------------------------------------------------------------

describe('PATCH /api/brief/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Default chain for SELECT (ownership check): select() -> eq() -> single()
    mockSelectSelect.mockReturnValue({ eq: mockSelectEq })
    mockSelectEq.mockReturnValue({ single: mockSelectSingle })

    // Default chain for UPDATE: update() -> eq() -> select() -> single()
    mockUpdate.mockReturnValue({ eq: mockUpdateEq })
    mockUpdateEq.mockReturnValue({ select: mockUpdateSelect })
    mockUpdateSelect.mockReturnValue({ single: mockUpdateSingle })
  })

  it('atualiza campo individual', async () => {
    const existingRow = makeBriefRow()
    mockSelectSingle.mockResolvedValue({ data: existingRow, error: null })

    const updatedRow = makeBriefRow({
      structured_brief: {
        ...existingRow.structured_brief,
        context: { content: 'New context content', status: 'complete' },
      },
      updated_at: '2026-03-28T12:00:00Z',
    })
    mockUpdateSingle.mockResolvedValue({ data: updatedRow, error: null })

    const { request, params } = createPatchRequest(VALID_UUID, {
      field: 'context',
      content: 'New context content',
      anonymousId: OWNER_ANON_ID,
    })

    const res = await PATCH(request, { params })
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(mockUpdate).toHaveBeenCalled()
    // Verify the update call included the field in structured_brief
    const updateArg = mockUpdate.mock.calls[0][0]
    expect(updateArg.structured_brief.context.content).toBe('New context content')
  })

  it('rejeita campo inválido (400)', async () => {
    const existingRow = makeBriefRow()
    mockSelectSingle.mockResolvedValue({ data: existingRow, error: null })

    const { request, params } = createPatchRequest(VALID_UUID, {
      field: 'invalid_field',
      content: 'Some content',
      anonymousId: OWNER_ANON_ID,
    })

    const res = await PATCH(request, { params })
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body).toHaveProperty('error')
    expect(typeof body.error).toBe('string')
    // Should NOT call update for invalid field
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('rejeita anonymous_id incorreto (403)', async () => {
    const existingRow = makeBriefRow({ anonymous_id: OWNER_ANON_ID })
    mockSelectSingle.mockResolvedValue({ data: existingRow, error: null })

    const { request, params } = createPatchRequest(VALID_UUID, {
      field: 'context',
      content: 'Trying to edit',
      anonymousId: 'different-anon-id',
    })

    const res = await PATCH(request, { params })
    const body = await res.json()

    expect(res.status).toBe(403)
    expect(body).toHaveProperty('error')
    expect(typeof body.error).toBe('string')
    // Should NOT call update for unauthorized user
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('retorna brief atualizado', async () => {
    const existingRow = makeBriefRow()
    mockSelectSingle.mockResolvedValue({ data: existingRow, error: null })

    const updatedRow = makeBriefRow({
      structured_brief: {
        ...existingRow.structured_brief,
        context: { content: 'Updated context', status: 'complete' },
      },
    })
    mockUpdateSingle.mockResolvedValue({ data: updatedRow, error: null })

    const { request, params } = createPatchRequest(VALID_UUID, {
      field: 'context',
      content: 'Updated context',
      anonymousId: OWNER_ANON_ID,
    })

    const res = await PATCH(request, { params })
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body).toHaveProperty('brief')
    expect(parseBriefRow).toHaveBeenCalledWith(updatedRow)
    expect(body.brief._parsed).toBe(true)
  })

  it('atualiza updated_at', async () => {
    const existingRow = makeBriefRow({ updated_at: '2026-01-01T00:00:00Z' })
    mockSelectSingle.mockResolvedValue({ data: existingRow, error: null })

    const updatedRow = makeBriefRow({ updated_at: '2026-03-28T12:00:00Z' })
    mockUpdateSingle.mockResolvedValue({ data: updatedRow, error: null })

    const { request, params } = createPatchRequest(VALID_UUID, {
      field: 'context',
      content: 'New content',
      anonymousId: OWNER_ANON_ID,
    })

    const res = await PATCH(request, { params })

    expect(res.status).toBe(200)
    // Verify the update call includes updated_at
    const updateArg = mockUpdate.mock.calls[0][0]
    expect(updateArg).toHaveProperty('updated_at')
    expect(typeof updateArg.updated_at).toBe('string')
    // Verify it's a valid ISO timestamp (not the old value)
    expect(updateArg.updated_at).not.toBe('2026-01-01T00:00:00Z')
    const parsedDate = new Date(updateArg.updated_at)
    expect(parsedDate.getTime()).not.toBeNaN()
  })
})
