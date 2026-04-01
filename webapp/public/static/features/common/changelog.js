// ?낅뜲?댄듃 濡쒓렇
//
// ??諛고룷留덈떎 CHANGELOG_ITEMS 留??꾩뿉 ??ぉ??異붽??⑸땲??
// tag: 'new' | 'improve' | 'fix' | 'refactor'

const CHANGELOG_ITEMS = [
  {
    date: '2026-04-01',
    version: 'v4.8',
    items: [
      { tag: 'improve', text: '히스토리 카드에서 이전 버전을 탭으로 전환하도록 바꿨습니다.' },
      { tag: 'improve', text: '선택된 버전을 기준으로 불러오기와 복사가 동작하도록 정리했습니다.' },
      { tag: 'improve', text: '세로 스크롤 대신 카드 내부 전환으로 이전 버전을 더 빠르게 확인할 수 있게 했습니다.' },
    ],
  },  {
    date: '2026-04-01',
    version: 'v4.7',
    items: [
      { tag: 'improve', text: '프롬프트 생성 레이어를 System, Template, User Input으로 분리했습니다.' },
      { tag: 'improve', text: '복잡도에 따라 간단 템플릿과 확장 템플릿을 나누어 토큰 사용량을 줄였습니다.' },
      { tag: 'improve', text: '최종 검증을 복잡도에 맞게 축약형과 확장형으로 나누어 출력 비용을 줄였습니다.' },
    ],
  },  {
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
      { tag: 'refactor', text: 'src/app??bootstrap, routing, rendering?쇰줈 遺꾨━?덉뒿?덈떎.' },
      { tag: 'refactor', text: 'tests瑜?features/prompt 湲곗??쇰줈 ?대뜑?뷀뻽?듬땲??' },
      { tag: 'improve', text: 'prompt quality???쒓뎅???곸뼱 濡쒖뺄?쇱씠吏?臾몄옄?댁쓣 ?ㅼ떆 ?뺣━?덉뒿?덈떎.' },
    ],
  },
  {
    date: '2026-04-01',
    version: 'v4.3',
    items: [
      { tag: 'fix', text: '?쒖옉 ?붾㈃??以묐났 ?뚮뜑留?濡쒓렇瑜??뺣━?덉뒿?덈떎.' },
      { tag: 'fix', text: '?앹꽦 ?꾨＼?꾪듃 寃利?釉붾줉???ㅽ뻾 濡쒓렇瑜??ㅼ떆 蹂댁씠?꾨줉 ?섏젙?덉뒿?덈떎.' },
      { tag: 'improve', text: '?앹꽦 ?꾨즺 ???꾩껜 移댁슫?곌? ???덉젙?곸쑝濡?媛깆떊?섎룄濡?媛쒖꽑?덉뒿?덈떎.' },
    ],
  },
  {
    date: '2026-04-01',
    version: 'v4.2',
    items: [
      { tag: 'improve', text: '硫붿씤 ?붾㈃ ?꾪솚 ?좊땲硫붿씠?섍낵 ?꾩껜 ?앹꽦 ?먮쫫???뺣━?덉뒿?덈떎.' },
      { tag: 'improve', text: '硫붿씤 ?곹깭 諛붿? ?꾩옱 ?꾩튂 ?덈궡瑜??ъ슜?먯뿉寃?????蹂댁씠寃??ㅻ벉?덉뒿?덈떎.' },
      { tag: 'improve', text: '怨듯넻 ?곸뿭 API瑜?異붽????붾㈃蹂?湲곕뒫??硫붿씤?먯꽌 諛붾줈 遺덈윭?????덇쾶 ?덉뒿?덈떎.' },
    ],
  },
  {
    date: '2026-04-01',
    version: 'v4.1',
    items: [
      { tag: 'new', text: '?꾨＼?꾪듃 ?앹꽦 寃곌낵瑜?3媛?蹂?뺤쑝濡?蹂댁뿬二쇨퀬 諛붾줈 ?좏깮?????덇쾶 ?덉뒿?덈떎.' },
      { tag: 'new', text: '寃곌낵 ?붾㈃??Optimize 踰꾪듉??異붽????앹꽦 寃곌낵瑜?媛쒖꽑 紐⑤뱶濡?諛붾줈 蹂대궪 ???덇쾶 ?덉뒿?덈떎.' },
      { tag: 'improve', text: '愿由ъ옄 ??쒕낫?쒖? CSV ?대낫?닿린 援ъ“瑜??뺣━?덉뒿?덈떎.' },
    ],
  },
]

const CHANGELOG_TAG_META = {
  new: { label: '??湲곕뒫', cls: 'bg-blue-500/20 text-blue-400', icon: 'fa-plus' },
  improve: { label: '媛쒖꽑', cls: 'bg-green-500/20 text-green-400', icon: 'fa-arrow-up' },
  fix: { label: '踰꾧렇 ?섏젙', cls: 'bg-red-500/20 text-red-400', icon: 'fa-wrench' },
  refactor: { label: '由ы뙥?곕쭅', cls: 'bg-gray-500/20 text-gray-300', icon: 'fa-code' },
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
                <span class="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">${meta.label}</span>
                <span class="text-[10px] text-slate-500">${group.version} 쨌 ${group.date}</span>
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
            <div class="text-[10px] uppercase tracking-[0.2em] text-slate-500">?낅뜲?댄듃 濡쒓렇</div>
            <h3 class="mt-1 text-xl font-bold text-slate-900">理쒓렐 蹂寃??ы빆</h3>
            <p class="mt-2 text-sm leading-6 text-slate-600">踰꾩쟾蹂꾨줈 湲곕뒫 異붽?, 援ъ“ 蹂寃? ?섏젙 ?ы빆???뺤씤?????덉뒿?덈떎.</p>
          </div>
          <button onclick="markUpdatesSeen()" class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100">
            理쒖떊?쇰줈 ?쒖떆
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



