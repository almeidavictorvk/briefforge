import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

// Mock CSS imports
vi.mock('@/styles/globals.css', () => ({}))

import { BriefField } from '@/components/brief-field'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeField(overrides: Partial<{ content: string; status: 'complete' | 'partial' | 'missing'; suggestion?: string }> = {}) {
  return {
    content: 'Default content',
    status: 'complete' as const,
    suggestion: undefined,
    ...overrides,
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('BriefField', () => {
  // Test 4: BriefField renderiza label e conteúdo
  it('renders label and content — both label and content text are visible in the DOM', () => {
    const field = makeField({ content: 'texto do contexto' })

    render(<BriefField label="Contexto" field={field} />)

    expect(screen.getByText('Contexto')).toBeInTheDocument()
    expect(screen.getByText('texto do contexto')).toBeInTheDocument()
  })

  // Test 5: BriefField renderiza status badge
  it('renders status badge — complete field shows badge with text "Completo"', () => {
    const field = makeField({ status: 'complete' })

    render(<BriefField label="Objetivo" field={field} />)

    expect(screen.getByText('Completo')).toBeInTheDocument()
  })

  // Test 6: BriefField renderiza suggestion quando partial
  it('renders suggestion when partial — partial field with suggestion displays the suggestion text', () => {
    const field = makeField({
      content: 'Objetivo parcial',
      status: 'partial',
      suggestion: 'Adicione métricas SMART ao objetivo',
    })

    render(<BriefField label="Objetivo" field={field} />)

    expect(screen.getByText('Adicione métricas SMART ao objetivo')).toBeInTheDocument()
  })

  // Test 7: BriefField não renderiza suggestion quando complete
  it('does NOT render suggestion when complete — complete field should NOT display suggestion text', () => {
    const field = makeField({
      content: 'Objetivo completo e detalhado',
      status: 'complete',
      suggestion: 'Esta sugestão não deve aparecer',
    })

    render(<BriefField label="Objetivo" field={field} />)

    expect(screen.queryByText('Esta sugestão não deve aparecer')).not.toBeInTheDocument()
  })

  // Test 8: BriefField renderiza estado missing
  it('renders missing state — missing field shows placeholder text and different visual', () => {
    const field = makeField({
      content: '',
      status: 'missing',
    })

    render(<BriefField label="Orçamento" field={field} />)

    // Should show the label
    expect(screen.getByText('Orçamento')).toBeInTheDocument()

    // Should show the missing badge
    expect(screen.getByText('Ausente')).toBeInTheDocument()

    // Should show a placeholder message instead of content
    expect(screen.getByText(/informação não fornecida/i)).toBeInTheDocument()
  })
})
