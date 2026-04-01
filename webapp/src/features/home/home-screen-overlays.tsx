/** @jsxImportSource hono/jsx */

export function HomeScreenOverlays() {
  return (
    <>
      <button
        onclick="showUpdates()"
        class="updates-fab fixed bottom-5 right-5 z-[90] flex items-center gap-2 rounded-full border border-brand-200 bg-white px-4 py-3 text-xs font-semibold text-brand-700 shadow-lg shadow-black/10 backdrop-blur-xl hover:-translate-y-0.5 hover:bg-slate-50 hover:text-brand-800"
      >
        <span class="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400"></span>
        <span data-updates-label>업데이트</span>
      </button>

      <div id="guide-modal" class="fixed inset-0 z-[100] hidden">
        <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" onclick="closeGuide()"></div>
        <div class="relative mx-auto mt-20 max-h-[80vh] max-w-3xl overflow-y-auto rounded-2xl border border-slate-200 bg-white m-4">
          <div class="sticky top-0 flex items-center justify-between rounded-t-2xl border-b border-slate-200 bg-white px-6 py-4">
            <h3 class="flex items-center gap-2 text-lg font-bold text-slate-900">
              <i class="fas fa-book-open text-brand-500"></i>가이드
            </h3>
            <button onclick="closeGuide()" class="text-slate-500 hover:text-slate-900"><i class="fas fa-xmark text-lg"></i></button>
          </div>
          <div class="space-y-6 p-6 text-sm text-slate-700" id="guide-content"></div>
        </div>
      </div>

      <div id="history-modal" class="fixed inset-0 z-[100] hidden">
        <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" onclick="closeHistory()"></div>
        <div class="relative mx-auto mt-20 max-h-[80vh] max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white m-4">
          <div class="sticky top-0 flex items-center justify-between rounded-t-2xl border-b border-slate-200 bg-white px-6 py-4">
            <h3 class="flex items-center gap-2 text-lg font-bold text-slate-900">
              <i class="fas fa-clock-rotate-left text-brand-500"></i>생성 히스토리
            </h3>
            <div class="flex items-center gap-2">
              <button onclick="clearHistory()" class="rounded px-2 py-1 text-xs text-red-600 hover:text-red-700">전체 삭제</button>
              <button onclick="closeHistory()" class="text-slate-500 hover:text-slate-900"><i class="fas fa-xmark text-lg"></i></button>
            </div>
          </div>
          <div id="history-content" class="p-6">
            <div class="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm leading-7 text-slate-500">
              아직 저장된 기록이 없습니다. 프롬프트를 생성하면 여기에 최근 기록이 쌓입니다.
            </div>
          </div>
        </div>
      </div>

      <div id="updates-modal" class="fixed inset-0 z-[100] hidden">
        <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" onclick="closeUpdates()"></div>
        <div class="relative mx-auto mt-20 max-h-[80vh] max-w-3xl overflow-y-auto rounded-2xl border border-slate-200 bg-white m-4">
          <div class="sticky top-0 flex items-center justify-between rounded-t-2xl border-b border-slate-200 bg-white px-6 py-4">
            <h3 class="flex items-center gap-2 text-lg font-bold text-slate-900">
              <i class="fas fa-bullhorn text-brand-500"></i>최근 업데이트
            </h3>
            <button onclick="closeUpdates()" class="updates-close-btn text-slate-500 hover:text-slate-900"><i class="fas fa-xmark text-lg"></i></button>
          </div>
          <div id="updates-content" class="p-6"></div>
        </div>
      </div>

      <div id="admin-dashboard" class="fixed inset-0 z-[110] hidden bg-slate-100/95">
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(92,124,250,0.14),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.12),transparent_28%)]"></div>
        <div id="admin-dashboard-content" class="relative h-full overflow-y-auto"></div>
      </div>

      <div id="suggestion-board" class="fixed inset-0 z-[105] hidden bg-slate-950/96">
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.14),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(92,124,250,0.12),transparent_30%)]"></div>
        <div class="relative flex h-full flex-col">
          <div class="flex items-center justify-between border-b border-white/10 px-4 py-3 sm:px-6">
            <div>
              <div class="text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-400">사용자 제안 게시판</div>
              <div class="mt-1 text-sm text-slate-300">사용자 제안과 수정 요청을 모아 관리자가 확인합니다.</div>
            </div>
            <div class="flex items-center gap-2">
              <button onclick="closeSuggestionBoard()" class="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10">닫기</button>
            </div>
          </div>
          <div id="suggestion-board-content" class="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6"></div>
        </div>
      </div>
    </>
  )
}
