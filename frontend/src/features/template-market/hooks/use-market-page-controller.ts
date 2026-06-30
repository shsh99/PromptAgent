import { useEffect, useMemo, useRef, useState } from 'react'

import type { TemplateFilters } from '../api/prompt-templates'
import { readFilters, writeFilters } from '../model/filter-url'
import { useTemplateDetail, useTemplateList } from './use-template-market'

export const useMarketPageController = () => {
  const initial = useMemo(readFilters, [])
  const [draft, setDraft] = useState<TemplateFilters>(initial)
  const [filters, setFilters] = useState<TemplateFilters>(initial)
  const [selectedId, setSelectedId] = useState<string>()
  const openerRef = useRef<HTMLButtonElement | undefined>(undefined)
  const { state: list, retry } = useTemplateList(filters)
  const detail = useTemplateDetail(selectedId)

  useEffect(() => {
    const restore = () => {
      const next = readFilters()
      setDraft(next)
      setFilters(next)
      setSelectedId(undefined)
    }
    window.addEventListener('popstate', restore)
    return () => window.removeEventListener('popstate', restore)
  }, [])

  const applyFilters = () => {
    const next = { ...draft, query: draft.query?.trim() || undefined, page: 0 }
    writeFilters(next)
    setFilters(next)
    setSelectedId(undefined)
  }
  const resetFilters = () => {
    const next = { page: 0 }
    writeFilters(next)
    setDraft(next)
    setFilters(next)
    setSelectedId(undefined)
  }
  const openDetail = (id: string, opener: HTMLButtonElement) => {
    openerRef.current = opener
    setSelectedId(id)
  }
  const closeDetail = () => {
    setSelectedId(undefined)
    openerRef.current?.focus()
  }
  const changePage = (page: number) => {
    const next = { ...filters, page }
    writeFilters(next)
    setDraft(next)
    setFilters(next)
    setSelectedId(undefined)
  }

  return { draft, setDraft, list, retry, detail, applyFilters, resetFilters, openDetail, closeDetail, changePage }
}
