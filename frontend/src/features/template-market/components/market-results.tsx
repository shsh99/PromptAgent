import type { ListState } from '../hooks/use-template-market'
import { MarketState } from './market-state'
import { Pagination } from './pagination'
import { TemplateCard } from './template-card'

interface MarketResultsProps {
  list: ListState
  retry: () => void
  resetFilters: () => void
  openDetail: (id: string, opener: HTMLButtonElement) => void
  changePage: (page: number) => void
}

export const MarketResults = ({ list, retry, resetFilters, openDetail, changePage }: MarketResultsProps) => {
  if (list.phase === 'loading' && !list.data) return <MarketState kind="loading" />
  if (list.phase === 'error' && !list.data) return <MarketState kind="error" onAction={retry} />
  if (!list.data) return null

  return (
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
      <Pagination page={list.data.page} totalPages={list.data.totalPages} onPageChange={changePage} />
    </div>
  )
}
