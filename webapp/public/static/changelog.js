// ===== changelog.js — 업데이트 로그 =====
//
// 새 버전 배포 시 CHANGELOG_ITEMS 맨 앞에 항목 추가
// tag: 'new' | 'improve' | 'fix' | 'refactor'
// ──────────────────────────────────────────

const CHANGELOG_ITEMS = [
  {
    date: '26.03.30',
    version: 'v2.3',
    items: [
      { tag: 'refactor', text: '파일이 길어져 기능별로 모듈 분리를 적용했습니다 (changelog / library / history / improve / prompt / technique / guide).' },
      { tag: 'improve',  text: '커밋·푸시 이후 Cloudflare Pages 자동 배포 흐름을 정립했습니다.' },
    ],
  },
  {
    date: '26.03.30',
    version: 'v2.2',
    items: [
      { tag: 'fix',     text: '업데이트 로그가 다른 서비스 내용으로 표시되던 오류를 수정했습니다.' },
      { tag: 'improve', text: '업데이트 모달에 버전 태그·카테고리 뱃지·NEW 표시를 추가했습니다.' },
      { tag: 'improve', text: '읽지 않은 업데이트가 있을 경우 버튼에 NEW 뱃지를 표시합니다.' },
    ],
  },
  {
    date: '26.03.28',
    version: 'v2.1',
    items: [
      { tag: 'new',     text: '프롬프트 라이브러리 기능을 추가했습니다. 생성한 프롬프트를 즐겨찾기로 저장하고 재사용할 수 있습니다.' },
      { tag: 'new',     text: '프롬프트 개선기(Improve) 기능을 추가했습니다. 기존 프롬프트를 붙여넣어 품질을 높일 수 있습니다.' },
      { tag: 'improve', text: '하네스 엔지니어링·컨텍스트 엔지니어링 필드를 대폭 확장했습니다.' },
    ],
  },
  {
    date: '26.03.20',
    version: 'v2.0',
    items: [
      { tag: 'new',     text: '컨텍스트 엔지니어링 기법을 추가했습니다. 프로젝트 전체 맥락 문서를 자동 생성합니다.' },
      { tag: 'new',     text: '하네스 엔지니어링 기법을 추가했습니다. AI 에이전트 운용 실행 매뉴얼을 생성합니다.' },
      { tag: 'new',     text: 'context.md 파일 다운로드 기능을 추가했습니다.' },
      { tag: 'improve', text: '프롬프트 체이닝에서 단계별 개별 복사·전체 다운로드를 지원합니다.' },
    ],
  },
  {
    date: '26.03.10',
    version: 'v1.5',
    items: [
      { tag: 'new',     text: '목적별 기법 자동 추천 기능을 추가했습니다.' },
      { tag: 'new',     text: '추천 기법 선택 시 입력 필드가 자동으로 채워지는 Auto-fill 기능을 추가했습니다.' },
      { tag: 'improve', text: '품질 리포트에 등급(S~D)과 7가지 체크리스트를 추가했습니다.' },
    ],
  },
  {
    date: '26.03.01',
    version: 'v1.0',
    items: [
      { tag: 'new', text: 'PromptBuilder 최초 출시. 제로샷·퓨샷·CoT·ToT·역할·체이닝·메타 프롬프팅 등 8가지 기법을 지원합니다.' },
      { tag: 'new', text: '생성 히스토리 로컬 저장 기능을 추가했습니다.' },
      { tag: 'new', text: '프롬프트 복사·다운로드 기능을 추가했습니다.' },
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
