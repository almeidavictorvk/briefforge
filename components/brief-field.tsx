"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { FieldStatusBadge } from "@/components/field-status-badge"
import { Lightbulb, Pencil, Check, X, Loader2 } from "lucide-react"

interface BriefFieldProps {
  label: string
  field: {
    content: string
    status: "complete" | "partial" | "missing"
    suggestion?: string
  }
  editable?: boolean
  fieldName?: string
  onSave?: (data: { field: string; content: string }) => Promise<void>
}

const borderByStatus = {
  complete: "border-l-success/60 border-success/30 bg-success/5",
  partial: "border-l-warning/60 border-warning/30 bg-warning/5",
  missing: "border-l-error/60 border-error/30 bg-error/5",
} as const

export function BriefField({ label, field, editable, fieldName, onSave }: BriefFieldProps) {
  const isMissing = field.status === "missing"
  const showSuggestion = field.status !== "complete" && !!field.suggestion

  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(field.content)
  const [isSaving, setIsSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea based on content
  const autoResize = useCallback(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = "auto"
      textarea.style.height = `${textarea.scrollHeight}px`
    }
  }, [])

  useEffect(() => {
    if (isEditing) {
      autoResize()
    }
  }, [isEditing, editContent, autoResize])

  const handleEdit = () => {
    setEditContent(field.content)
    setIsEditing(true)
  }

  const handleCancel = () => {
    setEditContent(field.content)
    setIsEditing(false)
  }

  const handleSave = async () => {
    if (!onSave || !fieldName) return
    setIsSaving(true)
    try {
      await onSave({ field: fieldName, content: editContent })
      setShowSuccess(true)
      setTimeout(() => {
        setShowSuccess(false)
        setIsEditing(false)
      }, 600)
    } finally {
      setIsSaving(false)
    }
  }

  const successBorder = showSuccess
    ? "border-l-success/80 border-success/50 bg-success/10"
    : borderByStatus[field.status]

  return (
    <div
      className={`rounded-2xl border border-l-4 p-5 transition-all duration-300 ${successBorder}`}
    >
      {/* Header: label + edit button + status badge */}
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-widest text-text-secondary">
          {label}
        </span>
        <div className="flex items-center gap-2">
          {editable && !isEditing && (
            <button
              type="button"
              aria-label="Editar"
              onClick={handleEdit}
              className="rounded-full p-1.5 text-text-muted transition-colors duration-200 hover:bg-surface-hover hover:text-text"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          )}
          <FieldStatusBadge status={field.status} />
        </div>
      </div>

      {/* Edit mode */}
      {isEditing ? (
        <div className="space-y-3">
          <textarea
            ref={textareaRef}
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            placeholder="Preencha este campo..."
            className="w-full resize-none rounded-xl border border-border bg-surface p-3 text-text outline-none transition-colors duration-200 focus:border-accent"
            rows={3}
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Salvar"
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-1.5 text-xs font-medium text-white transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" data-testid="save-loading" />
                  Salvando...
                </>
              ) : (
                <>
                  <Check className="h-3.5 w-3.5" />
                  Salvar
                </>
              )}
            </button>
            <button
              type="button"
              aria-label="Cancelar"
              onClick={handleCancel}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-1.5 text-xs font-medium text-text-secondary transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              <X className="h-3.5 w-3.5" />
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Content or missing placeholder */}
          {isMissing ? (
            <p className="text-sm italic text-text-muted">
              Informação não fornecida
            </p>
          ) : (
            <p className="text-text whitespace-pre-wrap">{field.content}</p>
          )}

          {/* Suggestion (only when not complete) */}
          {showSuggestion && (
            <div className="mt-3 flex items-start gap-2 text-sm italic text-text-muted">
              <Lightbulb className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{field.suggestion}</span>
            </div>
          )}
        </>
      )}

      {/* Success checkmark overlay */}
      {showSuccess && (
        <div className="mt-2 flex items-center gap-1.5 text-sm font-medium text-success">
          <Check className="h-4 w-4" />
          Salvo
        </div>
      )}
    </div>
  )
}
