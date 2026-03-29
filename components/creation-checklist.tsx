"use client"

import { useState } from "react"
import { ClipboardCheck, Copy, Check } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import type { FieldName, AuditResults } from "@/lib/types"

// ---------------------------------------------------------------------------
// The 4 key creation fields, matching the PDF "Checklist para Criação"
// ---------------------------------------------------------------------------

const CHECKLIST_ITEMS: { field: FieldName; label: string }[] = [
  { field: "deliverables", label: "Produzir" },
  { field: "audience", label: "Para" },
  { field: "tone", label: "Tom" },
  { field: "timeline", label: "Prazo" },
]

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface CreationChecklistProps {
  fields: Record<
    FieldName,
    {
      content: string
      status: "complete" | "partial" | "missing"
      suggestion?: string
    }
  >
  audit: AuditResults
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CreationChecklist({ fields }: CreationChecklistProps) {
  const [copied, setCopied] = useState(false)

  function buildChecklistText() {
    return CHECKLIST_ITEMS.map(({ field, label }) => {
      const f = fields[field]
      const hasContent = f.status !== "missing" && f.content.trim()
      if (!hasContent) return `${label}: A definir`
      return `${label}: ${f.content}`
    }).join("\n\n")
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(buildChecklistText())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full border border-bf-border bg-surface px-5 py-2.5 text-sm font-medium text-text transition-all duration-300 hover:scale-105 hover:bg-surface-hover active:scale-95"
        >
          <ClipboardCheck className="h-4 w-4" />
          Checklist
        </button>
      </DialogTrigger>

      <DialogContent showCloseButton={false} className="max-h-[85vh] overflow-y-auto border-bf-border bg-bg sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="font-display text-lg tracking-tight text-text">
              Checklist para Criação
            </DialogTitle>
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 rounded-full border border-bf-border px-3 py-1.5 text-xs font-medium text-text-secondary transition-all duration-300 hover:scale-105 hover:bg-surface-hover active:scale-95"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-success" />
                  Copiado
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  Copiar
                </>
              )}
            </button>
          </div>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-1">
          {CHECKLIST_ITEMS.map(({ field, label }) => {
            const f = fields[field]
            const hasContent = f.status !== "missing" && f.content.trim()

            return (
              <div key={field} className="flex gap-3">
                {/* Checkmark or dash */}
                <div className="mt-0.5 flex-shrink-0">
                  {hasContent ? (
                    <span className="text-sm text-accent">&#10003;</span>
                  ) : (
                    <span className="text-sm text-text-muted">&#8212;</span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  {/* Label + summary */}
                  <p className="text-sm text-text">
                    <span className="font-semibold">{label}:</span>{" "}
                    {hasContent ? (
                      <span className="text-text-secondary">
                        {summarize(f.content)}
                      </span>
                    ) : (
                      <span className="italic text-text-muted">A definir</span>
                    )}
                  </p>

                  {/* Full content */}
                  {hasContent && (
                    <p className="mt-1 text-sm leading-relaxed text-text-muted">
                      {f.content}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Extract a short summary (first sentence or first ~80 chars) */
function summarize(content: string): string {
  const firstSentence = content.split(/[.!?\n]/)[0]?.trim() ?? content
  if (firstSentence.length <= 80) return firstSentence
  return firstSentence.slice(0, 77) + "..."
}
