'use client'

import Link from 'next/link'
import { getScoreColor } from '@/lib/scoring'
import type { BriefStatus } from '@/lib/types'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface BriefCardProps {
  id: string
  title: string
  score: number
  status: BriefStatus
  createdAt: string // ISO date string
  updatedAt?: string // optional, for displaying "last updated"
  clientInputs?: Record<string, string> // client-filled fields
  pendingFieldCount?: number // total pending fields for progress calc
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Format a date as a relative time string in PT-BR.
 * - < 1 minute: "agora"
 * - < 60 minutes: "Xmin atras"
 * - < 24 hours: "Xh atras"
 * - < 48 hours: "ontem"
 * - Otherwise: "DD/MM/YYYY"
 */
export function formatRelativeDate(isoDate: string): string {
  const now = Date.now()
  const date = new Date(isoDate)
  const diffMs = now - date.getTime()

  const ONE_MINUTE = 60 * 1000
  const ONE_HOUR = 60 * ONE_MINUTE
  const ONE_DAY = 24 * ONE_HOUR

  if (diffMs < ONE_MINUTE) {
    return 'agora'
  }

  if (diffMs < ONE_HOUR) {
    const minutes = Math.floor(diffMs / ONE_MINUTE)
    return `${minutes}min atras`
  }

  if (diffMs < ONE_DAY) {
    const hours = Math.floor(diffMs / ONE_HOUR)
    return `${hours}h atras`
  }

  if (diffMs < 2 * ONE_DAY) {
    return 'ontem'
  }

  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

// ---------------------------------------------------------------------------
// Status badge config
// ---------------------------------------------------------------------------

const STATUS_CONFIG: Record<
  BriefStatus,
  { label: string; className: string }
> = {
  draft: {
    label: 'Rascunho',
    className: 'bg-text-muted/10 text-text-muted',
  },
  shared: {
    label: 'Compartilhado',
    className: 'bg-accent/10 text-accent',
  },
  complete: {
    label: 'Completo',
    className: 'bg-success/10 text-success',
  },
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function BriefCard({
  id,
  title,
  score,
  status,
  createdAt,
  clientInputs,
  pendingFieldCount,
}: BriefCardProps) {
  const scoreColor = getScoreColor(score)
  const statusConfig = STATUS_CONFIG[status]

  const clientFilledCount = clientInputs ? Object.keys(clientInputs).length : 0
  const showClientProgress =
    status === 'shared' &&
    clientInputs !== undefined &&
    pendingFieldCount !== undefined &&
    pendingFieldCount > 0

  return (
    <Link
      href={`/brief/${id}`}
      className="block rounded-2xl bg-surface border border-bf-border p-5 transition-all duration-300 hover:bg-surface-hover hover:scale-[1.02] hover:shadow-lg active:scale-95 group"
    >
      {/* Header row: title + score */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="font-display text-base text-text leading-tight line-clamp-2">
          {title}
        </h3>
        <span
          className={`font-mono text-sm font-semibold shrink-0 text-${scoreColor}`}
        >
          {score}
        </span>
      </div>

      {/* Score bar */}
      <div
        data-testid="score-bar"
        className="h-1.5 w-full rounded-full bg-bf-border mb-3 overflow-hidden"
      >
        <div
          className={`h-full rounded-full bg-${scoreColor} transition-all duration-500`}
          style={{ width: `${score}%` }}
        />
      </div>

      {/* Footer row: date + status badge */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-text-muted text-sm">
          {formatRelativeDate(createdAt)}
        </span>
        <div className="flex items-center gap-2">
          {showClientProgress && (
            <span className="text-text-secondary text-xs font-mono">
              Cliente: {clientFilledCount}/{pendingFieldCount}
            </span>
          )}
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusConfig.className}`}
          >
            {statusConfig.label}
          </span>
        </div>
      </div>
    </Link>
  )
}
