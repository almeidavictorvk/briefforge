import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Brief } from '@/lib/types'
import { FIELD_NAMES, FIELD_LABELS } from '@/lib/types'

// ---------------------------------------------------------------------------
// Mock @react-pdf/renderer — replaces PDF primitives with simple objects
// so we can test the component tree without needing a real PDF renderer.
// ---------------------------------------------------------------------------

const mockToBlob = vi.fn().mockResolvedValue(new Blob(['pdf-content'], { type: 'application/pdf' }))
const mockPdf = vi.fn().mockReturnValue({ toBlob: mockToBlob })

vi.mock('@react-pdf/renderer', async () => {
  const React = await import('react')

  const createMockComponent = (displayName: string) => {
    const Component = ({ children, ...props }: { children?: React.ReactNode; [key: string]: unknown }) =>
      React.createElement(displayName, props, children)
    Component.displayName = displayName
    return Component
  }

  return {
    Document: createMockComponent('Document'),
    Page: createMockComponent('Page'),
    View: createMockComponent('View'),
    Text: createMockComponent('Text'),
    StyleSheet: {
      create: <T extends Record<string, unknown>>(styles: T): T => styles,
    },
    Font: {
      register: vi.fn(),
    },
    pdf: mockPdf,
  }
})

// ---------------------------------------------------------------------------
// Helpers to build test data
// ---------------------------------------------------------------------------

function makeField(
  status: 'complete' | 'partial' | 'missing',
  content = '',
  suggestion?: string
): { content: string; status: 'complete' | 'partial' | 'missing'; suggestion?: string } {
  const field: { content: string; status: 'complete' | 'partial' | 'missing'; suggestion?: string } = {
    content,
    status,
  }
  if (suggestion !== undefined) {
    field.suggestion = suggestion
  }
  return field
}

function makeCompleteBrief(overrides?: Partial<Brief>): Brief {
  return {
    title: 'Campanha de Marketing Digital',
    fields: {
      context: makeField('complete', 'Empresa XYZ lança novo produto em janeiro.'),
      objective: makeField('complete', 'Aumentar awareness em 30% no Q1.'),
      audience: makeField('complete', 'Jovens 18-35, classe AB, urbanos.'),
      message: makeField('complete', 'Inovação que transforma o dia a dia.'),
      tone: makeField('complete', 'Moderno, informal, inspirador.'),
      deliverables: makeField('complete', '3 vídeos, 10 posts, 1 landing page.'),
      budget: makeField('complete', 'R$ 150.000,00'),
      timeline: makeField('complete', 'Janeiro a Março 2025'),
      kpis: makeField('complete', 'Impressões, CTR, conversões no site.'),
      references: makeField('complete', 'Campanha Nike "Just Do It" 2024.'),
    },
    audit: {
      gaps: [],
      contradictions: [],
      overall_note: 'Brief completo e bem estruturado.',
    },
    score: 92,
    ...overrides,
  }
}

// ---------------------------------------------------------------------------
// Helper: recursively extract text content from React element tree
// ---------------------------------------------------------------------------

function findTextContent(element: unknown): string[] {
  const texts: string[] = []
  if (!element) return texts
  if (typeof element === 'string') {
    texts.push(element)
    return texts
  }
  if (typeof element === 'number') {
    texts.push(String(element))
    return texts
  }
  if (Array.isArray(element)) {
    for (const child of element) {
      texts.push(...findTextContent(child))
    }
    return texts
  }
  // React element — check if it's a functional component that needs invocation
  if (typeof element === 'object' && element !== null && 'props' in element) {
    const el = element as { type?: unknown; props?: { children?: unknown; [key: string]: unknown } }
    // If type is a function (mock component), invoke it to expand
    if (typeof el.type === 'function') {
      try {
        const rendered = (el.type as (props: Record<string, unknown>) => unknown)(el.props ?? {})
        texts.push(...findTextContent(rendered))
      } catch {
        // If invocation fails, just traverse props.children
      }
    }
    if (el.props) {
      if (el.props.children !== undefined) {
        texts.push(...findTextContent(el.props.children))
      }
    }
  }
  return texts
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('generateBriefPDF', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('retorna Blob', async () => {
    const { generateBriefPDF } = await import('@/lib/pdf')
    const brief = makeCompleteBrief()

    const result = await generateBriefPDF(brief)

    expect(result).toBeInstanceOf(Blob)
    expect(mockPdf).toHaveBeenCalled()
    expect(mockToBlob).toHaveBeenCalled()
  })

  it('inclui título no documento', async () => {
    const { BriefPDFDocument } = await import('@/lib/pdf')
    const brief = makeCompleteBrief({ title: 'Meu Brief Especial' })

    // Call the component function directly to get the rendered React element tree
    const tree = BriefPDFDocument({ brief })

    const texts = findTextContent(tree)
    const allText = texts.join(' ')
    expect(allText).toContain('Meu Brief Especial')
  })

  it('inclui todos os 10 campos', async () => {
    const { BriefPDFDocument } = await import('@/lib/pdf')
    const brief = makeCompleteBrief()

    // Call the component function directly to get the rendered React element tree
    const tree = BriefPDFDocument({ brief })

    const texts = findTextContent(tree)
    const allText = texts.join(' ')

    // Verify all 10 field labels appear in the document
    for (const fieldName of FIELD_NAMES) {
      const label = FIELD_LABELS[fieldName]['pt-BR']
      expect(allText).toContain(label)
    }

    // Also verify the field contents are present
    expect(allText).toContain('Empresa XYZ lança novo produto em janeiro.')
    expect(allText).toContain('Aumentar awareness em 30% no Q1.')
    expect(allText).toContain('Jovens 18-35, classe AB, urbanos.')
  })
})
