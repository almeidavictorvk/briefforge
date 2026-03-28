import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import userEvent from '@testing-library/user-event'

// Mock CSS imports
vi.mock('@/styles/globals.css', () => ({}))

import { BriefInput } from '@/components/brief-input'

describe('BriefInput', () => {
  let onSubmit: ReturnType<typeof vi.fn>

  beforeEach(() => {
    onSubmit = vi.fn()
  })

  it('renderiza textarea', () => {
    render(<BriefInput onSubmit={onSubmit} />)
    const textarea = screen.getByRole('textbox')
    expect(textarea).toBeInTheDocument()
    expect(textarea.tagName).toBe('TEXTAREA')
  })

  it('exibe placeholder', () => {
    render(<BriefInput onSubmit={onSubmit} />)
    const textarea = screen.getByPlaceholderText(
      'Cole aqui a transcrição, email, mensagem de WhatsApp, notas de reunião...'
    )
    expect(textarea).toBeInTheDocument()
  })

  it('atualiza valor ao digitar', async () => {
    const user = userEvent.setup()
    render(<BriefInput onSubmit={onSubmit} />)
    const textarea = screen.getByRole('textbox')

    await user.type(textarea, 'Texto de teste para o brief')
    expect(textarea).toHaveValue('Texto de teste para o brief')
  })

  it('mostra contador de caracteres', async () => {
    const user = userEvent.setup()
    render(<BriefInput onSubmit={onSubmit} />)
    const textarea = screen.getByRole('textbox')

    await user.type(textarea, 'Hello World')
    // Should display the character count (11 chars)
    expect(screen.getByText(/11/)).toBeInTheDocument()
  })

  it('chama onSubmit com o texto', async () => {
    const user = userEvent.setup()
    render(<BriefInput onSubmit={onSubmit} />)
    const textarea = screen.getByRole('textbox')

    await user.type(textarea, 'Texto com mais de dez caracteres para submeter')
    const submitButton = screen.getByRole('button', { name: /forjar brief/i })
    await user.click(submitButton)

    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(onSubmit).toHaveBeenCalledWith('Texto com mais de dez caracteres para submeter')
  })

  it('desabilita submit com menos de 10 chars', async () => {
    const user = userEvent.setup()
    render(<BriefInput onSubmit={onSubmit} />)
    const textarea = screen.getByRole('textbox')

    await user.type(textarea, 'Short')
    const submitButton = screen.getByRole('button', { name: /forjar brief/i })
    expect(submitButton).toBeDisabled()
  })

  it('habilita submit com 10+ chars', async () => {
    const user = userEvent.setup()
    render(<BriefInput onSubmit={onSubmit} />)
    const textarea = screen.getByRole('textbox')

    await user.type(textarea, 'Texto longo o suficiente')
    const submitButton = screen.getByRole('button', { name: /forjar brief/i })
    expect(submitButton).not.toBeDisabled()
  })

  it('mostra loading state', () => {
    render(<BriefInput onSubmit={onSubmit} isLoading={true} />)
    const submitButton = screen.getByRole('button', { name: /forjar|gerando/i })
    // Button should be disabled during loading
    expect(submitButton).toBeDisabled()
    // Should have a loading indicator (spinner icon with animate-spin class)
    const spinner = submitButton.querySelector('.animate-spin')
    expect(spinner).toBeInTheDocument()
  })
})
