import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

// Mock CSS import
vi.mock('@/styles/globals.css', () => ({}))

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useParams: () => ({ id: 'test-brief-id' }),
}))

// Mock BriefClientView to isolate page logic
vi.mock('@/components/brief-client-view', () => ({
  BriefClientView: ({
    title,
    onFieldSave,
  }: {
    title: string
    onFieldSave: (fieldName: string, content: string) => Promise<void>
  }) => {
    return (
      <div data-testid="brief-client-view">
        <span>{title}</span>
        <button
          data-testid="save-field-btn"
          onClick={() => onFieldSave('budget', 'R$50k')}
        >
          Save
        </button>
      </div>
    )
  },
}))

// Mock framer-motion
const MotionDiv = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(function MotionDiv(props, ref) {
  return <div ref={ref} {...props} />
})

vi.mock('framer-motion', () => ({
  motion: { div: MotionDiv },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}))

// ---------------------------------------------------------------------------
// Helper: create a mock brief response
// ---------------------------------------------------------------------------

function makeMockBrief(overrides: Record<string, unknown> = {}) {
  return {
    id: 'test-brief-id',
    anonymous_id: 'anon-123',
    raw_input: 'Some raw input',
    title: 'Test Brief',
    language: 'pt-BR',
    share_enabled: true,
    status: 'shared',
    score: 75,
    field_scores: {},
    client_inputs: {},
    client_last_seen: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    fields: {
      context: { content: 'ctx', status: 'complete' },
      objective: { content: 'obj', status: 'complete' },
      audience: { content: '', status: 'missing' },
      message: { content: 'msg', status: 'complete' },
      tone: { content: 'partial tone', status: 'partial' },
      deliverables: { content: 'del', status: 'complete' },
      budget: { content: '', status: 'missing' },
      timeline: { content: 'time', status: 'complete' },
      kpis: { content: '', status: 'missing' },
      references: { content: 'ref', status: 'complete' },
    },
    audit: { gaps: [], contradictions: [], overall_note: '' },
    ...overrides,
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Pagina /share/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.restoreAllMocks()
    vi.resetModules()
  })

  it('carrega brief publico e renderiza BriefClientView', async () => {
    const mockBrief = makeMockBrief()

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ brief: mockBrief }),
      })
    )

    const SharePage = (await import('@/app/share/[id]/page')).default
    render(<SharePage />)

    // Should eventually render BriefClientView with the brief data
    await waitFor(() => {
      expect(screen.getByTestId('brief-client-view')).toBeInTheDocument()
    })

    // Should display title from the brief
    expect(screen.getByText('Test Brief')).toBeInTheDocument()

    // Verify fetch was called to load the brief
    expect(fetch).toHaveBeenCalledWith('/api/brief/test-brief-id')
  })

  it('mostra erro se brief nao esta compartilhado', async () => {
    const mockBrief = makeMockBrief({ share_enabled: false })

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ brief: mockBrief }),
      })
    )

    const SharePage = (await import('@/app/share/[id]/page')).default
    render(<SharePage />)

    // Should show error message about not being shared
    await waitFor(() => {
      expect(
        screen.getByText(/não está compartilhado/i)
      ).toBeInTheDocument()
    })

    // Should NOT render BriefClientView
    expect(screen.queryByTestId('brief-client-view')).not.toBeInTheDocument()
  })

  it('mostra erro se brief nao existe (404)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ error: 'Brief not found' }),
      })
    )

    const SharePage = (await import('@/app/share/[id]/page')).default
    render(<SharePage />)

    // Should show error message about not found
    await waitFor(() => {
      expect(screen.getByText(/não encontrado/i)).toBeInTheDocument()
    })

    // Should NOT render BriefClientView
    expect(screen.queryByTestId('brief-client-view')).not.toBeInTheDocument()
  })

  it('salva client_inputs ao preencher campo', async () => {
    const mockBrief = makeMockBrief()
    const updatedBrief = makeMockBrief({
      client_inputs: { budget: 'R$50k' },
    })

    const mockFetch = vi.fn()
      // First call: GET to load brief
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ brief: mockBrief }),
      })
      // Second call: PATCH to update client_last_seen on mount
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ brief: mockBrief }),
      })
      // Third call: PATCH to save field
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ brief: updatedBrief }),
      })

    vi.stubGlobal('fetch', mockFetch)

    const SharePage = (await import('@/app/share/[id]/page')).default
    render(<SharePage />)

    // Wait for BriefClientView to render
    await waitFor(() => {
      expect(screen.getByTestId('brief-client-view')).toBeInTheDocument()
    })

    // Click the save button (which calls onFieldSave('budget', 'R$50k'))
    const user = userEvent.setup()
    await user.click(screen.getByTestId('save-field-btn'))

    // Verify that PATCH was called with client_inputs
    await waitFor(() => {
      const patchCalls = mockFetch.mock.calls.filter(
        (call: unknown[]) => {
          if (typeof call[1] === 'object' && call[1] !== null) {
            const opts = call[1] as Record<string, unknown>
            return opts.method === 'PATCH'
          }
          return false
        }
      )

      // At least one PATCH call should contain the budget client_input
      const hasBudgetPatch = patchCalls.some((call: unknown[]) => {
        const opts = call[1] as Record<string, unknown>
        const body = JSON.parse(opts.body as string)
        return (
          body.client_inputs &&
          body.client_inputs.budget === 'R$50k'
        )
      })

      expect(hasBudgetPatch).toBe(true)
    })
  })
})
