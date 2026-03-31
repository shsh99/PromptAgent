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
              <button onclick="toggleMobileSidebar()" class="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10 xl:hidden">
                <i class="fas fa-bars mr-1"></i>
                메뉴
              </button>
              <button onclick="setTheme('light')" class="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10">
                라이트
              </button>
              <button onclick="setTheme('dark')" class="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10">
                다크
              </button>
              <button data-prompt-lang="ko" onclick="setPromptLanguage('ko')" class="rounded-full border border-white/10 bg-brand-600 px-3 py-2 text-xs font-semibold text-white hover:bg-brand-500">
                한국어
              </button>
              <button data-prompt-lang="en" onclick="setPromptLanguage('en')" class="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10">
                English
              </button>
              <button onclick="showGuide()" class="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10">
                가이드
              </button>
              <button onclick="showHistory()" class="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10">
                히스토리
              </button>
              <button onclick="promptAdminToken()" class="rounded-full border border-brand-500/20 bg-brand-500/10 px-3 py-2 text-xs font-semibold text-brand-200 hover:bg-brand-500/15">
                관리자
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div id="mobile-sidebar" class="fixed inset-0 z-[60] hidden xl:hidden">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" onclick="toggleMobileSidebar(false)"></div>
        <div class="sidebar-surface absolute bottom-0 left-0 top-16 w-[86vw] max-w-sm overflow-y-auto border-r border-white/10 bg-slate-950/96 p-4 shadow-2xl shadow-black/40">
          <div class="mb-4 flex items-center justify-between">
            <div>
              <div class="text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-400">빠른 이동</div>
              <div class="mt-1 text-sm font-semibold text-white">모바일 메뉴</div>
            </div>
            <button onclick="toggleMobileSidebar(false)" class="rounded-full border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-semibold text-slate-200 hover:bg-white/10">
              닫기
            </button>
          </div>
          <div class="space-y-2">
            <button onclick="switchMode('template')" class="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm font-semibold text-white hover:bg-white/10">
              템플릿 모드
            </button>
            <button onclick="switchMode('builder')" class="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm font-semibold text-white hover:bg-white/10">
              빌더 모드
            </button>
            <button onclick="switchMode('optimize')" class="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm font-semibold text-white hover:bg-white/10">
              최적화 모드
            </button>
          </div>
          <div class="mt-4 border-t border-white/10 pt-4">
            <div class="text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-400">작업 상태</div>
            <div class="mt-2 grid gap-2">
              <button data-workflow-state="new" onclick="setWorkflowState('new')" class="w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-left text-xs font-semibold text-slate-200 hover:bg-white/10">새로 시작</button>
              <button data-workflow-state="in-progress" onclick="setWorkflowState('in-progress')" class="w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-left text-xs font-semibold text-slate-200 hover:bg-white/10">진행 중</button>
              <button data-workflow-state="done" onclick="setWorkflowState('done')" class="w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-left text-xs font-semibold text-slate-200 hover:bg-white/10">완료 보고</button>
              <button data-workflow-state="blocked" onclick="setWorkflowState('blocked')" class="w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-left text-xs font-semibold text-slate-200 hover:bg-white/10">막힘 / 수정 요청</button>
            </div>
          </div>
          <div class="mt-4 rounded-2xl border border-brand-500/20 bg-brand-500/10 p-3 text-xs leading-6 text-slate-200">
            기본은 한국어입니다. 영어가 필요할 때만 영어 프롬프트로 바꿔주세요.
          </div>
        </div>
      </div>

      <main class="mx-auto max-w-7xl px-4 pb-16 pt-24 sm:px-6 lg:px-8">
        <div class="xl:grid xl:grid-cols-[16rem_minmax(0,1fr)] xl:gap-8">
          <aside class="hidden xl:block xl:sticky xl:top-24 xl:self-start">
            <div class="sidebar-surface rounded-3xl border border-white/10 bg-slate-950/90 p-4 shadow-2xl shadow-black/20 backdrop-blur-xl">
              <div class="mb-4 flex items-center justify-between">
                <div>
                  <div class="text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-400">빠른 이동</div>
                  <div class="mt-1 text-sm font-semibold text-white">처음 쓰는 사람용</div>
                </div>
                <span class="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold text-amber-300">BETA</span>
              </div>
              <div class="space-y-2">
                <button onclick="switchMode('template')" class="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm font-semibold text-white hover:bg-white/10">
                  템플릿 모드
                </button>
                <button onclick="switchMode('builder')" class="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm font-semibold text-white hover:bg-white/10">
                  빌더 모드
                </button>
                <button onclick="switchMode('optimize')" class="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm font-semibold text-white hover:bg-white/10">
                  최적화 모드
                </button>
              </div>
              <div class="mt-4 border-t border-white/10 pt-4">
                <div class="text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-400">작업 상태</div>
                <div class="mt-2 grid gap-2">
                  <button data-workflow-state="new" onclick="setWorkflowState('new')" class="w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-left text-xs font-semibold text-slate-200 hover:bg-white/10">새로 시작</button>
                  <button data-workflow-state="in-progress" onclick="setWorkflowState('in-progress')" class="w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-left text-xs font-semibold text-slate-200 hover:bg-white/10">진행 중</button>
                  <button data-workflow-state="done" onclick="setWorkflowState('done')" class="w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-left text-xs font-semibold text-slate-200 hover:bg-white/10">완료 보고</button>
                  <button data-workflow-state="blocked" onclick="setWorkflowState('blocked')" class="w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-left text-xs font-semibold text-slate-200 hover:bg-white/10">막힘 / 수정 요청</button>
                </div>
              </div>
              <div class="mt-4 rounded-2xl border border-brand-500/20 bg-brand-500/10 p-3 text-xs leading-6 text-slate-200">
                기본은 한국어입니다. 영어가 필요할 때만 영어 프롬프트로 바꿔주세요.
              </div>
            </div>
          </aside>

          <div class="min-w-0">
          <section class="mb-10 space-y-6">
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
                  템플릿 모드로 시작
                </button>
                <button onclick="switchMode('builder')" class="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white hover:bg-white/10">
                  고급자 모드
                </button>
                <button onclick="switchMode('optimize')" class="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white hover:bg-white/10">
                  최적화 열기
                </button>
              </div>
              <div class="grid gap-3 md:grid-cols-3">
                <div class="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-slate-300">
                  <div class="text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-400">1. 처음 시작</div>
                  <div class="mt-2 font-semibold text-white">템플릿 모드</div>
                  <div class="mt-1">예시가 자동으로 채워지는 가장 쉬운 시작점입니다.</div>
                </div>
                <div class="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-slate-300">
                  <div class="text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-400">2. 직접 설계</div>
                  <div class="mt-2 font-semibold text-white">빌더 모드</div>
                  <div class="mt-1">문제 정의부터 직접 입력해서 세밀하게 만듭니다.</div>
                </div>
                <div class="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-slate-300">
                  <div class="text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-400">3. 결과 개선</div>
                  <div class="mt-2 font-semibold text-white">최적화 모드</div>
                  <div class="mt-1">이미 만든 프롬프트를 결과 기준으로 다듬습니다.</div>
                </div>
              </div>
            </div>
          <div class="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
            <div class="mb-4 flex items-center justify-between gap-3">
              <div>
                <div class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">모드 선택</div>
                <h3 class="mt-2 text-lg font-semibold text-white">가장 쉬운 방식부터 시작하세요</h3>
              </div>
              <div class="text-xs text-slate-400">한 번만 고르면 됩니다</div>
            </div>
            <div class="grid gap-3 md:grid-cols-3">
              <button onclick="switchMode('template')" class="rounded-3xl border border-white/10 bg-white/5 px-4 py-4 text-left transition hover:bg-white/10">
                <div class="flex items-center justify-between">
                  <div class="text-sm font-semibold text-white">템플릿 모드</div>
                  <span class="rounded-full bg-brand-500/15 px-2 py-0.5 text-[10px] font-semibold text-brand-200">사무직</span>
                </div>
                <div class="mt-2 text-xs leading-5 text-slate-300">이메일, 보고서, 회의록처럼 자주 쓰는 일을 빠르게 시작합니다.</div>
              </button>
              <button onclick="switchMode('builder')" class="rounded-3xl border border-white/10 bg-white/5 px-4 py-4 text-left transition hover:bg-white/10">
                <div class="flex items-center justify-between">
                  <div class="text-sm font-semibold text-white">빌더 모드</div>
                  <span class="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-slate-200">개발자</span>
                </div>
                <div class="mt-2 text-xs leading-5 text-slate-300">문제 정의, 입력, 출력, 제약 조건을 직접 설계합니다.</div>
              </button>
              <button onclick="switchMode('optimize')" class="rounded-3xl border border-brand-400/20 bg-brand-500/10 px-4 py-4 text-left transition hover:bg-brand-500/15">
                <div class="flex items-center justify-between">
                  <div class="text-sm font-semibold text-brand-100">최적화 모드</div>
                  <span class="rounded-full bg-brand-500/20 px-2 py-0.5 text-[10px] font-semibold text-brand-100">개선</span>
                </div>
                <div class="mt-2 text-xs leading-5 text-brand-100/80">이미 만든 프롬프트를 결과 기준으로 고칩니다.</div>
              </button>
            </div>
          </div>
        </section>

        <div class="mb-10 rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
          <div class="mb-4 flex items-center justify-between gap-3">
            <div>
              <div class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">AI 스타일</div>
              <h3 class="mt-2 text-lg font-semibold text-white">어떤 AI 말투로 맞출지 고르세요</h3>
            </div>
          <div class="text-xs text-slate-300">기본은 GPT 스타일</div>
          </div>
          <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <button data-prompt-style="gpt" onclick="setPromptStyle('gpt')" class="rounded-2xl border border-brand-500/20 bg-brand-500/10 px-4 py-3 text-left text-sm font-semibold text-white hover:bg-brand-500/15">
              GPT
              <div class="mt-1 text-[11px] font-normal text-brand-100/80">구조적이고 간결한 스타일</div>
            </button>
            <button data-prompt-style="claude" onclick="setPromptStyle('claude')" class="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm font-semibold text-white hover:bg-white/10">
              Claude
              <div class="mt-1 text-[11px] font-normal text-slate-300">맥락이 풍부한 스타일</div>
            </button>
            <button data-prompt-style="gemini" onclick="setPromptStyle('gemini')" class="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm font-semibold text-white hover:bg-white/10">
              Gemini
              <div class="mt-1 text-[11px] font-normal text-slate-300">짧고 직접적인 스타일</div>
            </button>
            <button data-prompt-style="genspark" onclick="setPromptStyle('genspark')" class="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm font-semibold text-white hover:bg-white/10">
              Genspark
              <div class="mt-1 text-[11px] font-normal text-slate-300">실행 순서가 분명한 스타일</div>
            </button>
            <button data-prompt-style="custom" onclick="setPromptStyle('custom')" class="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm font-semibold text-white hover:bg-white/10">
              직접 지정
              <div class="mt-1 text-[11px] font-normal text-slate-300">기본 구조 유지, 수동 조정</div>
            </button>
          </div>
        </div>

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
                추천 경로 보기
              </button>
            </div>
            <p class="mt-2 text-xs leading-5 text-slate-400">키워드를 넣으면 어떤 방식이 맞는지 먼저 추천해줍니다.</p>
          </div>
        </section>

          <section id="recommendation-section" class="mb-6 hidden">
          <div class="rounded-3xl border border-brand-500/20 bg-white/5 p-5 backdrop-blur-xl">
            <div class="mb-3 flex items-center gap-2">
              <i class="fas fa-robot text-brand-300"></i>
              <h4 class="text-sm font-semibold text-white">AI 추천 결과</h4>
              <span class="rounded-full bg-brand-500/20 px-2 py-0.5 text-[10px] font-semibold text-brand-200">자동 분석</span>
            </div>
            <p id="rec-reason" class="mb-4 text-sm leading-7 text-slate-300">목적과 키워드를 선택하면 여기서 추천 이유를 보여줍니다.</p>
            <div class="grid gap-3 lg:grid-cols-2">
              <div id="rec-primary">
                <div class="rounded-2xl border border-dashed border-white/15 bg-white/5 p-4 text-sm leading-6 text-slate-400">
                  추천 결과가 나오면 가장 적합한 방식이 여기에 표시됩니다.
                </div>
              </div>
              <div id="rec-secondary" class="space-y-2">
                <div class="rounded-2xl border border-dashed border-white/15 bg-white/5 p-4 text-xs leading-6 text-slate-400">
                  아직 보조 추천이 없습니다. 목적을 먼저 선택한 뒤 추천을 눌러보세요.
                </div>
              </div>
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
          <div id="technique-grid" class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div class="rounded-2xl border border-dashed border-white/15 bg-white/5 p-4 text-sm leading-6 text-slate-400 sm:col-span-2 lg:col-span-3">
              목적을 먼저 선택하면 여기에 추천 방식과 직접 선택 카드가 나타납니다.
            </div>
          </div>
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
            <div id="fields-container" class="space-y-5">
              <div class="rounded-2xl border border-dashed border-white/15 bg-white/5 p-4 text-sm leading-6 text-slate-400">
                방식이 선택되면 입력칸이 이곳에 나타납니다.
              </div>
            </div>
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
          </div>
        </div>
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
          <div id="history-content" class="p-6">
            <div class="rounded-2xl border border-dashed border-white/15 bg-white/5 p-6 text-sm leading-7 text-slate-400">
              아직 저장된 기록이 없습니다. 프롬프트를 생성하면 여기에 최근 작업이 표시됩니다.
            </div>
          </div>
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
