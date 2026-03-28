'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { ParsedBrief } from '@/lib/supabase/helpers'

/**
 * useBriefRealtime — subscribes to Supabase Realtime changes on a specific brief row.
 *
 * Uses Realtime as a notification trigger only — always fetches the full brief
 * from the API to avoid issues with incomplete JSONB data in realtime payloads.
 *
 * Falls back to polling every 5s if the realtime connection fails.
 */
export function useBriefRealtime(
  briefId: string | undefined,
  onUpdate?: (brief: ParsedBrief) => void
) {
  const [brief, setBrief] = useState<ParsedBrief | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const onUpdateRef = useRef(onUpdate)
  useEffect(() => {
    onUpdateRef.current = onUpdate
  }, [onUpdate])

  // Polling fallback ref
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Fetch the full brief from the API (used by both realtime and polling)
  const fetchBrief = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/brief/${id}`)
      if (res.ok) {
        const data = await res.json()
        const parsed = data.brief as ParsedBrief
        setBrief(parsed)
        onUpdateRef.current?.(parsed)
      }
    } catch {
      // Silently fail
    }
  }, [])

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current)
      pollingRef.current = null
    }
  }, [])

  const startPolling = useCallback(
    (id: string) => {
      stopPolling()
      pollingRef.current = setInterval(() => fetchBrief(id), 5000)
    },
    [stopPolling, fetchBrief]
  )

  useEffect(() => {
    if (!briefId) return

    const supabase = createClient()
    const channelName = `brief-realtime-${briefId}`

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'briefs',
          filter: `id=eq.${briefId}`,
        },
        () => {
          // Realtime fires as notification — fetch full data from API
          fetchBrief(briefId)
        }
      )
      .subscribe((status: string) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true)
          stopPolling()
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          setIsConnected(false)
          startPolling(briefId)
        }
      })

    return () => {
      stopPolling()
      supabase.removeChannel(channel)
      setIsConnected(false)
    }
  }, [briefId, startPolling, stopPolling, fetchBrief])

  return { brief, isConnected }
}
