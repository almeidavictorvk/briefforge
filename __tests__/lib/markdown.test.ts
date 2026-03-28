import { describe, it, expect } from 'vitest'
import type { Brief } from '@/lib/types'
import { FIELD_NAMES, FIELD_LABELS } from '@/lib/types'
import { generateBriefMarkdown } from '@/lib/markdown'

// ---------------------------------------------------------------------------
// Helpers to build test data
// ---------------------------------------------------------------------------

function makeField(
  status: 'complete' | 'partial' | 'missing',
  content = '',
  suggestion?: string
): { content: string; status: 'complete' | 'partial' | 'missing'; suggestion?: string } {
  const field: { content: string; status: 'complete' | 'partial' | 'missing'; suggestion?: string } = {
    content,
    status,
  }
  if (suggestion !== undefined) {
    field.suggestion = suggestion
  }
  return field
}

function makeCompleteBrief(overrides?: Partial<Brief>): Brief {
  return {
    title: 'Campanha de Marketing Digital',
    fields: {
      context: makeField('complete', 'Empresa XYZ lança novo produto em janeiro.'),
      objective: makeField('complete', 'Aumentar awareness em 30% no Q1.'),
      audience: makeField('complete', 'Jovens 18-35, classe AB, urbanos.'),
      message: makeField('complete', 'Inovação que transforma o dia a dia.'),
      tone: makeField('complete', 'Moderno, informal, inspirador.'),
      deliverables: makeField('complete', '3 vídeos, 10 posts, 1 landing page.'),
      budget: makeField('complete', 'R$ 150.000,00'),
      timeline: makeField('complete', 'Janeiro a Março 2025'),
      kpis: makeField('complete', 'Impressões, CTR, conversões no site.'),
      references: makeField('complete', 'Campanha Nike "Just Do It" 2024.'),
    },
    audit: {
      gaps: [],
      contradictions: [],
      overall_note: 'Brief completo e bem estruturado.',
    },
    score: 92,
    ...overrides,
  }
}

function makeBriefWithGaps(): Brief {
  return {
    title: 'Brief Parcial',
    fields: {
      context: makeField('complete', 'Empresa ABC precisa de campanha.'),
      objective: makeField('partial', 'Aumentar vendas.', 'Defina metas SMART com números específicos.'),
      audience: makeField('missing', '', 'Quem é o público-alvo?'),
      message: makeField('complete', 'Qualidade e confiança.'),
      tone: makeField('partial', 'Sério.', 'Elabore mais sobre o tom desejado.'),
      deliverables: makeField('complete', 'Posts para redes sociais.'),
      budget: makeField('missing', '', 'Qual o orçamento disponível?'),
      timeline: makeField('complete', 'Q2 2025'),
      kpis: makeField('missing', '', 'Defina KPIs mensuráveis.'),
      references: makeField('complete', 'Sem referências específicas.'),
    },
    audit: {
      gaps: [
        { field: 'audience', severity: 'critical', suggestion: 'Público-alvo não definido.' },
        { field: 'budget', severity: 'critical', suggestion: 'Orçamento ausente.' },
        { field: 'objective', severity: 'warning', suggestion: 'Objetivo vago, falta métricas.' },
        { field: 'kpis', severity: 'critical', suggestion: 'Sem KPIs definidos.' },
      ],
      contradictions: [
        {
          description: 'Tom "sério" conflita com entregáveis para redes sociais.',
          fields: ['tone', 'deliverables'],
        },
      ],
      overall_note: 'Brief precisa de mais detalhamento em áreas chave.',
    },
    score: 45,
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('generateBriefMarkdown', () => {
  it('retorna string não vazia', () => {
    const brief = makeCompleteBrief()
    const markdown = generateBriefMarkdown(brief)

    expect(markdown).toBeTruthy()
    expect(markdown.length).toBeGreaterThan(0)
  })

  it('inclui título', () => {
    const brief = makeCompleteBrief({ title: 'Meu Brief Especial' })
    const markdown = generateBriefMarkdown(brief)

    expect(markdown).toContain('# Meu Brief Especial')
  })

  it('inclui score', () => {
    const brief = makeCompleteBrief({ score: 87 })
    const markdown = generateBriefMarkdown(brief)

    expect(markdown).toContain('87/100')
  })

  it('inclui todos os 10 campos', () => {
    const brief = makeCompleteBrief()
    const markdown = generateBriefMarkdown(brief)

    for (const fieldName of FIELD_NAMES) {
      const label = FIELD_LABELS[fieldName]['pt-BR']
      expect(markdown).toContain(`## ${label}`)
    }
  })

  it('inclui status dos campos', () => {
    const brief = makeBriefWithGaps()
    const markdown = generateBriefMarkdown(brief)

    // Status labels in Portuguese
    expect(markdown).toContain('Completo')
    expect(markdown).toContain('Parcial')
    expect(markdown).toContain('Ausente')
  })

  it('inclui suggestions', () => {
    const brief = makeBriefWithGaps()
    const markdown = generateBriefMarkdown(brief)

    expect(markdown).toContain('Defina metas SMART com números específicos.')
    expect(markdown).toContain('Quem é o público-alvo?')
    expect(markdown).toContain('Elabore mais sobre o tom desejado.')
  })

  it('inclui seção de auditoria', () => {
    const brief = makeBriefWithGaps()
    const markdown = generateBriefMarkdown(brief)

    // Section header
    expect(markdown).toContain('## Auditoria')

    // Gaps
    expect(markdown).toContain('Lacunas')
    expect(markdown).toContain('critical')
    expect(markdown).toContain('warning')
    expect(markdown).toContain('Público-alvo não definido.')
    expect(markdown).toContain('Objetivo vago, falta métricas.')

    // Contradictions
    expect(markdown).toContain('Contradições')
    expect(markdown).toContain('Tom "sério" conflita com entregáveis para redes sociais.')
    expect(markdown).toContain('tone')
    expect(markdown).toContain('deliverables')
  })

  it('inclui nota geral', () => {
    const brief = makeBriefWithGaps()
    const markdown = generateBriefMarkdown(brief)

    expect(markdown).toContain('Nota Geral')
    expect(markdown).toContain('Brief precisa de mais detalhamento em áreas chave.')
  })

  it('inclui footer', () => {
    const brief = makeCompleteBrief()
    const markdown = generateBriefMarkdown(brief)

    expect(markdown).toContain('Gerado por BriefForge')
  })
})
