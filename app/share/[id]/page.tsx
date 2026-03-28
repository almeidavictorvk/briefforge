'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import { BriefClientView } from '@/components/brief-client-view'
import type { ParsedBrief } from '@/lib/supabase/helpers'

// ---------------------------------------------------------------------------
// Page: /share/[id] — Brief Vivo (public client view)
// ---------------------------------------------------------------------------

export default function SharePage() {
  const params = useParams<{ id: string }>()

  const [brief, setBrief] = useState<ParsedBrief | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // -------------------------------------------------------------------------
  // Load brief on mount
  // -------------------------------------------------------------------------
  useEffect(() => {
    async function loadBrief() {
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
        const loadedBrief = data.brief as ParsedBrief

        // Check if brief is shared
        if (!loadedBrief.share_enabled) {
          setError('Este brief não está compartilhado')
          return
        }

        setBrief(loadedBrief)
      } catch {
        setError('Erro ao carregar brief')
      } finally {
        setLoading(false)
      }
    }

    loadBrief()
  }, [params.id])

  // -------------------------------------------------------------------------
  // Update client_last_seen on mount (lightweight PATCH)
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (!brief) return

    async function updateLastSeen() {
      try {
        await fetch(`/api/brief/${params.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ client_inputs: {} }),
        })
      } catch {
        // Silent fail — not critical
      }
    }

    updateLastSeen()
  }, [brief, params.id])

  // -------------------------------------------------------------------------
  // Handle field save from client
  // -------------------------------------------------------------------------
  const handleFieldSave = useCallback(
    async (fieldName: string, content: string) => {
      const res = await fetch(`/api/brief/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_inputs: { [fieldName]: content },
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
    [params.id]
  )

  // -------------------------------------------------------------------------
  // Loading state
  // -------------------------------------------------------------------------
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-bf-border border-t-accent" />
          <p className="text-sm text-text-secondary">Carregando...</p>
        </div>
      </div>
    )
  }

  // -------------------------------------------------------------------------
  // Error state
  // -------------------------------------------------------------------------
  if (error) {
    return (
      <div className="flex min-h-screen flex-col">
        {/* Simplified header */}
        <header className="border-b border-bf-border px-6 py-4">
          <span className="font-serif text-xl font-light tracking-tight text-text">
            BriefForge
          </span>
        </header>

        <div className="flex flex-1 items-center justify-center">
          <div className="flex flex-col items-center gap-4 text-center">
            <p className="text-lg text-text-secondary">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  // -------------------------------------------------------------------------
  // Brief not available (shouldn't happen, but safe guard)
  // -------------------------------------------------------------------------
  if (!brief) {
    return null
  }

  // -------------------------------------------------------------------------
  // Success state — render BriefClientView
  // -------------------------------------------------------------------------
  const clientInputs: Record<string, string> = {}
  if (brief.client_inputs && typeof brief.client_inputs === 'object') {
    for (const [key, value] of Object.entries(brief.client_inputs)) {
      if (typeof value === 'string') {
        clientInputs[key] = value
      }
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Simplified header */}
      <header className="border-b border-bf-border px-6 py-4">
        <span className="font-serif text-xl font-light tracking-tight text-text">
          BriefForge
        </span>
      </header>

      {/* Client view */}
      <main className="flex-1">
        <BriefClientView
          title={brief.title ?? 'Brief'}
          fields={brief.fields}
          clientInputs={clientInputs}
          onFieldSave={handleFieldSave}
        />
      </main>
    </div>
  )
}
