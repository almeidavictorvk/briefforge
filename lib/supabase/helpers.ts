import type { BriefRow, BriefField, FieldName } from '@/lib/types'
import { FIELD_NAMES } from '@/lib/types'

// ---------------------------------------------------------------------------
// ParsedBrief — the return type of parseBriefRow
// ---------------------------------------------------------------------------

export interface ParsedBrief {
  id: string
  anonymous_id: string
  raw_input: string
  title: string | null
  language: string
  status: string
  share_enabled: boolean
  score: number
  field_scores: Record<string, unknown>
  client_inputs: Record<string, unknown>
  client_last_seen: string | null
  created_at: string
  updated_at: string
  fields: Record<FieldName, BriefField>
  audit: {
    gaps: Array<{ field: string; severity: 'critical' | 'warning'; suggestion: string }>
    contradictions: Array<{ description: string; fields: string[] }>
    overall_note: string
  }
}

// ---------------------------------------------------------------------------
// Default field value — used when a field is missing from JSONB
// ---------------------------------------------------------------------------

const DEFAULT_FIELD: BriefField = {
  content: '',
  status: 'missing',
}

// ---------------------------------------------------------------------------
// parseBriefRow — converts a Supabase BriefRow into a typed ParsedBrief
// ---------------------------------------------------------------------------

export function parseBriefRow(row: BriefRow): ParsedBrief {
  const structuredBrief = (row.structured_brief ?? {}) as Record<string, unknown>
  const auditResults = (row.audit_results ?? {}) as Record<string, unknown>

  // Parse fields — iterate all 10 field names and pick from JSONB or default
  const fields = {} as Record<FieldName, BriefField>
  for (const name of FIELD_NAMES) {
    const raw = structuredBrief[name]
    if (
      raw &&
      typeof raw === 'object' &&
      'content' in raw &&
      'status' in raw
    ) {
      const rawField = raw as Record<string, unknown>
      const parsed: BriefField = {
        content: String(rawField.content ?? ''),
        status: rawField.status as BriefField['status'],
      }
      if (rawField.suggestion !== undefined) {
        parsed.suggestion = String(rawField.suggestion)
      }
      fields[name] = parsed
    } else {
      fields[name] = { ...DEFAULT_FIELD }
    }
  }

  // Parse audit — use JSONB values or defaults
  const rawGaps = Array.isArray(auditResults.gaps) ? auditResults.gaps : []
  const rawContradictions = Array.isArray(auditResults.contradictions)
    ? auditResults.contradictions
    : []
  const overallNote =
    typeof auditResults.overall_note === 'string'
      ? auditResults.overall_note
      : ''

  const audit: ParsedBrief['audit'] = {
    gaps: rawGaps.map((g: Record<string, unknown>) => ({
      field: String(g.field ?? ''),
      severity: (g.severity === 'critical' ? 'critical' : 'warning') as
        | 'critical'
        | 'warning',
      suggestion: String(g.suggestion ?? ''),
    })),
    contradictions: rawContradictions.map((c: Record<string, unknown>) => ({
      description: String(c.description ?? ''),
      fields: Array.isArray(c.fields) ? c.fields.map(String) : [],
    })),
    overall_note: overallNote,
  }

  return {
    id: row.id,
    anonymous_id: row.anonymous_id,
    raw_input: row.raw_input,
    title: row.title,
    language: row.language,
    status: row.status,
    share_enabled: row.share_enabled,
    score: row.score,
    field_scores: row.field_scores,
    client_inputs: row.client_inputs,
    client_last_seen: row.client_last_seen,
    created_at: row.created_at,
    updated_at: row.updated_at,
    fields,
    audit,
  }
}
