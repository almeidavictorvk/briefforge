import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'

// Mock @ai-sdk/react
const mockSubmit = vi.fn()
vi.mock('@ai-sdk/react', () => ({
  experimental_useObject: vi.fn(() => ({
    object: undefined,
    submit: mockSubmit,
    isLoading: false,
    error: undefined,
  })),
}))

import { useBriefStream } from '@/hooks/use-brief-stream'

describe('useBriefStream', () => {
  it('retorna interface correta', () => {
    const { result } = renderHook(() => useBriefStream())

    expect(result.current).toHaveProperty('brief')
    expect(result.current).toHaveProperty('generate')
    expect(result.current).toHaveProperty('isLoading')
    expect(result.current).toHaveProperty('error')
    expect(typeof result.current.generate).toBe('function')
    expect(typeof result.current.isLoading).toBe('boolean')
  })

  it('brief inicia como undefined', () => {
    const { result } = renderHook(() => useBriefStream())

    expect(result.current.brief).toBeUndefined()
  })

  it('isLoading inicia como false', () => {
    const { result } = renderHook(() => useBriefStream())

    expect(result.current.isLoading).toBe(false)
  })
})
