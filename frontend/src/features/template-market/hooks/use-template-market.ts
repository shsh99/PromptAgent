import { useCallback, useEffect, useState } from 'react'

import { fetchPromptTemplate, fetchPromptTemplates, type PromptTemplateDetail, type PromptTemplatePage, type TemplateFilters } from '../api/prompt-templates'

type ListState =
  | { phase: 'loading'; data?: PromptTemplatePage }
  | { phase: 'success'; data: PromptTemplatePage }
  | { phase: 'error'; data?: PromptTemplatePage }

type DetailState =
  | { phase: 'idle' | 'loading' }
  | { phase: 'success'; data: PromptTemplateDetail }
  | { phase: 'not-found' | 'error' }

export const useTemplateList = (filters: TemplateFilters) => {
  const [requestKey, setRequestKey] = useState(0)
  const [state, setState] = useState<ListState>({ phase: 'loading' })

  useEffect(() => {
    const controller = new AbortController()
    setState((current) => ({ phase: 'loading', data: current.data }))
    fetchPromptTemplates(filters, controller.signal)
      .then((data) => setState({ phase: 'success', data }))
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return
        setState((current) => ({ phase: 'error', data: current.data }))
      })
    return () => controller.abort()
  }, [filters, requestKey])

  const retry = useCallback(() => setRequestKey((key) => key + 1), [])
  return { state, retry }
}

export const useTemplateDetail = (id?: string) => {
  const [state, setState] = useState<DetailState>({ phase: 'idle' })

  useEffect(() => {
    if (!id) {
      setState({ phase: 'idle' })
      return
    }
    const controller = new AbortController()
    setState({ phase: 'loading' })
    fetchPromptTemplate(id, controller.signal)
      .then((data) => setState({ phase: 'success', data }))
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return
        const status = typeof error === 'object' && error && 'status' in error ? error.status : undefined
        setState({ phase: status === 404 ? 'not-found' : 'error' })
      })
    return () => controller.abort()
  }, [id])

  return state
}
