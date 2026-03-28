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

describe('BriefCard', () => {
  const defaultProps = {
    id: 'abc-123',
    title: 'Campanha X',
    score: 85,
    status: 'draft' as const,
    createdAt: new Date().toISOString(),
  }

  it('renderiza titulo', () => {
    render(<BriefCard {...defaultProps} title="Campanha X" />)
    expect(screen.getByText('Campanha X')).toBeInTheDocument()
  })

  it('renderiza score com cor correta', () => {
    render(<BriefCard {...defaultProps} score={85} />)
    const scoreElement = screen.getByText('85')
    expect(scoreElement).toBeInTheDocument()
    // Score >= 70 should have text-success class
    const hasSuccessClass =
      scoreElement.className.includes('text-success') ||
      scoreElement.parentElement?.className.includes('text-success') ||
      false
    expect(hasSuccessClass).toBe(true)
  })

  it('renderiza data relativa', () => {
    // Create a date 5 minutes ago
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
    render(<BriefCard {...defaultProps} createdAt={fiveMinutesAgo} />)
    expect(screen.getByText('5min atras')).toBeInTheDocument()
  })

  it('renderiza status badge', () => {
    render(<BriefCard {...defaultProps} status="shared" />)
    expect(screen.getByText('Compartilhado')).toBeInTheDocument()
  })

  it('e clicavel e navega para /brief/[id]', () => {
    render(<BriefCard {...defaultProps} id="abc-123" />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/brief/abc-123')
  })
})
