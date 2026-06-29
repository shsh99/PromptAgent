export interface SystemHealth {
  status: 'UP'
  service: string
  version: string
}

const isSystemHealth = (value: unknown): value is SystemHealth => {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Record<string, unknown>
  return candidate.status === 'UP'
    && typeof candidate.service === 'string'
    && typeof candidate.version === 'string'
}

export const fetchSystemHealth = async (signal?: AbortSignal): Promise<SystemHealth> => {
  const response = await fetch('/api/v1/system/health', {
    headers: { Accept: 'application/json' },
    signal,
  })
  if (!response.ok) {
    throw new Error(`API 상태 확인 실패: ${response.status}`)
  }

  const payload: unknown = await response.json()
  if (!isSystemHealth(payload)) {
    throw new Error('API 상태 응답이 올바르지 않습니다.')
  }
  return payload
}
