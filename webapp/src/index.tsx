/** @jsxImportSource hono/jsx */
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { renderer } from './renderer'
import { apiRouter } from './routes'

const app = new Hono()

app.use(renderer)
app.use('/api/*', cors())
app.route('/api', apiRouter)

app.get('/', (c) => {
  return c.render(
    <div id="app-root">
      <nav class="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div class="flex h-16 items-center justify-between gap-4">
            <div class="flex cursor-pointer items-center gap-3" onclick="location.reload()">
              <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-indigo-600 shadow-lg shadow-brand-500/20">
                <i class="fas fa-wand-magic-sparkles text-sm text-white"></i>
              </div>
              <div>
                <h1 class="text-lg font-bold tracking-tight text-white">프롬프트빌더</h1>
                <p class="text-[11px] text-slate-400">프롬프트를 몰라도 AI를 잘 쓰게 만드는 플랫폼</p>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <button onclick="setTheme('light')" class="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10">
                라이트
              </button>
              <button onclick="setTheme('dark')" class="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10">
                다크
              </button>
              <button onclick="showGuide()" class="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10">
                가이드
              </button>
              <button onclick="showHistory()" class="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10">
                히스토리
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main class="mx-auto max-w-7xl px-4 pb-16 pt-24 sm:px-6 lg:px-8">
        <section class="mb-10 grid gap-6 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
          <div class="space-y-4">
            <div class="inline-flex items-center gap-2 rounded-full border border-brand-500/20 bg-brand-500/10 px-3 py-1 text-xs font-semibold text-brand-300">
              <i class="fas fa-wand-magic-sparkles"></i>
              프롬프트를 몰라도 AI를 잘 쓰게 만드는 구조 설계 플랫폼
            </div>
            <h2 class="text-4xl font-black leading-tight text-white sm:text-5xl">
              업무 템플릿으로 쉽게 시작하고, <br class="hidden sm:block" />
              <span class="bg-gradient-to-r from-brand-300 to-cyan-300 bg-clip-text text-transparent">빌더로 직접 설계하고 최적화로 품질을 높이세요</span>
            </h2>
            <p class="max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
              프롬프트를 자동으로 뚝딱 만드는 도구가 아니라, 빈칸을 채우고 구조를 정리해서 거의 완성형에 가까운 프롬프트를 만들 수 있게 돕습니다.
            </p>
            <div class="flex flex-wrap gap-3">
              <button onclick="switchMode('template')" class="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-black/10 hover:bg-slate-100">
                템플릿으로 시작
              </button>
              <button onclick="switchMode('builder')" class="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white hover:bg-white/10">
                빌더 열기
              </button>
              <button onclick="switchMode('optimize')" class="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white hover:bg-white/10">
                최적화 열기
              </button>
            </div>
          </div>

          <div class="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
            <div class="flex items-center justify-between gap-3">
              <div>
                <div class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">바로 시작</div>
                <div class="mt-2 text-lg font-semibold text-white">무엇을 먼저 하시나요?</div>
                <p class="mt-1 text-sm leading-6 text-slate-300">처음이면 템플릿, 새 프로젝트면 설계, 진행 중이면 질문부터 시작하세요.</p>
              </div>
              <div class="hidden h-14 w-14 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-300 sm:flex">
                <i class="fas fa-compass text-xl"></i>
              </div>
            </div>
            <div class="mt-5 grid gap-3">
              <button onclick="switchMode('template')" class="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left transition hover:bg-white/10">
                <div class="text-sm font-semibold text-white">업무 템플릿으로 시작</div>
                <div class="mt-1 text-xs leading-5 text-slate-400">자소서, 회의 요약, 코드 리뷰처럼 자주 쓰는 작업을 빠르게 시작합니다.</div>
              </button>
              <button onclick="loadBuilderStarter(0)" class="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left transition hover:bg-white/10">
                <div class="text-sm font-semibold text-white">새 프로젝트 설계</div>
                <div class="mt-1 text-xs leading-5 text-slate-400">문제 정의, 목표, 산출물, 구조를 먼저 잡는 프롬프트로 바로 들어갑니다.</div>
              </button>
              <button onclick="loadBuilderStarter(1)" class="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left transition hover:bg-white/10">
                <div class="text-sm font-semibold text-white">진행 중 질문 정리</div>
                <div class="mt-1 text-xs leading-5 text-slate-400">프로젝트를 하다가 여러 번 묻는 질문을 구조화해서 바로 사용할 수 있습니다.</div>
              </button>
              <button onclick="switchMode('optimize')" class="rounded-2xl border border-brand-400/20 bg-brand-500/10 px-4 py-3 text-left transition hover:bg-brand-500/15">
                <div class="text-sm font-semibold text-brand-200">이미 만든 프롬프트 개선</div>
                <div class="mt-1 text-xs leading-5 text-brand-100/80">결과를 넣고 문제를 분석해 다음 버전으로 고칩니다.</div>
              </button>
            </div>
          </div>
        </section>

        <section id="step-purpose" class="mb-6">
          <div class="mb-4 flex items-center gap-3">
            <div class="flex h-8 w-8 items-center justify-center rounded-full bg-brand-500 text-sm font-bold text-white">1</div>
            <div>
              <h3 class="text-lg font-semibold text-white">목적과 키워드를 먼저 정하세요</h3>
              <p class="text-sm text-slate-400">원하는 일을 고르면 나머지 입력이 더 쉬워집니다.</p>
            </div>
          </div>
          <div id="purpose-grid" class="grid grid-cols-2 gap-3 sm:grid-cols-4"></div>
          <div id="keyword-section" class="mt-4 hidden">
            <label class="mb-2 block text-sm font-medium text-slate-300">키워드</label>
            <div class="flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                id="keyword-input"
                placeholder="예: 자소서, 코드 리뷰, 회의 요약"
                class="flex-1 rounded-2xl border border-white/10 bg-white/95 px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                onkeydown="if(event.key==='Enter')requestRecommendation()"
              />
              <button
                onclick="requestRecommendation()"
                id="recommend-btn"
                class="rounded-2xl bg-brand-600 px-5 py-3 font-semibold text-white shadow-lg shadow-brand-500/20 hover:bg-brand-500"
              >
                추천 받기
              </button>
            </div>
          </div>
        </section>

        <section id="recommendation-section" class="mb-6 hidden">
          <div class="rounded-3xl border border-brand-500/20 bg-white/5 p-5 backdrop-blur-xl">
            <div class="mb-3 flex items-center gap-2">
              <i class="fas fa-robot text-brand-300"></i>
              <h4 class="text-sm font-semibold text-white">AI 추천 결과</h4>
              <span class="rounded-full bg-brand-500/20 px-2 py-0.5 text-[10px] font-semibold text-brand-200">자동 분석</span>
            </div>
            <p id="rec-reason" class="mb-4 text-sm leading-7 text-slate-300"></p>
            <div class="grid gap-3 lg:grid-cols-2">
              <div id="rec-primary"></div>
              <div id="rec-secondary" class="space-y-2"></div>
            </div>
          </div>
        </section>

        <section id="step-technique" class="mb-6 opacity-40 pointer-events-none transition-all duration-300">
          <div class="mb-2 flex items-center gap-3">
            <div class="flex h-8 w-8 items-center justify-center rounded-full bg-slate-700 text-sm font-bold text-slate-300" id="step2-badge">2</div>
            <div>
              <h3 class="text-lg font-semibold text-white">방식을 선택하세요</h3>
              <p class="text-sm text-slate-400">추천 결과를 쓰거나, 직접 방식까지 고를 수 있습니다.</p>
            </div>
          </div>
          <div id="technique-grid" class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"></div>
        </section>

        <section id="step-fields" class="mb-6 hidden">
          <div class="mb-2 flex items-center gap-3">
            <div class="flex h-8 w-8 items-center justify-center rounded-full bg-brand-500 text-sm font-bold text-white">3</div>
            <div>
              <h3 class="text-lg font-semibold text-white" id="fields-title">필요한 정보를 입력하세요</h3>
              <p class="text-sm text-slate-400" id="fields-subtitle">자동으로 채워진 값은 확인 후 수정할 수 있습니다.</p>
            </div>
          </div>
          <div class="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
            <div id="fields-container" class="space-y-5"></div>
            <div class="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                id="generate-btn"
                onclick="generatePrompt()"
                class="flex-1 rounded-2xl bg-brand-600 px-6 py-3.5 font-semibold text-white shadow-lg shadow-brand-500/20 hover:bg-brand-500"
              >
                프롬프트 생성
              </button>
              <button onclick="resetFields()" class="rounded-2xl border border-white/10 bg-white/5 px-6 py-3.5 font-semibold text-white hover:bg-white/10">
                초기화
              </button>
            </div>
          </div>
        </section>

        <section id="result-section" class="hidden">
          <div class="mb-4 flex items-center gap-3">
            <div class="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white">
              <i class="fas fa-check text-xs"></i>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-white">생성된 프롬프트</h3>
              <p class="text-sm text-slate-400">필요하면 복사하거나 다운로드해서 바로 사용할 수 있습니다.</p>
            </div>
          </div>
          <div class="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div class="space-y-4">
              <div id="context-doc-section" class="hidden">
                <div class="rounded-3xl border border-cyan-500/20 bg-white/5 p-5 backdrop-blur-xl">
                  <div class="mb-3 flex items-center gap-2">
                    <i class="fas fa-scroll text-cyan-300"></i>
                    <h4 class="text-sm font-semibold text-white">컨텍스트 문서</h4>
                    <span class="rounded-full bg-cyan-500/20 px-2 py-0.5 text-[10px] text-cyan-200">context.md</span>
                  </div>
                  <div id="context-doc-info"></div>
                </div>
              </div>

              <div class="overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl">
                <div class="flex items-center justify-between border-b border-white/10 px-5 py-3">
                  <div class="flex items-center gap-2">
                    <i class="fas fa-file-code text-brand-300 text-sm"></i>
                    <span class="text-sm font-medium text-white" id="result-technique-name">프롬프트</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <button onclick="copyPrompt()" id="copy-btn" class="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-white/10">
                      복사
                    </button>
                    <button onclick="downloadPrompt()" class="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-white/10">
                      다운로드
                    </button>
                  </div>
                </div>
                <div class="p-5">
                  <pre id="result-prompt" class="whitespace-pre-wrap text-sm leading-relaxed text-slate-200"></pre>
                </div>
              </div>

              <div id="chain-section" class="hidden">
                <div class="rounded-3xl border border-teal-500/20 bg-white/5 p-5 backdrop-blur-xl">
                  <div class="mb-4 flex items-center justify-between gap-3">
                    <div class="flex items-center gap-2">
                      <i class="fas fa-link text-teal-300"></i>
                      <h4 class="text-sm font-semibold text-white">단계별 프롬프트</h4>
                    </div>
                    <button onclick="downloadAllChainSteps()" class="rounded-xl border border-teal-500/20 bg-teal-500/10 px-3 py-1.5 text-[10px] font-semibold text-teal-200 hover:bg-teal-500/20">
                      전체 다운로드
                    </button>
                  </div>
                  <p class="mb-3 text-xs leading-6 text-slate-400">
                    각 단계를 펼쳐서 하나씩 복사할 수 있습니다. 필요하면 바로 다른 AI 도구에 넣어 사용할 수 있습니다.
                  </p>
                  <div id="chain-content"></div>
                </div>
              </div>
            </div>

            <div class="space-y-4">
              <div class="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
                <h4 class="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
                  <i class="fas fa-chart-simple text-brand-300"></i>
                  품질 요약
                </h4>
                <div class="mb-4 flex items-center gap-4">
                  <div id="quality-grade" class="flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-black"></div>
                  <div>
                    <div class="text-2xl font-bold text-white"><span id="quality-score">0</span><span class="text-sm text-slate-400">%</span></div>
                    <div class="text-xs text-slate-400" id="quality-label">분석 대기 중</div>
                  </div>
                </div>
                <div id="quality-checks" class="space-y-2"></div>
              </div>

              <div class="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
                <h4 class="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
                  <i class="fas fa-lightbulb text-yellow-300"></i>
                  도움말
                </h4>
                <ul id="tips-list" class="space-y-2 text-xs leading-6 text-slate-300"></ul>
              </div>
            </div>
          </div>
        </section>
      </main>

      <button
        onclick="showUpdates()"
        class="fixed bottom-5 right-5 z-[90] flex items-center gap-2 rounded-full border border-brand-400/30 bg-slate-900/90 px-4 py-3 text-xs font-semibold text-brand-300 shadow-lg shadow-brand-900/30 backdrop-blur-xl hover:-translate-y-0.5 hover:text-white"
      >
        <span class="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400"></span>
        <span>업데이트</span>
      </button>

      <div id="guide-modal" class="fixed inset-0 z-[100] hidden">
        <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" onclick="closeGuide()"></div>
        <div class="relative mx-auto mt-20 max-h-[80vh] max-w-3xl overflow-y-auto rounded-2xl border border-white/10 bg-slate-950 m-4">
          <div class="sticky top-0 flex items-center justify-between rounded-t-2xl border-b border-white/10 bg-slate-950 px-6 py-4">
            <h3 class="flex items-center gap-2 text-lg font-bold text-white">
              <i class="fas fa-book-open text-brand-300"></i>프롬프트 가이드
            </h3>
            <button onclick="closeGuide()" class="text-slate-400 hover:text-white"><i class="fas fa-xmark text-lg"></i></button>
          </div>
          <div class="space-y-6 p-6 text-sm text-slate-300" id="guide-content"></div>
        </div>
      </div>

      <div id="history-modal" class="fixed inset-0 z-[100] hidden">
        <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" onclick="closeHistory()"></div>
        <div class="relative mx-auto mt-20 max-h-[80vh] max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-slate-950 m-4">
          <div class="sticky top-0 flex items-center justify-between rounded-t-2xl border-b border-white/10 bg-slate-950 px-6 py-4">
            <h3 class="flex items-center gap-2 text-lg font-bold text-white">
              <i class="fas fa-clock-rotate-left text-brand-300"></i>생성 히스토리
            </h3>
            <div class="flex items-center gap-2">
              <button onclick="clearHistory()" class="rounded px-2 py-1 text-xs text-red-300 hover:text-red-200">전체 삭제</button>
              <button onclick="closeHistory()" class="text-slate-400 hover:text-white"><i class="fas fa-xmark text-lg"></i></button>
            </div>
          </div>
          <div id="history-content" class="p-6"></div>
        </div>
      </div>

      <div id="updates-modal" class="fixed inset-0 z-[100] hidden">
        <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" onclick="closeUpdates()"></div>
        <div class="relative mx-auto mt-20 max-h-[80vh] max-w-3xl overflow-y-auto rounded-2xl border border-white/10 bg-slate-950 m-4">
          <div class="sticky top-0 flex items-center justify-between rounded-t-2xl border-b border-white/10 bg-slate-950 px-6 py-4">
            <h3 class="flex items-center gap-2 text-lg font-bold text-white">
              <i class="fas fa-bullhorn text-brand-300"></i>최근 업데이트
            </h3>
            <button onclick="closeUpdates()" class="text-slate-400 hover:text-white"><i class="fas fa-xmark text-lg"></i></button>
          </div>
          <div id="updates-content" class="p-6"></div>
        </div>
      </div>
    </div>
  )
})

export default app
