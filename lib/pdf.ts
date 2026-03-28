import React from 'react'
import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  pdf,
} from '@react-pdf/renderer'
import type { Brief, FieldName } from '@/lib/types'
import { FIELD_NAMES, FIELD_LABELS } from '@/lib/types'

// ---------------------------------------------------------------------------
// Design tokens (light theme — better for print/PDF)
// ---------------------------------------------------------------------------

const colors = {
  bg: '#FAFAF7',
  surface: '#FFFFFF',
  border: '#E8E6E1',
  text: '#1A1A1A',
  textSecondary: '#6B6560',
  textMuted: '#9B9590',
  accent: '#E8553A',
  success: '#16A34A',
  warning: '#CA8A04',
  error: '#DC2626',
}

// ---------------------------------------------------------------------------
// Status helpers
// ---------------------------------------------------------------------------

const STATUS_LABELS: Record<string, string> = {
  complete: 'Completo',
  partial: 'Parcial',
  missing: 'Ausente',
}

const STATUS_COLORS: Record<string, string> = {
  complete: colors.success,
  partial: colors.warning,
  missing: colors.error,
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  page: {
    backgroundColor: colors.bg,
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: colors.text,
  },

  // Header
  header: {
    marginBottom: 24,
    borderBottomWidth: 2,
    borderBottomColor: colors.accent,
    paddingBottom: 16,
  },
  logo: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    color: colors.accent,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: colors.text,
    marginBottom: 4,
  },
  headerDate: {
    fontSize: 9,
    color: colors.textMuted,
  },

  // Score section
  scoreSection: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
  },
  scoreSectionTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: colors.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  scoreNumber: {
    fontSize: 28,
    fontFamily: 'Helvetica-Bold',
    color: colors.accent,
  },
  scoreBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
  },
  scoreBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
  },
  scoreLabel: {
    fontSize: 10,
    color: colors.textSecondary,
  },

  // Field section
  fieldContainer: {
    marginBottom: 14,
    padding: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
  },
  fieldHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  fieldLabel: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: colors.text,
  },
  fieldStatus: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    color: '#FFFFFF',
  },
  fieldContent: {
    fontSize: 10,
    color: colors.text,
    lineHeight: 1.5,
  },
  fieldContentMissing: {
    fontSize: 10,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  fieldSuggestion: {
    fontSize: 9,
    color: colors.warning,
    marginTop: 4,
    fontStyle: 'italic',
  },

  // Pendencias section
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: colors.text,
    marginTop: 20,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 4,
  },
  pendenciaItem: {
    flexDirection: 'row',
    marginBottom: 4,
    paddingLeft: 8,
  },
  pendenciaBullet: {
    fontSize: 10,
    color: colors.error,
    marginRight: 6,
  },
  pendenciaText: {
    fontSize: 10,
    color: colors.text,
    flex: 1,
  },
  pendenciaSeverity: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#FFFFFF',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 2,
    marginRight: 6,
  },

  // Checklist section
  checklistItem: {
    flexDirection: 'row',
    marginBottom: 6,
    paddingLeft: 8,
  },
  checklistBullet: {
    fontSize: 10,
    color: colors.accent,
    marginRight: 6,
  },
  checklistLabel: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: colors.textSecondary,
    marginRight: 4,
  },
  checklistValue: {
    fontSize: 10,
    color: colors.text,
    flex: 1,
  },

  // No pending fields message
  noPendingText: {
    fontSize: 10,
    color: colors.success,
    fontStyle: 'italic',
    paddingLeft: 8,
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: 8,
    color: colors.textMuted,
  },
})

// ---------------------------------------------------------------------------
// PDF Document Component
// ---------------------------------------------------------------------------

interface BriefPDFDocumentProps {
  brief: Brief
}

export function BriefPDFDocument({ brief }: BriefPDFDocumentProps) {
  const now = new Date()
  const dateStr = now.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

  // Collect pending fields (missing or partial)
  const pendingFields = FIELD_NAMES.filter(
    (name) => brief.fields[name].status !== 'complete'
  )

  return React.createElement(
    Document,
    null,
    React.createElement(
      Page,
      { size: 'A4', style: styles.page },

      // --- HEADER ---
      React.createElement(
        View,
        { style: styles.header },
        React.createElement(Text, { style: styles.logo }, 'BriefForge'),
        React.createElement(Text, { style: styles.headerTitle }, brief.title),
        React.createElement(Text, { style: styles.headerDate }, `Gerado em ${dateStr}`)
      ),

      // --- SCORE SECTION ---
      React.createElement(
        View,
        { style: styles.scoreSection },
        React.createElement(Text, { style: styles.scoreSectionTitle }, 'Score de Qualidade'),
        React.createElement(
          View,
          { style: styles.scoreRow },
          React.createElement(Text, { style: styles.scoreNumber }, `${brief.score}`),
          React.createElement(
            View,
            { style: styles.scoreBarContainer },
            React.createElement(View, {
              style: {
                ...styles.scoreBar,
                width: `${brief.score}%`,
                backgroundColor:
                  brief.score >= 70
                    ? colors.success
                    : brief.score >= 40
                      ? colors.warning
                      : colors.error,
              },
            })
          ),
          React.createElement(Text, { style: styles.scoreLabel }, '/100')
        )
      ),

      // --- FIELDS (all 10) ---
      ...FIELD_NAMES.map((fieldName) => {
        const field = brief.fields[fieldName]
        const label = FIELD_LABELS[fieldName as FieldName]['pt-BR']
        const statusLabel = STATUS_LABELS[field.status]
        const statusColor = STATUS_COLORS[field.status]

        return React.createElement(
          View,
          { key: fieldName, style: styles.fieldContainer },
          React.createElement(
            View,
            { style: styles.fieldHeader },
            React.createElement(Text, { style: styles.fieldLabel }, label),
            React.createElement(
              Text,
              {
                style: {
                  ...styles.fieldStatus,
                  backgroundColor: statusColor,
                },
              },
              statusLabel
            )
          ),
          field.status === 'missing'
            ? React.createElement(
                Text,
                { style: styles.fieldContentMissing },
                'Informacao nao fornecida'
              )
            : React.createElement(Text, { style: styles.fieldContent }, field.content),
          field.suggestion
            ? React.createElement(
                Text,
                { style: styles.fieldSuggestion },
                `Sugestao: ${field.suggestion}`
              )
            : null
        )
      }),

      // --- PENDENCIAS SECTION ---
      React.createElement(Text, { style: styles.sectionTitle }, 'Pendencias'),
      pendingFields.length > 0
        ? pendingFields.map((fieldName) => {
            const label = FIELD_LABELS[fieldName as FieldName]['pt-BR']
            const field = brief.fields[fieldName]
            const statusLabel = STATUS_LABELS[field.status]

            // Find matching gap from audit
            const gap = brief.audit.gaps.find((g) => g.field === fieldName)

            return React.createElement(
              View,
              { key: `pending-${fieldName}`, style: styles.pendenciaItem },
              React.createElement(Text, { style: styles.pendenciaBullet }, '\u2022'),
              gap
                ? React.createElement(
                    Text,
                    {
                      style: {
                        ...styles.pendenciaSeverity,
                        backgroundColor:
                          gap.severity === 'critical' ? colors.error : colors.warning,
                      },
                    },
                    gap.severity.toUpperCase()
                  )
                : null,
              React.createElement(
                Text,
                { style: styles.pendenciaText },
                `${label} (${statusLabel})${gap ? ` - ${gap.suggestion}` : ''}`
              )
            )
          })
        : React.createElement(
            Text,
            { style: styles.noPendingText },
            'Nenhuma pendencia. Brief completo!'
          ),

      // --- CHECKLIST PARA CRIACAO ---
      React.createElement(Text, { style: styles.sectionTitle }, 'Checklist para Criacao'),
      React.createElement(
        View,
        { style: styles.checklistItem },
        React.createElement(Text, { style: styles.checklistBullet }, '\u2713'),
        React.createElement(Text, { style: styles.checklistLabel }, 'Produzir:'),
        React.createElement(
          Text,
          { style: styles.checklistValue },
          brief.fields.deliverables.status !== 'missing'
            ? brief.fields.deliverables.content
            : 'A definir'
        )
      ),
      React.createElement(
        View,
        { style: styles.checklistItem },
        React.createElement(Text, { style: styles.checklistBullet }, '\u2713'),
        React.createElement(Text, { style: styles.checklistLabel }, 'Para:'),
        React.createElement(
          Text,
          { style: styles.checklistValue },
          brief.fields.audience.status !== 'missing'
            ? brief.fields.audience.content
            : 'A definir'
        )
      ),
      React.createElement(
        View,
        { style: styles.checklistItem },
        React.createElement(Text, { style: styles.checklistBullet }, '\u2713'),
        React.createElement(Text, { style: styles.checklistLabel }, 'Tom:'),
        React.createElement(
          Text,
          { style: styles.checklistValue },
          brief.fields.tone.status !== 'missing' ? brief.fields.tone.content : 'A definir'
        )
      ),
      React.createElement(
        View,
        { style: styles.checklistItem },
        React.createElement(Text, { style: styles.checklistBullet }, '\u2713'),
        React.createElement(Text, { style: styles.checklistLabel }, 'Prazo:'),
        React.createElement(
          Text,
          { style: styles.checklistValue },
          brief.fields.timeline.status !== 'missing'
            ? brief.fields.timeline.content
            : 'A definir'
        )
      ),

      // --- FOOTER ---
      React.createElement(
        View,
        { style: styles.footer },
        React.createElement(Text, { style: styles.footerText }, 'Gerado por BriefForge'),
        React.createElement(Text, { style: styles.footerText }, dateStr)
      )
    )
  )
}

// ---------------------------------------------------------------------------
// Main export: generates a PDF Blob from a Brief
// ---------------------------------------------------------------------------

export async function generateBriefPDF(brief: Brief): Promise<Blob> {
  const document = BriefPDFDocument({ brief })
  const blob = await pdf(document).toBlob()
  return blob
}
