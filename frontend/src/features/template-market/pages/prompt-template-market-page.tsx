import { DetailRegion } from '../components/detail-region'
import { MarketResults } from '../components/market-results'
import { SearchFilters } from '../components/search-filters'
import { useMarketPageController } from '../hooks/use-market-page-controller'

export const PromptTemplateMarketPage = () => {
  const market = useMarketPageController()
  return (
    <section className="prompt-market" id="prompt-market" aria-labelledby="prompt-market-title">
      <header className="market-intro">
        <div>
          <p className="eyebrow">VERIFIED PROMPT LIBRARY</p>
          <h2 id="prompt-market-title">검증된 프롬프트 작업대</h2>
        </div>
        <p>목적에 맞는 시작점을 고르고, 9개 필수 항목을 확인한 뒤 바로 업무에 사용하세요.</p>
      </header>

      <SearchFilters value={market.draft} onChange={market.setDraft} onSubmit={market.applyFilters} />
      <MarketResults
        list={market.list}
        retry={market.retry}
        resetFilters={market.resetFilters}
        openDetail={market.openDetail}
        changePage={market.changePage}
      />
      <DetailRegion detail={market.detail} onClose={market.closeDetail} />
    </section>
  )
}
