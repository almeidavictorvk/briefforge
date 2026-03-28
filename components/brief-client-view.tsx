"use client"

import { ClientField } from "@/components/client-field"
import type { FieldName, FieldStatus } from "@/lib/types"
import { FIELD_NAMES } from "@/lib/types"

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface BriefClientViewProps {
  title: string
  fields: Record<FieldName, { content: string; status: FieldStatus; suggestion?: string }>
  clientInputs?: Record<string, string>
  onFieldSave: (fieldName: string, content: string) => Promise<void>
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function BriefClientView({
  title,
  fields,
  clientInputs = {},
  onFieldSave,
}: BriefClientViewProps) {
  // Build effective status: if client already submitted input for a field, treat it as complete
  const getEffectiveStatus = (name: FieldName) => {
    if (clientInputs[name]) return "complete"
    return fields[name].status
  }

  // Count complete fields (including client-submitted ones)
  const completeCount = FIELD_NAMES.filter(
    (name) => getEffectiveStatus(name) === "complete"
  ).length
  const totalCount = FIELD_NAMES.length
  const allComplete = completeCount === totalCount

  // Filter and order: missing first, then partial — exclude complete (including client-submitted)
  const pendingFields = FIELD_NAMES.filter(
    (name) => getEffectiveStatus(name) === "missing"
  )
  const partialFields = FIELD_NAMES.filter(
    (name) => getEffectiveStatus(name) === "partial"
  )
  const orderedPending: FieldName[] = [...pendingFields, ...partialFields]

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      {/* Brief title */}
      <h1 className="mb-4 font-serif text-3xl font-light tracking-tight text-text">
        {title}
      </h1>

      {allComplete ? (
        /* Thank you state */
        <div className="rounded-3xl border border-success/30 bg-success/10 p-8 text-center">
          <p className="text-lg font-medium text-text">
            Obrigado! Todas as informações foram preenchidas.
          </p>
        </div>
      ) : (
        <>
          {/* Welcome message */}
          <p className="mb-6 text-base leading-relaxed text-text-secondary">
            Olá! Sua agência precisa de algumas informações para dar vida ao seu
            projeto.
          </p>

          {/* Progress indicator */}
          <p className="mb-8 text-sm font-medium text-text-muted">
            {completeCount} de {totalCount} campos preenchidos
          </p>

          {/* Pending fields */}
          <div className="flex flex-col gap-6">
            {orderedPending.map((name) => (
              <ClientField
                key={name}
                fieldName={name}
                field={fields[name]}
                clientInput={clientInputs[name]}
                onSave={onFieldSave}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
