import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

// Mock CSS imports
vi.mock('@/styles/globals.css', () => ({}))

// Mock framer-motion
vi.mock('framer-motion', () => {
  const motion = new Proxy(
    {},
    {
      get: (_target, prop: string) => {
        const MotionComponent = React.forwardRef(
          function MotionProxy(props: Record<string, unknown>, ref: React.Ref<unknown>) {
            const framerProps = new Set([
              'animate', 'initial', 'exit', 'transition', 'variants',
              'whileHover', 'whileTap', 'whileInView', 'layout', 'layoutId',
            ])
            const filteredProps: Record<string, unknown> = {}
            for (const [key, value] of Object.entries(props)) {
              if (!framerProps.has(key) && !key.startsWith('animate') && !key.startsWith('transition')) {
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

// Mock scoring module
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

import { BriefView } from '@/components/brief-view'
import type { FieldName } from '@/lib/types'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeField(overrides: Partial<{ content: string; status: 'complete' | 'partial' | 'missing'; suggestion?: string }> = {}) {
  return {
    content: 'Default field content',
    status: 'complete' as const,
    suggestion: undefined,
    ...overrides,
  }
}

function makeFields(): Record<FieldName, { content: string; status: 'complete' | 'partial' | 'missing'; suggestion?: string }> {
  return {
    context: makeField({ content: 'Contexto do projeto' }),
    objective: makeField({ content: 'Objetivo SMART do projeto' }),
    audience: makeField({ content: 'Público-alvo definido' }),
    message: makeField({ content: 'Mensagem principal clara' }),
    tone: makeField({ content: 'Tom profissional' }),
    deliverables: makeField({ content: 'Lista de entregáveis' }),
    budget: makeField({ content: 'R$ 50.000' }),
    timeline: makeField({ content: '3 meses' }),
    kpis: makeField({ content: 'Métricas de sucesso' }),
    references: makeField({ content: 'Referências visuais' }),
  }
}

function makeAudit() {
  return {
    gaps: [
      { field: 'budget', severity: 'warning' as const, suggestion: 'Detalhar faixa orçamentária' },
    ],
    contradictions: [],
    overall_note: 'Brief bem estruturado com pequenas lacunas',
  }
}

const defaultProps = {
  title: 'Campanha Nova Marca',
  score: 85,
  fields: makeFields(),
  audit: makeAudit(),
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('BriefView', () => {
  // Test 17: BriefView renderiza todos os 10 campos
  it('renders all 10 brief fields — all field labels appear in the DOM', () => {
    render(<BriefView {...defaultProps} />)

    // All 10 PT-BR labels should be present
    expect(screen.getByText('Contexto')).toBeInTheDocument()
    expect(screen.getByText('Objetivo')).toBeInTheDocument()
    expect(screen.getByText('Público-alvo')).toBeInTheDocument()
    expect(screen.getByText('Mensagem Principal')).toBeInTheDocument()
    expect(screen.getByText('Tom de Voz')).toBeInTheDocument()
    expect(screen.getByText('Entregáveis')).toBeInTheDocument()
    expect(screen.getByText('Orçamento')).toBeInTheDocument()
    expect(screen.getByText('Prazo')).toBeInTheDocument()
    expect(screen.getByText('KPIs')).toBeInTheDocument()
    expect(screen.getByText('Referências')).toBeInTheDocument()
  })

  // Test 18: BriefView renderiza split-view
  it('renders split-view layout — two main sections: brief column and audit column', () => {
    render(<BriefView {...defaultProps} />)

    const briefColumn = screen.getByTestId('brief-column')
    const auditColumn = screen.getByTestId('audit-column')

    expect(briefColumn).toBeInTheDocument()
    expect(auditColumn).toBeInTheDocument()
  })

  // Test 19: BriefView renderiza ScoreDisplay
  it('renders ScoreDisplay — score number is displayed', () => {
    render(<BriefView {...defaultProps} />)

    // ScoreDisplay renders the score number
    expect(screen.getByText('85')).toBeInTheDocument()
  })

  // Test 20: BriefView renderiza título do brief
  it('renders brief title — title text appears in the DOM', () => {
    render(<BriefView {...defaultProps} />)

    expect(screen.getByText('Campanha Nova Marca')).toBeInTheDocument()
  })
})
