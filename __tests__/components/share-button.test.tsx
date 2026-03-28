import React from 'react'
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock CSS imports
vi.mock('@/styles/globals.css', () => ({}))

import { ShareButton } from '@/components/share-button'

describe('ShareButton', () => {
  let mockOnShare: ReturnType<typeof vi.fn>
  let mockWriteText: ReturnType<typeof vi.fn>

  beforeEach(() => {
    mockOnShare = vi.fn().mockResolvedValue(undefined)
    mockWriteText = vi.fn().mockResolvedValue(undefined)

    // Mock clipboard API using defineProperty since clipboard is readonly
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: mockWriteText,
      },
      writable: true,
      configurable: true,
    })

    // Mock window.location.origin
    Object.defineProperty(window, 'location', {
      value: { origin: 'https://briefforge.app' },
      writable: true,
      configurable: true,
    })
  })

  it('renderiza botao de compartilhar', () => {
    render(
      <ShareButton briefId="abc-123" onShare={mockOnShare} />
    )
    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
    expect(button).toHaveTextContent(/compartilhar/i)
  })

  it('gera link correto ao clicar', async () => {
    render(
      <ShareButton briefId="abc-123" onShare={mockOnShare} />
    )

    const button = screen.getByRole('button')
    await act(async () => {
      fireEvent.click(button)
    })

    await waitFor(() => {
      expect(mockWriteText).toHaveBeenCalledWith(
        'https://briefforge.app/share/abc-123'
      )
    })
  })

  it('copia link para clipboard', async () => {
    render(
      <ShareButton briefId="test-brief-456" onShare={mockOnShare} />
    )

    const button = screen.getByRole('button')
    await act(async () => {
      fireEvent.click(button)
    })

    await waitFor(() => {
      expect(mockWriteText).toHaveBeenCalledTimes(1)
      expect(mockWriteText).toHaveBeenCalledWith(
        'https://briefforge.app/share/test-brief-456'
      )
    })
  })

  it('mostra feedback "copiado" apos clicar', async () => {
    render(
      <ShareButton briefId="abc-123" onShare={mockOnShare} />
    )

    const button = screen.getByRole('button')
    await act(async () => {
      fireEvent.click(button)
    })

    await waitFor(() => {
      expect(screen.getByText(/link copiado/i)).toBeInTheDocument()
    })
  })

  it('desabilita se brief nao salvo (briefId undefined)', () => {
    render(
      <ShareButton onShare={mockOnShare} />
    )
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
  })
})
