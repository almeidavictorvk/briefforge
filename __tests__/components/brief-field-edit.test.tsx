import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import userEvent from '@testing-library/user-event'

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
// Tests — BriefField Edit Mode
// ---------------------------------------------------------------------------

describe('BriefField — Edit Mode', () => {
  let onSave: ReturnType<typeof vi.fn>

  beforeEach(() => {
    onSave = vi.fn().mockResolvedValue(undefined)
  })

  // Test 1: BriefField entra em modo edição ao clicar editar
  it('enters edit mode when clicking the edit button', async () => {
    const user = userEvent.setup()
    const field = makeField({ content: 'Conteúdo original' })

    render(
      <BriefField
        label="Contexto"
        field={field}
        editable
        fieldName="context"
        onSave={onSave}
      />
    )

    // Initially, no textarea should be visible
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()

    // Click the edit button
    const editButton = screen.getByRole('button', { name: /editar/i })
    await user.click(editButton)

    // Textarea should now be visible
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  // Test 2: BriefField exibe conteúdo atual na textarea ao editar
  it('shows current content in the textarea when editing', async () => {
    const user = userEvent.setup()
    const field = makeField({ content: 'texto X' })

    render(
      <BriefField
        label="Contexto"
        field={field}
        editable
        fieldName="context"
        onSave={onSave}
      />
    )

    const editButton = screen.getByRole('button', { name: /editar/i })
    await user.click(editButton)

    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveValue('texto X')
  })

  // Test 3: BriefField permite editar e atualizar valor
  it('allows editing and updating the value in the textarea', async () => {
    const user = userEvent.setup()
    const field = makeField({ content: 'texto original' })

    render(
      <BriefField
        label="Contexto"
        field={field}
        editable
        fieldName="context"
        onSave={onSave}
      />
    )

    const editButton = screen.getByRole('button', { name: /editar/i })
    await user.click(editButton)

    const textarea = screen.getByRole('textbox')
    await user.clear(textarea)
    await user.type(textarea, 'novo texto editado')

    expect(textarea).toHaveValue('novo texto editado')
  })

  // Test 4: BriefField salva ao clicar "Salvar" e invoca callback
  it('calls onSave with field name and new content when clicking save', async () => {
    const user = userEvent.setup()
    const field = makeField({ content: 'texto original' })

    render(
      <BriefField
        label="Contexto"
        field={field}
        editable
        fieldName="context"
        onSave={onSave}
      />
    )

    const editButton = screen.getByRole('button', { name: /editar/i })
    await user.click(editButton)

    const textarea = screen.getByRole('textbox')
    await user.clear(textarea)
    await user.type(textarea, 'conteúdo atualizado')

    const saveButton = screen.getByRole('button', { name: /salvar/i })
    await user.click(saveButton)

    expect(onSave).toHaveBeenCalledTimes(1)
    expect(onSave).toHaveBeenCalledWith({
      field: 'context',
      content: 'conteúdo atualizado',
    })
  })

  // Test 5: BriefField cancela e restaura conteúdo original
  it('cancels editing and restores original content', async () => {
    const user = userEvent.setup()
    const field = makeField({ content: 'texto original' })

    render(
      <BriefField
        label="Contexto"
        field={field}
        editable
        fieldName="context"
        onSave={onSave}
      />
    )

    const editButton = screen.getByRole('button', { name: /editar/i })
    await user.click(editButton)

    const textarea = screen.getByRole('textbox')
    await user.clear(textarea)
    await user.type(textarea, 'texto modificado que será descartado')

    const cancelButton = screen.getByRole('button', { name: /cancelar/i })
    await user.click(cancelButton)

    // Should exit edit mode
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()

    // Should show original content
    expect(screen.getByText('texto original')).toBeInTheDocument()
  })

  // Test 6: BriefField mostra indicador de loading durante save
  it('shows a loading indicator while saving', async () => {
    const user = userEvent.setup()
    // Create a promise that won't resolve immediately
    let resolvePromise: () => void
    const pendingPromise = new Promise<void>((resolve) => {
      resolvePromise = resolve
    })
    const slowOnSave = vi.fn().mockReturnValue(pendingPromise)

    const field = makeField({ content: 'texto para salvar' })

    render(
      <BriefField
        label="Contexto"
        field={field}
        editable
        fieldName="context"
        onSave={slowOnSave}
      />
    )

    const editButton = screen.getByRole('button', { name: /editar/i })
    await user.click(editButton)

    const saveButton = screen.getByRole('button', { name: /salvar/i })
    await user.click(saveButton)

    // Loading indicator should appear (the save button should show loading state)
    await waitFor(() => {
      expect(screen.getByTestId('save-loading')).toBeInTheDocument()
    })

    // Resolve the promise to clean up
    resolvePromise!()
    await waitFor(() => {
      expect(screen.queryByTestId('save-loading')).not.toBeInTheDocument()
    })
  })

  // Test 7: BriefField campo missing exibe textarea vazia com placeholder
  it('shows empty textarea with placeholder for missing fields', async () => {
    const user = userEvent.setup()
    const field = makeField({ content: '', status: 'missing' })

    render(
      <BriefField
        label="Orçamento"
        field={field}
        editable
        fieldName="budget"
        onSave={onSave}
      />
    )

    const editButton = screen.getByRole('button', { name: /editar/i })
    await user.click(editButton)

    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveValue('')
    expect(textarea).toHaveAttribute('placeholder', 'Preencha este campo...')
  })
})
