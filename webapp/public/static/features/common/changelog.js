// 업데이트 로그
//
// 최근 변경 사항을 모달에서 보여주는 데이터입니다.
// tag: 'new' | 'improve' | 'fix' | 'refactor'

const CHANGELOG_ITEMS = [
  {
    date: '2026-04-02',
    version: 'v4.13',
    items: [
      { tag: 'improve', text: '홈 히어로의 버튼 정렬과 설명 폭을 다시 맞췄습니다.' },
      { tag: 'improve', text: '빠른 흐름 안내를 모드 선택 패널 내부로 넣어 빈 공간을 줄였습니다.' },
      { tag: 'improve', text: 'AI 스타일 패널의 높이와 토큰을 왼쪽 컬럼과 맞췄습니다.' },
      { tag: 'fix', text: '템플릿 시작용 보조 카드 블록을 화면에서 제거했습니다.' },
    ],
  },
  {
    date: '2026-04-02',
    version: 'v4.12',
    items: [
      { tag: 'improve', text: '상단 헤더 버튼과 다크 모드 전환 버튼의 가시성을 개선했습니다.' },
      { tag: 'improve', text: '관리자 화면의 버튼과 카드가 어두운 테마에서도 읽히도록 정리했습니다.' },
      { tag: 'fix', text: '헤더가 겹쳐 보이던 문제를 줄여 첫 화면 가독성을 높였습니다.' },
    ],
  },
  {
    date: '2026-04-02',
    version: 'v4.11',
    items: [
      { tag: 'new', text: '검색 노출을 위해 robots.txt와 sitemap.xml을 추가했습니다.' },
      { tag: 'improve', text: '공개 페이지의 canonical과 description 메타를 정리했습니다.' },
      { tag: 'improve', text: '문서와 배포 산출물이 검색 봇에 읽히도록 준비했습니다.' },
    ],
  },
  {
    date: '2026-04-01',
    version: 'v4.10',
    items: [
      { tag: 'improve', text: '관리자 대시보드를 프로젝트명에 맞게 다시 정리했습니다.' },
      { tag: 'improve', text: '히스토리 화면을 탭 기반 탐색으로 다시 구성했습니다.' },
      { tag: 'improve', text: '공통 surface 토큰을 버튼과 카드에 적용했습니다.' },
    ],
  },
  {
    date: '2026-04-01',
    version: 'v4.9',
    items: [
      { tag: 'improve', text: '히스토리 카드에서 이전 버전을 탭으로 바로 볼 수 있게 했습니다.' },
      { tag: 'improve', text: '선택한 버전을 기준으로 불러오기와 복사가 동작하도록 정리했습니다.' },
      { tag: 'improve', text: '히스토리 탐색을 아래로 길게 내리지 않도록 바꿨습니다.' },
    ],
  },
  {
    date: '2026-04-01',
    version: 'v4.8',
    items: [
      { tag: 'improve', text: '히스토리 카드에서 이전 버전 이동 UX를 더 자연스럽게 만들었습니다.' },
      { tag: 'improve', text: '선택된 버전을 기준으로 미리보기와 복사 동작이 맞도록 했습니다.' },
      { tag: 'improve', text: '관리자 화면의 카드형 워크스페이스를 더 읽기 쉽게 정리했습니다.' },
    ],
  },
  {
    date: '2026-04-01',
    version: 'v4.7',
    items: [
      { tag: 'improve', text: '프롬프트 생성 레이어를 System, Template, User Input으로 분리했습니다.' },
      { tag: 'improve', text: '복잡도에 따라 간단 템플릿과 확장 템플릿을 나눴습니다.' },
      { tag: 'improve', text: '최종 검증도 구조에 맞게 더 명확하게 정리했습니다.' },
    ],
  },
  {
    date: '2026-04-01',
    version: 'v4.6',
    items: [
      { tag: 'improve', text: '공통 surface 토큰을 홈 화면 카드와 버튼에 적용했습니다.' },
      { tag: 'improve', text: '선택 카드와 보조 카드의 대비 규칙을 다시 맞췄습니다.' },
      { tag: 'improve', text: '템플릿 카드와 빠른 흐름 안내가 같은 흐름으로 보이게 했습니다.' },
    ],
  },
  {
    date: '2026-04-01',
    version: 'v4.5',
    items: [
      { tag: 'improve', text: '프롬프트 품질 분석에 문제 정의, 입력 데이터, 추론 방향, 예시, 복구 경로를 추가했습니다.' },
      { tag: 'improve', text: '생성 프롬프트에 전략적 안내 블록을 추가했습니다.' },
      { tag: 'improve', text: '최근 작업 기록을 changelog에 함께 남기도록 정리했습니다.' },
    ],
  },
  {
    date: '2026-04-01',
    version: 'v4.4',
    items: [
      { tag: 'refactor', text: 'src/app을 bootstrap, routing, rendering으로 나눴습니다.' },
      { tag: 'refactor', text: 'tests를 features/prompt 기준으로 다시 정리했습니다.' },
      { tag: 'improve', text: '프롬프트 분석 문구를 더 읽기 쉽게 고쳤습니다.' },
    ],
  },
  {
    date: '2026-04-01',
    version: 'v4.3',
    items: [
      { tag: 'fix', text: '시작 화면의 중복 헤더 로그를 정리했습니다.' },
      { tag: 'fix', text: '생성 프롬프트 검증 블록이 다시 보이도록 수정했습니다.' },
      { tag: 'improve', text: '생성 완료 후 전체 카운트를 더 안정적으로 갱신하도록 개선했습니다.' },
    ],
  },
  {
    date: '2026-04-01',
    version: 'v4.2',
    items: [
      { tag: 'improve', text: '메인 화면 전환 애니메이션과 전체 생성 문구를 정리했습니다.' },
      { tag: 'improve', text: '메인 상태 바의 현재 위치 안내를 사용자에게 더 잘 보이도록 조정했습니다.' },
      { tag: 'improve', text: '공통 영역 API를 추가해 화면에서 바로 불러올 수 있게 했습니다.' },
    ],
  },
  {
    date: '2026-04-01',
    version: 'v4.1',
    items: [
      { tag: 'new', text: '프롬프트 생성 결과를 3개 변형으로 보여주고 바로 선택할 수 있게 했습니다.' },
      { tag: 'new', text: '결과 화면에서 Optimize 버튼을 눌러 개선 모드로 바로 이동할 수 있게 했습니다.' },
      { tag: 'improve', text: '관리자 대시보드에 CSV 내보내기 구조를 추가했습니다.' },
    ],
  },
]

const CHANGELOG_TAG_META = {
  new: { label: '새 기능', cls: 'bg-blue-500/20 text-blue-300', icon: 'fa-plus' },
  improve: { label: '개선', cls: 'bg-green-500/20 text-green-300', icon: 'fa-arrow-up' },
  fix: { label: '수정', cls: 'bg-red-500/20 text-red-300', icon: 'fa-wrench' },
  refactor: { label: '리팩터', cls: 'bg-gray-500/20 text-gray-200', icon: 'fa-code' },
}

function getLastSeenVersion() {
  return localStorage.getItem('pb_last_seen_version') || ''
}

function setLastSeenVersion(version) {
  if (!version) return
  localStorage.setItem('pb_last_seen_version', version)
}

function getLatestVersion() {
  return CHANGELOG_ITEMS[0]?.version || ''
}

function getUnseenCount() {
  const lastSeen = getLastSeenVersion()
  return CHANGELOG_ITEMS.filter((item) => item.version !== lastSeen).length
}

function renderChangelogItems() {
  return CHANGELOG_ITEMS.map((group) => {
    const items = group.items
      .map((item) => {
        const meta = CHANGELOG_TAG_META[item.tag] || CHANGELOG_TAG_META.improve
        return `
          <li class="flex gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <span class="mt-0.5 inline-flex h-7 w-7 flex-none items-center justify-center rounded-full ${meta.cls}">
              <i class="fas ${meta.icon} text-[10px]"></i>
            </span>
            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-2">
                <span class="update-tag-pill rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">${meta.label}</span>
                <span class="update-version-pill text-[10px] text-slate-500">${group.version} · ${group.date}</span>
              </div>
              <p class="mt-2 text-sm leading-6 text-slate-700">${item.text}</p>
            </div>
          </li>
        `
      })
      .join('')

    return `
      <section class="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div class="mb-3 flex items-center justify-between gap-3">
          <div>
            <div class="text-[10px] uppercase tracking-[0.2em] text-slate-500">${group.date}</div>
            <h4 class="mt-1 text-sm font-semibold text-slate-900">${group.version}</h4>
          </div>
          <span class="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] text-slate-600">${group.items.length} items</span>
        </div>
        <ul class="space-y-3">${items}</ul>
      </section>
    `
  }).join('')
}

function renderUpdatesContent() {
  return `
    <div class="space-y-5">
      <div class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div class="text-[10px] uppercase tracking-[0.2em] text-slate-500">업데이트 로그</div>
            <h3 class="mt-1 text-xl font-bold text-slate-900">최근 변경 사항</h3>
            <p class="mt-2 text-sm leading-6 text-slate-600">버전별 기능 추가, 구조 변경, 수정 항목을 한눈에 확인할 수 있습니다.</p>
          </div>
          <button onclick="markUpdatesSeen()" class="updates-action-btn rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100">
            최신으로 표시
          </button>
        </div>
      </div>
      <div class="space-y-4">${renderChangelogItems()}</div>
    </div>
  `
}

function showUpdates() {
  const modal = document.getElementById('updates-modal')
  const content = document.getElementById('updates-content')
  if (!modal || !content) return
  content.innerHTML = renderUpdatesContent()
  modal.classList.remove('hidden')
  setLastSeenVersion(getLatestVersion())
  renderUpdatesBadge()
}

function closeUpdates() {
  const modal = document.getElementById('updates-modal')
  if (!modal) return
  modal.classList.add('hidden')
}

function markUpdatesSeen() {
  setLastSeenVersion(getLatestVersion())
  renderUpdatesBadge()
}

function renderUpdatesBadge() {
  return
}

window.showUpdates = showUpdates
window.closeUpdates = closeUpdates
window.renderUpdatesBadge = renderUpdatesBadge
window.markUpdatesSeen = markUpdatesSeen
