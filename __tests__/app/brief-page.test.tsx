import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

// Mock CSS import
vi.mock('@/styles/globals.css', () => ({}))

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useParams: vi.fn(() => ({ id: 'test-uuid-1234' })),
}))

// Mock useAnonymousId
vi.mock('@/hooks/use-anonymous-id', () => ({
  useAnonymousId: () => ({ anonymousId: 'test-anon-id', isReady: true }),
}))

// Mock BriefView to simplify testing the page
vi.mock('@/components/brief-view', () => ({
  BriefView: ({ title, score }: { title: string; score: number }) => (
    <div data-testid="brief-view">
      <span>{title}</span>
      <span>{score}</span>
    </div>
  ),
}))

// Mock framer-motion
const MotionDiv = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function MotionDiv(props, ref) {
    return <div ref={ref} {...props} />
  }
)
const MotionSpan = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  function MotionSpan(props, ref) {
    return <span ref={ref} {...props} />
  }
)
function AnimatePresence({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

vi.mock('framer-motion', () => ({
  motion: { div: MotionDiv, span: MotionSpan },
  AnimatePresence,
}))

// ---------------------------------------------------------------------------
// Helper: create a mock brief response
// ---------------------------------------------------------------------------

function createMockBriefResponse() {
  return {
    brief: {
      id: 'test-uuid-1234',
      anonymous_id: 'anon-123',
      raw_input: 'Some raw input text',
      title: 'Campanha de Marketing',
      language: 'pt-BR',
      status: 'draft',
      share_enabled: false,
      score: 72,
      field_scores: {},
      client_inputs: {},
      client_last_seen: null,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      fields: {
        context: { content: 'Empresa X', status: 'complete' },
        objective: { content: 'Aumentar vendas', status: 'complete' },
        audience: { content: 'Jovens 18-25', status: 'complete' },
        message: { content: 'Qualidade e preço', status: 'partial', suggestion: 'Detalhar melhor' },
        tone: { content: 'Informal', status: 'complete' },
        deliverables: { content: 'Posts Instagram', status: 'complete' },
        budget: { content: '', status: 'missing' },
        timeline: { content: '3 meses', status: 'complete' },
        kpis: { content: 'Engajamento', status: 'partial', suggestion: 'Definir metas numéricas' },
        references: { content: '', status: 'missing' },
      },
      audit: {
        gaps: [
          { field: 'budget', severity: 'critical', suggestion: 'Definir orçamento' },
        ],
        contradictions: [],
        overall_note: 'Brief parcialmente completo',
      },
    },
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Página /brief/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.restoreAllMocks()
  })

  it('carrega brief e renderiza BriefView com dados', async () => {
    const mockResponse = createMockBriefResponse()

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockResponse),
      })
    )

    const BriefPage = (await import('@/app/brief/[id]/page')).default
    render(<BriefPage />)

    // Should eventually render BriefView with the brief data
    await waitFor(() => {
      expect(screen.getByTestId('brief-view')).toBeInTheDocument()
    })

    // Should display title and score from the brief
    expect(screen.getByText('Campanha de Marketing')).toBeInTheDocument()
    expect(screen.getByText('72')).toBeInTheDocument()

    // Verify fetch was called with correct URL
    expect(fetch).toHaveBeenCalledWith('/api/brief/test-uuid-1234')
  })

  it('mostra loading enquanto carrega', async () => {
    // Create a fetch that never resolves immediately
    let resolveFetch: (value: unknown) => void
    const fetchPromise = new Promise((resolve) => {
      resolveFetch = resolve
    })

    vi.stubGlobal('fetch', vi.fn().mockReturnValue(fetchPromise))

    const BriefPage = (await import('@/app/brief/[id]/page')).default
    render(<BriefPage />)

    // Should show loading state
    expect(screen.getByText(/carregando/i)).toBeInTheDocument()

    // Should NOT show BriefView yet
    expect(screen.queryByTestId('brief-view')).not.toBeInTheDocument()

    // Resolve fetch to clean up
    resolveFetch!({
      ok: true,
      status: 200,
      json: () => Promise.resolve(createMockBriefResponse()),
    })

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByText(/carregando/i)).not.toBeInTheDocument()
    })
  })

  it('mostra erro se brief não encontrado (404)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ error: 'Brief not found' }),
      })
    )

    const BriefPage = (await import('@/app/brief/[id]/page')).default
    render(<BriefPage />)

    // Should show error message
    await waitFor(() => {
      expect(screen.getByText(/brief não encontrado/i)).toBeInTheDocument()
    })

    // Should NOT show BriefView
    expect(screen.queryByTestId('brief-view')).not.toBeInTheDocument()
  })
})
