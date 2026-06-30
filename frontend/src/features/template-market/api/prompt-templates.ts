import { parsePromptTemplateDetail, parsePromptTemplatePage } from './parsers'
import type { PromptTemplateDetail, PromptTemplatePage, TemplateFilters } from './types'

export { parsePromptTemplateDetail, parsePromptTemplatePage } from './parsers'
export type { PromptTemplateDetail, PromptTemplatePage, PromptTemplateSummary, TemplateFilters } from './types'

export class PromptTemplateApiError extends Error {
  constructor(public readonly status: number, public readonly code?: string, message = '요청을 처리하지 못했습니다.') {
    super(message)
    this.name = 'PromptTemplateApiError'
  }
}

const readError = async (response: Response): Promise<PromptTemplateApiError> => {
  try {
    const value: unknown = await response.json()
    if (value && typeof value === 'object') {
      const problem = value as Record<string, unknown>
      return new PromptTemplateApiError(
        response.status,
        typeof problem.code === 'string' ? problem.code : undefined,
        typeof problem.message === 'string' ? problem.message : undefined,
      )
    }
  } catch {
    // 응답 본문이 없거나 JSON이 아니면 상태 코드 기반 안내를 사용한다.
  }
  return new PromptTemplateApiError(response.status)
}

export const fetchPromptTemplates = async (filters: TemplateFilters, signal?: AbortSignal): Promise<PromptTemplatePage> => {
  const params = new URLSearchParams()
  if (filters.category) params.set('category', filters.category)
  if (filters.difficulty) params.set('difficulty', filters.difficulty)
  if (filters.query?.trim()) params.set('query', filters.query.trim())
  params.set('page', '0')
  params.set('size', '20')
  const response = await fetch(`/api/v1/prompt-templates?${params.toString()}`, {
    headers: { Accept: 'application/json' }, signal,
  })
  if (!response.ok) throw await readError(response)
  return parsePromptTemplatePage(await response.json())
}

export const fetchPromptTemplate = async (id: string, signal?: AbortSignal): Promise<PromptTemplateDetail> => {
  const response = await fetch(`/api/v1/prompt-templates/${encodeURIComponent(id)}`, {
    headers: { Accept: 'application/json' }, signal,
  })
  if (!response.ok) throw await readError(response)
  return parsePromptTemplateDetail(await response.json())
}
