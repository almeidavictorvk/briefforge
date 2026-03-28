"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { FIELD_LABELS, FIELD_NAMES } from "@/lib/types"
import type { AuditResults, FieldName } from "@/lib/types"

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface AuditPanelProps {
  audit: AuditResults
  /** Brief fields — used to show complete fields and to retrieve field-level suggestions */
  fields?: Partial<
    Record<
      FieldName,
      { content: string; status: "complete" | "partial" | "missing"; suggestion?: string }
    >
  >
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Map raw field key (e.g. "objective") to PT-BR label. Falls back to raw key. */
function fieldLabel(field: string): string {
  const key = field.toLowerCase().trim() as FieldName
  return FIELD_LABELS[key]?.["pt-BR"] ?? field
}

const SEVERITY_META = {
  critical: {
    label: "Crítico",
    description: "Informação essencial ausente — o briefing não pode avançar sem ela.",
    dotClass: "bg-error",
    bgClass: "bg-error/10 border-error/20",
    textClass: "text-error",
    iconBg: "bg-error/15 text-error",
  },
  warning: {
    label: "Atenção",
    description: "Informação incompleta ou vaga — pode gerar retrabalho.",
    dotClass: "bg-warning",
    bgClass: "bg-warning/10 border-warning/20",
    textClass: "text-warning",
    iconBg: "bg-warning/15 text-warning",
  },
} as const

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SeverityDot({ severity }: { severity: "critical" | "warning" }) {
  const meta = SEVERITY_META[severity]
  return (
    <span
      className={`mt-0.5 flex h-2.5 w-2.5 shrink-0 rounded-full ${meta.dotClass}`}
      aria-label={meta.label}
    />
  )
}

function GapItem({
  gap,
  previewText,
  onClick,
}: {
  gap: { field: string; severity: "critical" | "warning"; suggestion: string }
  /** Fallback preview text from the field-level suggestion */
  previewText?: string
  onClick: () => void
}) {
  const meta = SEVERITY_META[gap.severity]
  const label = fieldLabel(gap.field)
  const preview = gap.suggestion || previewText

  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className={`group flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] ${meta.bgClass}`}
      >
        <SeverityDot severity={gap.severity} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-text">
              {label}
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${meta.bgClass} ${meta.textClass}`}
            >
              {meta.label}
            </span>
          </div>
          {preview && (
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-text-muted">
              {preview}
            </p>
          )}
        </div>
        <span className="mt-0.5 shrink-0 text-text-muted opacity-0 transition-opacity group-hover:opacity-100">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      </button>
    </li>
  )
}

function GapDetailDialog({
  gap,
  suggestionText,
  open,
  onOpenChange,
}: {
  gap: { field: string; severity: "critical" | "warning"; suggestion: string }
  /** Resolved suggestion text: gap.suggestion or field-level suggestion */
  suggestionText: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const meta = SEVERITY_META[gap.severity]
  const label = fieldLabel(gap.field)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-bf-border bg-surface text-text sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${meta.iconBg}`}>
              {gap.severity === "critical" ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495ZM10 6a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 6Zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </span>
            <div>
              <DialogTitle className="text-base font-semibold text-text">
                {label}
              </DialogTitle>
              <DialogDescription asChild>
                <span className={`text-xs font-medium ${meta.textClass}`}>
                  {meta.label} — {meta.description}
                </span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div>
            <h4 className="mb-2 text-xs font-medium uppercase tracking-widest text-text-secondary">
              O que está faltando
            </h4>
            <p className="text-sm leading-relaxed text-text">
              {suggestionText}
            </p>
          </div>

          <div className={`rounded-lg border p-3 ${meta.bgClass}`}>
            <p className="text-xs leading-relaxed text-text-muted">
              <strong className={meta.textClass}>Dica:</strong>{" "}
              {gap.severity === "critical"
                ? "Este campo é fundamental para a execução do projeto. Sem ele, a equipe criativa não terá direção suficiente para avançar."
                : "Este campo tem informação parcial. Complementá-lo evita retrabalho e alinha expectativas com o cliente."}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function ContradictionItem({
  contradiction,
}: {
  contradiction: { description: string; fields: string[] }
}) {
  return (
    <li className="rounded-xl border border-error/20 bg-error/5 px-4 py-3">
      <p className="text-sm leading-relaxed text-text">{contradiction.description}</p>
      {contradiction.fields?.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {contradiction.fields.map((field) => (
            <span
              key={field}
              className="rounded-full bg-error/10 px-2.5 py-0.5 text-xs font-medium text-error"
            >
              {fieldLabel(field)}
            </span>
          ))}
        </div>
      )}
    </li>
  )
}

function SectionHeading({
  children,
  count,
}: {
  children: React.ReactNode
  count?: number
}) {
  return (
    <div className="flex items-center gap-2">
      <h3 className="text-xs font-medium uppercase tracking-widest text-text-secondary">
        {children}
      </h3>
      {count !== undefined && count > 0 && (
        <span className="rounded-full bg-bf-border/60 px-2 py-0.5 text-[10px] font-semibold tabular-nums text-text-muted">
          {count}
        </span>
      )}
    </div>
  )
}

function EmptyGapsMessage() {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-success/20 bg-success/5 px-4 py-3">
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success/15 text-success">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-3.5 w-3.5"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
            clipRule="evenodd"
          />
        </svg>
      </span>
      <p className="text-sm text-success">Briefing completo — nenhuma lacuna</p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Complete fields section
// ---------------------------------------------------------------------------

function CompleteFieldItem({ fieldName }: { fieldName: string }) {
  return (
    <li className="flex items-center gap-2.5 rounded-lg border border-success/15 bg-success/5 px-3 py-2">
      <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-success/20 text-success">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-2.5 w-2.5"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
            clipRule="evenodd"
          />
        </svg>
      </span>
      <span className="text-xs font-medium text-success/80">
        {fieldLabel(fieldName)}
      </span>
    </li>
  )
}

// ---------------------------------------------------------------------------
// Severity legend
// ---------------------------------------------------------------------------

function SeverityLegend() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full bg-error" />
        <span className="text-[10px] font-medium uppercase tracking-wider text-text-muted">
          Crítico
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full bg-warning" />
        <span className="text-[10px] font-medium uppercase tracking-wider text-text-muted">
          Atenção
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full bg-success" />
        <span className="text-[10px] font-medium uppercase tracking-wider text-text-muted">
          OK
        </span>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function AuditPanel({ audit, fields }: AuditPanelProps) {
  const [selectedGap, setSelectedGap] = useState<{
    field: string
    severity: "critical" | "warning"
    suggestion: string
  } | null>(null)

  const gaps = audit.gaps ?? []
  const contradictions = (audit.contradictions ?? []).filter(
    (c) => c.description && c.description.trim() !== ""
  )
  const hasGaps = gaps.length > 0
  const hasContradictions = contradictions.length > 0

  // Group gaps by severity
  const criticalGaps = gaps.filter((g) => g.severity === "critical")
  const warningGaps = gaps.filter((g) => g.severity === "warning")

  // Determine complete fields (fields with status "complete" that are NOT in gaps)
  const gapFieldKeys = new Set(gaps.map((g) => g.field.toLowerCase().trim()))
  const completeFields = fields
    ? FIELD_NAMES.filter(
        (name) =>
          fields[name]?.status === "complete" && !gapFieldKeys.has(name)
      )
    : []

  /** Resolve suggestion for a gap: gap.suggestion → field.suggestion → fallback */
  function resolveSuggestion(gap: { field: string; severity: "critical" | "warning"; suggestion: string }): string {
    if (gap.suggestion) return gap.suggestion
    const key = gap.field.toLowerCase().trim() as FieldName
    const fieldSuggestion = fields?.[key]?.suggestion
    if (fieldSuggestion) return fieldSuggestion
    return gap.severity === "critical"
      ? `O campo "${fieldLabel(gap.field)}" é essencial para avançar com o projeto. Peça ao cliente informações detalhadas sobre este item.`
      : `O campo "${fieldLabel(gap.field)}" está incompleto. Solicite mais detalhes ao cliente para evitar retrabalho.`
  }

  return (
    <>
      <div className="space-y-6 rounded-2xl border border-bf-border bg-surface p-6">
        {/* Legend */}
        <SeverityLegend />

        {/* Gaps section */}
        <section className="space-y-3">
          <SectionHeading count={gaps.length}>Lacunas</SectionHeading>

          {hasGaps ? (
            <div className="space-y-2">
              {criticalGaps.map((gap, idx) => (
                <GapItem
                  key={`critical-${gap.field}-${idx}`}
                  gap={gap}
                  previewText={resolveSuggestion(gap)}
                  onClick={() => setSelectedGap(gap)}
                />
              ))}
              {warningGaps.map((gap, idx) => (
                <GapItem
                  key={`warning-${gap.field}-${idx}`}
                  gap={gap}
                  previewText={resolveSuggestion(gap)}
                  onClick={() => setSelectedGap(gap)}
                />
              ))}
            </div>
          ) : (
            <EmptyGapsMessage />
          )}
        </section>

        {/* Complete fields section */}
        {completeFields.length > 0 && (
          <section className="space-y-3">
            <SectionHeading count={completeFields.length}>
              Campos completos
            </SectionHeading>
            <ul className="grid grid-cols-2 gap-1.5">
              {completeFields.map((name) => (
                <CompleteFieldItem key={name} fieldName={name} />
              ))}
            </ul>
          </section>
        )}

        {/* Contradictions section — only rendered when non-empty */}
        {hasContradictions && (
          <section className="space-y-3">
            <SectionHeading count={contradictions.length}>
              Contradições
            </SectionHeading>
            <ul className="space-y-2">
              {contradictions.map((contradiction, idx) => (
                <ContradictionItem key={idx} contradiction={contradiction} />
              ))}
            </ul>
          </section>
        )}

        {/* Overall note section */}
        {audit.overall_note && audit.overall_note.trim() !== "" && (
          <section className="space-y-3">
            <SectionHeading>Nota Geral</SectionHeading>
            <p className="text-sm leading-relaxed text-text-muted">
              {audit.overall_note}
            </p>
          </section>
        )}
      </div>

      {/* Gap detail dialog */}
      {selectedGap && (
        <GapDetailDialog
          gap={selectedGap}
          suggestionText={resolveSuggestion(selectedGap)}
          open={!!selectedGap}
          onOpenChange={(open) => {
            if (!open) setSelectedGap(null)
          }}
        />
      )}
    </>
  )
}
