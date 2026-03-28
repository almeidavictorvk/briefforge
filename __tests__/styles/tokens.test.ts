import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const css = readFileSync(resolve(__dirname, '../../styles/globals.css'), 'utf-8')

describe('Design Tokens', () => {
  it('dark tokens are defined in .dark selector', () => {
    // Find the .dark block that contains --bf-bg
    // The CSS should have a .dark { ... } block with ALL BF tokens
    const darkMatch = css.match(/\.dark\s*\{[^}]*--bf-bg[^}]*\}/s)
    expect(darkMatch).not.toBeNull()

    const darkBlock = darkMatch![0]
    expect(darkBlock).toContain('--bf-bg: #0A0A0A')
    expect(darkBlock).toContain('--bf-surface: #141414')
    expect(darkBlock).toContain('--bf-surface-hover: #1E1E1E')
    expect(darkBlock).toContain('--bf-border: #2A2A2A')
    expect(darkBlock).toContain('--bf-text: #F5F5F0')
    expect(darkBlock).toContain('--bf-text-secondary: #A8A49E')
    expect(darkBlock).toContain('--bf-text-muted: #706C66')
    expect(darkBlock).toContain('--bf-accent: #E8553A')
    expect(darkBlock).toContain('--bf-success: #22C55E')
    expect(darkBlock).toContain('--bf-warning: #EAB308')
    expect(darkBlock).toContain('--bf-error: #EF4444')
  })

  it('light tokens are defined in :root selector', () => {
    // The :root block should have LIGHT mode BF tokens
    const rootMatch = css.match(/:root\s*\{[^}]*--bf-bg[^}]*\}/s)
    expect(rootMatch).not.toBeNull()

    const rootBlock = rootMatch![0]
    expect(rootBlock).toContain('--bf-bg: #FAFAF7')
    expect(rootBlock).toContain('--bf-surface: #FFFFFF')
    expect(rootBlock).toContain('--bf-surface-hover: #F5F5F0')
    expect(rootBlock).toContain('--bf-border: #E8E6E1')
    expect(rootBlock).toContain('--bf-text: #1A1A1A')
    expect(rootBlock).toContain('--bf-text-secondary: #6B6560')
    expect(rootBlock).toContain('--bf-text-muted: #9B9590')
    expect(rootBlock).toContain('--bf-accent: #E8553A')
    expect(rootBlock).toContain('--bf-success: #16A34A')
    expect(rootBlock).toContain('--bf-warning: #CA8A04')
    expect(rootBlock).toContain('--bf-error: #DC2626')
  })

  it('accent color is consistent between themes', () => {
    const rootMatch = css.match(/:root\s*\{[^}]*--bf-accent[^}]*\}/s)
    const darkMatch = css.match(/\.dark\s*\{[^}]*--bf-accent[^}]*\}/s)

    expect(rootMatch).not.toBeNull()
    expect(darkMatch).not.toBeNull()

    // Extract accent values
    const rootAccent = rootMatch![0].match(/--bf-accent:\s*([^;]+)/)?.[1]?.trim()
    const darkAccent = darkMatch![0].match(/--bf-accent:\s*([^;]+)/)?.[1]?.trim()

    expect(rootAccent).toBe('#E8553A')
    expect(darkAccent).toBe('#E8553A')
  })
})
