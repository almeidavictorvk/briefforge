import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import userEvent from '@testing-library/user-event'

// Mock CSS imports
vi.mock('@/styles/globals.css', () => ({}))

import { ClientField } from '@/components/client-field'
import type { FieldStatus } from '@/lib/types'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeField(overrides: Partial<{ content: string; status: FieldStatus; suggestion?: string }> = {}) {
  return {
    content: '',
    status: 'missing' as FieldStatus,
    suggestion: undefined,
    ...overrides,
  }
}

// ---------------------------------------------------------------------------
// Tests — ClientField Component
// ---------------------------------------------------------------------------

describe('ClientField', () => {
  let onSave: ReturnType<typeof vi.fn>

  beforeEach(() => {
    onSave = vi.fn().mockResolvedValue(undefined)
  })

  // Test 1: ClientField renderiza label simplificada
  it('renders simplified label instead of technical label', () => {
    const field = makeField({ status: 'missing' })

    render(
      <ClientField
        fieldName="budget"
        field={field}
        onSave={onSave}
      />
    )

    // Should show the simplified text, NOT the technical label "Orçamento"
    expect(
      screen.getByText(/Quanto sua empresa pode investir neste projeto/i)
    ).toBeInTheDocument()

    // Should NOT show the technical label
    expect(screen.queryByText('Orçamento')).not.toBeInTheDocument()
  })

  // Test 2: ClientField renderiza placeholder guiado
  it('renders a guided placeholder in the textarea for missing fields', () => {
    const field = makeField({ status: 'missing' })

    render(
      <ClientField
        fieldName="kpis"
        field={field}
        onSave={onSave}
      />
    )

    const textarea = screen.getByRole('textbox')
    expect(textarea).toBeInTheDocument()
    // The placeholder should be a guided, friendly text (not empty or generic)
    expect(textarea.getAttribute('placeholder')).toBeTruthy()
    expect(textarea.getAttribute('placeholder')!.length).toBeGreaterThan(5)
  })

  // Test 3: ClientField permite digitação
  it('allows typing in the textarea', async () => {
    const user = userEvent.setup()
    const field = makeField({ status: 'missing' })

    render(
      <ClientField
        fieldName="context"
        field={field}
        onSave={onSave}
      />
    )

    const textarea = screen.getByRole('textbox')
    await user.type(textarea, 'Minha empresa é do ramo de tecnologia')

    expect(textarea).toHaveValue('Minha empresa é do ramo de tecnologia')
  })

  // Test 4: ClientField exibe conteúdo existente (readonly) para campos complete
  it('shows content as readonly for complete fields without a textarea', () => {
    const field = makeField({
      content: 'Conteúdo completo do campo',
      status: 'complete',
    })

    render(
      <ClientField
        fieldName="context"
        field={field}
        onSave={onSave}
      />
    )

    // Content should be displayed
    expect(screen.getByText('Conteúdo completo do campo')).toBeInTheDocument()

    // No textarea should be rendered for complete fields
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
  })

  // Test 5: ClientField chama onSave ao submeter
  it('calls onSave with fieldName and content when clicking save', async () => {
    const user = userEvent.setup()
    const field = makeField({ status: 'missing' })

    render(
      <ClientField
        fieldName="budget"
        field={field}
        onSave={onSave}
      />
    )

    const textarea = screen.getByRole('textbox')
    await user.type(textarea, 'R$ 50.000 a R$ 80.000')

    const saveButton = screen.getByRole('button', { name: /salvar/i })
    await user.click(saveButton)

    expect(onSave).toHaveBeenCalledTimes(1)
    expect(onSave).toHaveBeenCalledWith('budget', 'R$ 50.000 a R$ 80.000')
  })

  // Test 6: ClientField mostra loading durante save
  it('shows a loading indicator while save is in progress', async () => {
    const user = userEvent.setup()
    let resolvePromise: () => void
    const pendingPromise = new Promise<void>((resolve) => {
      resolvePromise = resolve
    })
    const slowOnSave = vi.fn().mockReturnValue(pendingPromise)

    const field = makeField({ status: 'missing' })

    render(
      <ClientField
        fieldName="timeline"
        field={field}
        onSave={slowOnSave}
      />
    )

    const textarea = screen.getByRole('textbox')
    await user.type(textarea, 'Lançamento em março')

    const saveButton = screen.getByRole('button', { name: /salvar/i })
    await user.click(saveButton)

    // Loading indicator should appear
    await waitFor(() => {
      expect(screen.getByTestId('client-field-loading')).toBeInTheDocument()
    })

    // Resolve the promise to clean up
    resolvePromise!()
    await waitFor(() => {
      expect(screen.queryByTestId('client-field-loading')).not.toBeInTheDocument()
    })
  })
})
