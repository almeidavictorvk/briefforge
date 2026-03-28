import { describe, it, expect } from 'vitest'
import type { BriefRow, FieldName } from '@/lib/types'
import { FIELD_NAMES } from '@/lib/types'
import { parseBriefRow } from '@/lib/supabase/helpers'
import type { ParsedBrief } from '@/lib/supabase/helpers'

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

function createMockBriefRow(overrides: Partial<BriefRow> = {}): BriefRow {
  return {
    id: 'test-uuid-123',
    anonymous_id: 'anon-456',
    raw_input: 'Some raw text from client',
    structured_brief: {
      context: { content: 'Campaign context', status: 'complete' },
      objective: { content: 'Increase sales', status: 'complete' },
      audience: {
        content: 'Young adults',
        status: 'partial',
        suggestion: 'Define age range',
      },
      message: { content: '', status: 'missing' },
      tone: { content: 'Professional', status: 'complete' },
      deliverables: { content: 'Social media posts', status: 'complete' },
      budget: { content: '', status: 'missing' },
      timeline: { content: 'Q1 2025', status: 'complete' },
      kpis: {
        content: 'Engagement rate',
        status: 'partial',
        suggestion: 'Add specific targets',
      },
      references: { content: '', status: 'missing' },
    },
    audit_results: {
      gaps: [
        {
          field: 'budget',
          severity: 'critical',
          suggestion: 'Define budget range',
        },
      ],
      contradictions: [],
      overall_note: 'Brief needs budget information',
    },
    score: 65,
    field_scores: {},
    title: 'Test Brief',
    language: 'pt-BR',
    status: 'draft',
    share_enabled: false,
    client_inputs: {},
    client_last_seen: null,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    ...overrides,
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('parseBriefRow', () => {
  describe('converte JSONB fields corretamente', () => {
    it('should parse structured_brief into typed fields for all 10 field names', () => {
      const row = createMockBriefRow()
      const result: ParsedBrief = parseBriefRow(row)

      // Every field name from FIELD_NAMES must be present
      for (const name of FIELD_NAMES) {
        expect(result.fields).toHaveProperty(name)
        expect(result.fields[name]).toHaveProperty('content')
        expect(result.fields[name]).toHaveProperty('status')
      }
    })

    it('should preserve content and status of each field', () => {
      const row = createMockBriefRow()
      const result = parseBriefRow(row)

      expect(result.fields.context.content).toBe('Campaign context')
      expect(result.fields.context.status).toBe('complete')

      expect(result.fields.audience.content).toBe('Young adults')
      expect(result.fields.audience.status).toBe('partial')
      expect(result.fields.audience.suggestion).toBe('Define age range')

      expect(result.fields.message.content).toBe('')
      expect(result.fields.message.status).toBe('missing')

      expect(result.fields.budget.content).toBe('')
      expect(result.fields.budget.status).toBe('missing')
    })

    it('should parse audit_results with gaps, contradictions, and overall_note', () => {
      const row = createMockBriefRow()
      const result = parseBriefRow(row)

      expect(result.audit.gaps).toHaveLength(1)
      expect(result.audit.gaps[0]).toEqual({
        field: 'budget',
        severity: 'critical',
        suggestion: 'Define budget range',
      })
      expect(result.audit.contradictions).toEqual([])
      expect(result.audit.overall_note).toBe('Brief needs budget information')
    })

    it('should parse audit_results with contradictions', () => {
      const row = createMockBriefRow({
        audit_results: {
          gaps: [],
          contradictions: [
            {
              description: 'Budget conflicts with deliverables scope',
              fields: ['budget', 'deliverables'],
            },
          ],
          overall_note: 'Review contradictions',
        },
      })
      const result = parseBriefRow(row)

      expect(result.audit.contradictions).toHaveLength(1)
      expect(result.audit.contradictions[0]).toEqual({
        description: 'Budget conflicts with deliverables scope',
        fields: ['budget', 'deliverables'],
      })
    })

    it('should preserve suggestion field when present on a brief field', () => {
      const row = createMockBriefRow()
      const result = parseBriefRow(row)

      expect(result.fields.kpis.suggestion).toBe('Add specific targets')
    })

    it('should not have suggestion when not present in the source', () => {
      const row = createMockBriefRow()
      const result = parseBriefRow(row)

      // Complete fields should not have suggestion
      expect(result.fields.context.suggestion).toBeUndefined()
    })
  })

  describe('mantém metadata (id, anonymous_id, created_at, status)', () => {
    it('should preserve id', () => {
      const row = createMockBriefRow()
      const result = parseBriefRow(row)

      expect(result.id).toBe('test-uuid-123')
    })

    it('should preserve anonymous_id', () => {
      const row = createMockBriefRow()
      const result = parseBriefRow(row)

      expect(result.anonymous_id).toBe('anon-456')
    })

    it('should preserve raw_input', () => {
      const row = createMockBriefRow()
      const result = parseBriefRow(row)

      expect(result.raw_input).toBe('Some raw text from client')
    })

    it('should preserve created_at and updated_at', () => {
      const row = createMockBriefRow()
      const result = parseBriefRow(row)

      expect(result.created_at).toBe('2025-01-01T00:00:00Z')
      expect(result.updated_at).toBe('2025-01-01T00:00:00Z')
    })

    it('should preserve status', () => {
      const row = createMockBriefRow({ status: 'shared' })
      const result = parseBriefRow(row)

      expect(result.status).toBe('shared')
    })

    it('should preserve share_enabled', () => {
      const row = createMockBriefRow({ share_enabled: true })
      const result = parseBriefRow(row)

      expect(result.share_enabled).toBe(true)
    })

    it('should preserve title (including null)', () => {
      const row = createMockBriefRow({ title: null })
      const result = parseBriefRow(row)

      expect(result.title).toBeNull()
    })

    it('should preserve language', () => {
      const row = createMockBriefRow({ language: 'en' })
      const result = parseBriefRow(row)

      expect(result.language).toBe('en')
    })

    it('should preserve score', () => {
      const row = createMockBriefRow({ score: 85 })
      const result = parseBriefRow(row)

      expect(result.score).toBe(85)
    })

    it('should preserve field_scores', () => {
      const row = createMockBriefRow({
        field_scores: { context: 100, budget: 0 },
      })
      const result = parseBriefRow(row)

      expect(result.field_scores).toEqual({ context: 100, budget: 0 })
    })

    it('should preserve client_inputs', () => {
      const row = createMockBriefRow({
        client_inputs: { budget: 'R$ 50.000' },
      })
      const result = parseBriefRow(row)

      expect(result.client_inputs).toEqual({ budget: 'R$ 50.000' })
    })

    it('should preserve client_last_seen (including null)', () => {
      const row = createMockBriefRow({
        client_last_seen: '2025-06-15T10:30:00Z',
      })
      const result = parseBriefRow(row)

      expect(result.client_last_seen).toBe('2025-06-15T10:30:00Z')
    })
  })

  describe('trata campos JSONB vazios com defaults', () => {
    it('should return all fields with default values when structured_brief is empty', () => {
      const row = createMockBriefRow({ structured_brief: {} })
      const result = parseBriefRow(row)

      for (const name of FIELD_NAMES) {
        expect(result.fields[name].content).toBe('')
        expect(result.fields[name].status).toBe('missing')
        expect(result.fields[name].suggestion).toBeUndefined()
      }
    })

    it('should return empty audit when audit_results is empty', () => {
      const row = createMockBriefRow({ audit_results: {} })
      const result = parseBriefRow(row)

      expect(result.audit.gaps).toEqual([])
      expect(result.audit.contradictions).toEqual([])
      expect(result.audit.overall_note).toBe('')
    })

    it('should handle partial structured_brief (some fields present, others missing)', () => {
      const row = createMockBriefRow({
        structured_brief: {
          context: { content: 'Has context', status: 'complete' },
          // All other 9 fields missing from the JSONB
        },
      })
      const result = parseBriefRow(row)

      // Present field should keep its data
      expect(result.fields.context.content).toBe('Has context')
      expect(result.fields.context.status).toBe('complete')

      // Missing fields should get defaults
      const missingFields: FieldName[] = [
        'objective',
        'audience',
        'message',
        'tone',
        'deliverables',
        'budget',
        'timeline',
        'kpis',
        'references',
      ]
      for (const name of missingFields) {
        expect(result.fields[name].content).toBe('')
        expect(result.fields[name].status).toBe('missing')
      }
    })

    it('should handle partial audit_results (only gaps, no contradictions or note)', () => {
      const row = createMockBriefRow({
        audit_results: {
          gaps: [
            {
              field: 'budget',
              severity: 'warning',
              suggestion: 'Add budget',
            },
          ],
        },
      })
      const result = parseBriefRow(row)

      expect(result.audit.gaps).toHaveLength(1)
      expect(result.audit.contradictions).toEqual([])
      expect(result.audit.overall_note).toBe('')
    })

    it('should handle empty field_scores gracefully', () => {
      const row = createMockBriefRow({ field_scores: {} })
      const result = parseBriefRow(row)

      expect(result.field_scores).toEqual({})
    })

    it('should handle empty client_inputs gracefully', () => {
      const row = createMockBriefRow({ client_inputs: {} })
      const result = parseBriefRow(row)

      expect(result.client_inputs).toEqual({})
    })
  })
})
