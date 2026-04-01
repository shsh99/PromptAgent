// 업데이트 로그
//
// 최근 변경 사항을 화면에 보여주는 모듈입니다.
// tag: 'new' | 'improve' | 'fix' | 'refactor'

const CHANGELOG_ITEMS = [
  {
    date: '2026-04-02',
    version: 'v4.11',
    items: [
      { tag: 'new', text: '검색엔진 인덱싱을 위해 robots.txt, sitemap.xml, 홈 메타 태그를 추가했습니다.' },
      { tag: 'improve', text: '공개 페이지가 검색 결과에 더 잘 노출되도록 정규 URL과 설명 메타를 정리했습니다.' },
      { tag: 'improve', text: '문서 최신화 흐름에 검색 노출 준비 항목도 함께 반영했습니다.' },
    ],
  },
  {
    date: '2026-04-01',
    version: 'v4.10',
    items: [
      { tag: 'improve', text: '관리자 대시보드를 프로젝트명에 맞춰 다시 정리하고, 사이드바 탭 전환 방식으로 바꿨습니다.' },
      { tag: 'improve', text: '라이트 모드와 다크 모드의 표면, 버튼, 배지 토큰을 분리해 가시성을 개선했습니다.' },
      { tag: 'improve', text: '히스토리와 관리자 화면의 정보를 아래로 길게 읽지 않도록 섹션 전환 구조로 압축했습니다.' },
    ],
  },
  {
    date: '2026-04-01',
    version: 'v4.9',
    items: [
      { tag: 'improve', text: '히스토리 화면을 선택 목록과 상세 패널로 나눠서 세로 스크롤 부담을 줄였습니다.' },
      { tag: 'improve', text: '선택한 기록의 버전과 미리보기를 오른쪽 패널에서 바로 확인할 수 있게 했습니다.' },
      { tag: 'improve', text: '히스토리 불러오기와 복사가 선택된 기록 기준으로 동작하도록 정리했습니다.' },
    ],
  },
  {
    date: '2026-04-01',
    version: 'v4.8',
    items: [
      { tag: 'improve', text: '히스토리 카드에서 이전 버전을 탭으로 전환할 수 있게 했습니다.' },
      { tag: 'improve', text: '선택한 버전을 기준으로 불러오기와 복사가 동작하도록 정리했습니다.' },
      { tag: 'improve', text: '세로 스크롤 대신 카드 내부 전환으로 이전 기록을 더 빠르게 확인할 수 있게 했습니다.' },
    ],
  },
  {
    date: '2026-04-01',
    version: 'v4.7',
    items: [
      { tag: 'improve', text: '프롬프트 생성 레이어를 System, Template, User Input으로 분리했습니다.' },
      { tag: 'improve', text: '복잡도에 따라 간단 템플릿과 확장 템플릿을 나누어 토큰 사용량을 줄였습니다.' },
      { tag: 'improve', text: '최종 검증도 복잡도에 맞게 축약형과 확장형으로 나누어 출력 비용을 줄였습니다.' },
    ],
  },
  {
    date: '2026-04-01',
    version: 'v4.6',
    items: [
      { tag: 'improve', text: '공통 surface 토큰을 적용해 라이트/다크 모드 홈 카드의 톤을 일관되게 맞췄습니다.' },
      { tag: 'improve', text: '작은 화면에서 카드와 버튼이 너무 빽빽해지지 않도록 반응형 밀도 규칙을 추가했습니다.' },
      { tag: 'improve', text: '템플릿 카드와 퀵 스타트 카드를 재사용 가능한 surface 클래스 기반으로 정리했습니다.' },
    ],
  },
  {
    date: '2026-04-01',
    version: 'v4.5',
    items: [
      { tag: 'improve', text: '프롬프트 품질 분석에 문제 정의, 입력 데이터, 추론 방향, 예시, 복구 경로를 추가했습니다.' },
      { tag: 'improve', text: '생성된 프롬프트에 최종 검증 블록 전에 전략 가이드 블록을 넣도록 했습니다.' },
      { tag: 'improve', text: '최근 작업 내역이 문서와 변경 로그에 함께 기록되도록 정리했습니다.' },
    ],
  },
  {
    date: '2026-04-01',
    version: 'v4.4',
    items: [
      { tag: 'refactor', text: 'src/app을 bootstrap, routing, rendering으로 분리했습니다.' },
      { tag: 'refactor', text: 'tests를 features/prompt 기준으로 다시 정리했습니다.' },
      { tag: 'improve', text: '프롬프트 품질 관련 영어 로컬라이징 문자열을 다시 정리했습니다.' },
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
      { tag: 'improve', text: '메인 화면 전환 애니메이션과 전체 생성 흐름을 정리했습니다.' },
      { tag: 'improve', text: '메인 상태 바와 현재 위치 안내를 사용자에게 더 잘 보이도록 조정했습니다.' },
      { tag: 'improve', text: '공통 영역 API를 추가해 화면별 기능을 메인에서 바로 불러올 수 있게 했습니다.' },
    ],
  },
  {
    date: '2026-04-01',
    version: 'v4.1',
    items: [
      { tag: 'new', text: '프롬프트 생성 결과를 3개 변형으로 보여주고 바로 선택할 수 있게 했습니다.' },
      { tag: 'new', text: '결과 화면에 Optimize 버튼을 넣어 생성 결과를 곧바로 개선 모드로 보낼 수 있게 했습니다.' },
      { tag: 'improve', text: '관리자 대시보드에 CSV 내보내기 구조를 정리했습니다.' },
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
            <p class="mt-2 text-sm leading-6 text-slate-600">버전별 기능 추가, 구조 변경, 수정 사항을 확인할 수 있습니다.</p>
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
  if (modal) modal.classList.add('hidden')
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
