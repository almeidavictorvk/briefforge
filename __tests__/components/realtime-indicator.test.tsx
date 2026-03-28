import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

// Mock CSS imports
vi.mock('@/styles/globals.css', () => ({}))

import { RealtimeIndicator } from '@/components/realtime-indicator'

describe('RealtimeIndicator', () => {
  it('mostra "cliente online" quando ativo (clientLastSeen < 30s)', () => {
    const recentTimestamp = new Date(Date.now() - 5000).toISOString()

    render(
      <RealtimeIndicator
        clientLastSeen={recentTimestamp}
        clientFilledCount={0}
        totalPendingCount={3}
      />
    )

    // Should show text indicating the client is actively filling
    expect(screen.getByText(/preenchendo/i)).toBeInTheDocument()

    // Should show a pulsing green dot
    const dot = document.querySelector('.animate-pulse')
    expect(dot).toBeInTheDocument()

    // The dot should have green/success styling
    expect(dot!.className).toMatch(/bg-success/)
    expect(dot!.className).toMatch(/rounded-full/)
  })

  it('oculta quando inativo (clientLastSeen > 30s ou null)', () => {
    // Case 1: old timestamp (60 seconds ago)
    const { container: container1, unmount } = render(
      <RealtimeIndicator
        clientLastSeen={new Date(Date.now() - 60000).toISOString()}
        clientFilledCount={0}
        totalPendingCount={3}
      />
    )

    expect(container1.innerHTML).toBe('')
    unmount()

    // Case 2: null clientLastSeen
    const { container: container2 } = render(
      <RealtimeIndicator
        clientLastSeen={null}
        clientFilledCount={0}
        totalPendingCount={3}
      />
    )

    expect(container2.innerHTML).toBe('')
  })

  it('mostra contagem de campos preenchidos pelo cliente', () => {
    const recentTimestamp = new Date(Date.now() - 5000).toISOString()

    render(
      <RealtimeIndicator
        clientLastSeen={recentTimestamp}
        clientFilledCount={2}
        totalPendingCount={5}
      />
    )

    // Should show "2 de 5" indicating filled count out of total pending
    expect(screen.getByText(/2 de 5/)).toBeInTheDocument()
  })
})
