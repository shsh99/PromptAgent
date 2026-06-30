interface MarketStateProps { kind: 'loading' | 'empty' | 'error'; onAction?: () => void }

const content = {
  loading: ['템플릿을 불러오는 중…', '검증된 업무 지침을 정리하고 있습니다.'],
  empty: ['조건에 맞는 템플릿이 없습니다.', '검색어를 줄이거나 전체 업무에서 다시 찾아보세요.'],
  error: ['템플릿을 불러오지 못했습니다.', '연결을 확인한 뒤 목록을 다시 요청하세요.'],
} as const

export const MarketState = ({ kind, onAction }: MarketStateProps) => (
  <div className={`market-state market-state--${kind}`} role={kind === 'loading' ? 'status' : 'region'} aria-live="polite">
    <p>{content[kind][0]}</p>
    <span>{content[kind][1]}</span>
    {kind === 'empty' ? <button type="button" onClick={onAction}>필터 초기화</button> : null}
    {kind === 'error' ? <button type="button" onClick={onAction}>목록 다시 불러오기</button> : null}
  </div>
)
