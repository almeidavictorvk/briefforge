import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import HistoryPage from '@/app/history/page'

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

// Mock CSS import
vi.mock('@/styles/globals.css', () => ({}))

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

// Mock useAnonymousId
vi.mock('@/hooks/use-anonymous-id', () => ({
  useAnonymousId: () => ({ anonymousId: 'test-anon-id', isReady: true }),
}))

// Mock scoring
vi.mock('@/lib/scoring', () => ({
  getScoreColor: (score: number) => {
    if (score >= 70) return 'success'
    if (score >= 40) return 'warning'
    return 'error'
  },
}))

// Supabase mock chain — mock .from().select().eq().order().limit()
const mockSelect = vi.fn()
const mockEq = vi.fn()
const mockOrder = vi.fn()
const mockLimit = vi.fn()

function setupSupabaseMock(data: unknown[] | null, error: unknown = null) {
  mockLimit.mockResolvedValue({ data, error })
  mockOrder.mockReturnValue({ limit: mockLimit })
  mockEq.mockReturnValue({ order: mockOrder })
  mockSelect.mockReturnValue({ eq: mockEq })

  const mockFrom = vi.fn().mockReturnValue({
    select: mockSelect,
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
// Test data
// ---------------------------------------------------------------------------

const mockBriefs = [
  {
    id: 'brief-1',
    title: 'Campanha Digital',
    score: 85,
    status: 'draft',
    share_enabled: false,
    client_inputs: {},
    structured_brief: {},
    created_at: '2026-03-28T10:00:00Z',
    updated_at: '2026-03-28T12:00:00Z',
  },
  {
    id: 'brief-2',
    title: 'Lançamento Produto',
    score: 60,
    status: 'shared',
    share_enabled: true,
    client_inputs: { budget: 'R$ 50k' },
    structured_brief: { budget: { content: '', status: 'missing' }, timeline: { content: '', status: 'missing' } },
    created_at: '2026-03-27T10:00:00Z',
    updated_at: '2026-03-28T11:00:00Z',
  },
  {
    id: 'brief-3',
    title: 'Rebranding',
    score: 30,
    status: 'complete',
    share_enabled: false,
    client_inputs: {},
    structured_brief: {},
    created_at: '2026-03-26T10:00:00Z',
    updated_at: '2026-03-28T10:00:00Z',
  },
]

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('History Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Default: empty briefs list
    mockFrom = setupSupabaseMock([])
  })

  it('renderiza título "Seus Briefs"', async () => {
    render(<HistoryPage />)

    await waitFor(() => {
      expect(screen.getByText(/Seus Briefs/)).toBeInTheDocument()
    })
  })

  it('lista briefs do usuário', async () => {
    mockFrom = setupSupabaseMock(mockBriefs)

    render(<HistoryPage />)

    await waitFor(() => {
      const links = screen.getAllByRole('link').filter((link) =>
        link.getAttribute('href')?.startsWith('/brief/')
      )
      expect(links).toHaveLength(3)
    })
  })

  it('ordena por updated_at DESC', async () => {
    mockFrom = setupSupabaseMock(mockBriefs)

    render(<HistoryPage />)

    await waitFor(() => {
      expect(mockOrder).toHaveBeenCalledWith('updated_at', { ascending: false })
    })
  })

  it('mostra contagem total', async () => {
    mockFrom = setupSupabaseMock(mockBriefs)

    render(<HistoryPage />)

    await waitFor(() => {
      expect(screen.getByText(/\(3\)/)).toBeInTheDocument()
    })
  })

  it('mostra estado vazio', async () => {
    mockFrom = setupSupabaseMock([])

    render(<HistoryPage />)

    await waitFor(() => {
      const link = screen.getByRole('link', { name: /criar primeiro brief/i })
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', '/')
    })
  })

  it('mostra loading state', () => {
    // Use a promise that never resolves to keep loading state visible
    mockLimit.mockReturnValue(new Promise(() => {}))
    mockOrder.mockReturnValue({ limit: mockLimit })
    mockEq.mockReturnValue({ order: mockOrder })
    mockSelect.mockReturnValue({ eq: mockEq })
    mockFrom = vi.fn().mockReturnValue({ select: mockSelect })

    render(<HistoryPage />)

    // Loading skeletons should be visible while data is loading
    const skeletons = document.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('filtra por busca', async () => {
    mockFrom = setupSupabaseMock(mockBriefs)

    render(<HistoryPage />)

    // Wait for briefs to load
    await waitFor(() => {
      expect(screen.getByText('Campanha Digital')).toBeInTheDocument()
    })

    // Type in search input
    const searchInput = screen.getByPlaceholderText(/buscar/i)
    fireEvent.change(searchInput, { target: { value: 'Rebranding' } })

    // Should show only the matching brief
    await waitFor(() => {
      expect(screen.queryByText('Campanha Digital')).not.toBeInTheDocument()
      expect(screen.queryByText('Lançamento Produto')).not.toBeInTheDocument()
      expect(screen.getByText('Rebranding')).toBeInTheDocument()
    })
  })
})
