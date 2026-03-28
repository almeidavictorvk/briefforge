import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import Home from '@/app/page'

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

// Mock CSS import
vi.mock('@/styles/globals.css', () => ({}))

// Mock next/navigation
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

// Mock useAnonymousId
vi.mock('@/hooks/use-anonymous-id', () => ({
  useAnonymousId: () => ({ anonymousId: 'test-anon-id', isReady: true }),
}))

// Supabase mock chain
const mockSelect = vi.fn()
const mockEq = vi.fn()
const mockOrder = vi.fn()
const mockLimit = vi.fn()
const mockInsert = vi.fn()
const mockSingle = vi.fn()

function setupSupabaseMock(data: unknown[] | null, error: unknown = null) {
  mockLimit.mockResolvedValue({ data, error })
  mockOrder.mockReturnValue({ limit: mockLimit })
  mockEq.mockReturnValue({ order: mockOrder })
  mockSelect.mockReturnValue({ eq: mockEq })

  mockSingle.mockResolvedValue({ data: null, error: null })
  mockInsert.mockReturnValue({ select: vi.fn().mockReturnValue({ single: mockSingle }) })

  const mockFrom = vi.fn().mockReturnValue({
    select: mockSelect,
    insert: mockInsert,
  })

  return mockFrom
}

let mockFrom: ReturnType<typeof setupSupabaseMock>

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    from: (...args: unknown[]) => mockFrom(...args),
  }),
}))

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Home Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Default: empty briefs list
    mockFrom = setupSupabaseMock([])
  })

  it('renderiza heading principal', () => {
    render(<Home />)
    // The heading contains "De caos para" and "estratégia" (possibly in separate elements)
    expect(screen.getByText(/De caos para/)).toBeInTheDocument()
    expect(screen.getByText(/estratégia/)).toBeInTheDocument()
  })

  it('renderiza BriefInput (textarea)', () => {
    render(<Home />)
    const textarea = screen.getByPlaceholderText(
      /cole aqui/i
    )
    expect(textarea).toBeInTheDocument()
  })

  it('renderiza seção de recentes com BriefCards', async () => {
    const mockBriefs = [
      {
        id: 'brief-1',
        title: 'Brief de Teste',
        score: 75,
        status: 'draft',
        created_at: new Date().toISOString(),
      },
      {
        id: 'brief-2',
        title: 'Outro Brief',
        score: 50,
        status: 'shared',
        created_at: new Date().toISOString(),
      },
    ]
    mockFrom = setupSupabaseMock(mockBriefs)

    render(<Home />)

    await waitFor(() => {
      expect(screen.getByText('Recentes')).toBeInTheDocument()
    })

    await waitFor(() => {
      expect(screen.getByText('Brief de Teste')).toBeInTheDocument()
      expect(screen.getByText('Outro Brief')).toBeInTheDocument()
    })
  })

  it('exibe estado vazio quando não há briefs', async () => {
    mockFrom = setupSupabaseMock([])

    render(<Home />)

    await waitFor(() => {
      expect(
        screen.getByText(/nenhum brief ainda/i)
      ).toBeInTheDocument()
    })
  })
})
