import { useMemo, useRef, useState } from 'react'

import type { TemplateFilters } from '../api/prompt-templates'
import { MarketState } from '../components/market-state'
import { SearchFilters } from '../components/search-filters'
import { TemplateCard } from '../components/template-card'
import { TemplateDetail } from '../components/template-detail'
import { useTemplateDetail, useTemplateList } from '../hooks/use-template-market'
import { readFilters, writeFilters } from '../model/filter-url'

const DetailLoading = () => <div className="detail-state" role="status">상세 프롬프트를 불러오는 중…</div>

interface DetailErrorProps { kind: 'not-found' | 'error'; onClose: () => void }

const DetailError = ({ kind, onClose }: DetailErrorProps) => (
  <div className="detail-state detail-state--error" role="region" aria-live="polite">
    <p>{kind === 'not-found' ? '선택한 공개 템플릿을 찾을 수 없습니다.' : '상세 프롬프트를 불러오지 못했습니다.'}</p>
    <span>{kind === 'not-found' ? '목록에서 다른 검증 템플릿을 선택하세요.' : '잠시 후 목록에서 다시 선택하세요.'}</span>
    <button type="button" onClick={onClose}>목록 탐색으로 돌아가기</button>
  </div>
)

export const PromptTemplateMarketPage = () => {
  const initialFilters = useMemo(readFilters, [])
  const [draft, setDraft] = useState<TemplateFilters>(initialFilters)
  const [filters, setFilters] = useState<TemplateFilters>(initialFilters)
  const [selectedId, setSelectedId] = useState<string>()
  const openerRef = useRef<HTMLButtonElement | undefined>(undefined)
  const { state: list, retry } = useTemplateList(filters)
  const detail = useTemplateDetail(selectedId)

  const applyFilters = () => {
    const next = { ...draft, query: draft.query?.trim() || undefined }
    writeFilters(next)
    setFilters(next)
    setSelectedId(undefined)
  }

  const resetFilters = () => {
    writeFilters({})
    setDraft({})
    setFilters({})
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

  return (
    <section className="prompt-market" id="prompt-market" aria-labelledby="prompt-market-title">
      <header className="market-intro">
        <div>
          <p className="eyebrow">VERIFIED PROMPT LIBRARY</p>
          <h2 id="prompt-market-title">검증된 프롬프트 작업대</h2>
        </div>
        <p>목적에 맞는 시작점을 고르고, 9개 필수 항목을 확인한 뒤 바로 업무에 사용하세요.</p>
      </header>

      <SearchFilters value={draft} onChange={setDraft} onSubmit={applyFilters} />

      {list.phase === 'loading' && !list.data ? <MarketState kind="loading" /> : null}
      {list.phase === 'error' && !list.data ? <MarketState kind="error" onAction={retry} /> : null}
      {list.data ? (
        <div className="market-results" aria-busy={list.phase === 'loading'}>
          <div className="market-results__summary">
            <p>{list.data.totalElements}개의 검증된 템플릿</p>
            {list.phase === 'loading' ? <span role="status">검색 결과 갱신 중…</span> : null}
            {list.phase === 'error' ? <button type="button" onClick={retry}>최신 목록 다시 불러오기</button> : null}
          </div>
          {list.data.items.length === 0 ? <MarketState kind="empty" onAction={resetFilters} /> : (
            <div className="template-grid">
              {list.data.items.map((template) => (
                <TemplateCard key={`${template.id}-${template.version}`} template={template}
                  onOpen={(opener) => openDetail(template.id, opener)} />
              ))}
            </div>
          )}
        </div>
      ) : null}

      {detail.phase === 'loading' ? <DetailLoading /> : null}
      {detail.phase === 'not-found' || detail.phase === 'error' ? <DetailError kind={detail.phase} onClose={closeDetail} /> : null}
      {detail.phase === 'success' ? <TemplateDetail template={detail.data} onClose={closeDetail} /> : null}
    </section>
  )
}
