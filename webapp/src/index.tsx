/** @jsxImportSource hono/jsx */
// ===== index.tsx — 진입점: 앱 조립 + 메인 페이지 렌더링 =====
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { renderer } from './renderer'
import { apiRouter } from './routes'

const app = new Hono()

app.use(renderer)
app.use('/api/*', cors())

// API 라우터 마운트
app.route('/api', apiRouter)

// ── 메인 페이지 ───────────────────────────────────────────────────
app.get('/', (c) => {
  return c.render(
    <div id="app-root">
      {/* ── 네비게이션 ── */}
      <nav class="fixed top-0 left-0 right-0 z-50 bg-gray-950/80 backdrop-blur-xl border-b border-gray-800/50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between h-16">
            <div class="flex items-center gap-3 cursor-pointer" onclick="location.reload()">
              <div class="w-9 h-9 bg-gradient-to-br from-brand-500 to-brand-700 rounded-lg flex items-center justify-center">
                <i class="fas fa-wand-magic-sparkles text-white text-sm"></i>
              </div>
              <div>
                <h1 class="text-lg font-bold text-white leading-tight">PromptBuilder</h1>
                <p class="text-[10px] text-gray-500 -mt-0.5">AI 프롬프트 생성기</p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <button onclick="showGuide()" class="text-xs text-gray-400 hover:text-brand-400 transition-colors flex items-center gap-1.5">
                <i class="fas fa-book-open"></i>
                <span class="hidden sm:inline">가이드</span>
              </button>
              <button onclick="showHistory()" class="text-xs text-gray-400 hover:text-brand-400 transition-colors flex items-center gap-1.5">
                <i class="fas fa-clock-rotate-left"></i>
                <span class="hidden sm:inline">히스토리</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ── 메인 콘텐츠 ── */}
      <main class="pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* 히어로 */}
        <section class="text-center mb-10">
          <div class="inline-flex items-center gap-2 px-3 py-1 bg-brand-500/10 border border-brand-500/20 rounded-full text-brand-400 text-xs mb-4">
            <i class="fas fa-wand-magic-sparkles"></i>
            바이브 코딩의 첫 단계, 완벽한 프롬프트 설계
          </div>
          <h2 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4 leading-tight">
            키워드 하나로<br />
            <span class="bg-gradient-to-r from-brand-400 to-purple-400 bg-clip-text text-transparent">프로 레벨 프롬프트</span>를 자동 생성
          </h2>
          <p class="text-gray-400 text-sm sm:text-base max-w-2xl mx-auto">
            목적과 키워드만 입력하면 최적의 기법을 추천하고,<br class="hidden sm:inline" />
            컨텍스트 문서부터 프롬프트 체이닝까지 자동으로 작성해드립니다.
          </p>
        </section>

        {/* Step 1: 목적 + 키워드 */}
        <section id="step-purpose" class="mb-8">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-8 h-8 bg-brand-500 rounded-full flex items-center justify-center text-white text-sm font-bold">1</div>
            <h3 class="text-lg font-semibold text-white">프로젝트 목적과 키워드를 입력하세요</h3>
          </div>
          <div id="purpose-grid" class="grid grid-cols-2 sm:grid-cols-4 gap-3"></div>
          <div id="keyword-section" class="mt-4 hidden">
            <label class="block text-sm text-gray-400 mb-1.5">핵심 키워드를 입력하세요</label>
            <div class="flex gap-3">
              <input type="text" id="keyword-input" placeholder="예: 할일 관리 앱, 포트폴리오 사이트, 챗봇..."
                class="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                onkeydown="if(event.key==='Enter')requestRecommendation()" />
              <button onclick="requestRecommendation()" id="recommend-btn"
                class="px-5 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-medium transition-all flex items-center gap-2 whitespace-nowrap">
                <i class="fas fa-magic"></i>추천 받기
              </button>
            </div>
          </div>
        </section>

        {/* 추천 결과 */}
        <section id="recommendation-section" class="mb-8 hidden">
          <div class="bg-gradient-to-r from-brand-500/5 to-purple-500/5 border border-brand-500/20 rounded-2xl p-6">
            <div class="flex items-center gap-2 mb-3">
              <i class="fas fa-robot text-brand-400"></i>
              <h4 class="text-sm font-semibold text-white">AI 추천 결과</h4>
              <span class="text-[10px] bg-brand-500/20 text-brand-400 px-2 py-0.5 rounded-full">자동 분석</span>
            </div>
            <p id="rec-reason" class="text-xs text-gray-400 mb-4 leading-relaxed"></p>
            <div class="flex flex-col sm:flex-row gap-3">
              <div id="rec-primary" class="flex-1"></div>
              <div id="rec-secondary" class="flex-1 space-y-2"></div>
            </div>
          </div>
        </section>

        {/* Step 2: 기법 선택 */}
        <section id="step-technique" class="mb-8 opacity-40 pointer-events-none transition-all duration-300">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-gray-400 text-sm font-bold" id="step2-badge">2</div>
            <h3 class="text-lg font-semibold text-white">또는 직접 기법을 선택하세요</h3>
          </div>
          <p class="text-xs text-gray-500 mb-4 ml-11">추천 결과를 사용하거나, 아래에서 직접 선택할 수 있습니다.</p>
          <div id="technique-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"></div>
        </section>

        {/* Step 3: 필드 입력 */}
        <section id="step-fields" class="mb-8 hidden">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-8 h-8 bg-brand-500 rounded-full flex items-center justify-center text-white text-sm font-bold">3</div>
            <h3 class="text-lg font-semibold text-white" id="fields-title">세부 정보를 입력하세요</h3>
          </div>
          <p class="text-xs text-gray-500 mb-4 ml-11" id="fields-subtitle">
            <span class="text-brand-400">자동 채워진 필드</span>를 확인하고 수정하세요.
            <span class="text-red-400">*</span> 표시는 필수입니다.
          </p>
          <div class="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
            <div id="fields-container" class="space-y-5"></div>
            <div class="mt-6 flex flex-col sm:flex-row gap-3">
              <button id="generate-btn" onclick="generatePrompt()"
                class="flex-1 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-semibold py-3.5 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-brand-500/20">
                <i class="fas fa-wand-magic-sparkles"></i>프롬프트 생성
              </button>
              <button onclick="resetFields()" class="px-6 py-3.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl transition-all flex items-center justify-center gap-2">
                <i class="fas fa-rotate-left"></i>초기화
              </button>
            </div>
          </div>
        </section>

        {/* 결과 영역 */}
        <section id="result-section" class="hidden">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
              <i class="fas fa-check text-xs"></i>
            </div>
            <h3 class="text-lg font-semibold text-white">생성된 프롬프트</h3>
          </div>
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div class="lg:col-span-2 space-y-4">
              {/* 컨텍스트 문서 메타 */}
              <div id="context-doc-section" class="hidden">
                <div class="bg-gradient-to-r from-cyan-500/5 to-blue-500/5 border border-cyan-500/20 rounded-2xl p-5">
                  <div class="flex items-center gap-2 mb-3">
                    <i class="fas fa-scroll text-cyan-400"></i>
                    <h4 class="text-sm font-semibold text-white">컨텍스트 문서 생성됨</h4>
                    <span class="text-[10px] bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded-full">context.md</span>
                  </div>
                  <div id="context-doc-info"></div>
                </div>
              </div>
              {/* 메인 프롬프트 */}
              <div class="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden">
                <div class="flex items-center justify-between px-5 py-3 border-b border-gray-800 bg-gray-900/80">
                  <div class="flex items-center gap-2">
                    <i class="fas fa-file-code text-brand-400 text-sm"></i>
                    <span class="text-sm font-medium text-gray-300" id="result-technique-name">프롬프트</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <button onclick="copyPrompt()" id="copy-btn"
                      class="text-xs text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5">
                      <i class="fas fa-copy"></i>복사
                    </button>
                    <button onclick="downloadPrompt()"
                      class="text-xs text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5">
                      <i class="fas fa-download"></i>다운로드
                    </button>
                  </div>
                </div>
                <div class="p-5">
                  <pre id="result-prompt" class="text-sm text-gray-200 whitespace-pre-wrap font-mono leading-relaxed"></pre>
                </div>
              </div>
              {/* 체이닝 단계별 프롬프트 */}
              <div id="chain-section" class="hidden">
                <div class="bg-gradient-to-r from-teal-500/5 to-green-500/5 border border-teal-500/20 rounded-2xl p-5">
                  <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center gap-2">
                      <i class="fas fa-link text-teal-400"></i>
                      <h4 class="text-sm font-semibold text-white">단계별 프롬프트 체인</h4>
                      <span class="text-[10px] bg-teal-500/20 text-teal-400 px-2 py-0.5 rounded-full">각 단계를 순서대로 실행</span>
                    </div>
                    <button onclick="downloadAllChainSteps()"
                      class="text-[10px] text-teal-400 hover:text-teal-300 bg-teal-500/10 hover:bg-teal-500/20 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5">
                      <i class="fas fa-download"></i>전체 다운로드
                    </button>
                  </div>
                  <p class="text-xs text-gray-500 mb-3">
                    <i class="fas fa-info-circle mr-1"></i>각 단계를 클릭하여 펼치고, 개별 복사할 수 있습니다. Step 1부터 순서대로 AI에게 전달하세요.
                  </p>
                  <div id="chain-content"></div>
                </div>
              </div>
            </div>
            {/* 사이드 패널 */}
            <div class="space-y-4">
              <div class="bg-gray-900/50 border border-gray-800 rounded-2xl p-5">
                <h4 class="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <i class="fas fa-chart-simple text-brand-400"></i>품질 리포트
                </h4>
                <div class="flex items-center gap-4 mb-4">
                  <div id="quality-grade" class="w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-black"></div>
                  <div>
                    <div class="text-2xl font-bold text-white"><span id="quality-score">0</span><span class="text-sm text-gray-500">%</span></div>
                    <div class="text-xs text-gray-500" id="quality-label">분석 중...</div>
                  </div>
                </div>
                <div id="quality-checks" class="space-y-2"></div>
              </div>
              <div class="bg-gray-900/50 border border-gray-800 rounded-2xl p-5">
                <h4 class="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <i class="fas fa-lightbulb text-yellow-400"></i>팁
                </h4>
                <ul id="tips-list" class="space-y-2 text-xs text-gray-400"></ul>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── 업데이트 버튼 ── */}
      <button
        onclick="showUpdates()"
        class="fixed bottom-5 right-5 z-[90] flex items-center gap-2 rounded-full border border-brand-400/30 bg-gray-900/90 px-4 py-3 text-xs font-semibold text-brand-300 shadow-lg shadow-brand-900/30 backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:border-brand-300/60 hover:text-white"
      >
        <span class="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400"></span>
        <span>업데이트</span>
      </button>

      {/* ── 가이드 모달 ── */}
      <div id="guide-modal" class="fixed inset-0 z-[100] hidden">
        <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" onclick="closeGuide()"></div>
        <div class="relative max-w-3xl mx-auto mt-20 bg-gray-900 border border-gray-800 rounded-2xl max-h-[80vh] overflow-y-auto m-4">
          <div class="sticky top-0 bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between rounded-t-2xl">
            <h3 class="text-lg font-bold text-white flex items-center gap-2">
              <i class="fas fa-book-open text-brand-400"></i>프롬프트 엔지니어링 가이드
            </h3>
            <button onclick="closeGuide()" class="text-gray-400 hover:text-white"><i class="fas fa-xmark text-lg"></i></button>
          </div>
          <div class="p-6 space-y-6 text-sm text-gray-300" id="guide-content"></div>
        </div>
      </div>

      {/* ── 히스토리 모달 ── */}
      <div id="history-modal" class="fixed inset-0 z-[100] hidden">
        <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" onclick="closeHistory()"></div>
        <div class="relative max-w-2xl mx-auto mt-20 bg-gray-900 border border-gray-800 rounded-2xl max-h-[80vh] overflow-y-auto m-4">
          <div class="sticky top-0 bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between rounded-t-2xl">
            <h3 class="text-lg font-bold text-white flex items-center gap-2">
              <i class="fas fa-clock-rotate-left text-brand-400"></i>생성 히스토리
            </h3>
            <div class="flex items-center gap-2">
              <button onclick="clearHistory()" class="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded">전체 삭제</button>
              <button onclick="closeHistory()" class="text-gray-400 hover:text-white"><i class="fas fa-xmark text-lg"></i></button>
            </div>
          </div>
          <div class="p-6" id="history-content"></div>
        </div>
      </div>

      {/* ── 업데이트 모달 ── */}
      <div id="updates-modal" class="fixed inset-0 z-[100] hidden">
        <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" onclick="closeUpdates()"></div>
        <div class="relative max-w-3xl mx-auto mt-20 bg-gray-900 border border-gray-800 rounded-2xl max-h-[80vh] overflow-y-auto m-4">
          <div class="sticky top-0 bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between rounded-t-2xl">
            <h3 class="text-lg font-bold text-white flex items-center gap-2">
              <i class="fas fa-bullhorn text-brand-400"></i>최근 업데이트
            </h3>
            <button onclick="closeUpdates()" class="text-gray-400 hover:text-white"><i class="fas fa-xmark text-lg"></i></button>
          </div>
          <div class="p-6" id="updates-content"></div>
        </div>
      </div>
    </div>
  )
})

export default app
