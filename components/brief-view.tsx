"use client"

import { motion } from "framer-motion"
import { RefreshCw, Loader2 } from "lucide-react"
import { BriefField } from "@/components/brief-field"
import { AuditPanel } from "@/components/audit-panel"
import { ScoreDisplay } from "@/components/score-display"
import { CreationChecklist } from "@/components/creation-checklist"
import { FIELD_NAMES, FIELD_LABELS } from "@/lib/types"
import type { FieldName, AuditResults } from "@/lib/types"

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface BriefViewProps {
  title: string
  score: number
  fields: Record<
    FieldName,
    {
      content: string
      status: "complete" | "partial" | "missing"
      suggestion?: string
    }
  >
  audit: AuditResults
  /** When true, indicates brief is being streamed — enables animate on score */
  isStreaming?: boolean
  /** Callback triggered when the "Re-auditar" button is clicked */
  onReaudit?: () => void
  /** When true, shows loading state on the "Re-auditar" button */
  isReauditing?: boolean
  /** Callback triggered when a field is saved via inline editor */
  onFieldSave?: (data: { field: string; content: string }) => Promise<void>
  /** Brief ID — passed through for context */
  briefId?: string
  /** Anonymous ID — passed through for context */
  anonymousId?: string
  /** Key used to force ScoreDisplay re-mount and re-animate */
  scoreKey?: number
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function BriefView({
  title,
  score,
  fields,
  audit,
  isStreaming = false,
  onReaudit,
  isReauditing = false,
  onFieldSave,
  scoreKey,
}: BriefViewProps) {
  return (
    <div className="mx-auto max-w-7xl px-6">
      {/* Header: title + score + re-audit button */}
      <div className="mb-8 flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:justify-between">
        <h1 className="font-display text-3xl tracking-tight text-text">
          {title}
        </h1>
        <div className="flex items-center gap-4">
          <CreationChecklist fields={fields} audit={audit} />
          {onReaudit && (
            <button
              type="button"
              onClick={onReaudit}
              disabled={isReauditing}
              className="inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              {isReauditing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Re-auditando...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  Re-auditar
                </>
              )}
            </button>
          )}
          <ScoreDisplay
            key={scoreKey ?? score}
            score={score}
            animate={isReauditing || isStreaming}
          />
        </div>
      </div>

      {/* Split-view: brief fields (left) + audit panel (right) */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_400px]">
        {/* Left column: brief fields */}
        <div data-testid="brief-column" className="space-y-4">
          {FIELD_NAMES.map((fieldName, index) => (
            <motion.div
              key={fieldName}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                delay: index * 0.08,
                ease: "easeOut",
              }}
            >
              <BriefField
                label={FIELD_LABELS[fieldName]["pt-BR"]}
                field={fields[fieldName]}
                editable={!!onFieldSave}
                fieldName={fieldName}
                onSave={onFieldSave}
              />
            </motion.div>
          ))}
        </div>

        {/* Right column: audit panel */}
        <div data-testid="audit-column" className="lg:sticky lg:top-24 lg:self-start">
          <AuditPanel audit={audit} fields={fields} />
        </div>
      </div>
    </div>
  )
}
