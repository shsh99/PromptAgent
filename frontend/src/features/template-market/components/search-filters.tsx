import type { FormEvent } from 'react'

import { categories, difficulties, type PromptCategory, type PromptDifficulty, type TemplateFilters } from '../api/types'

interface SearchFiltersProps {
  value: TemplateFilters
  onChange: (value: TemplateFilters) => void
  onSubmit: () => void
}

export const SearchFilters = ({ value, onChange, onSubmit }: SearchFiltersProps) => {
  const submit = (event: FormEvent) => {
    event.preventDefault()
    onSubmit()
  }

  return (
    <form className="market-filters" onSubmit={submit} role="search">
      <div className="filter-field filter-field--query">
        <label htmlFor="market-query">업무 검색</label>
        <input
          id="market-query"
          name="query"
          type="search"
          autoComplete="off"
          placeholder="예: 회의 후속 메일…"
          value={value.query ?? ''}
          onChange={(event) => onChange({ ...value, query: event.target.value })}
        />
      </div>
      <div className="filter-field">
        <label htmlFor="market-category">업무 카테고리</label>
        <select
          id="market-category"
          name="category"
          value={value.category ?? ''}
          onChange={(event) => onChange({ ...value, category: event.target.value as PromptCategory || undefined })}
        >
          <option value="">전체 업무</option>
          {categories.map(([id, label]) => <option value={id} key={id}>{label}</option>)}
        </select>
      </div>
      <div className="filter-field">
        <label htmlFor="market-difficulty">난이도</label>
        <select
          id="market-difficulty"
          name="difficulty"
          value={value.difficulty ?? ''}
          onChange={(event) => onChange({ ...value, difficulty: event.target.value as PromptDifficulty || undefined })}
        >
          <option value="">모든 난이도</option>
          {difficulties.map(([id, label]) => <option value={id} key={id}>{label}</option>)}
        </select>
      </div>
      <button className="market-search-button" type="submit">템플릿 검색</button>
    </form>
  )
}
