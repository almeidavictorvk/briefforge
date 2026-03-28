'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { useAnonymousId } from '@/hooks/use-anonymous-id'
import { createClient } from '@/lib/supabase/client'
import { BriefCard } from '@/components/brief-card'
import type { BriefStatus } from '@/lib/types'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface HistoryBrief {
  id: string
  title: string | null
  score: number
  status: string
  share_enabled: boolean
  client_inputs: Record<string, string>
  structured_brief: Record<string, { content?: string; status?: string }>
  created_at: string
  updated_at: string
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Count pending fields (missing or partial) from the structured_brief object.
 */
function countPendingFields(
  structuredBrief: Record<string, { content?: string; status?: string }>
): number {
  let count = 0
  for (const key of Object.keys(structuredBrief)) {
    const field = structuredBrief[key]
    if (field && (field.status === 'missing' || field.status === 'partial')) {
      count++
    }
  }
  return count
}

// ---------------------------------------------------------------------------
// History Page
// ---------------------------------------------------------------------------

export default function HistoryPage() {
  const { anonymousId, isReady } = useAnonymousId()
  const [briefs, setBriefs] = useState<HistoryBrief[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  // -----------------------------------------------------------------------
  // Load briefs
  // -----------------------------------------------------------------------

  const loadBriefs = useCallback(async () => {
    if (!isReady || !anonymousId) return

    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('briefs')
        .select('id, title, score, status, share_enabled, client_inputs, structured_brief, created_at, updated_at')
        .eq('anonymous_id', anonymousId)
        .order('updated_at', { ascending: false })
        .limit(50)

      if (!error && data) {
        setBriefs(data as HistoryBrief[])
      }
    } catch {
      // Supabase may not be available in dev — fail silently
    } finally {
      setIsLoading(false)
    }
  }, [anonymousId, isReady])

  useEffect(() => {
    loadBriefs()
  }, [loadBriefs])

  // -----------------------------------------------------------------------
  // Filtered briefs (client-side search)
  // -----------------------------------------------------------------------

  const filteredBriefs = useMemo(() => {
    if (!searchQuery.trim()) return briefs

    const query = searchQuery.toLowerCase()
    return briefs.filter((brief) =>
      (brief.title ?? '').toLowerCase().includes(query)
    )
  }, [briefs, searchQuery])

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  return (
    <main className="min-h-[calc(100vh-4rem)]">
      <section className="py-24 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-baseline gap-3">
              <h1 className="font-display text-5xl md:text-6xl font-light tracking-tight text-text">
                Seus Briefs
              </h1>
              {!isLoading && briefs.length > 0 && (
                <span className="font-mono text-lg text-text-muted">
                  ({briefs.length})
                </span>
              )}
            </div>
          </div>

          {/* Search */}
          {!isLoading && briefs.length > 0 && (
            <div className="mb-10">
              <input
                type="text"
                placeholder="Buscar por título..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full max-w-md rounded-full border border-bf-border bg-surface px-4 py-2 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
            </div>
          )}

          {/* Content */}
          {isLoading ? (
            /* Loading skeletons */
            <div className="grid gap-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="animate-pulse rounded-2xl bg-surface border border-bf-border h-28"
                />
              ))}
            </div>
          ) : briefs.length === 0 ? (
            /* Empty state */
            <div className="text-center py-24">
              <p className="text-text-muted text-lg mb-6">
                Você ainda não criou nenhum brief.
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-medium text-white transition-all duration-300 hover:scale-105 active:scale-95"
              >
                Criar primeiro brief
              </Link>
            </div>
          ) : (
            /* Brief cards grid */
            <div className="grid gap-4">
              {filteredBriefs.map((brief) => (
                <BriefCard
                  key={brief.id}
                  id={brief.id}
                  title={brief.title ?? 'Brief sem título'}
                  score={brief.score}
                  status={brief.status as BriefStatus}
                  createdAt={brief.created_at}
                  updatedAt={brief.updated_at}
                  clientInputs={brief.client_inputs}
                  pendingFieldCount={countPendingFields(brief.structured_brief)}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
