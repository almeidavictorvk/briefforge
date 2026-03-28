'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAnonymousId } from '@/hooks/use-anonymous-id'
import { createClient } from '@/lib/supabase/client'
import { BriefInput } from '@/components/brief-input'
import { BriefCard } from '@/components/brief-card'
import type { BriefStatus } from '@/lib/types'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface RecentBrief {
  id: string
  title: string | null
  score: number
  status: string
  created_at: string
}

// ---------------------------------------------------------------------------
// Home Page
// ---------------------------------------------------------------------------

export default function Home() {
  const router = useRouter()
  const { anonymousId, isReady } = useAnonymousId()
  const [recentBriefs, setRecentBriefs] = useState<RecentBrief[]>([])
  const [isLoadingBriefs, setIsLoadingBriefs] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // -----------------------------------------------------------------------
  // Load recent briefs
  // -----------------------------------------------------------------------

  const loadRecentBriefs = useCallback(async () => {
    if (!isReady || !anonymousId) return

    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('briefs')
        .select('id, title, score, status, created_at')
        .eq('anonymous_id', anonymousId)
        .order('updated_at', { ascending: false })
        .limit(5)

      if (!error && data) {
        setRecentBriefs(data)
      }
    } catch {
      // Supabase may not be available in dev — fail silently
    } finally {
      setIsLoadingBriefs(false)
    }
  }, [anonymousId, isReady])

  useEffect(() => {
    loadRecentBriefs()
  }, [loadRecentBriefs])

  // -----------------------------------------------------------------------
  // Submit: create brief row → navigate to /brief/[id]
  // -----------------------------------------------------------------------

  async function handleSubmit(rawInput: string) {
    if (!isReady || !anonymousId) return

    setIsSubmitting(true)

    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('briefs')
        .insert({
          anonymous_id: anonymousId,
          raw_input: rawInput,
          language: 'pt-BR',
        })
        .select('id')
        .single()

      if (!error && data) {
        // Store raw input in sessionStorage for the brief page to pick up
        // and trigger AI generation via streaming
        sessionStorage.setItem(`brief-raw-input-${data.id}`, rawInput)
        router.push(`/brief/${data.id}?streaming=true`)
      }
    } catch {
      // Handle error gracefully
    } finally {
      setIsSubmitting(false)
    }
  }

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  return (
    <main className="min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="py-24 px-6 md:px-12">
        <div className="max-w-3xl mx-auto text-center">
          {/* Decorative label */}
          <span className="inline-block text-xs font-medium uppercase tracking-widest text-text-muted mb-8">
            Briefings estruturados com IA
          </span>

          {/* Oversized heading with mixed emphasis */}
          <h1 className="font-display text-6xl md:text-7xl lg:text-8xl font-light tracking-tight leading-[0.95] text-text">
            De caos para{' '}
            <span className="italic text-accent">estratégia</span>.
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-xl text-text-secondary max-w-xl mx-auto leading-relaxed">
            Cole o pedido do cliente. A IA faz o resto.
          </p>

          {/* BriefInput */}
          <div className="mt-12 max-w-2xl mx-auto">
            <BriefInput onSubmit={handleSubmit} isLoading={isSubmitting} />
          </div>
        </div>
      </section>

      {/* Recent Briefs Section */}
      <section className="py-16 px-6 md:px-12">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display text-2xl font-light text-text mb-8">
            Recentes
          </h2>

          {isLoadingBriefs ? (
            /* Loading skeleton */
            <div className="grid gap-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-24 rounded-2xl bg-surface animate-pulse border border-bf-border"
                />
              ))}
            </div>
          ) : recentBriefs.length > 0 ? (
            /* Brief cards grid */
            <div className="grid gap-4">
              {recentBriefs.map((brief) => (
                <BriefCard
                  key={brief.id}
                  id={brief.id}
                  title={brief.title ?? 'Brief sem título'}
                  score={brief.score}
                  status={brief.status as BriefStatus}
                  createdAt={brief.created_at}
                />
              ))}
            </div>
          ) : (
            /* Empty state */
            <div className="text-center py-16">
              <p className="text-text-muted text-lg">
                Nenhum brief ainda. Cole um texto acima para começar.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
