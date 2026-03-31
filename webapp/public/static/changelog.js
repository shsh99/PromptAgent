// ===== changelog.js — 업데이트 로그 =====
//
// 새 버전 배포 시 CHANGELOG_ITEMS 맨 앞에 항목 추가
// tag: 'new' | 'improve' | 'fix' | 'refactor'
// ──────────────────────────────────────────

const CHANGELOG_ITEMS = [
  {
    date: '26.03.31',
    version: 'v2.5',
    items: [
      { tag: 'fix',      text: '최적화 모드 실행 안정성을 높이고 빈 입력 안내를 추가.' },
      { tag: 'improve',  text: '한국어 기본 출력을 강화하고 영어는 선택했을 때만 나오도록 정리.' },
      { tag: 'improve',  text: '라이트 모드 색감과 그림자 톤을 더 부드럽게 조정.' },
      { tag: 'refactor', text: '첫 화면의 중복 안내를 줄여 진입 동선을 더 단순하게 정리.' },
    ],
  },
  {
    date: '26.03.31',
    version: 'v2.4',
    items: [
      { tag: 'new',      text: '한국어 기본 UI와 라이트/다크 테마 전환을 추가.' },
      { tag: 'new',      text: '프로젝트 설계용과 진행 중 질문용 시작 템플릿을 분리.' },
      { tag: 'improve',  text: '예시, 도움말, 최적화 화면을 더 단순하고 읽기 쉽게 정리.' },
      { tag: 'fix',      text: '라이트 모드 색상과 그림자 톤을 더 자연스럽게 조정.' },
    ],
  },
  {
    date: '26.03.30',
    version: 'v2.3',
    items: [
      { tag: 'new',      text: '관리자 전용 로그 조회 기능 추가.' },
      { tag: 'improve',  text: '최근 업데이트 화면을 더 짧고 읽기 쉽게 정리.' },
      { tag: 'fix',      text: '화면 문구와 표시 위치를 수정.' },
    ],
  },
  {
    date: '26.03.30',
    version: 'v2.2',
    items: [
      { tag: 'new',     text: '기록 확인 및 관리 기능 추가.' },
      { tag: 'improve', text: '사용 흐름을 더 단순하게 정리.' },
      { tag: 'fix',     text: '표시 오류를 수정.' },
    ],
  },
  {
    date: '26.03.28',
    version: 'v2.1',
    items: [
      { tag: 'new',     text: '프롬프트 저장 및 재사용 기능 추가.' },
      { tag: 'new',     text: '프롬프트 개선 기능 추가.' },
      { tag: 'improve', text: '입력 옵션을 더 세밀하게 조정 가능.' },
    ],
  },
  {
    date: '26.03.20',
    version: 'v2.0',
    items: [
      { tag: 'new',     text: '컨텍스트 문서 생성 기능 추가.' },
      { tag: 'new',     text: '단계별 프롬프트 생성 기능 추가.' },
      { tag: 'new',     text: 'context.md 다운로드 기능 추가.' },
      { tag: 'improve', text: '생성 결과 활용성과 다운로드 경험 개선.' },
    ],
  },
  {
    date: '26.03.10',
    version: 'v1.5',
    items: [
      { tag: 'new',     text: '목적별 기법 자동 추천 기능 추가.' },
      { tag: 'new',     text: '입력 필드 자동 채우기 기능 추가.' },
      { tag: 'improve', text: '품질 점검 항목을 보강.' },
    ],
  },
  {
    date: '26.03.01',
    version: 'v1.0',
    items: [
      { tag: 'new', text: 'PromptBuilder 초기 버전 출시.' },
      { tag: 'new', text: '프롬프트 생성 기록 저장 기능 추가.' },
      { tag: 'new', text: '프롬프트 복사 및 다운로드 기능 추가.' },
    ],
  },
];

const CHANGELOG_TAG_META = {
  new:      { label: '새 기능',   cls: 'bg-blue-500/20 text-blue-400',   icon: 'fa-plus' },
  improve:  { label: '개선',      cls: 'bg-green-500/20 text-green-400', icon: 'fa-arrow-up' },
  fix:      { label: '버그 수정', cls: 'bg-red-500/20 text-red-400',     icon: 'fa-wrench' },
  refactor: { label: '리팩토링',  cls: 'bg-gray-500/20 text-gray-400',   icon: 'fa-code' },
};

// ── 읽음 처리 ──────────────────────────────────────────────────────
function getLastSeenVersion() {
  return localStorage.getItem('pb_last_seen_version') || '';
}

function markUpdatesRead() {
  if (CHANGELOG_ITEMS.length > 0) {
    localStorage.setItem('pb_last_seen_version', CHANGELOG_ITEMS[0].version);
  }
  const badge = document.getElementById('updates-new-badge');
  if (badge) badge.remove();
}

function hasUnreadUpdates() {
  const seen = getLastSeenVersion();
  if (!seen) return true;
  return CHANGELOG_ITEMS.length > 0 && CHANGELOG_ITEMS[0].version !== seen;
}

function renderUpdatesBadge() {
  const btn = document.querySelector('button[onclick="showUpdates()"]');
  if (!btn || document.getElementById('updates-new-badge')) return;
  if (hasUnreadUpdates()) {
    const badge = document.createElement('span');
    badge.id = 'updates-new-badge';
    badge.className = 'absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-500 text-[9px] font-bold text-white';
    badge.textContent = 'N';
    btn.style.position = 'relative';
    btn.appendChild(badge);
  }
}

// ── 모달 ───────────────────────────────────────────────────────────
function showUpdates() {
  document.getElementById('updates-modal').classList.remove('hidden');
  markUpdatesRead();

  const content = document.getElementById('updates-content');
  content.innerHTML = CHANGELOG_ITEMS.map((item, index) => {
    const isLatest = index === 0;
    const itemsHtml = item.items.map(entry => {
      const meta = CHANGELOG_TAG_META[entry.tag] || CHANGELOG_TAG_META.new;
      return `
        <div class="flex items-start gap-3 rounded-xl border border-gray-800 bg-gray-900/60 px-4 py-3">
          <span class="mt-0.5 flex-shrink-0 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${meta.cls}">
            <i class="fas ${meta.icon} text-[9px]"></i>${meta.label}
          </span>
          <span class="text-sm leading-relaxed text-gray-300">${escapeHtml(entry.text)}</span>
        </div>`;
    }).join('');

    return `
      <div class="${index ? 'mt-6 border-t border-gray-800/60 pt-6' : ''}">
        <div class="mb-3 flex items-center gap-3">
          <span class="inline-flex h-9 w-9 items-center justify-center rounded-full ${isLatest ? 'bg-brand-500/20 text-brand-400' : 'bg-gray-800 text-gray-500'}">
            <i class="fas ${isLatest ? 'fa-rocket' : 'fa-clock-rotate-left'} text-sm"></i>
          </span>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <span class="text-sm font-bold text-white">${escapeHtml(item.version || '')}</span>
              ${isLatest ? '<span class="inline-flex items-center gap-1 rounded-full bg-brand-500/20 px-2 py-0.5 text-[10px] font-bold text-brand-400"><i class="fas fa-bolt text-[8px]"></i>최신</span>' : ''}
            </div>
            <div class="text-[11px] text-gray-500">${escapeHtml(item.date)}</div>
          </div>
        </div>
        <div class="space-y-2 pl-12">${itemsHtml}</div>
      </div>`;
  }).join('');
}

function closeUpdates() {
  document.getElementById('updates-modal').classList.add('hidden');
}
