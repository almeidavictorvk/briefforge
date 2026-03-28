import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'

// ---------------------------------------------------------------------------
// Mock Supabase client — track channel, on, subscribe, removeChannel calls
// ---------------------------------------------------------------------------

const mockOn = vi.fn()
const mockSubscribe = vi.fn()
const mockRemoveChannel = vi.fn()

// Single channel instance returned by all chainable calls
const channelInstance: Record<string, unknown> = {
  on: mockOn,
  subscribe: mockSubscribe,
}

// .on() stores callback and returns the same channel (chainable)
mockOn.mockImplementation(
  (_event: string, _filter: unknown, callback: (payload: unknown) => void) => {
    ;(mockOn as unknown as { _lastCallback: (payload: unknown) => void })._lastCallback = callback
    return channelInstance
  }
)

// .subscribe() calls the status callback and returns the same channel (chainable, like real Supabase)
mockSubscribe.mockImplementation((cb?: (status: string) => void) => {
  if (cb) cb('SUBSCRIBED')
  return channelInstance
})

const mockChannel = vi.fn().mockReturnValue(channelInstance)

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    channel: mockChannel,
    removeChannel: mockRemoveChannel,
  }),
}))

// Mock parseBriefRow — simple passthrough with a marker
vi.mock('@/lib/supabase/helpers', () => ({
  parseBriefRow: (row: Record<string, unknown>) => ({
    ...row,
    _parsed: true,
  }),
}))

import { useBriefRealtime } from '@/hooks/use-brief-realtime'

// ---------------------------------------------------------------------------
// Reset all mocks before each test
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.clearAllMocks()
})

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useBriefRealtime', () => {
  it('inicia subscription com briefId', () => {
    const briefId = 'test-brief-123'

    renderHook(() => useBriefRealtime(briefId))

    // Should create a channel for the brief
    expect(mockChannel).toHaveBeenCalledWith(
      expect.stringContaining(briefId)
    )

    // Should call .on() with postgres_changes event for UPDATE on briefs table
    expect(mockOn).toHaveBeenCalledWith(
      'postgres_changes',
      expect.objectContaining({
        event: 'UPDATE',
        schema: 'public',
        table: 'briefs',
        filter: `id=eq.${briefId}`,
      }),
      expect.any(Function)
    )

    // Should call .subscribe()
    expect(mockSubscribe).toHaveBeenCalled()
  })

  it('atualiza state quando recebe update via realtime', async () => {
    const briefId = 'test-brief-456'
    const mockOnUpdate = vi.fn()

    const { result } = renderHook(() =>
      useBriefRealtime(briefId, mockOnUpdate)
    )

    // brief should start as null
    expect(result.current.brief).toBeNull()

    // Simulate a realtime event by calling the captured .on() callback
    const realtimeCallback = (mockOn as unknown as { _lastCallback: (payload: unknown) => void })._lastCallback
    expect(realtimeCallback).toBeDefined()

    const fakeRow = {
      id: briefId,
      anonymous_id: 'anon-1',
      raw_input: 'some text',
      structured_brief: {},
      audit_results: {},
      score: 75,
      field_scores: {},
      title: 'Test Brief',
      language: 'pt-BR',
      status: 'shared',
      share_enabled: true,
      client_inputs: { budget: 'R$ 50k' },
      client_last_seen: '2026-03-28T12:00:00Z',
      created_at: '2026-03-28T10:00:00Z',
      updated_at: '2026-03-28T12:00:00Z',
    }

    await act(async () => {
      realtimeCallback({ new: fakeRow })
    })

    // State should be updated with parsed brief
    expect(result.current.brief).not.toBeNull()
    expect(result.current.brief).toMatchObject({
      id: briefId,
      _parsed: true,
    })

    // onUpdate callback should have been called
    expect(mockOnUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ id: briefId, _parsed: true })
    )
  })

  it('limpa subscription no unmount', () => {
    const briefId = 'test-brief-789'

    const { unmount } = renderHook(() => useBriefRealtime(briefId))

    // Channel should have been created
    expect(mockChannel).toHaveBeenCalled()
    const channelInstance = mockChannel.mock.results[0].value

    // Unmount the hook
    unmount()

    // Should call removeChannel with the channel instance
    expect(mockRemoveChannel).toHaveBeenCalledWith(channelInstance)
  })
})
