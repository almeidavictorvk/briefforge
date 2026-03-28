import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

// Mock CSS imports
vi.mock('@/styles/globals.css', () => ({}))

import { FieldStatusBadge } from '@/components/field-status-badge'

describe('FieldStatusBadge', () => {
  it('renders complete variant with text "Completo" and success color', () => {
    render(<FieldStatusBadge status="complete" />)

    const badge = screen.getByText('Completo')
    expect(badge).toBeInTheDocument()

    // Badge or its container should have success-related styling
    const badgeEl = badge.closest('[class]')!
    expect(badgeEl.className).toMatch(/bg-success/)
    expect(badgeEl.className).toMatch(/text-success/)
  })

  it('renders partial variant with text "Parcial" and warning color', () => {
    render(<FieldStatusBadge status="partial" />)

    const badge = screen.getByText('Parcial')
    expect(badge).toBeInTheDocument()

    const badgeEl = badge.closest('[class]')!
    expect(badgeEl.className).toMatch(/bg-warning/)
    expect(badgeEl.className).toMatch(/text-warning/)
  })

  it('renders missing variant with text "Ausente" and error color with pulse animation', () => {
    render(<FieldStatusBadge status="missing" />)

    const badge = screen.getByText('Ausente')
    expect(badge).toBeInTheDocument()

    const badgeEl = badge.closest('[class]')!
    expect(badgeEl.className).toMatch(/bg-error/)
    expect(badgeEl.className).toMatch(/text-error/)
    expect(badgeEl.className).toMatch(/animate-pulse/)
  })

  it('renders pill-shaped badges with rounded-full', () => {
    render(<FieldStatusBadge status="complete" />)

    const badge = screen.getByText('Completo').closest('[class]')!
    expect(badge.className).toMatch(/rounded-full/)
  })

  it('renders with small text size', () => {
    render(<FieldStatusBadge status="complete" />)

    const badge = screen.getByText('Completo').closest('[class]')!
    expect(badge.className).toMatch(/text-xs/)
    expect(badge.className).toMatch(/font-medium/)
  })
})
