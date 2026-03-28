import type { Brief } from '@/lib/types'
import { FIELD_NAMES, FIELD_LABELS } from '@/lib/types'
import type { FieldName } from '@/lib/types'

// ---------------------------------------------------------------------------
// Status label mapping (PT-BR)
// ---------------------------------------------------------------------------

const STATUS_LABELS: Record<string, string> = {
  complete: 'Completo',
  partial: 'Parcial',
  missing: 'Ausente',
}

// ---------------------------------------------------------------------------
// generateBriefMarkdown
// ---------------------------------------------------------------------------

/**
 * Generates a Markdown representation of a Brief.
 *
 * Includes title, score, all 10 fields with status/suggestions,
 * audit section (gaps, contradictions, overall note), and footer.
 */
export function generateBriefMarkdown(brief: Brief): string {
  const lines: string[] = []

  // --- Header ---
  lines.push(`# ${brief.title}`)
  lines.push('')
  lines.push(`**Score:** ${brief.score}/100`)
  lines.push(`**Gerado em:** ${new Date().toLocaleDateString('pt-BR')}`)
  lines.push('')
  lines.push('---')
  lines.push('')

  // --- Fields ---
  for (const fieldName of FIELD_NAMES) {
    const field = brief.fields[fieldName as FieldName]
    const label = FIELD_LABELS[fieldName as FieldName]['pt-BR']
    const statusLabel = STATUS_LABELS[field.status] ?? field.status

    lines.push(`## ${label}`)

    if (field.content) {
      lines.push(field.content)
    } else {
      lines.push('_Sem conteúdo_')
    }

    lines.push(`> Status: ${statusLabel}`)

    if (field.suggestion) {
      lines.push(`> Sugestão: ${field.suggestion}`)
    }

    lines.push('')
  }

  lines.push('---')
  lines.push('')

  // --- Audit ---
  lines.push('## Auditoria')
  lines.push('')

  // Gaps
  lines.push('### Lacunas')
  if (brief.audit.gaps.length > 0) {
    for (const gap of brief.audit.gaps) {
      lines.push(`- [${gap.severity}] ${gap.field}: ${gap.suggestion}`)
    }
  } else {
    lines.push('_Nenhuma lacuna identificada._')
  }
  lines.push('')

  // Contradictions
  lines.push('### Contradições')
  if (brief.audit.contradictions.length > 0) {
    for (const contradiction of brief.audit.contradictions) {
      lines.push(
        `- ${contradiction.description} (campos: ${contradiction.fields.join(', ')})`
      )
    }
  } else {
    lines.push('_Nenhuma contradição identificada._')
  }
  lines.push('')

  // Overall note
  lines.push('### Nota Geral')
  lines.push(brief.audit.overall_note)
  lines.push('')

  // --- Footer ---
  lines.push('---')
  lines.push('')
  lines.push('*Gerado por BriefForge*')

  return lines.join('\n')
}
