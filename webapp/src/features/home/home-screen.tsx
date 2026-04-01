/** @jsxImportSource hono/jsx */

import { SiteFooter } from '../../components/site-footer'
import { HomeScreenOverlays } from './home-screen-overlays'

export function HomeScreen() {
  return (
<div id="app-root">
      <nav class="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
        <div class="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div class="flex cursor-pointer items-center gap-3" onclick="location.reload()">
              <div class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-indigo-600 shadow-lg shadow-brand-500/20">
                <i class="fas fa-wand-magic-sparkles text-sm text-white"></i>
              </div>
              <div class="min-w-0">
                <h1 class="text-base font-bold tracking-tight text-white sm:text-lg">프롬프트빌더</h1>
                <p class="hidden text-[11px] text-slate-400 sm:block">프롬프트를 몰라도 AI를 잘 쓰게 만드는 플랫폼</p>
              </div>
            </div>

            <div class="flex flex-wrap items-center gap-2 sm:justify-end">
              <button
                type="button"
                data-theme-switch
                onclick="toggleTheme()"
                aria-pressed="false"
                class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-white"
              >
                <span class="toggle-switch-label toggle-switch-label-left">라이트</span>
                <span class="toggle-switch-track"><span class="toggle-switch-knob"></span></span>
                <span class="toggle-switch-label toggle-switch-label-right">다크</span>
              </button>

              <button
                type="button"
                data-lang-switch
                onclick="togglePromptLanguage()"
                aria-pressed="false"
                class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-white"
              >
                <span class="toggle-switch-label toggle-switch-label-left">한국어</span>
                <span class="toggle-switch-track"><span class="toggle-switch-knob"></span></span>
                <span class="toggle-switch-label toggle-switch-label-right">English</span>
              </button>
              <button onclick="showGuide()" class="hidden rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 md:inline-flex">
                가이드
              </button>
              <button onclick="showHistory()" class="hidden rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 md:inline-flex">
                히스토리
              </button>
              <button onclick="promptAdminToken()" class="inline-flex rounded-full border border-brand-200 bg-brand-50 px-3 py-2 text-xs font-semibold text-brand-700 shadow-sm hover:bg-brand-100">
                관리자 모드
              </button>
              <button onclick="toggleMobileSidebar()" class="inline-flex rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 xl:hidden">
                <i class="fas fa-bars"></i>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main class="mx-auto max-w-7xl px-4 pb-16 pt-24 sm:px-6 lg:px-8">
        <div class="min-w-0">
          <section class="mb-8 space-y-6">
            <div class="space-y-4">
              <div class="inline-flex items-center gap-2 rounded-full border border-brand-500/20 bg-brand-500/10 px-3 py-1 text-xs font-semibold text-brand-300">
                <i class="fas fa-wand-magic-sparkles"></i>
                프롬프트를 몰라도 AI를 잘 쓰게 만드는 구조 설계 플랫폼
              </div>
              <h2 class="text-4xl font-black leading-tight text-white sm:text-5xl">
                프롬프트를 몰라도 AI를 잘 쓰게 만드는
                <span class="block bg-gradient-to-r from-brand-300 to-cyan-300 bg-clip-text text-transparent">업무 템플릿, 빌더, 최적화를 한 화면에서</span>
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
              <div class="grid gap-3 lg:grid-cols-3">
                <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div class="text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-400">전체 생성 프롬프트</div>
                  <div class="mt-2 text-3xl font-black text-white"><span id="site-prompt-count">0</span></div>
                  <div class="mt-1 text-xs leading-5 text-slate-400">지금까지 생성된 프롬프트 누적 수</div>
                </div>
                <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div class="text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-400">전체 활동 로그</div>
                  <div class="mt-2 text-3xl font-black text-white"><span id="site-activity-count">0</span></div>
                  <div class="mt-1 text-xs leading-5 text-slate-400">페이지뷰를 제외한 생성, 복사, 다운로드 활동 수</div>
                </div>
                <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div class="text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-400">전체 방문자 수</div>
                  <div class="mt-2 text-3xl font-black text-white"><span id="site-visitor-count">0</span></div>
                  <div class="mt-1 text-xs leading-5 text-slate-400">고유 사용자를 기준으로 집계된 방문자 수</div>
                </div>
              </div>
            </div>
          <div class="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
            <div class="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
              <div class="mb-4 flex items-center justify-between gap-3">
                <div>
                  <div class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">모드 선택</div>
                  <h3 class="mt-2 text-lg font-semibold text-white">가장 쉬운 방식부터 시작하세요</h3>
                </div>
                <div class="text-xs text-slate-400">한 번만 고르면 됩니다</div>
              </div>
              <div class="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                <button onclick="switchMode('template')" class="rounded-3xl border border-white/10 bg-white/5 px-4 py-4 text-left transition hover:bg-white/10">
                  <div class="flex items-center justify-between">
                    <div class="text-sm font-semibold text-white">템플릿 모드</div>
                    <span class="rounded-full bg-brand-500/15 px-2 py-0.5 text-[10px] font-semibold text-brand-200">사무직</span>
                  </div>
                  <div class="mt-2 text-xs leading-5 text-slate-300">메일, 보고서, 회의록 같은 일상 업무를 빠르게 고릅니다.</div>
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
                  <div class="mt-2 text-xs leading-5 text-brand-100/80">이미 만든 프롬프트를 결과 기준으로 다듬습니다.</div>
                </button>
              </div>
            </div>

            <div class="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl xl:sticky xl:top-24 self-start">
              <div class="mb-4 flex items-center justify-between gap-3">
                <div>
                  <div class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">AI 스타일</div>
                  <h3 class="mt-2 text-lg font-semibold text-white">어떤 AI 말투로 맞출지 고르세요</h3>
                </div>
                <div class="text-xs text-slate-300">기본은 GPT 스타일</div>
              </div>
              <div class="grid gap-3 grid-cols-2 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
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
                <button data-prompt-style="custom" onclick="setPromptStyle('custom')" class="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm font-semibold text-white hover:bg-white/10 sm:col-span-2 xl:col-span-1 2xl:col-span-2">
                  직접 지정
                  <div class="mt-1 text-[11px] font-normal text-slate-300">기본 구조 유지, 수동 조정</div>
                </button>
              </div>
            </div>
          </div>
        </section>

          <section id="step-purpose" class="mb-6">
          <div class="mb-4 flex items-center gap-3">
            <div class="flex h-8 w-8 items-center justify-center rounded-full bg-brand-500 text-sm font-bold text-white">1</div>
            <div>
              <h3 class="text-lg font-semibold text-white">목적과 키워드를 먼저 정하세요</h3>
              <p class="text-sm text-slate-400">상황을 먼저 고르면 어떤 입력이 필요한지 바로 안내합니다.</p>
            </div>
          </div>
          <div id="purpose-grid" class="grid grid-cols-2 gap-3 sm:grid-cols-4"></div>
          <div id="keyword-section" class="mt-4 hidden">
              <label class="mb-2 block text-sm font-medium text-slate-300">키워드</label>
            <div class="flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                id="keyword-input"
                placeholder="예: 장소, 코드 리뷰, 회의 초안"
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
            <p class="mt-2 text-xs leading-5 text-slate-400">키워드를 넣으면 어떤 방식이 잘 맞는지 먼저 추천합니다.</p>
          </div>
        </section>

          <section id="recommendation-section" class="mb-6 hidden">
          <div class="rounded-3xl border border-brand-500/20 bg-white/5 p-5 backdrop-blur-xl">
            <div class="mb-3 flex items-center gap-2">
              <i class="fas fa-robot text-brand-300"></i>
              <h4 class="text-sm font-semibold text-white">AI 추천 결과</h4>
              <span class="rounded-full bg-brand-500/20 px-2 py-0.5 text-[10px] font-semibold text-brand-200">자동 품질 분석</span>
            </div>
            <p id="rec-reason" class="mb-4 text-sm leading-7 text-slate-300">목적과 키워드를 고르면 그에 맞는 추천 이유를 보여줍니다.</p>
            <div class="grid gap-3 lg:grid-cols-2">
              <div id="rec-primary">
                <div class="rounded-2xl border border-dashed border-white/15 bg-white/5 p-4 text-sm leading-6 text-slate-400">
                  추천 결과가 나오면 가장 적합한 방식이 여기에 표시됩니다.
                </div>
              </div>
              <div id="rec-secondary" class="space-y-2">
                <div class="rounded-2xl border border-dashed border-white/15 bg-white/5 p-4 text-xs leading-6 text-slate-400">
                  아직 보조 추천은 없습니다. 목적을 고르면 추천이 채워집니다.
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
              <p class="text-sm text-slate-400">추천 결과를 보고 바로 가장 맞는 방식까지 고를 수 있습니다.</p>
            </div>
          </div>
          <div id="technique-grid" class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div class="rounded-2xl border border-dashed border-white/15 bg-white/5 p-4 text-sm leading-6 text-slate-400 sm:col-span-2 lg:col-span-3">
              목적을 먼저 고르면 추천 방식과 직접 선택 카드가 표시됩니다.
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
                방식을 고르면 입력칸이 이곳에 표시됩니다.
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
                    <button onclick="openOptimizeFromResult()" class="rounded-xl border border-brand-500/20 bg-brand-500/10 px-3 py-1.5 text-xs font-semibold text-brand-100 hover:bg-brand-500/15">
                      최적화
                    </button>
                  </div>
                </div>
                <div class="p-5">
                  <pre id="result-prompt" class="whitespace-pre-wrap text-sm leading-relaxed text-slate-200"></pre>
                </div>
              </div>

              <div id="result-variants" class="space-y-4"></div>

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

            <div class="space-y-4 xl:sticky xl:top-24 self-start">
              <div class="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
                <h4 class="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
                  <i class="fas fa-chart-simple text-brand-300"></i>
                  품질 요약
                </h4>
                <div class="mb-4 flex items-center gap-4">
                  <div id="quality-grade" class="flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-black"></div>
                  <div>
                    <div class="text-2xl font-bold text-white"><span id="quality-score">0</span><span class="text-sm text-slate-400">%</span></div>
                    <div class="text-xs text-slate-400" id="quality-label">품질 분석 대기 중</div>
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
      </main>

      <SiteFooter />
      <HomeScreenOverlays />
    </div>

  )
}
