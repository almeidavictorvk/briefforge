import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock CSS imports
vi.mock('@/styles/globals.css', () => ({}))

import { Header } from '@/components/header'

describe('Header', () => {
  beforeEach(() => {
    document.documentElement.className = 'dark'
    localStorage.clear()
  })

  it('renders logo "BriefForge"', () => {
    render(<Header />)
    expect(screen.getByText('BriefForge')).toBeInTheDocument()
  })

  it('contains link to /history', () => {
    render(<Header />)
    const link = screen.getByRole('link', { name: /histórico|history/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/history')
  })

  it('contains ThemeToggle', () => {
    render(<Header />)
    const themeButton = screen.getByRole('button', { name: /tema|theme/i })
    expect(themeButton).toBeInTheDocument()
  })

  it('is responsive - essential elements accessible', () => {
    render(<Header />)
    // On any viewport, the logo and theme toggle should be visible
    const logo = screen.getByText('BriefForge')
    const themeToggle = screen.getByRole('button', { name: /tema|theme/i })
    expect(logo).toBeVisible()
    expect(themeToggle).toBeVisible()
  })
})
