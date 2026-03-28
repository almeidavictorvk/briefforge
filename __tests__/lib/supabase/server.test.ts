import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(),
    auth: {},
    channel: vi.fn(),
  })),
}))

describe('Supabase Server Client', () => {
  beforeEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it('createServerClient retorna instância do Supabase', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co')
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-service-role-key')

    const { createServerClient } = await import('@/lib/supabase/server')
    const client = createServerClient()

    expect(client).toBeDefined()
    expect(client.from).toBeDefined()
    expect(typeof client.from).toBe('function')
  })

  it('createServerClient usa service role key', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co')
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-service-role-key')

    const { createClient: supabaseCreateClient } = await import('@supabase/supabase-js')
    const { createServerClient } = await import('@/lib/supabase/server')

    createServerClient()

    expect(supabaseCreateClient).toHaveBeenCalledWith(
      'https://test.supabase.co',
      'test-service-role-key'
    )
  })
})
