import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock @supabase/supabase-js before importing
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(),
    auth: {},
    channel: vi.fn(),
  })),
}))

describe('Supabase Browser Client', () => {
  beforeEach(() => {
    vi.unstubAllEnvs()
    // Reset module cache to re-evaluate the module
    vi.resetModules()
  })

  it('createClient retorna instância do Supabase', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co')
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY', 'test-anon-key')

    const { createClient } = await import('@/lib/supabase/client')
    const client = createClient()

    expect(client).toBeDefined()
    expect(client.from).toBeDefined()
    expect(typeof client.from).toBe('function')
  })

  it('createClient usa variáveis de ambiente corretas', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co')
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY', 'test-anon-key')

    const { createClient: supabaseCreateClient } = await import('@supabase/supabase-js')
    const { createClient } = await import('@/lib/supabase/client')

    createClient()

    expect(supabaseCreateClient).toHaveBeenCalledWith(
      'https://test.supabase.co',
      'test-anon-key'
    )
  })
})
