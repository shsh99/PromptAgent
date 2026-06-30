import { categories, difficulties, type PromptCategory, type PromptDifficulty, type TemplateFilters } from '../api/types'

const categorySet = new Set(categories.map(([value]) => value))
const difficultySet = new Set(difficulties.map(([value]) => value))

export const readFilters = (): TemplateFilters => {
  const params = new URLSearchParams(window.location.search)
  const category = params.get('category')
  const difficulty = params.get('difficulty')
  const query = params.get('query')?.trim()
  return {
    category: categorySet.has(category as PromptCategory) ? category as PromptCategory : undefined,
    difficulty: difficultySet.has(difficulty as PromptDifficulty) ? difficulty as PromptDifficulty : undefined,
    query: query || undefined,
  }
}

export const writeFilters = (filters: TemplateFilters) => {
  const params = new URLSearchParams()
  if (filters.category) params.set('category', filters.category)
  if (filters.difficulty) params.set('difficulty', filters.difficulty)
  if (filters.query?.trim()) params.set('query', filters.query.trim())
  const search = params.toString()
  window.history.pushState({}, '', `${window.location.pathname}${search ? `?${search}` : ''}`)
}
