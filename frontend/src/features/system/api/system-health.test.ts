import { afterEach, describe, expect, it, vi } from 'vitest'

import { fetchSystemHealth } from './system-health'

describe('fetchSystemHealth', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('returns the typed backend health contract', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({
      status: 'UP',
      service: 'prompt-agent-api',
      version: '0.1.0',
    }), { status: 200, headers: { 'Content-Type': 'application/json' } })))

    await expect(fetchSystemHealth()).resolves.toEqual({
      status: 'UP',
      service: 'prompt-agent-api',
      version: '0.1.0',
    })
  })

  it('rejects malformed backend responses', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{"status":"UP"}', {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })))

    await expect(fetchSystemHealth()).rejects.toThrow('올바르지 않습니다')
  })
})
