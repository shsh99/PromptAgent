import { useEffect, useState } from 'react'

import { fetchSystemHealth, type SystemHealth } from '../api/system-health'

type HealthState =
  | { phase: 'loading' }
  | { phase: 'connected'; data: SystemHealth }
  | { phase: 'error' }

export const useSystemHealth = (): HealthState => {
  const [state, setState] = useState<HealthState>({ phase: 'loading' })

  useEffect(() => {
    const controller = new AbortController()
    fetchSystemHealth(controller.signal)
      .then((data) => setState({ phase: 'connected', data }))
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return
        setState({ phase: 'error' })
      })
    return () => controller.abort()
  }, [])

  return state
}
