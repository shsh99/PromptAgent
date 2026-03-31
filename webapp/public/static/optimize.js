// ===== optimize.js - mode switch + optimize loop =====

const OPTIMIZE_HISTORY_KEY = 'pf_optimize_history';
const OPTIMIZE_SESSION_KEY = 'pf_optimize_session';
const OPTIMIZE_COMPARE_KEY = 'pf_optimize_compare';
const OPTIMIZE_EXAMPLES = [
  {
    title: '프로젝트 설계',
    prompt: '신규 서비스를 기획하는 프로젝트입니다. 먼저 문제를 정의하고, 대상 사용자, 목표 KPI, 필요한 산출물, 출력 형식을 정리한 뒤 최종 답변을 작성하세요.',
    output: '문제 정의, 대상 사용자, KPI, 핵심 기능, 실행 계획이 포함된 프로젝트 브리프로 출력하세요.',
    goal: '처음 만드는 프롬프트에서 문제와 목표를 먼저 보이게 하기.',
  },
  {
    title: '진행 중 질문',
    prompt: '현재 프로젝트 진행 상황을 바탕으로 다음에 확인해야 할 질문을 3개만 정리하세요. 각 질문은 맥락, 필요한 정보, 기대 답변 형식까지 포함해야 합니다.',
    output: '질문 3개를 목록으로 출력하고, 각 질문마다 왜 필요한지 한 줄로 설명하세요.',
    goal: '프로젝트 진행 중 여러 번 묻는 질문을 빠르게 정리하기.',
  },
  {
    title: '구조화 출력',
    prompt: '기획 요청을 분석하고, 결과를 title, summary, risks, action_items가 있는 JSON 형태로만 반환하세요.',
    output: 'JSON 외의 설명은 넣지 마세요.',
    goal: '출력 구조를 고정해 결과가 흔들리지 않게 만들기.',
  },
  {
    title: '코드 리뷰',
    prompt: '시니어 엔지니어 관점에서 이 PR을 리뷰하세요. 정확성 문제, 유지보수 위험, 누락된 테스트를 먼저 찾고 표 형식으로 정리하세요.',
    output: '문제, 영향, 수정 제안을 3개 섹션으로 나눠서 출력하세요.',
    goal: '리뷰를 바로 실행 가능한 구조로 바꾸기.',
  },
  {
    title: '회의 요약',
    prompt: '회의 메모를 결정 사항, 남은 질문, 다음 행동으로 정리하세요. 문장은 짧고 실무적으로 유지하세요.',
    output: '결정 사항, 질문, 다음 행동을 각각 나눠서 출력하세요.',
    goal: '원본 메모를 재사용 가능한 요약 형식으로 바꾸기.',
  },
  {
    title: '마케팅 초안',
    prompt: '신제품 런칭용 캠페인 초안을 작성하세요. 먼저 대상의 문제를 정의하고, 제안 가치와 문구 후보를 구조적으로 정리하세요.',
    output: '대상, 문제, 핵심 메시지, 헤드라인, CTA를 구조화된 형태로 출력하세요.',
    goal: '전환 중심 구조와 출력 형식을 강화하기.',
  },
];

const BUILDER_STARTERS = [
  {
    title: '프로젝트 설계',
    purpose: 'content',
    keyword: '신규 서비스 기획',
    technique: 'harness',
    description: '문제, 대상, KPI, 산출물을 먼저 채워 새 프로젝트의 골격을 잡습니다.',
  },
  {
    title: '진행 중 질문',
    purpose: 'web-app',
    keyword: '프로젝트 진행 중 확인 질문',
    technique: 'context-engineering',
    description: '이미 진행 중인 프로젝트에서 다음에 물어볼 질문을 정리합니다.',
  },
  {
    title: '코드 리뷰',
    purpose: 'web-app',
    keyword: '풀 리퀘스트 리뷰',
    technique: 'harness',
    description: '리스크, 확인 항목, 수정 제안을 포함한 리뷰 프롬프트입니다.',
  },
  {
    title: '회의 메모',
    purpose: 'custom',
    keyword: '회의 요약',
    technique: 'few-shot',
    description: '메모를 결정 사항, 실행 항목, 담당자로 정리합니다.',
  },
  {
    title: '버그 분류',
    purpose: 'web-app',
    keyword: '버그 분류 브리프',
    technique: 'chain-of-thought',
    description: '문제를 정의하고 원인을 추론한 뒤 실행 계획을 만듭니다.',
  },
  {
    title: '마케팅 브리프',
    purpose: 'content',
    keyword: '신제품 런칭 브리프',
    technique: 'role-prompting',
    description: '전환을 목표로 하는 마케팅용 하네스를 빠르게 시작합니다.',
  },
];

function getOptimizeHistory() {
  try {
    return JSON.parse(localStorage.getItem(OPTIMIZE_HISTORY_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveOptimizeHistory(items) {
  localStorage.setItem(OPTIMIZE_HISTORY_KEY, JSON.stringify(items.slice(0, 30)));
}

function setOptimizeSession(session) {
  localStorage.setItem(OPTIMIZE_SESSION_KEY, JSON.stringify(session || {}));
  window.__optimizeSession = session || {};
}

function getOptimizeSession() {
  if (window.__optimizeSession) return window.__optimizeSession;
  try {
    return JSON.parse(localStorage.getItem(OPTIMIZE_SESSION_KEY) || '{}');
  } catch {
    return {};
  }
}

function normalizeVersionText(text) {
  return String(text || '')
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.trimEnd());
}

function buildInlineDiff(before, after) {
  const left = normalizeVersionText(before);
  const right = normalizeVersionText(after);
  const max = Math.max(left.length, right.length);
  const rows = [];

  for (let i = 0; i < max; i += 1) {
    const prevLine = left[i];
    const nextLine = right[i];
    if (prevLine === nextLine) {
      if (!prevLine && !nextLine) continue;
      rows.push(`<div class="grid grid-cols-[24px_1fr_1fr] gap-2 text-xs text-gray-500">
        <div class="font-mono text-right">${i + 1}</div>
        <div class="rounded-lg bg-gray-50 px-2 py-1 font-mono">${escapeHtml(prevLine || '')}</div>
        <div class="rounded-lg bg-gray-50 px-2 py-1 font-mono">${escapeHtml(nextLine || '')}</div>
      </div>`);
      continue;
    }
    rows.push(`<div class="grid grid-cols-[24px_1fr_1fr] gap-2 text-xs">
      <div class="font-mono text-right text-gray-400">${i + 1}</div>
      <div class="rounded-lg border border-red-100 bg-red-50 px-2 py-1 font-mono text-red-700">${escapeHtml(prevLine || '∅')}</div>
      <div class="rounded-lg border border-emerald-100 bg-emerald-50 px-2 py-1 font-mono text-emerald-700">${escapeHtml(nextLine || '∅')}</div>
    </div>`);
  }

  return rows.join('');
}

function getCurrentCompareId() {
  return Number(localStorage.getItem(OPTIMIZE_COMPARE_KEY) || 0);
}

function setCurrentCompareId(id) {
  localStorage.setItem(OPTIMIZE_COMPARE_KEY, String(id || 0));
}

function getOptimizeEl(id) {
  return document.getElementById(id);
}

function setOptimizeText(id, value) {
  const el = getOptimizeEl(id);
  if (el) el.textContent = value;
}

function setOptimizeValue(id, value) {
  const el = getOptimizeEl(id);
  if (el) el.value = value;
}

function injectOptimizeUI() {
  if (document.getElementById('optimize-tabs')) return;
  const firstBuilderSection = document.getElementById('step-purpose');
  if (!firstBuilderSection) return;

  const tabs = document.createElement('section');
  tabs.id = 'optimize-tabs';
  tabs.className = 'mb-8';
  tabs.innerHTML = `
    <div class="flex justify-center">
      <div class="inline-flex rounded-2xl border border-gray-200 bg-white p-1.5 shadow-sm">
        <button onclick="switchMode('template')" id="tab-template" class="mode-btn px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2">
          <i class="fas fa-th-large"></i>
          <span>템플릿</span>
        </button>
        <button onclick="switchMode('builder')" id="tab-builder" class="mode-btn px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 active bg-brand-600 text-white">
          <i class="fas fa-code"></i>
          <span>빌더</span>
        </button>
        <button onclick="switchMode('optimize')" id="tab-optimize" class="mode-btn px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2">
          <i class="fas fa-magic"></i>
          <span>최적화</span>
        </button>
      </div>
    </div>
  `;
  firstBuilderSection.parentElement.insertBefore(tabs, firstBuilderSection);

  const templatePanel = document.createElement('section');
  templatePanel.id = 'template-workspace';
  templatePanel.className = 'hidden mb-10';
  templatePanel.innerHTML = `
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div class="bg-white text-gray-900 border border-gray-200 rounded-3xl p-5 shadow-sm">
        <div class="flex items-center gap-2 mb-3 text-brand-600">
          <i class="fas fa-briefcase"></i>
          <h3 class="font-semibold">업무 시작 카드</h3>
        </div>
        <p class="text-sm text-gray-600 leading-relaxed">역할, 문제, 출력 형식이 미리 채워져 있어 바로 시작할 수 있습니다.</p>
      </div>
      <div class="bg-white text-gray-900 border border-gray-200 rounded-3xl p-5 shadow-sm">
        <div class="flex items-center gap-2 mb-3 text-brand-600">
          <i class="fas fa-code"></i>
          <h3 class="font-semibold">빌더 시작 카드</h3>
        </div>
        <p class="text-sm text-gray-600 leading-relaxed">강한 제약과 구조가 필요할 때 하네스 필드를 바로 사용할 수 있습니다.</p>
      </div>
      <div class="bg-white text-gray-900 border border-gray-200 rounded-3xl p-5 shadow-sm">
        <div class="flex items-center gap-2 mb-3 text-brand-600">
          <i class="fas fa-magic"></i>
          <h3 class="font-semibold">최적화 시작 카드</h3>
        </div>
        <p class="text-sm text-gray-600 leading-relaxed">프롬프트와 결과를 넣고, 다음 버전을 더 좋게 개선할 수 있습니다.</p>
        <button onclick="switchMode('optimize')" class="mt-4 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-500">
          최적화 열기
        </button>
      </div>
    </div>
  `;
  firstBuilderSection.parentElement.insertBefore(templatePanel, firstBuilderSection);

  const builderHelperPanel = document.createElement('section');
  builderHelperPanel.id = 'builder-helper-panel';
  builderHelperPanel.className = 'hidden mb-8';
  builderHelperPanel.innerHTML = `
    <div class="grid grid-cols-1 xl:grid-cols-3 gap-4">
      <div class="xl:col-span-2 rounded-3xl border border-gray-200 bg-white text-gray-900 shadow-sm p-5">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="text-lg font-semibold">빌더 시작 템플릿</h3>
            <p class="text-sm text-gray-500">사용 사례를 고르면 구조화된 프롬프트 작성으로 바로 진입할 수 있습니다.</p>
          </div>
          <span class="rounded-full bg-brand-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-700">빠른 시작</span>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          ${BUILDER_STARTERS.map((item, index) => `
            <div class="rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <div class="flex items-center justify-between gap-3 mb-2">
                <div class="font-semibold text-gray-900">${escapeHtml(item.title)}</div>
                <button onclick="loadBuilderStarter(${index})" class="rounded-xl bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-500">적용</button>
              </div>
              <div class="text-xs text-gray-500 leading-relaxed">${escapeHtml(item.description)}</div>
            </div>
          `).join('')}
        </div>
      </div>
      <div class="rounded-3xl border border-gray-200 bg-white text-gray-900 shadow-sm p-5">
        <div class="flex items-center gap-2 mb-4">
          <i class="fas fa-clipboard-check text-brand-600"></i>
        <h4 class="font-semibold">빌더 체크리스트</h4>
        </div>
        <ul class="space-y-2 text-sm text-gray-600 leading-relaxed">
          <li>작업보다 먼저 문제를 정의하세요.</li>
          <li>입력 데이터와 지시문을 분리하세요.</li>
          <li>출력 형식을 명확히 지정하세요.</li>
          <li>길이와 형식 제약을 추가하세요.</li>
          <li>불안정한 작업이면 예시를 1개 넣으세요.</li>
        </ul>
      </div>
    </div>
  `;
  firstBuilderSection.parentElement.insertBefore(builderHelperPanel, firstBuilderSection);

  const optimizePanel = document.createElement('section');
  optimizePanel.id = 'optimize-workspace';
  optimizePanel.className = 'hidden mb-10';
  optimizePanel.innerHTML = `
    <div class="grid grid-cols-1 xl:grid-cols-3 gap-4">
      <div class="xl:col-span-2 space-y-4">
        <div class="rounded-3xl border border-gray-200 bg-white text-gray-900 shadow-sm p-5">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h3 class="text-lg font-semibold">최적화 모드</h3>
              <p class="text-sm text-gray-500">프롬프트 → 실행 → 결과 → 평가 → 개선 → 버전</p>
            </div>
            <div class="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              <span class="h-2 w-2 rounded-full bg-emerald-500"></span>루프 준비 완료
            </div>
          </div>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold uppercase tracking-[0.2em] text-gray-500 mb-2">프롬프트</label>
              <textarea id="optimize-prompt" rows="12" class="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10" placeholder="최적화할 프롬프트를 붙여넣거나 작성하세요."></textarea>
            </div>
            <div>
              <label class="block text-xs font-semibold uppercase tracking-[0.2em] text-gray-500 mb-2">결과</label>
              <textarea id="optimize-output" rows="12" class="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10" placeholder="모델이 생성한 결과를 붙여넣으세요."></textarea>
            </div>
          </div>
          <div class="mt-4">
            <label class="block text-xs font-semibold uppercase tracking-[0.2em] text-gray-500 mb-2">목표</label>
            <input id="optimize-goal" type="text" class="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10" placeholder="결과가 어떻게 더 좋아졌어야 했는지 적어주세요." />
          </div>
          <div class="mt-5 flex flex-col sm:flex-row gap-3">
            <button onclick="runOptimize()" id="optimize-run-btn" class="flex-1 rounded-2xl bg-brand-600 px-5 py-3 font-semibold text-white hover:bg-brand-500">
              최적화 실행
            </button>
            <button onclick="saveOptimizeVersion()" class="rounded-2xl border border-gray-200 bg-white px-5 py-3 font-semibold text-gray-700 hover:bg-gray-50">
              버전 저장
            </button>
          </div>
        </div>

        <div class="rounded-3xl border border-gray-200 bg-white text-gray-900 shadow-sm p-5">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h4 class="font-semibold">시작 템플릿</h4>
              <p class="text-xs text-gray-500">어떻게 시작할지 막막할 때 바로 사용할 수 있습니다.</p>
            </div>
            <span class="rounded-full bg-brand-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-700">예시</span>
          </div>
          <div class="space-y-3" id="optimize-example-list">
            ${OPTIMIZE_EXAMPLES.map((item, index) => `
              <div class="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <div class="flex items-center justify-between gap-3 mb-2">
                  <div class="font-semibold text-gray-900">${escapeHtml(item.title)}</div>
                  <div class="flex items-center gap-2">
                    <button onclick="loadOptimizeExample(${index})" class="rounded-xl bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-500">불러오기</button>
                    <button onclick="copyOptimizeExample(${index})" class="rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-white">복사</button>
                  </div>
                </div>
                <div class="text-xs text-gray-500 line-clamp-3">${escapeHtml(item.goal)}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="rounded-3xl border border-gray-200 bg-white text-gray-900 shadow-sm p-5">
          <div class="flex items-center justify-between mb-4">
            <h4 class="font-semibold">개선된 프롬프트</h4>
            <div class="flex items-center gap-2">
              <button onclick="copyOptimizePrompt()" class="rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50">복사</button>
              <button onclick="rollbackOptimizePrompt()" class="rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50">되돌리기</button>
            </div>
          </div>
          <pre id="optimize-improved-prompt" class="whitespace-pre-wrap rounded-2xl bg-gray-50 p-4 text-sm leading-relaxed text-gray-800 min-h-[220px]"></pre>
        </div>

        <div class="rounded-3xl border border-gray-200 bg-white text-gray-900 shadow-sm p-5">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h4 class="font-semibold">버전 비교</h4>
              <p class="text-xs text-gray-500">선택한 버전과 현재 세션을 비교합니다.</p>
            </div>
            <button onclick="clearOptimizeCompare()" class="rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50">초기화</button>
          </div>
          <div id="optimize-diff" class="space-y-3">
            <div class="rounded-2xl bg-gray-50 px-4 py-5 text-sm text-gray-500">비교할 버전을 선택하세요.</div>
          </div>
        </div>
      </div>
      <div class="space-y-4">
        <div class="rounded-3xl border border-gray-200 bg-white text-gray-900 shadow-sm p-5">
          <div class="flex items-center gap-2 mb-4">
            <i class="fas fa-chart-simple text-brand-600"></i>
            <h4 class="font-semibold">최적화 요약</h4>
          </div>
          <div class="flex items-center gap-4 mb-4">
            <div id="optimize-score" class="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-2xl font-black text-brand-700">0</div>
            <div>
              <div class="text-sm text-gray-500">반복 점수</div>
              <div id="optimize-status" class="font-semibold text-gray-900">대기 중</div>
            </div>
          </div>
          <div id="optimize-issues" class="space-y-2 text-sm text-gray-700"></div>
        </div>

        <div class="rounded-3xl border border-gray-200 bg-white text-gray-900 shadow-sm p-5">
          <div class="flex items-center gap-2 mb-4">
            <i class="fas fa-clipboard-check text-brand-600"></i>
            <h4 class="font-semibold">프롬프트 체크리스트</h4>
          </div>
          <ul class="space-y-2 text-sm text-gray-600 leading-relaxed">
            <li>작업보다 먼저 문제를 정의하세요.</li>
            <li>입력 데이터와 지시문을 분리하세요.</li>
            <li>형식과 길이 제약을 넣으세요.</li>
            <li>기대하는 출력 구조를 보여주세요.</li>
            <li>불안정한 작업이면 예시를 하나 넣으세요.</li>
          </ul>
        </div>

        <div class="rounded-3xl border border-gray-200 bg-white text-gray-900 shadow-sm p-5">
          <div class="flex items-center gap-2 mb-4">
            <i class="fas fa-link text-brand-600"></i>
            <h4 class="font-semibold">반복 기록</h4>
          </div>
          <div id="optimize-history" class="space-y-3"></div>
        </div>
      </div>
    </div>
  `;
  firstBuilderSection.parentElement.insertBefore(optimizePanel, document.getElementById('result-section'));

  renderOptimizeHistory();
}

function setActiveModeTab(mode) {
  document.querySelectorAll('.mode-btn').forEach((btn) => {
    btn.classList.remove('active', 'bg-brand-600', 'text-white');
    btn.classList.add('text-gray-700', 'hover:bg-gray-50');
  });
  const active = document.getElementById(`tab-${mode}`);
  if (active) {
    active.classList.add('active', 'bg-brand-600', 'text-white');
    active.classList.remove('text-gray-700', 'hover:bg-gray-50');
  }
}

function toggleSections(mode) {
  const builderIds = ['step-purpose', 'recommendation-section', 'step-technique', 'step-fields', 'result-section'];
  const templatePanel = document.getElementById('template-workspace');
  const builderHelperPanel = document.getElementById('builder-helper-panel');
  const optimizePanel = document.getElementById('optimize-workspace');
  const showBuilder = mode === 'builder';
  const showTemplate = mode === 'template';
  const showOptimize = mode === 'optimize';

  builderIds.forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (id === 'result-section') {
      if (!showBuilder) el.classList.add('hidden');
      return;
    }
    el.classList.toggle('hidden', !showBuilder);
  });
  if (builderHelperPanel) builderHelperPanel.classList.toggle('hidden', !showBuilder);
  if (templatePanel) templatePanel.classList.toggle('hidden', !showTemplate);
  if (optimizePanel) optimizePanel.classList.toggle('hidden', !showOptimize);
}

function switchMode(mode) {
  const nextMode = mode || 'builder';
  if (typeof state !== 'undefined') state.mode = nextMode;
  localStorage.setItem('pf_mode', nextMode);
  if (nextMode === 'optimize' && !document.getElementById('optimize-workspace')) {
    injectOptimizeUI();
  }
  setActiveModeTab(nextMode);
  toggleSections(nextMode);

  if (nextMode === 'template') {
    const keywordInput = document.getElementById('keyword-input');
    if (keywordInput) keywordInput.value = '신제품 런칭 브리프';
  }
}

function initializeMode(mode) {
  injectOptimizeUI();
  switchMode(mode || localStorage.getItem('pf_mode') || 'builder');
  if (typeof localizeWorkspaceCopy === 'function') {
    localizeWorkspaceCopy();
  }
}

function getOptimizeDraft() {
  return getOptimizeSession();
}

async function runOptimize() {
  const prompt = getOptimizeEl('optimize-prompt')?.value.trim() || '';
  const output = getOptimizeEl('optimize-output')?.value.trim() || '';
  const goal = getOptimizeEl('optimize-goal')?.value.trim() || '';
  const btn = getOptimizeEl('optimize-run-btn');
  if (!btn || !prompt || !output) {
    setOptimizeText('optimize-status', '프롬프트와 결과를 먼저 입력하세요.');
    return;
  }

  setOptimizeText('optimize-status', '실행 중...');
  btn.disabled = true;
  btn.textContent = '최적화 중...';

  try {
    const res = await fetch('/api/optimize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, output, goal, language: state?.promptLanguage || 'ko' }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);

    const session = {
      prompt,
      output,
      goal,
      result: data,
      language: state?.promptLanguage || 'ko',
      createdAt: new Date().toISOString(),
    };
    setOptimizeSession(session);
    renderOptimizeResult(data);
    if (typeof recordActivity === 'function') {
      recordActivity('OPTIMIZE_RUN', {
        score: data.score,
        issues: data.issues || [],
      });
    }
  } catch (error) {
    setOptimizeText('optimize-status', error.message || '최적화 실행에 실패했습니다.');
  } finally {
    btn.disabled = false;
    btn.textContent = '최적화 실행';
  }
}

function renderOptimizeResult(data) {
  setOptimizeText('optimize-score', data.score ?? 0);
  setOptimizeText('optimize-status', data.issues?.length ? '개선 필요' : '반복 가능');
  setOptimizeText('optimize-improved-prompt', data.improvedPrompt || '');
  const issues = data.issues || [];
  const improvements = data.improvements || [];
  const issueHtml = `
    <div class="rounded-2xl bg-gray-50 p-3">
      <div class="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-2">문제점</div>
      <div class="space-y-1">
        ${issues.length ? issues.map((issue) => `<div class="flex items-start gap-2 text-sm text-gray-700"><i class="fas fa-circle-xmark mt-0.5 text-red-500"></i><span>${escapeHtml(issue)}</span></div>`).join('') : '<div class="text-sm text-gray-500">감지된 문제점이 없습니다.</div>'}
      </div>
    </div>
    <div class="rounded-2xl bg-gray-50 p-3">
      <div class="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-2">개선안</div>
      <div class="space-y-1">
        ${improvements.length ? improvements.map((item) => `<div class="flex items-start gap-2 text-sm text-gray-700"><i class="fas fa-arrow-right mt-0.5 text-brand-600"></i><span>${escapeHtml(item)}</span></div>`).join('') : '<div class="text-sm text-gray-500">아직 개선안이 없습니다.</div>'}
      </div>
    </div>
    <div class="rounded-2xl bg-brand-50 p-3">
      <div class="text-[10px] uppercase tracking-[0.2em] text-brand-600 mb-2">다음 실행</div>
      <div class="text-sm text-brand-900">${escapeHtml(data.nextAction || '수정한 프롬프트로 다시 실행해 보세요.')}</div>
    </div>
  `;
  const issueContainer = getOptimizeEl('optimize-issues');
  if (issueContainer) issueContainer.innerHTML = issueHtml;

  const session = getOptimizeSession();
  if (session?.prompt) {
    renderOptimizeCurrentDiff(session, data);
  }
}

function saveOptimizeVersion() {
  const session = getOptimizeSession();
  if (!session.prompt || !session.result) return;
  const history = getOptimizeHistory();
  const entry = {
    id: Date.now(),
    version: history.length + 1,
    prompt: session.result.improvedPrompt || session.prompt,
    basePrompt: session.prompt || '',
    improvedPrompt: session.result.improvedPrompt || session.prompt || '',
    goal: session.goal || '',
    output: session.output || '',
    language: session.language || 'ko',
    issues: session.result.issues || [],
    improvements: session.result.improvements || [],
    score: session.result.score ?? 0,
    createdAt: new Date().toLocaleString('ko-KR'),
  };
  history.unshift(entry);
  saveOptimizeHistory(history);
  renderOptimizeHistory();
  setCurrentCompareId(entry.id);
  renderOptimizeDiff(entry);
}

function renderOptimizeHistory() {
  const container = getOptimizeEl('optimize-history');
  if (!container) return;
  const history = getOptimizeHistory();
  if (!history.length) {
    container.innerHTML = '<div class="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-sm text-gray-500">아직 저장된 버전이 없습니다.</div>';
    return;
  }
  container.innerHTML = history.slice(0, 5).map((item) => `
    <div class="w-full text-left rounded-2xl border border-gray-200 bg-gray-50 p-4 transition hover:border-brand-300 hover:bg-white">
      <div class="flex items-center justify-between mb-2">
        <div class="font-semibold text-gray-900">v${item.version}</div>
        <div class="text-xs text-gray-500">${item.score}%</div>
      </div>
      <div class="text-xs text-gray-500 mb-2">${escapeHtml(item.createdAt || '')}</div>
      <div class="text-sm text-gray-700 line-clamp-2">${escapeHtml(item.prompt || '')}</div>
      <div class="mt-4 flex flex-wrap gap-2">
        <button onclick="loadOptimizeVersion(${item.id})" class="rounded-xl bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-500">불러오기</button>
        <button onclick="compareOptimizeVersion(${item.id})" class="rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-white">비교</button>
        <button onclick="rollbackOptimizeVersion(${item.id})" class="rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-white">되돌리기</button>
      </div>
    </div>
  `).join('');
}

function renderOptimizeDiff(entry) {
  const diffContainer = getOptimizeEl('optimize-diff');
  if (!diffContainer || !entry) return;
  const current = getOptimizeSession();
  const beforeText = entry.basePrompt || entry.prompt || '';
  const afterText = current?.result?.improvedPrompt || current?.prompt || entry.improvedPrompt || entry.prompt || '';
  diffContainer.innerHTML = `
    <div class="rounded-2xl bg-gray-50 p-4">
      <div class="flex items-center justify-between mb-3">
        <div class="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">선택한 버전</div>
        <div class="text-xs text-gray-500">v${entry.version}</div>
      </div>
      <div class="text-sm text-gray-700">${escapeHtml(entry.goal || '저장된 목표가 없습니다.')}</div>
    </div>
    <div class="rounded-2xl border border-gray-200 overflow-hidden">
      <div class="grid grid-cols-2 text-[10px] uppercase tracking-[0.2em] text-gray-500 bg-gray-50 border-b border-gray-200">
        <div class="px-3 py-2">이전</div>
        <div class="px-3 py-2">이후</div>
      </div>
      <div class="p-3 space-y-2 max-h-[360px] overflow-auto">
        ${buildInlineDiff(beforeText, afterText) || '<div class="text-sm text-gray-500">비교 가능한 차이가 없습니다.</div>'}
      </div>
    </div>
  `;
}

function renderOptimizeCurrentDiff(session, data) {
  const diffContainer = getOptimizeEl('optimize-diff');
  if (!diffContainer) return;
  const beforeText = session.prompt || '';
  const afterText = data?.improvedPrompt || '';
  diffContainer.innerHTML = `
    <div class="rounded-2xl bg-gray-50 p-4">
      <div class="flex items-center justify-between mb-3">
        <div class="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">현재 세션</div>
        <div class="text-xs text-gray-500">실시간 미리보기</div>
      </div>
      <div class="text-sm text-gray-700">${escapeHtml(session.goal || '저장된 목표가 없습니다.')}</div>
    </div>
    <div class="rounded-2xl border border-gray-200 overflow-hidden">
      <div class="grid grid-cols-2 text-[10px] uppercase tracking-[0.2em] text-gray-500 bg-gray-50 border-b border-gray-200">
        <div class="px-3 py-2">이전</div>
        <div class="px-3 py-2">이후</div>
      </div>
      <div class="p-3 space-y-2 max-h-[360px] overflow-auto">
        ${buildInlineDiff(beforeText, afterText) || '<div class="text-sm text-gray-500">비교 가능한 차이가 없습니다.</div>'}
      </div>
    </div>
  `;
}

function clearOptimizeCompare() {
  localStorage.removeItem(OPTIMIZE_COMPARE_KEY);
  const diffContainer = getOptimizeEl('optimize-diff');
  if (!diffContainer) return;
  diffContainer.innerHTML = '<div class="rounded-2xl bg-gray-50 px-4 py-5 text-sm text-gray-500">비교할 버전을 선택하세요.</div>';
}

function loadOptimizeVersion(id) {
  const entry = getOptimizeHistory().find((item) => item.id === id);
  if (!entry) return;
  setOptimizeValue('optimize-prompt', entry.basePrompt || entry.prompt || '');
  setOptimizeValue('optimize-goal', entry.goal || '');
  setOptimizeValue('optimize-output', entry.output || '');
  setOptimizeText('optimize-improved-prompt', entry.improvedPrompt || entry.prompt || '');
  setOptimizeText('optimize-score', entry.score ?? 0);
  setOptimizeText('optimize-status', '기록에서 불러옴');
  setCurrentCompareId(id);
  renderOptimizeDiff(entry);
}

function compareOptimizeVersion(id) {
  const entry = getOptimizeHistory().find((item) => item.id === id);
  if (!entry) return;
  setCurrentCompareId(id);
  renderOptimizeDiff(entry);
}

function rollbackOptimizePrompt() {
  const session = getOptimizeSession();
  if (!session?.prompt) return;
  setOptimizeValue('optimize-prompt', session.prompt || '');
  setOptimizeValue('optimize-output', session.output || '');
  setOptimizeValue('optimize-goal', session.goal || '');
  setOptimizeText('optimize-status', '현재 세션으로 되돌림');
}

function rollbackOptimizeVersion(id) {
  const entry = getOptimizeHistory().find((item) => item.id === id);
  if (!entry) return;
  setOptimizeValue('optimize-prompt', entry.basePrompt || entry.prompt || '');
  setOptimizeValue('optimize-output', entry.output || '');
  setOptimizeValue('optimize-goal', entry.goal || '');
  setOptimizeText('optimize-improved-prompt', entry.improvedPrompt || entry.prompt || '');
  setOptimizeText('optimize-score', entry.score ?? 0);
  setOptimizeText('optimize-status', '선택한 버전으로 되돌림');

  const session = {
    prompt: entry.basePrompt || entry.prompt || '',
    output: entry.output || '',
    goal: entry.goal || '',
    language: entry.language || 'ko',
    result: {
      score: entry.score ?? 0,
      issues: entry.issues || [],
      improvements: entry.improvements || [],
      improvedPrompt: entry.improvedPrompt || entry.prompt || '',
      nextAction: '되돌린 뒤에는 다시 최적화해 보세요.',
    },
    createdAt: new Date().toISOString(),
  };
  setOptimizeSession(session);
  setCurrentCompareId(id);
  renderOptimizeDiff(entry);
}

async function loadBuilderStarter(index) {
  const item = BUILDER_STARTERS[index];
  if (!item) return;
  switchMode('builder');

  if (typeof selectPurpose === 'function') {
    selectPurpose(item.purpose);
  } else {
    state.purpose = item.purpose;
    const keywordSection = document.getElementById('keyword-section');
    if (keywordSection) keywordSection.classList.remove('hidden');
  }

  const keywordInput = document.getElementById('keyword-input');
  if (keywordInput) keywordInput.value = item.keyword;

  if (typeof selectTechniqueManual === 'function') {
    await selectTechniqueManual(item.technique);
  }

  if (typeof state !== 'undefined') {
    state.keyword = item.keyword;
    state.techniqueId = item.technique;
  }

  const firstField = document.querySelector('.field-input');
  if (firstField) firstField.focus();
}

function loadOptimizeExample(index) {
  const item = OPTIMIZE_EXAMPLES[index];
  if (!item) return;
  switchMode('optimize');
  setOptimizeValue('optimize-prompt', item.prompt);
  setOptimizeValue('optimize-output', item.output);
  setOptimizeValue('optimize-goal', item.goal);
  setOptimizeText('optimize-status', '예시를 불러왔습니다');
}

function copyOptimizeExample(index) {
  const item = OPTIMIZE_EXAMPLES[index];
  if (!item) return;
  const text = [
    '프롬프트:',
    item.prompt,
    '',
    '결과:',
    item.output,
    '',
    '목표:',
    item.goal,
  ].join('\n');
  navigator.clipboard.writeText(text);
}

function copyOptimizePrompt() {
  const text = document.getElementById('optimize-improved-prompt')?.textContent?.trim() || '';
  if (!text) return;
  navigator.clipboard.writeText(text);
}

function polishHomepageCopy() {
  const hero = document.querySelector('main > section.text-center');
  if (!hero) return;
  const badge = hero.querySelector('div.inline-flex');
  const title = hero.querySelector('h2');
  const description = hero.querySelector('p');

  if (badge) badge.innerHTML = '<i class="fas fa-wand-magic-sparkles"></i> 프롬프트를 몰라도 AI를 잘 쓰게 만드는 플랫폼';
  if (title) title.innerHTML = '업무 템플릿으로 쉽게 시작하고, <br /><span class="bg-gradient-to-r from-brand-400 to-purple-400 bg-clip-text text-transparent">빌더로 직접 설계하고 최적화로 품질을 높이세요</span>';
  if (description) description.innerHTML = '복잡한 프롬프트를 외울 필요 없이 시작할 수 있고, <br class="hidden sm:inline" />빌더로 직접 설계한 뒤 최적화 루프로 품질을 계속 높일 수 있습니다.';
}

function localizeWorkspaceCopy() {
  const mapping = [
    ['button[onclick*="loadBuilderStarter"]', '적용'],
    ['button[onclick*="loadOptimizeExample"]', '불러오기'],
    ['button[onclick*="copyOptimizeExample"]', '복사'],
    ['button[onclick*="copyOptimizePrompt"]', '복사'],
    ['button[onclick*="rollbackOptimizePrompt"]', '되돌리기'],
    ['button[onclick*="clearOptimizeCompare"]', '초기화'],
    ['button[onclick*="loadOptimizeVersion"]', '불러오기'],
    ['button[onclick*="compareOptimizeVersion"]', '비교'],
    ['button[onclick*="rollbackOptimizeVersion"]', '되돌리기'],
  ];

  mapping.forEach(([selector, label]) => {
    document.querySelectorAll(selector).forEach((button) => {
      button.textContent = label;
    });
  });

  const runBtn = document.getElementById('optimize-run-btn');
  if (runBtn) runBtn.textContent = '최적화 실행';

  const labels = document.querySelectorAll('#optimize-workspace label, #builder-helper-panel h4, #optimize-workspace h4');
  labels.forEach((el) => {
    const text = el.textContent || '';
    if (text.includes('Prompt')) el.textContent = '프롬프트';
    if (text.includes('Output')) el.textContent = '결과';
    if (text.includes('Goal')) el.textContent = '목표';
  });
}

window.switchMode = switchMode;
window.initializeMode = initializeMode;
window.runOptimize = runOptimize;
window.saveOptimizeVersion = saveOptimizeVersion;
window.copyOptimizePrompt = copyOptimizePrompt;
window.loadOptimizeVersion = loadOptimizeVersion;
window.compareOptimizeVersion = compareOptimizeVersion;
window.rollbackOptimizeVersion = rollbackOptimizeVersion;
window.clearOptimizeCompare = clearOptimizeCompare;
window.rollbackOptimizePrompt = rollbackOptimizePrompt;
window.loadBuilderStarter = loadBuilderStarter;
window.loadOptimizeExample = loadOptimizeExample;
window.copyOptimizeExample = copyOptimizeExample;
window.polishHomepageCopy = polishHomepageCopy;
window.localizeWorkspaceCopy = localizeWorkspaceCopy;
