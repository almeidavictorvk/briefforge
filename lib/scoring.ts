import type { BriefFields, AuditResults } from '@/lib/types'
import { FIELD_NAMES } from '@/lib/types'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const WEIGHTS = {
  completeness: 0.4,
  clarity: 0.3,
  coherence: 0.2,
  measurability: 0.1,
} as const

/** Minimum content length to be considered "specific" */
const CLARITY_MIN_LENGTH = 20

/** Content length at which clarity is considered maximum */
const CLARITY_MAX_LENGTH = 200

/** How much each contradiction reduces the coherence score (out of 100) */
const COHERENCE_PENALTY_PER_CONTRADICTION = 20

// ---------------------------------------------------------------------------
// Dimension calculators
// ---------------------------------------------------------------------------

/**
 * Completeness score (0-100).
 * Each of the 10 fields contributes equally (10% each).
 * complete = 100%, partial = 50%, missing = 0%.
 */
export function calculateCompleteness(fields: BriefFields): number {
  let total = 0

  for (const name of FIELD_NAMES) {
    const field = fields[name]
    if (field.status === 'complete') {
      total += 100
    } else if (field.status === 'partial') {
      total += 50
    }
    // missing adds 0
  }

  return total / FIELD_NAMES.length
}

/**
 * Clarity score (0-100).
 * Heuristic based on content length of non-missing fields.
 * Longer, more specific content scores higher.
 */
export function calculateClarity(fields: BriefFields): number {
  let totalScore = 0
  let countedFields = 0

  for (const name of FIELD_NAMES) {
    const field = fields[name]
    if (field.status === 'missing') continue

    countedFields++
    const len = field.content.length

    if (len <= CLARITY_MIN_LENGTH) {
      // Very short / vague — low clarity
      totalScore += (len / CLARITY_MIN_LENGTH) * 30
    } else if (len >= CLARITY_MAX_LENGTH) {
      // Long and specific — high clarity
      totalScore += 100
    } else {
      // Linear interpolation between min and max
      const ratio = (len - CLARITY_MIN_LENGTH) / (CLARITY_MAX_LENGTH - CLARITY_MIN_LENGTH)
      totalScore += 30 + ratio * 70
    }
  }

  if (countedFields === 0) return 0
  return Math.round(totalScore / countedFields)
}

/**
 * Coherence score (0-100).
 * Inverse proportion of contradictions.
 * 0 contradictions = 100; each contradiction reduces by COHERENCE_PENALTY_PER_CONTRADICTION.
 */
export function calculateCoherence(audit: AuditResults): number {
  const penalty = audit.contradictions.length * COHERENCE_PENALTY_PER_CONTRADICTION
  return Math.max(0, 100 - penalty)
}

/**
 * Measurability score (0-100).
 * Based solely on the KPIs field status.
 * complete = 100, partial = 50, missing = 0.
 */
export function calculateMeasurability(fields: BriefFields): number {
  const kpis = fields.kpis
  if (kpis.status === 'complete') return 100
  if (kpis.status === 'partial') return 50
  return 0
}

// ---------------------------------------------------------------------------
// Composite score
// ---------------------------------------------------------------------------

/**
 * Total brief score (0-100), weighted across 4 dimensions.
 * completeness 40% + clarity 30% + coherence 20% + measurability 10%.
 * Always clamped to 0-100 and rounded to integer.
 */
export function calculateScore(fields: BriefFields, audit: AuditResults): number {
  const completeness = calculateCompleteness(fields)

  // If nothing is filled in, the score is 0 — coherence/clarity are meaningless
  // when there is no content to evaluate.
  if (completeness === 0) return 0

  const clarity = calculateClarity(fields)
  const coherence = calculateCoherence(audit)
  const measurability = calculateMeasurability(fields)

  const raw =
    completeness * WEIGHTS.completeness +
    clarity * WEIGHTS.clarity +
    coherence * WEIGHTS.coherence +
    measurability * WEIGHTS.measurability

  return Math.round(Math.min(100, Math.max(0, raw)))
}

// ---------------------------------------------------------------------------
// Display helpers
// ---------------------------------------------------------------------------

/**
 * Returns a semantic color key based on the score.
 * >= 70 -> 'success', 40-69 -> 'warning', < 40 -> 'error'
 */
export function getScoreColor(score: number): 'success' | 'warning' | 'error' {
  if (score >= 70) return 'success'
  if (score >= 40) return 'warning'
  return 'error'
}

/**
 * Returns a human-readable label for the score.
 * >= 80 -> "Excelente", 60-79 -> "Bom", 40-59 -> "Regular", < 40 -> "Fraco"
 */
export function getScoreLabel(score: number): string {
  if (score >= 80) return 'Excelente'
  if (score >= 60) return 'Bom'
  if (score >= 40) return 'Regular'
  return 'Fraco'
}
