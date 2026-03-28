import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

// Mock CSS imports
vi.mock('@/styles/globals.css', () => ({}))

// Framer-motion specific props to filter out when rendering plain HTML elements
const framerProps = new Set([
  'animate', 'initial', 'exit', 'transition', 'variants',
  'whileHover', 'whileTap', 'whileInView', 'layout', 'layoutId',
])

function isFramerProp(key: string): boolean {
  return framerProps.has(key) || key.startsWith('animate') || key.startsWith('transition')
}

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => {
  // Create a proxy that returns a simple HTML element factory for any motion.* access
  const motion = new Proxy(
    {},
    {
      get: (_target, prop: string) => {
        const MotionComponent = React.forwardRef(
          function MotionProxy(props: Record<string, unknown>, ref: React.Ref<unknown>) {
            const filteredProps: Record<string, unknown> = {}
            for (const [key, value] of Object.entries(props)) {
              if (!isFramerProp(key)) {
                filteredProps[key] = value
              }
            }
            return React.createElement(prop, { ...filteredProps, ref })
          }
        )
        MotionComponent.displayName = `motion.${prop}`
        return MotionComponent
      },
    }
  )

  return {
    motion,
    useMotionValue: (initial: number) => ({
      get: () => initial,
      set: () => {},
      on: () => () => {},
    }),
    useSpring: (value: unknown) => value,
    useTransform: (_value: unknown, _input: unknown, output: number[]) => ({
      get: () => (output ? output[output.length - 1] : 0),
      set: () => {},
      on: () => () => {},
    }),
    AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
  }
})

// Mock scoring module (being developed in parallel)
vi.mock('@/lib/scoring', () => ({
  getScoreColor: (score: number): 'success' | 'warning' | 'error' => {
    if (score >= 70) return 'success'
    if (score >= 40) return 'warning'
    return 'error'
  },
  getScoreLabel: (score: number): string => {
    if (score >= 80) return 'Excelente'
    if (score >= 60) return 'Bom'
    if (score >= 40) return 'Regular'
    return 'Fraco'
  },
}))

import { ScoreDisplay } from '@/components/score-display'

describe('ScoreDisplay', () => {
  it('renders the score number', () => {
    render(<ScoreDisplay score={87} animate={false} />)
    expect(screen.getByText('87')).toBeInTheDocument()
  })

  it('applies correct color based on score', () => {
    // High score (>=70) should get success color
    const { unmount } = render(<ScoreDisplay score={85} animate={false} />)
    const successElement = screen.getByText('85')
    // The score number span or its parent should have the text-success class
    const hasSuccessClass =
      successElement.className.includes('text-success') ||
      successElement.parentElement?.className.includes('text-success') ||
      false
    expect(hasSuccessClass).toBe(true)
    unmount()

    // Low score (<40) should get error color
    render(<ScoreDisplay score={30} animate={false} />)
    const errorElement = screen.getByText('30')
    const hasErrorClass =
      errorElement.className.includes('text-error') ||
      errorElement.parentElement?.className.includes('text-error') ||
      false
    expect(hasErrorClass).toBe(true)
  })

  it('shows the label text', () => {
    render(<ScoreDisplay score={85} animate={false} />)
    expect(screen.getByText('Excelente')).toBeInTheDocument()
  })

  it('uses mono font for the score number', () => {
    render(<ScoreDisplay score={75} animate={false} />)
    const scoreElement = screen.getByText('75')
    expect(scoreElement.className).toMatch(/font-mono/)
  })
})
