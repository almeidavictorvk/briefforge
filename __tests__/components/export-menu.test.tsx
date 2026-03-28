import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock CSS imports
vi.mock('@/styles/globals.css', () => ({}))

// Hoisted mocks — these can be referenced in vi.mock factories
const { mockGenerateBriefPDF, mockGenerateBriefMarkdown } = vi.hoisted(() => ({
  mockGenerateBriefPDF: vi.fn(),
  mockGenerateBriefMarkdown: vi.fn(),
}))

vi.mock('@/lib/pdf', () => ({
  generateBriefPDF: mockGenerateBriefPDF,
}))

vi.mock('@/lib/markdown', () => ({
  generateBriefMarkdown: mockGenerateBriefMarkdown,
}))

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
  Toaster: () => null,
}))

import { ExportMenu } from '@/components/export-menu'
import type { Brief } from '@/lib/types'
import type { FieldName } from '@/lib/types'

// ---------------------------------------------------------------------------
// Test data
// ---------------------------------------------------------------------------

const FIELD_NAMES: FieldName[] = [
  'context', 'objective', 'audience', 'message', 'tone',
  'deliverables', 'budget', 'timeline', 'kpis', 'references',
]

function makeMockBrief(): Brief {
  const fields = {} as Brief['fields']
  for (const name of FIELD_NAMES) {
    fields[name] = {
      content: `Content for ${name}`,
      status: 'complete' as const,
    }
  }

  return {
    title: 'Test Brief',
    score: 85,
    fields,
    audit: {
      gaps: [],
      contradictions: [],
      overall_note: 'Good brief.',
    },
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ExportMenu', () => {
  let mockBrief: Brief

  beforeEach(() => {
    mockBrief = makeMockBrief()

    // Reset and re-configure mock implementations
    mockGenerateBriefPDF.mockReset()
    mockGenerateBriefMarkdown.mockReset()
    mockGenerateBriefPDF.mockResolvedValue(new Blob(['test'], { type: 'application/pdf' }))
    mockGenerateBriefMarkdown.mockReturnValue('# Test Markdown\n\nBrief content here')
  })

  it('renderiza botão de exportar', () => {
    render(<ExportMenu brief={mockBrief} />)

    const trigger = screen.getByRole('button', { name: /exportar/i })
    expect(trigger).toBeInTheDocument()
  })

  it('abre dropdown com opções PDF e Markdown', async () => {
    const user = userEvent.setup()

    render(<ExportMenu brief={mockBrief} />)

    const trigger = screen.getByRole('button', { name: /exportar/i })
    await user.click(trigger)

    await waitFor(() => {
      expect(screen.getByText(/pdf/i)).toBeInTheDocument()
      expect(screen.getByText(/markdown/i)).toBeInTheDocument()
    })
  })

  it('chama geração de PDF ao selecionar', async () => {
    const onExportPDF = vi.fn()
    const user = userEvent.setup()

    render(<ExportMenu brief={mockBrief} onExportPDF={onExportPDF} />)

    const trigger = screen.getByRole('button', { name: /exportar/i })
    await user.click(trigger)

    await waitFor(() => {
      expect(screen.getByText(/pdf/i)).toBeInTheDocument()
    })

    const pdfOption = screen.getByText(/pdf/i)
    await user.click(pdfOption)

    await waitFor(() => {
      expect(onExportPDF).toHaveBeenCalledTimes(1)
    })
  })

  it('chama geração de Markdown ao selecionar', async () => {
    const onExportMarkdown = vi.fn()
    const user = userEvent.setup()

    render(<ExportMenu brief={mockBrief} onExportMarkdown={onExportMarkdown} />)

    const trigger = screen.getByRole('button', { name: /exportar/i })
    await user.click(trigger)

    await waitFor(() => {
      expect(screen.getByText(/markdown/i)).toBeInTheDocument()
    })

    const markdownOption = screen.getByText(/markdown/i)
    await user.click(markdownOption)

    await waitFor(() => {
      expect(onExportMarkdown).toHaveBeenCalledTimes(1)
    })
  })

  it('copia markdown para clipboard ao selecionar Markdown', async () => {
    // IMPORTANT: userEvent.setup() overrides navigator.clipboard, so the
    // clipboard mock MUST be set AFTER userEvent.setup() is called.
    const user = userEvent.setup()

    const mockWriteText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: mockWriteText },
      writable: true,
      configurable: true,
    })

    render(<ExportMenu brief={mockBrief} />)

    const trigger = screen.getByRole('button', { name: /exportar/i })
    await user.click(trigger)

    await waitFor(() => {
      expect(screen.getByText(/markdown/i)).toBeInTheDocument()
    })

    const markdownOption = screen.getByText(/markdown/i)
    await user.click(markdownOption)

    await waitFor(() => {
      expect(mockGenerateBriefMarkdown).toHaveBeenCalledWith(mockBrief)
      expect(mockWriteText).toHaveBeenCalledWith('# Test Markdown\n\nBrief content here')
    })
  })
})
