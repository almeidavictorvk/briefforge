import { describe, it, expect } from 'vitest'
import type { BriefFields, AuditResults } from '@/lib/types'

// Will import these once implemented — tests should FAIL initially
import {
  calculateCompleteness,
  calculateClarity,
  calculateCoherence,
  calculateMeasurability,
  calculateScore,
  getScoreColor,
  getScoreLabel,
} from '@/lib/scoring'

// ---------------------------------------------------------------------------
// Helpers to build test data
// ---------------------------------------------------------------------------

function makeField(
  status: 'complete' | 'partial' | 'missing',
  content = ''
): { content: string; status: 'complete' | 'partial' | 'missing' } {
  return { content, status }
}

function makeFields(
  statuses: Array<'complete' | 'partial' | 'missing'>,
  contents?: string[]
): BriefFields {
  const names = [
    'context',
    'objective',
    'audience',
    'message',
    'tone',
    'deliverables',
    'budget',
    'timeline',
    'kpis',
    'references',
  ] as const

  const fields: Record<string, { content: string; status: 'complete' | 'partial' | 'missing' }> = {}
  for (let i = 0; i < names.length; i++) {
    fields[names[i]] = makeField(statuses[i], contents?.[i] ?? '')
  }
  return fields as unknown as BriefFields
}

function makeAudit(contradictionCount = 0): AuditResults {
  const contradictions = Array.from({ length: contradictionCount }, (_, i) => ({
    description: `Contradiction ${i + 1}`,
    fields: ['context', 'objective'],
  }))

  return {
    gaps: [],
    contradictions,
    overall_note: 'Test note',
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('calculateCompleteness', () => {
  it('retorna 100 quando todos os campos sao complete', () => {
    const fields = makeFields(Array(10).fill('complete'))
    expect(calculateCompleteness(fields)).toBe(100)
  })

  it('retorna 0 quando todos os campos sao missing', () => {
    const fields = makeFields(Array(10).fill('missing'))
    expect(calculateCompleteness(fields)).toBe(0)
  })

  it('retorna 50 quando todos os campos sao partial', () => {
    const fields = makeFields(Array(10).fill('partial'))
    expect(calculateCompleteness(fields)).toBe(50)
  })

  it('calcula mix corretamente — 5 complete + 3 partial + 2 missing = 65', () => {
    const statuses: Array<'complete' | 'partial' | 'missing'> = [
      'complete',
      'complete',
      'complete',
      'complete',
      'complete',
      'partial',
      'partial',
      'partial',
      'missing',
      'missing',
    ]
    const fields = makeFields(statuses)
    // (5*100 + 3*50 + 2*0) / 10 = 65
    expect(calculateCompleteness(fields)).toBe(65)
  })
})

describe('calculateClarity', () => {
  it('retorna score alto para conteudo longo e especifico', () => {
    const longContent =
      'Precisamos lançar uma campanha digital integrada para o produto X, focando em conversão de leads qualificados através de anúncios segmentados em redes sociais e Google Ads, com landing pages otimizadas para cada persona. O objetivo é aumentar em 30% as vendas no Q4 2024.'
    const contents = Array(10).fill(longContent)
    const fields = makeFields(Array(10).fill('complete'), contents)
    const score = calculateClarity(fields)
    expect(score).toBeGreaterThanOrEqual(70)
  })

  it('retorna score baixo para conteudo vago/curto', () => {
    const shortContent = 'algo'
    const contents = Array(10).fill(shortContent)
    const fields = makeFields(Array(10).fill('complete'), contents)
    const score = calculateClarity(fields)
    expect(score).toBeLessThan(40)
  })
})

describe('calculateCoherence', () => {
  it('retorna 100 sem contradicoes', () => {
    const audit = makeAudit(0)
    expect(calculateCoherence(audit)).toBe(100)
  })

  it('reduz score proporcionalmente por contradicao', () => {
    const audit2 = makeAudit(2)
    const score2 = calculateCoherence(audit2)
    expect(score2).toBeLessThan(100)
    expect(score2).toBeGreaterThan(0)

    const audit4 = makeAudit(4)
    const score4 = calculateCoherence(audit4)
    expect(score4).toBeLessThan(score2)
  })
})

describe('calculateMeasurability', () => {
  it('retorna 100 quando KPIs sao complete', () => {
    const fields = makeFields([
      'missing',
      'missing',
      'missing',
      'missing',
      'missing',
      'missing',
      'missing',
      'missing',
      'complete', // kpis
      'missing',
    ])
    expect(calculateMeasurability(fields)).toBe(100)
  })

  it('retorna 0 quando KPIs sao missing', () => {
    const fields = makeFields([
      'complete',
      'complete',
      'complete',
      'complete',
      'complete',
      'complete',
      'complete',
      'complete',
      'missing', // kpis
      'complete',
    ])
    expect(calculateMeasurability(fields)).toBe(0)
  })
})

describe('calculateScore', () => {
  it('aplica pesos corretamente — completude 100, clareza ~50, coerencia 100, mensurabilidade 0 -> ~75', () => {
    // All complete but with medium-length content, 0 contradictions, kpis missing
    // completeness = 100 (all complete)
    // clarity ~= depends on content length, we need to engineer it
    // coherence = 100 (no contradictions)
    // measurability = 0 (kpis missing)
    //
    // We'll make all fields complete with medium content, kpis missing
    const mediumContent =
      'Uma campanha para aumentar awareness da marca no mercado nacional.'
    const contents = Array(10).fill(mediumContent)
    const statuses: Array<'complete' | 'partial' | 'missing'> = Array(10).fill('complete')
    statuses[8] = 'missing' // kpis missing -> measurability = 0
    contents[8] = '' // kpis empty

    const fields = makeFields(statuses, contents)
    const audit = makeAudit(0)

    const score = calculateScore(fields, audit)
    // completeness = (9*100 + 0) / 10 = 90
    // clarity depends on content (medium ~50-60)
    // coherence = 100
    // measurability = 0
    // Exact value depends on clarity heuristic, but should be in reasonable range
    expect(score).toBeGreaterThanOrEqual(50)
    expect(score).toBeLessThanOrEqual(90)
  })

  it('retorna 0 para brief completamente vazio', () => {
    const fields = makeFields(Array(10).fill('missing'), Array(10).fill(''))
    const audit = makeAudit(0)
    const score = calculateScore(fields, audit)
    expect(score).toBe(0)
  })

  it('retorna ~100 para brief perfeito', () => {
    const longContent =
      'Precisamos lançar uma campanha digital integrada para o produto X, focando em conversão de leads qualificados através de anúncios segmentados em redes sociais e Google Ads, com landing pages otimizadas para cada persona. O objetivo é aumentar em 30% as vendas no Q4 2024, com ROI mínimo de 3:1. Os KPIs incluem taxa de conversão, CPA, e ROAS.'
    const contents = Array(10).fill(longContent)
    const fields = makeFields(Array(10).fill('complete'), contents)
    const audit = makeAudit(0)
    const score = calculateScore(fields, audit)
    expect(score).toBeGreaterThanOrEqual(90)
  })

  it('nunca retorna valor fora de 0-100', () => {
    // Test various edge cases
    const cases = [
      // all missing, lots of contradictions
      {
        fields: makeFields(Array(10).fill('missing'), Array(10).fill('')),
        audit: makeAudit(20),
      },
      // all complete, long content, no contradictions
      {
        fields: makeFields(
          Array(10).fill('complete'),
          Array(10).fill(
            'Este é um conteúdo muito longo e detalhado que abrange muitos aspectos diferentes do projeto. '.repeat(
              10
            )
          )
        ),
        audit: makeAudit(0),
      },
    ]

    for (const { fields, audit } of cases) {
      const score = calculateScore(fields, audit)
      expect(score).toBeGreaterThanOrEqual(0)
      expect(score).toBeLessThanOrEqual(100)
      expect(Number.isInteger(score)).toBe(true)
    }
  })
})

describe('getScoreColor', () => {
  it("retorna 'success' para score >= 70", () => {
    expect(getScoreColor(70)).toBe('success')
    expect(getScoreColor(85)).toBe('success')
    expect(getScoreColor(100)).toBe('success')
  })

  it("retorna 'warning' para score 40-69", () => {
    expect(getScoreColor(40)).toBe('warning')
    expect(getScoreColor(55)).toBe('warning')
    expect(getScoreColor(69)).toBe('warning')
  })

  it("retorna 'error' para score < 40", () => {
    expect(getScoreColor(0)).toBe('error')
    expect(getScoreColor(20)).toBe('error')
    expect(getScoreColor(39)).toBe('error')
  })
})

describe('getScoreLabel', () => {
  it('retorna labels corretas por faixa', () => {
    expect(getScoreLabel(85)).toBe('Excelente')
    expect(getScoreLabel(80)).toBe('Excelente')
    expect(getScoreLabel(100)).toBe('Excelente')

    expect(getScoreLabel(65)).toBe('Bom')
    expect(getScoreLabel(60)).toBe('Bom')
    expect(getScoreLabel(79)).toBe('Bom')

    expect(getScoreLabel(45)).toBe('Regular')
    expect(getScoreLabel(40)).toBe('Regular')
    expect(getScoreLabel(59)).toBe('Regular')

    expect(getScoreLabel(20)).toBe('Fraco')
    expect(getScoreLabel(0)).toBe('Fraco')
    expect(getScoreLabel(39)).toBe('Fraco')
  })
})
