import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

// Mock CSS imports
vi.mock('@/styles/globals.css', () => ({}))

// Mock scoring module
vi.mock('@/lib/scoring', () => ({
  getScoreColor: (score: number): 'success' | 'warning' | 'error' => {
    if (score >= 70) return 'success'
    if (score >= 40) return 'warning'
    return 'error'
  },
}))

// Mock next/link to render a plain anchor
vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string
    children: React.ReactNode
    [key: string]: unknown
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

import { BriefCard } from '@/components/brief-card'

describe('BriefCard (expanded)', () => {
  const defaultProps = {
    id: 'test-id-456',
    title: 'Campanha Verão 2026',
    score: 75,
    status: 'draft' as const,
    createdAt: new Date().toISOString(),
  }

  it('renderiza score bar', () => {
    render(<BriefCard {...defaultProps} score={75} />)
    const scoreBar = screen.getByTestId('score-bar')
    expect(scoreBar).toBeInTheDocument()
    // The inner fill should have width proportional to score
    const fill = scoreBar.firstElementChild as HTMLElement
    expect(fill).toBeTruthy()
    expect(fill.style.width).toBe('75%')
  })

  it('renderiza status "Rascunho"', () => {
    render(<BriefCard {...defaultProps} status="draft" />)
    expect(screen.getByText('Rascunho')).toBeInTheDocument()
  })

  it('renderiza status "Compartilhado"', () => {
    render(<BriefCard {...defaultProps} status="shared" />)
    expect(screen.getByText('Compartilhado')).toBeInTheDocument()
  })

  it('renderiza status "Completo"', () => {
    render(<BriefCard {...defaultProps} status="complete" />)
    expect(screen.getByText('Completo')).toBeInTheDocument()
  })

  it('mostra progresso do cliente', () => {
    render(
      <BriefCard
        {...defaultProps}
        status="shared"
        clientInputs={{ objective: 'Vender mais', budget: 'R$ 50k' }}
        pendingFieldCount={3}
      />
    )
    expect(screen.getByText(/Cliente:\s*2\/3/)).toBeInTheDocument()
  })

  it('renderiza data relativa', () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    render(<BriefCard {...defaultProps} createdAt={twoHoursAgo} />)
    expect(screen.getByText('2h atras')).toBeInTheDocument()
  })

  it('navega ao clicar', () => {
    render(<BriefCard {...defaultProps} id="test-id-456" />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/brief/test-id-456')
  })
})
