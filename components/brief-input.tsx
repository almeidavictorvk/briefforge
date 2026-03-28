'use client'

import { useState } from 'react'
import { ClipboardPaste, Loader2, Sparkles } from 'lucide-react'

interface BriefInputProps {
  onSubmit: (text: string) => void
  isLoading?: boolean
}

const MIN_CHARS = 10

export function BriefInput({ onSubmit, isLoading = false }: BriefInputProps) {
  const [value, setValue] = useState('')

  const charCount = value.length
  const isDisabled = charCount < MIN_CHARS || isLoading

  function handleSubmit() {
    if (!isDisabled) {
      onSubmit(value)
    }
  }

  async function handlePaste() {
    try {
      const text = await navigator.clipboard.readText()
      setValue((prev) => prev + text)
    } catch {
      // Clipboard API not available or permission denied — fail silently
    }
  }

  return (
    <div className="w-full space-y-4">
      {/* Textarea container */}
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Cole aqui a transcrição, email, mensagem de WhatsApp, notas de reunião..."
          rows={6}
          className="w-full min-h-[180px] resize-y rounded-2xl border border-bf-border bg-surface px-5 py-4 font-body text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition duration-300 text-base leading-relaxed"
        />

        {/* Paste button — top-right corner of textarea */}
        <button
          type="button"
          onClick={handlePaste}
          aria-label="Colar"
          className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full border border-bf-border bg-surface-hover px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-text hover:scale-105 active:scale-95 transition duration-300"
        >
          <ClipboardPaste className="h-3.5 w-3.5" />
          <span>Colar</span>
        </button>
      </div>

      {/* Footer: character counter + submit button */}
      <div className="flex items-center justify-between">
        {/* Character counter */}
        <span className="text-sm font-mono text-text-muted tabular-nums">
          {charCount}
        </span>

        {/* Submit button */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isDisabled}
          aria-label={isLoading ? 'Gerando brief...' : 'Forjar Brief'}
          className="flex items-center gap-2 rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent/25 hover:scale-105 active:scale-95 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:active:scale-100"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Gerando...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              <span>Forjar Brief</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
