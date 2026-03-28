import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

// Mock CSS imports
vi.mock('@/styles/globals.css', () => ({}))

import { AuditPanel } from '@/components/audit-panel'
import type { AuditResults } from '@/lib/types'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeAudit(overrides: Partial<AuditResults> = {}): AuditResults {
  return {
    gaps: [],
    contradictions: [],
    overall_note: '',
    ...overrides,
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('AuditPanel', () => {
  // Test 12: AuditPanel renderiza gaps
  it('renders gaps — both gaps appear in the panel', () => {
    const audit = makeAudit({
      gaps: [
        { field: 'budget', severity: 'critical', suggestion: 'Definir verba disponível' },
        { field: 'timeline', severity: 'warning', suggestion: 'Especificar datas' },
      ],
    })

    render(<AuditPanel audit={audit} />)

    // Both gap suggestions should be visible
    expect(screen.getByText('Definir verba disponível')).toBeInTheDocument()
    expect(screen.getByText('Especificar datas')).toBeInTheDocument()

    // Both field names should be visible
    expect(screen.getByText(/budget/i)).toBeInTheDocument()
    expect(screen.getByText(/timeline/i)).toBeInTheDocument()
  })

  // Test 13: AuditPanel renderiza gaps com severity correta
  it('renders gaps with correct severity — critical has different visual indicator than warning', () => {
    const audit = makeAudit({
      gaps: [
        { field: 'budget', severity: 'critical', suggestion: 'Definir verba' },
        { field: 'timeline', severity: 'warning', suggestion: 'Especificar prazo' },
      ],
    })

    render(<AuditPanel audit={audit} />)

    // Find gap items by their suggestion text and check severity indicators
    const criticalSuggestion = screen.getByText('Definir verba')
    const warningSuggestion = screen.getByText('Especificar prazo')

    // The critical gap's container should have a red/error visual indicator
    const criticalItem = criticalSuggestion.closest('[data-severity]') || criticalSuggestion.closest('li') || criticalSuggestion.parentElement!
    const warningItem = warningSuggestion.closest('[data-severity]') || warningSuggestion.closest('li') || warningSuggestion.parentElement!

    // They should have visually distinct indicators. Check that the critical item
    // contains an element with red/error styling and warning contains yellow/warning.
    const criticalHTML = criticalItem.innerHTML
    const warningHTML = warningItem.innerHTML

    // Critical should include error/red indicator
    expect(criticalHTML).toMatch(/text-error|bg-error|border-error/)
    // Warning should include warning/yellow indicator
    expect(warningHTML).toMatch(/text-warning|bg-warning|border-warning/)
  })

  // Test 14: AuditPanel renderiza contradictions
  it('renders contradictions — description and involved fields appear', () => {
    const audit = makeAudit({
      contradictions: [
        {
          description: 'Orçamento baixo contradiz entregáveis extensos',
          fields: ['budget', 'deliverables'],
        },
      ],
    })

    render(<AuditPanel audit={audit} />)

    // Description should be visible
    expect(
      screen.getByText('Orçamento baixo contradiz entregáveis extensos')
    ).toBeInTheDocument()

    // Involved fields should be listed
    expect(screen.getByText(/budget/i)).toBeInTheDocument()
    expect(screen.getByText(/deliverables/i)).toBeInTheDocument()
  })

  // Test 15: AuditPanel renderiza nota geral
  it('renders overall_note — the AI evaluation text is visible', () => {
    const audit = makeAudit({
      overall_note: 'Brief bem estruturado, mas falta definição de orçamento.',
    })

    render(<AuditPanel audit={audit} />)

    expect(
      screen.getByText('Brief bem estruturado, mas falta definição de orçamento.')
    ).toBeInTheDocument()
  })

  // Test 16: AuditPanel renderiza estado vazio
  it('renders empty state — positive message when no gaps or contradictions', () => {
    const audit = makeAudit({
      gaps: [],
      contradictions: [],
      overall_note: 'Tudo certo!',
    })

    render(<AuditPanel audit={audit} />)

    // Should show a positive message indicating no gaps were found
    expect(screen.getByText(/nenhuma lacuna/i)).toBeInTheDocument()
  })
})
