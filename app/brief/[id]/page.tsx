'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { BriefView } from '@/components/brief-view'
import { ExportMenu } from '@/components/export-menu'
import { ShareButton } from '@/components/share-button'
import { RealtimeIndicator } from '@/components/realtime-indicator'
import { useAnonymousId } from '@/hooks/use-anonymous-id'
import { useBriefRealtime } from '@/hooks/use-brief-realtime'
import { createClient } from '@/lib/supabase/client'
import type { ParsedBrief } from '@/lib/supabase/helpers'
import type { FieldName, AuditResults } from '@/lib/types'
import { FIELD_NAMES } from '@/lib/types'

// ---------------------------------------------------------------------------
// Helper: parse partial JSON by adding missing closing brackets
// ---------------------------------------------------------------------------

function tryParsePartialJson(text: string): Record<string, unknown> | null {
  // Try direct parse first
  try {
    return JSON.parse(text)
  } catch {
    // ignored
  }

  // Try fixing by closing open braces/brackets
  let fixed = text
  const opens = { '{': 0, '[': 0 }
  let inString = false
  let escape = false

  for (const ch of fixed) {
    if (escape) {
      escape = false
      continue
    }
    if (ch === '\\') {
      escape = true
      continue
    }
    if (ch === '"') {
      inString = !inString
      continue
    }
    if (inString) continue
    if (ch === '{') opens['{']++
    if (ch === '}') opens['{']--
    if (ch === '[') opens['[']++
    if (ch === ']') opens['[']--
  }

  // If we're inside a string, close it
  if (inString) fixed += '"'

  // Close open brackets/braces
  for (let i = 0; i < opens['[']; i++) fixed += ']'
  for (let i = 0; i < opens['{']; i++) fixed += '}'

  try {
    return JSON.parse(fixed)
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
// Helper: convert streaming object to BriefView fields
// ---------------------------------------------------------------------------

const DEFAULT_FIELD = {
  content: '',
  status: 'missing' as const,
}

const DEFAULT_AUDIT: AuditResults = {
  gaps: [],
  contradictions: [],
  overall_note: '',
}

function buildFieldsFromStream(
  streamFields: Record<string, unknown> | undefined
): Record<FieldName, { content: string; status: 'complete' | 'partial' | 'missing'; suggestion?: string }> | null {
  if (!streamFields) return null

  const fields = {} as Record<
    FieldName,
    { content: string; status: 'complete' | 'partial' | 'missing'; suggestion?: string }
  >

  let hasAny = false
  for (const name of FIELD_NAMES) {
    const raw = streamFields[name]
    if (raw && typeof raw === 'object' && 'content' in raw) {
      const f = raw as Record<string, unknown>
      fields[name] = {
        content: String(f.content ?? ''),
        status: (f.status as 'complete' | 'partial' | 'missing') ?? 'missing',
      }
      if (f.suggestion) {
        fields[name].suggestion = String(f.suggestion)
      }
      hasAny = true
    } else {
      fields[name] = { ...DEFAULT_FIELD }
    }
  }

  return hasAny ? fields : null
}

// ---------------------------------------------------------------------------
// Page: /brief/[id]
// ---------------------------------------------------------------------------

export default function BriefPage() {
  const params = useParams<{ id: string }>()
  const { anonymousId } = useAnonymousId()

  // Brief loaded from API
  const [brief, setBrief] = useState<ParsedBrief | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isReauditing, setIsReauditing] = useState(false)
  const [scoreKey, setScoreKey] = useState(0)
  const autoReauditedRef = useRef(false)

  // Streaming state (manual fetch, no useObject)
  const [streamBrief, setStreamBrief] = useState<Record<string, unknown> | null>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamError, setStreamError] = useState<string | null>(null)
  const [streamingMode, setStreamingMode] = useState(false)

  // -------------------------------------------------------------------------
  // Realtime subscription — only active when brief is shared.
  // When a realtime update arrives with new client_inputs that complete all
  // gaps, trigger auto re-audit once. Uses a ref for handleReaudit to avoid
  // circular dependency (handleReaudit depends on brief, onRealtimeUpdate
  // sets brief).
  // -------------------------------------------------------------------------
  const pendingAutoReauditRef = useRef(false)

  const onRealtimeUpdate = useCallback(
    (updated: ParsedBrief) => {
      setBrief((prev) => {
        if (prev && !autoReauditedRef.current) {
          const prevInputs = prev.client_inputs as Record<string, unknown>
          const newInputs = updated.client_inputs as Record<string, unknown>

          const hasNewInput = FIELD_NAMES.some((name) => {
            const prevVal = prevInputs[name]
            const newVal = newInputs[name]
            return (
              typeof newVal === 'string' &&
              newVal.trim() !== '' &&
              prevVal !== newVal
            )
          })

          if (hasNewInput) {
            const allComplete = FIELD_NAMES.every((name) => {
              if (updated.fields[name].status === 'complete') return true
              const cv = newInputs[name]
              return typeof cv === 'string' && cv.trim() !== ''
            })

            if (allComplete) {
              autoReauditedRef.current = true
              pendingAutoReauditRef.current = true
            }
          }
        }

        return updated
      })
    },
    []
  )

  // -------------------------------------------------------------------------
  // handleShare — enables sharing and updates brief status
  // -------------------------------------------------------------------------
  const handleShare = useCallback(async () => {
    if (!params.id || !anonymousId) return

    const supabase = createClient()
    const { error: updateError } = await supabase
      .from('briefs')
      .update({
        share_enabled: true,
        status: 'shared',
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .eq('anonymous_id', anonymousId)

    if (updateError) {
      throw new Error('Failed to enable sharing')
    }

    setBrief((prev) =>
      prev ? { ...prev, share_enabled: true, status: 'shared' } : prev
    )
  }, [params.id, anonymousId])

  // -------------------------------------------------------------------------
  // handleFieldSave — saves an individual field edit via PATCH
  // -------------------------------------------------------------------------
  const handleFieldSave = useCallback(
    async (data: { field: string; content: string }) => {
      if (!anonymousId) return

      const res = await fetch(`/api/brief/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          field: data.field,
          content: data.content,
          anonymousId,
        }),
      })

      if (!res.ok) {
        throw new Error('Failed to save field')
      }

      const result = await res.json()
      if (result.brief) {
        setBrief(result.brief)
      }
    },
    [anonymousId, params.id]
  )

  // -------------------------------------------------------------------------
  // handleReaudit — triggers AI re-audit and saves results
  // (defined before the useEffect that calls it to avoid TDZ)
  // -------------------------------------------------------------------------
  const handleReaudit = useCallback(async () => {
    if (!brief || !anonymousId) return

    setIsReauditing(true)

    try {
      // Use brief.fields directly — client_inputs are already merged into
      // structured_brief by the PATCH API, so no extra merge is needed.
      const structured_brief: Record<string, unknown> = {}
      for (const name of FIELD_NAMES) {
        structured_brief[name] = brief.fields[name]
      }

      const auditRes = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          briefId: params.id,
          structured_brief,
          language: brief.language || 'pt-BR',
        }),
      })

      if (!auditRes.ok) throw new Error('Audit request failed')

      const auditResult = await auditRes.json() as {
        fields?: Record<string, unknown>
        audit?: Record<string, unknown>
        score?: number
        title?: string
      } | null

      if (auditResult?.fields && auditResult?.audit && auditResult?.score !== undefined) {
        const newStructuredBrief: Record<string, unknown> = {}
        for (const name of FIELD_NAMES) {
          const f = (auditResult.fields as Record<string, unknown>)[name]
          if (f) {
            newStructuredBrief[name] = f
          } else {
            newStructuredBrief[name] = structured_brief[name]
          }
        }

        const patchRes = await fetch(`/api/brief/${params.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            structured_brief: newStructuredBrief,
            audit_results: auditResult.audit,
            score: auditResult.score,
            anonymousId,
          }),
        })

        if (patchRes.ok) {
          const patchResult = await patchRes.json()
          if (patchResult.brief) {
            setBrief(patchResult.brief)
          }
        }
      } else {
        const briefRes = await fetch(`/api/brief/${params.id}`)
        if (briefRes.ok) {
          const data = await briefRes.json()
          if (data.brief) {
            setBrief(data.brief)
          }
        }
      }
    } catch (err) {
      console.error('Re-audit failed:', err)
      toast.error('Falha ao re-auditar o brief. Tente novamente.')
    } finally {
      setIsReauditing(false)
      setScoreKey((prev) => prev + 1)
    }
  }, [brief, anonymousId, params.id])

  const realtimeBriefId = brief?.share_enabled ? params.id : undefined
  useBriefRealtime(realtimeBriefId, onRealtimeUpdate)

  // Trigger auto re-audit after realtime state update
  useEffect(() => {
    if (pendingAutoReauditRef.current && brief && !isReauditing) {
      pendingAutoReauditRef.current = false
      handleReaudit()
    }
  })

  // Auto re-audit is handled inside onRealtimeUpdate above — only triggers
  // when new client_inputs arrive via realtime, never on initial page load.

  // -------------------------------------------------------------------------
  // Load brief from API
  // -------------------------------------------------------------------------
  const loadBrief = useCallback(async () => {
    try {
      const res = await fetch(`/api/brief/${params.id}`)
      if (!res.ok) {
        if (res.status === 404) {
          setError('Brief não encontrado')
        } else {
          setError('Erro ao carregar brief')
        }
        return
      }
      const data = await res.json()
      setBrief(data.brief)
    } catch {
      setError('Erro ao carregar brief')
    } finally {
      setLoading(false)
    }
  }, [params.id])

  // -------------------------------------------------------------------------
  // Main effect: streaming or loading
  //
  // StrictMode-safe: uses AbortController cleanup to cancel mount 1's fetch.
  // sessionStorage is only removed AFTER streaming succeeds, so mount 2 can
  // re-read it and start a fresh stream.
  // -------------------------------------------------------------------------
  const saveStreamedRef = useRef(false)

  useEffect(() => {
    // Check URL for streaming flag
    const urlParams = new URLSearchParams(window.location.search)
    const shouldStream = urlParams.get('streaming') === 'true'

    if (!shouldStream) {
      // Non-streaming mode: load from API
      loadBrief()
      return
    }

    const rawInput = sessionStorage.getItem(`brief-raw-input-${params.id}`)
    if (!rawInput) {
      // No rawInput (page refresh?) — load from API
      loadBrief()
      return
    }

    // Streaming mode
    setStreamingMode(true)
    setIsStreaming(true)
    setLoading(false)

    const abortController = new AbortController()
    let cancelled = false

    async function runStream() {
      try {
        const response = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rawInput, language: 'pt-BR' }),
          signal: abortController.signal,
        })

        if (!response.ok) {
          throw new Error('Failed to generate brief')
        }

        if (cancelled) return

        const finalObj = await response.json() as Record<string, unknown>
        if (finalObj) {
          setStreamBrief(finalObj)

          // Save to Supabase
          if (!saveStreamedRef.current) {
            saveStreamedRef.current = true

            const supabase = createClient()
            const structuredBrief: Record<string, unknown> = {}
            const fields = finalObj.fields as Record<string, unknown> | undefined
            if (fields) {
              for (const name of FIELD_NAMES) {
                if (fields[name]) structuredBrief[name] = fields[name]
              }
            }

            await supabase
              .from('briefs')
              .update({
                structured_brief: structuredBrief,
                audit_results: finalObj.audit ?? {},
                score: typeof finalObj.score === 'number' ? finalObj.score : 0,
                title: typeof finalObj.title === 'string' ? finalObj.title : null,
                status: 'draft',
                updated_at: new Date().toISOString(),
              })
              .eq('id', params.id)
          }
        }

        // Success — remove sessionStorage, clean URL, and transition to normal mode
        if (!cancelled) {
          sessionStorage.removeItem(`brief-raw-input-${params.id}`)
          window.history.replaceState({}, '', `/brief/${params.id}`)
          setIsStreaming(false)

          // Load the saved brief from API to transition to full view (with export/share buttons)
          try {
            const briefRes = await fetch(`/api/brief/${params.id}`)
            if (briefRes.ok) {
              const briefData = await briefRes.json()
              if (briefData.brief) {
                setBrief(briefData.brief)
                setStreamingMode(false)
              }
            }
          } catch {
            // If fetch fails, stay in streaming mode — user can refresh
          }
        }
      } catch (err) {
        if (cancelled) return
        if (err instanceof Error && err.name === 'AbortError') return
        setStreamError('Erro ao gerar brief')
        setIsStreaming(false)
      }
    }

    runStream()

    return () => {
      cancelled = true
      abortController.abort()
    }
  }, [params.id, loadBrief])

  // -------------------------------------------------------------------------
  // Derive view data from streaming brief
  // -------------------------------------------------------------------------

  const streamFields = buildFieldsFromStream(
    streamBrief?.fields as Record<string, unknown> | undefined
  )

  const streamAudit: AuditResults | null =
    streamBrief?.audit && typeof streamBrief.audit === 'object'
      ? {
          gaps: Array.isArray((streamBrief.audit as AuditResults).gaps)
            ? (streamBrief.audit as AuditResults).gaps
            : [],
          contradictions: Array.isArray((streamBrief.audit as AuditResults).contradictions)
            ? (streamBrief.audit as AuditResults).contradictions
            : [],
          overall_note:
            typeof (streamBrief.audit as AuditResults).overall_note === 'string'
              ? (streamBrief.audit as AuditResults).overall_note
              : '',
        }
      : null

  // -------------------------------------------------------------------------
  // Loading state (non-streaming only)
  // -------------------------------------------------------------------------
  if (!streamingMode && loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-bf-border border-t-accent" />
          <p className="text-sm text-text-secondary">Carregando brief...</p>
        </div>
      </div>
    )
  }

  // -------------------------------------------------------------------------
  // Error state
  // -------------------------------------------------------------------------
  if ((error || streamError) && !streamBrief) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <p className="text-lg text-text-secondary">{error || streamError}</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-surface px-5 py-2.5 text-sm font-medium text-text transition-colors hover:bg-surface-hover"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao início
          </Link>
        </div>
      </div>
    )
  }

  // -------------------------------------------------------------------------
  // Streaming view
  // -------------------------------------------------------------------------
  if (streamingMode) {
    return (
      <div className="py-8">
        {/* Back button */}
        <div className="mx-auto mb-8 max-w-7xl px-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-text-secondary transition-colors hover:text-text"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar</span>
          </Link>
        </div>

        {/* Streaming indicator */}
        {isStreaming && (
          <div className="mx-auto mb-6 max-w-7xl px-6">
            <div className="inline-flex items-center gap-3 rounded-full border border-accent/30 bg-accent/5 px-4 py-2">
              <div className="h-2 w-2 animate-pulse rounded-full bg-accent" />
              <span className="text-sm font-medium text-accent">
                Forjando seu brief...
              </span>
            </div>
          </div>
        )}

        {/* Brief content (partial during streaming) */}
        {streamFields ? (
          <BriefView
            title={streamBrief?.title ? String(streamBrief.title) : 'Gerando...'}
            score={typeof streamBrief?.score === 'number' ? streamBrief.score : 0}
            fields={streamFields}
            audit={streamAudit ?? DEFAULT_AUDIT}
            isStreaming={isStreaming}
          />
        ) : (
          <div className="flex min-h-[40vh] items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-bf-border border-t-accent" />
              <p className="text-sm text-text-secondary">Processando input...</p>
            </div>
          </div>
        )}
      </div>
    )
  }

  // -------------------------------------------------------------------------
  // Brief not available
  // -------------------------------------------------------------------------
  if (!brief) {
    return null
  }

  // -------------------------------------------------------------------------
  // Fields for display — client_inputs content is already merged into
  // structured_brief by the PATCH API. Here we only override the STATUS
  // to "complete" when the client has submitted input, because the re-audit
  // AI may set status back to "partial" based on content quality, but from
  // a workflow perspective the client fulfilled their part.
  // -------------------------------------------------------------------------
  const clientInputs = brief.client_inputs as Record<string, unknown>
  const displayFields = { ...brief.fields }
  for (const name of FIELD_NAMES) {
    const clientValue = clientInputs[name]
    if (typeof clientValue === 'string' && clientValue.trim()) {
      if (displayFields[name].status !== 'complete') {
        displayFields[name] = { ...displayFields[name], status: 'complete' }
      }
    }
  }

  // -------------------------------------------------------------------------
  // Filter audit gaps — remove gaps for fields the client has already filled.
  // The re-audit AI may still list them as gaps (based on content quality),
  // but from a workflow perspective the client fulfilled their part.
  // -------------------------------------------------------------------------
  const clientFilledFields = new Set(
    FIELD_NAMES.filter((name) => {
      const v = clientInputs[name]
      return typeof v === 'string' && v.trim() !== ''
    })
  )
  const displayAudit = {
    ...brief.audit,
    gaps: brief.audit.gaps.filter(
      (g) => !clientFilledFields.has(g.field.toLowerCase().trim() as FieldName)
    ),
  }


  // -------------------------------------------------------------------------
  // Derive realtime indicator props.
  // totalOriginalPending = number of fields that were originally pending
  // (before client filled any). This stays constant so the indicator reads
  // as progress: "X de Y campos pendentes".
  // A field is "originally pending" if either:
  //   - the client filled it (it WAS pending, now fulfilled), or
  //   - it's still not complete and the client hasn't filled it yet
  // -------------------------------------------------------------------------
  const clientFilledCount = Object.values(clientInputs).filter(
    (v) => v !== null && v !== undefined && v !== ''
  ).length

  const totalOriginalPending = FIELD_NAMES.filter((name) => {
    const clientFilled = typeof clientInputs[name] === 'string'
      && (clientInputs[name] as string).trim() !== ''
    if (clientFilled) return true
    return brief.fields[name].status !== 'complete'
  }).length

  // -------------------------------------------------------------------------
  // Success state (loaded from API)
  // -------------------------------------------------------------------------
  return (
    <div className="py-8">
      {/* Header: back button + share + realtime indicator */}
      <div className="mx-auto mb-8 max-w-7xl px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-text-secondary transition-colors hover:text-text"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar</span>
          </Link>

          <div className="flex items-center gap-4">
            {brief.share_enabled && (
              <RealtimeIndicator
                clientLastSeen={brief.client_last_seen}
                clientFilledCount={clientFilledCount}
                totalPendingCount={totalOriginalPending}
              />
            )}
            <ExportMenu
              brief={{
                title: brief.title ?? 'Brief sem título',
                score: brief.score,
                fields: displayFields,
                audit: displayAudit,
              }}
            />
            <ShareButton
              briefId={params.id}
              isShared={brief.share_enabled}
              onShare={handleShare}
            />
          </div>
        </div>
      </div>

      {/* Brief content */}
      <BriefView
        title={brief.title ?? 'Brief sem título'}
        score={brief.score}
        fields={displayFields}
        audit={displayAudit}
        briefId={params.id}
        anonymousId={anonymousId}
        onFieldSave={handleFieldSave}
        onReaudit={handleReaudit}
        isReauditing={isReauditing}
        scoreKey={scoreKey}
      />
    </div>
  )
}
