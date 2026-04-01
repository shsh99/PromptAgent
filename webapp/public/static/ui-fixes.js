// ===== ui-fixes.js - late overrides for history / light-mode polish =====

(function () {
  function showHistory() {
    const modal = document.getElementById('history-modal');
    const content = document.getElementById('history-content');
    if (!modal || !content) return;

    modal.classList.remove('hidden');
    const items = typeof loadLocalHistory === 'function' ? loadLocalHistory() : [];
    content.innerHTML = `
      <div class="space-y-5">
        <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div class="text-[10px] uppercase tracking-[0.2em] text-slate-400">로컬 히스토리</div>
              <p class="mt-1 text-sm leading-6 text-slate-300">프롬프트를 생성한 기록만 보여줍니다. 관리자 로그는 별도 관리자 화면에서 확인하세요.</p>
            </div>
            <div class="flex flex-wrap gap-2">
              <button onclick="clearHistory()" class="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-200 hover:bg-red-500/15">내 기록 삭제</button>
              <button onclick="closeHistory()" class="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-white/10">닫기</button>
            </div>
          </div>
          <div class="mt-4">
            <input id="history-search" type="search" placeholder="기능, 키워드, 목적, 본문으로 검색"
              class="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/10" />
          </div>
        </div>
        <div id="local-history-panel"></div>
      </div>
    `;

    const search = document.getElementById('history-search');
    const localPanel = document.getElementById('local-history-panel');
    const updateLocalPanel = () => {
      if (!localPanel || typeof renderLocalHistoryPanel !== 'function' || typeof loadLocalHistory !== 'function') return;
      localPanel.innerHTML = renderLocalHistoryPanel(loadLocalHistory(), search?.value || '');
    };
    updateLocalPanel();
    search?.addEventListener('input', updateLocalPanel);
  }

  function clearHistory() {
    localStorage.removeItem('pf_user_history');
    localStorage.removeItem('pf_user_activity');
    localStorage.removeItem('pf_active_prompt_history_id');
    showHistory();
  }

  window.showHistory = showHistory;
  window.clearHistory = clearHistory;
})();
