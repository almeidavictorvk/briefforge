import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@openrouter/ai-sdk-provider', () => ({
  createOpenRouter: vi.fn(() => ({
    chat: vi.fn(() => 'mock-model'),
  })),
}))

describe('OpenRouter Provider', () => {
  beforeEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it('OpenRouter provider é criado com API key', async () => {
    vi.stubEnv('OPENROUTER_API_KEY', 'sk-or-test-key-123')

    const { createOpenRouter } = await import('@openrouter/ai-sdk-provider')
    await import('@/lib/ai/openrouter')

    expect(createOpenRouter).toHaveBeenCalledWith({
      apiKey: 'sk-or-test-key-123',
    })
  })

  it('OpenRouter provider expõe modelo', async () => {
    vi.stubEnv('OPENROUTER_API_KEY', 'sk-or-test-key-123')

    const { getModel } = await import('@/lib/ai/openrouter')
    const model = getModel('anthropic/claude-sonnet-4')

    expect(model).toBeDefined()
    expect(model).toBe('mock-model')
  })
})
