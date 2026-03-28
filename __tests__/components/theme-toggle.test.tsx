import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock CSS imports
vi.mock('@/styles/globals.css', () => ({}))

import { ThemeToggle } from '@/components/theme-toggle'

describe('ThemeToggle', () => {
  beforeEach(() => {
    // Reset DOM and localStorage before each test
    document.documentElement.className = 'dark'
    localStorage.clear()
  })

  it('renders', () => {
    render(<ThemeToggle />)
    const button = screen.getByRole('button', { name: /tema|theme/i })
    expect(button).toBeInTheDocument()
  })

  it('toggles from dark to light', () => {
    document.documentElement.classList.add('dark')
    render(<ThemeToggle />)

    const button = screen.getByRole('button', { name: /tema|theme/i })
    fireEvent.click(button)

    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('toggles from light to dark', () => {
    document.documentElement.classList.remove('dark')
    render(<ThemeToggle />)

    const button = screen.getByRole('button', { name: /tema|theme/i })
    fireEvent.click(button)

    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('persists theme to localStorage', () => {
    document.documentElement.classList.add('dark')
    render(<ThemeToggle />)

    const button = screen.getByRole('button', { name: /tema|theme/i })
    fireEvent.click(button) // dark -> light

    expect(localStorage.getItem('briefforge-theme')).toBe('light')
  })

  it('initializes from localStorage', () => {
    localStorage.setItem('briefforge-theme', 'light')
    document.documentElement.classList.add('dark') // Start with dark in DOM

    render(<ThemeToggle />)

    // Component should sync DOM to localStorage value
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })
})
