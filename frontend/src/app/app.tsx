import { useSystemHealth } from '../features/system/hooks/use-system-health'
import { PromptTemplateMarketPage } from '../features/template-market'

const products = [
  {
    number: '01',
    title: '프롬프트 마켓',
    description: '업무별 검증 기준을 갖춘 템플릿을 찾아 즉시 복사합니다.',
    action: '템플릿 둘러보기',
    href: '#prompt-market',
  },
  {
    number: '02',
    title: '상세 생성기',
    description: '업무 목적과 제약을 질문으로 정리해 실행 가능한 프롬프트를 만듭니다.',
    action: '프롬프트 설계하기',
    href: '#prompt-generator',
  },
  {
    number: '03',
    title: '에이전트 추천기',
    description: '필요한 역할·스킬·실행 순서를 분석해 재사용 가능한 구성을 제안합니다.',
    action: '구성 추천받기',
    href: '#agent-recommender',
  },
] as const

const ApiStatus = () => {
  const health = useSystemHealth()
  const label = health.phase === 'connected'
    ? 'API 연결됨'
    : health.phase === 'error'
      ? 'API 연결 확인 필요'
      : 'API 연결 확인 중'

  return (
    <p className={`api-status api-status--${health.phase}`} aria-live="polite">
      <span aria-hidden="true" />
      {label}
    </p>
  )
}

export const App = () => (
  <div className="site-shell">
    <a className="skip-link" href="#main-content">본문으로 건너뛰기</a>
    <header className="site-header">
      <a className="brand" href="/" aria-label="PromptAgent 홈">
        <span className="brand-mark" aria-hidden="true">P</span>
        <span>PromptAgent</span>
      </a>
      <ApiStatus />
    </header>

    <main id="main-content">
      <section className="hero" aria-labelledby="hero-title">
        <p className="eyebrow">PROMPT OPERATING SYSTEM</p>
        <h1 id="hero-title">업무를 실행 가능한 AI 지침으로</h1>
        <p className="hero-copy">
          검증된 시작점이 필요할 때도, 나만의 정교한 작업 흐름이 필요할 때도
          하나의 명확한 구조에서 설계하세요.
        </p>
      </section>

      <section className="product-grid" aria-label="PromptAgent 핵심 기능">
        {products.map((product) => (
          <article className="product-card" id={`product-${product.href.slice(1)}`} key={product.title}>
            <p className="card-number">{product.number}</p>
            <h2>{product.title}</h2>
            <p>{product.description}</p>
            <a href={product.href}>{product.action}<span aria-hidden="true"> ↗</span></a>
          </article>
        ))}
      </section>

      <PromptTemplateMarketPage />
    </main>

    <footer>
      <p>좋은 결과는 좋은 구조에서 시작됩니다.</p>
      <span>Spring · React foundation</span>
    </footer>
  </div>
)
