import { z } from 'zod'
import { fieldSchema, briefSchema } from '@/lib/ai/schema'

// ---------------------------------------------------------------------------
// Types derived from Zod schemas (R3 + R5: never duplicate manually)
// ---------------------------------------------------------------------------

/** Single brief field with content, status, and optional suggestion */
export type BriefField = z.infer<typeof fieldSchema>

/** Full brief object as returned by the AI engine */
export type Brief = z.infer<typeof briefSchema>

/** All 10 structured fields of a brief */
export type BriefFields = Brief['fields']

/** A single audit gap entry */
export type AuditGap = Brief['audit']['gaps'][number]

/** A single audit contradiction entry */
export type AuditContradiction = Brief['audit']['contradictions'][number]

/** Complete audit results (gaps + contradictions + overall note) */
export type AuditResults = Brief['audit']

// ---------------------------------------------------------------------------
// Union types
// ---------------------------------------------------------------------------

/** Status of an individual field */
export type FieldStatus = 'complete' | 'partial' | 'missing'

/** Lifecycle status of a brief */
export type BriefStatus = 'draft' | 'shared' | 'complete'

// ---------------------------------------------------------------------------
// Database row type (Supabase `briefs` table)
// ---------------------------------------------------------------------------

/** Represents a row from the Supabase `briefs` table */
export interface BriefRow {
  id: string
  anonymous_id: string
  raw_input: string
  structured_brief: Record<string, unknown>
  audit_results: Record<string, unknown>
  score: number
  field_scores: Record<string, unknown>
  title: string | null
  language: string
  status: string
  share_enabled: boolean
  client_inputs: Record<string, unknown>
  client_last_seen: string | null
  created_at: string
  updated_at: string
}

// ---------------------------------------------------------------------------
// Constants (R4)
// ---------------------------------------------------------------------------

/** Ordered list of all 10 brief field names */
export const FIELD_NAMES = [
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

/** Union type of valid field names — derived from FIELD_NAMES */
export type FieldName = (typeof FIELD_NAMES)[number]

// ---------------------------------------------------------------------------
// Field labels (R4b) — bilingual PT-BR / EN
// ---------------------------------------------------------------------------

export const FIELD_LABELS: Record<FieldName, { 'pt-BR': string; en: string }> = {
  context: { 'pt-BR': 'Contexto', en: 'Context' },
  objective: { 'pt-BR': 'Objetivo', en: 'Objective' },
  audience: { 'pt-BR': 'Público-alvo', en: 'Target Audience' },
  message: { 'pt-BR': 'Mensagem Principal', en: 'Key Message' },
  tone: { 'pt-BR': 'Tom de Voz', en: 'Tone of Voice' },
  deliverables: { 'pt-BR': 'Entregáveis', en: 'Deliverables' },
  budget: { 'pt-BR': 'Orçamento', en: 'Budget' },
  timeline: { 'pt-BR': 'Prazo', en: 'Timeline' },
  kpis: { 'pt-BR': 'KPIs', en: 'KPIs' },
  references: { 'pt-BR': 'Referências', en: 'References' },
}
