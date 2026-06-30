import { useCallback, useEffect, useRef, useState } from 'react'

import { fetchPromptTemplate, fetchPromptTemplates, type PromptTemplateDetail, type PromptTemplatePage, type TemplateFilters } from '../api/prompt-templates'

export type ListState =
  | { phase: 'loading'; data?: PromptTemplatePage }
  | { phase: 'success'; data: PromptTemplatePage }
  | { phase: 'error'; data?: PromptTemplatePage }

export type DetailState =
  | { phase: 'idle' | 'loading' }
  | { phase: 'success'; data: PromptTemplateDetail }
  | { phase: 'not-found' | 'error' }

export const useTemplateList = (filters: TemplateFilters) => {
  const [requestKey, setRequestKey] = useState(0)
  const [state, setState] = useState<ListState>({ phase: 'loading' })
  const sequence = useRef(0)

  useEffect(() => {
    const requestId = ++sequence.current
    let active = true
    const controller = new AbortController()
    setState((current) => ({ phase: 'loading', data: current.data }))
    fetchPromptTemplates(filters, controller.signal)
      .then((data) => {
        if (active && requestId === sequence.current) setState({ phase: 'success', data })
      })
      .catch((error: unknown) => {
        if (!active || requestId !== sequence.current || (error instanceof DOMException && error.name === 'AbortError')) return
        setState((current) => ({ phase: 'error', data: current.data }))
      })
    return () => {
      active = false
      controller.abort()
    }
  }, [filters, requestKey])

  const retry = useCallback(() => setRequestKey((key) => key + 1), [])
  return { state, retry }
}

export const useTemplateDetail = (id?: string) => {
  const [state, setState] = useState<DetailState>({ phase: 'idle' })
  const sequence = useRef(0)

  useEffect(() => {
    const requestId = ++sequence.current
    if (!id) {
      setState({ phase: 'idle' })
      return
    }
    let active = true
    const controller = new AbortController()
    setState({ phase: 'loading' })
    fetchPromptTemplate(id, controller.signal)
      .then((data) => {
        if (active && requestId === sequence.current) setState({ phase: 'success', data })
      })
      .catch((error: unknown) => {
        if (!active || requestId !== sequence.current || (error instanceof DOMException && error.name === 'AbortError')) return
        const status = typeof error === 'object' && error && 'status' in error ? error.status : undefined
        setState({ phase: status === 404 ? 'not-found' : 'error' })
      })
    return () => {
      active = false
      controller.abort()
    }
  }, [id])

  return state
}
