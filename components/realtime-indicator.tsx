'use client'


interface RealtimeIndicatorProps {
  clientLastSeen: string | null
  clientFilledCount: number
  totalPendingCount: number
}

const ACTIVE_THRESHOLD_MS = 30_000 // 30 seconds

function isClientActive(clientLastSeen: string | null): boolean {
  if (!clientLastSeen) return false
  const lastSeenTime = new Date(clientLastSeen).getTime()
  const elapsed = Date.now() - lastSeenTime
  return elapsed < ACTIVE_THRESHOLD_MS
}

export function RealtimeIndicator({
  clientLastSeen,
  clientFilledCount,
  totalPendingCount,
}: RealtimeIndicatorProps) {
  if (!isClientActive(clientLastSeen)) {
    return null
  }

  const allFilled = totalPendingCount > 0 && clientFilledCount >= totalPendingCount

  if (allFilled) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <span className="inline-flex h-2.5 w-2.5 rounded-full bg-success" />
        <span className="text-success">
          Cliente completou todos os campos
        </span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="relative flex h-2.5 w-2.5">
        <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-success" />
      </span>
      <span className="text-text-secondary">
        Cliente está preenchendo...
      </span>
      {totalPendingCount > 0 && (
        <span className="rounded-full bg-surface-hover px-2 py-0.5 text-xs font-medium text-text-muted">
          {clientFilledCount} de {totalPendingCount} campos pendentes
        </span>
      )}
    </div>
  )
}
