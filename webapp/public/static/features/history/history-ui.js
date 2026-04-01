function renderAdminPanel(data) {
  const promptLogs = data?.promptLogs || [];
  const activityLogs = data?.activityLogs || [];
  const stats = data?.stats || {};
  const tokenState = getAdminToken() ? '연결됨' : '없음';

  const promptCards = promptLogs.length
    ? promptLogs.slice(0, 50).map((entry) => `
      <div class="border border-gray-800 rounded-xl p-4 mb-3 hover:border-gray-700 transition-colors">
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-2">
            <span class="text-xs px-2 py-0.5 rounded-full font-bold bg-orange-500/20 text-orange-400">${escapeHtml(entry.grade || 'C')}</span>
            <span class="text-sm font-medium text-white">${escapeHtml(entry.technique || entry.techniqueId || 'Prompt')}</span>
            <span class="text-[10px] rounded-full bg-gray-800 px-2 py-0.5 text-gray-400">${escapeHtml(entry.actionType || 'RUN')}</span>
          </div>
          <span class="text-[10px] text-gray-600">${formatTime(entry.createdAt)}</span>
        </div>
        <div class="text-[11px] text-gray-500 mb-2">
          ${entry.visitorId ? `<span class="mr-3">visitor: ${escapeHtml(entry.visitorId)}</span>` : ''}
          ${entry.keyword ? `<span class="mr-3">keyword: ${escapeHtml(entry.keyword)}</span>` : ''}
          ${entry.score !== undefined ? `<span>score: ${entry.score}%</span>` : ''}
        </div>
        <pre class="text-xs text-gray-400 whitespace-pre-wrap line-clamp-3 font-mono">${escapeHtml(entry.prompt || '')}</pre>
      </div>
    `).join('')
    : '<div class="text-center py-8 text-gray-600 text-sm">저장된 프롬프트 로그가 없습니다.</div>';

  const activityCards = activityLogs.length
    ? activityLogs.slice(0, 50).map((entry) => `
      <div class="flex items-start justify-between gap-3 border-b border-gray-800 py-3 last:border-b-0">
        <div>
          <div class="text-sm text-white">${escapeHtml(entry.actionType || 'UNKNOWN')}</div>
          <div class="text-[11px] text-gray-500">
            ${entry.visitorId ? escapeHtml(entry.visitorId) : 'anonymous'}
            ${entry.techniqueId ? ` · ${escapeHtml(entry.techniqueId)}` : ''}
          </div>
        </div>
        <div class="text-[10px] text-gray-600">${formatTime(entry.createdAt)}</div>
      </div>
    `).join('')
    : '<div class="text-center py-8 text-gray-600 text-sm">수집된 활동 로그가 없습니다.</div>';

  const topTechniques = (stats.topPromptTechniques || []).slice(0, 5);
  const topPurposes = (stats.topPromptPurposes || []).slice(0, 5);
  const topActivityTypes = (stats.topActivityTypes || []).slice(0, 5);
  const gradeCounts = (stats.promptGradeCounts || []).map((item) => ({ key: item.key, count: item.count }));

  return `
    <div class="grid grid-cols-2 gap-3 mb-5 sm:grid-cols-3 xl:grid-cols-6">
      ${renderStatCard('생성 수', stats.promptCount || 0)}
      ${renderStatCard('조회수', stats.pageViewCount || 0)}
      ${renderStatCard('최적화 수', stats.optimizeRunCount || 0)}
      ${renderStatCard('활동 수', stats.activityCount || 0)}
      ${renderStatCard('사용자 수', stats.visitorCount || 0)}
      ${renderStatCard('Token', tokenState, 'text-white')}
    </div>

    <div class="grid grid-cols-1 gap-3 mb-5 lg:grid-cols-3">
      ${renderListBlock('인기 프롬프트 유형', topTechniques)}
      ${renderListBlock('자주 쓰는 목적', topPurposes)}
      ${renderListBlock('활동 패턴', topActivityTypes)}
    </div>

    <div class="grid grid-cols-1 gap-3 mb-5 lg:grid-cols-4">
      ${renderListBlock('프롬프트 등급 분포', gradeCounts)}
      ${renderStatCard('복사 수', stats.copyCount || 0)}
      ${renderStatCard('다운로드 수', stats.downloadCount || 0)}
      ${renderStatCard('생성 이벤트', stats.promptGenerateCount || 0)}
    </div>

    <div class="grid grid-cols-1 gap-4">
      <section class="rounded-2xl border border-gray-800 bg-gray-950/60 p-4">
        <div class="mb-3 flex items-center justify-between">
          <h4 class="text-sm font-semibold text-white">관리자 프롬프트 로그</h4>
          <span class="text-[10px] text-gray-500">${promptLogs.length} entries</span>
        </div>
        ${promptCards}
      </section>
      <section class="rounded-2xl border border-gray-800 bg-gray-950/60 p-4">
        <div class="mb-3 flex items-center justify-between">
          <h4 class="text-sm font-semibold text-white">관리자 활동 로그</h4>
          <span class="text-[10px] text-gray-500">${activityLogs.length} events</span>
        </div>
        ${activityCards}
      </section>
    </div>
  `;
}

async function showAdminHistory() {
  const token = getAdminToken() || prompt('관리자 토큰을 입력하세요.') || '';
  if (!token) return;
  setAdminToken(token);

  const modal = document.getElementById('history-modal');
  const content = document.getElementById('history-content');
  modal.classList.remove('hidden');
  content.innerHTML = '<div class="py-10 text-center text-gray-500">관리자 로그를 불러오는 중...</div>';

  const data = await fetchAdminLogs();
  if (data?.unauthorized) {
    clearAdminToken();
    content.innerHTML = '<div class="py-10 text-center text-red-400">관리자 토큰이 유효하지 않습니다.</div>';
    return;
  }
  if (data?.error) {
    content.innerHTML = `<div class="py-10 text-center text-red-400">${escapeHtml(data.error)}</div>`;
    return;
  }
  content.innerHTML = renderAdminPanelV2(data);
}

function clearAdminHistory() {
  const token = getAdminToken();
  if (!token) return;
  fetch('/api/admin/logs', {
    method: 'DELETE',
    headers: { 'X-Admin-Token': token },
  }).then(async (res) => {
    if (res.status === 401) {
      clearAdminToken();
      alert('관리자 토큰이 유효하지 않습니다.');
      return;
    }
    if (!res.ok) {
      alert('로그 초기화에 실패했습니다.');
      return;
    }
    await showAdminHistory();
  });
}

function closeHistory() {
  document.getElementById('history-modal').classList.add('hidden');
}

async function promptAdminToken() {
  const token = prompt('관리자 토큰을 입력하세요.') || '';
  if (!token.trim()) return;
  setAdminToken(token.trim());
  await showAdminDashboard();
}

window.showHistory = showHistory;
window.closeHistory = closeHistory;
window.clearHistory = clearHistory;
window.showAdminHistory = showAdminHistory;
window.promptAdminToken = promptAdminToken;
window.selectHistoryThread = selectHistoryThread;
window.selectHistoryVersion = selectHistoryVersion;
window.openSuggestionBoard = openSuggestionBoard;
window.showSuggestionBoard = showSuggestionBoard;
window.closeSuggestionBoard = closeSuggestionBoard;
window.submitSuggestion = submitSuggestion;
window.clearSuggestionDraft = clearSuggestionDraft;
window.copyHistoryItem = copyHistoryItem;
window.loadHistoryItem = loadHistoryItem;
window.copySuggestionText = copySuggestionText;

function openSuggestionBoard() {
  const board = document.getElementById('suggestion-board');
  if (!board) return;
  board.classList.remove('hidden');
  const content = document.getElementById('suggestion-board-content');
  if (content) {
    content.innerHTML = renderSuggestionBoardContent();
    const titleEl = document.getElementById('suggestion-title');
    const textEl = document.getElementById('suggestion-text');
    const persistDraft = () => setSuggestionDraft({
      title: titleEl?.value || '',
      text: textEl?.value || '',
    });
    if (titleEl) titleEl.oninput = persistDraft;
    if (textEl) textEl.oninput = persistDraft;
  }
}

function showSuggestionBoard() {
  openSuggestionBoard();
}

function closeSuggestionBoard() {
  const board = document.getElementById('suggestion-board');
  if (board) board.classList.add('hidden');
}

function clearSuggestionDraft() {
  localStorage.removeItem(USER_SUGGESTION_DRAFT_KEY);
  const titleEl = document.getElementById('suggestion-title');
  const textEl = document.getElementById('suggestion-text');
  if (titleEl) titleEl.value = '';
  if (textEl) textEl.value = '';
}

function copySuggestionText(id) {
  const item = loadLocalSuggestions().find((entry) => entry.id === id);
  if (!item) return;
  navigator.clipboard.writeText(`${item.title ? `[${item.title}] ` : ''}${item.text || ''}`);
}

function submitSuggestion() {
  const titleEl = document.getElementById('suggestion-title');
  const textEl = document.getElementById('suggestion-text');
  const title = titleEl?.value?.trim() || '';
  const text = textEl?.value?.trim() || '';
  if (!text) {
    alert('건의 내용을 입력하세요.');
    return;
  }
  const entry = saveSuggestionItem(text, title || '건의사항');
  if (!entry) return;
  if (typeof recordActivity === 'function') {
    recordActivity('SUGGESTION_SUBMIT', {
      suggestionId: entry.id,
      title: entry.title,
      text: entry.text,
    });
  }
  if (titleEl) titleEl.value = '';
  if (textEl) textEl.value = '';
  setSuggestionDraft({ title: '', text: '' });
  openSuggestionBoard();
  alert('건의가 접수되었습니다. 관리자 대시보드에서도 확인할 수 있습니다.');
}

function copyHistoryItem(threadId) {
  const item = loadHistoryThread(threadId);
  if (!item) return;
  if (typeof selectHistoryThread === 'function') {
    selectHistoryThread(threadId);
  }
  const versions = Array.isArray(item.versions) ? item.versions : [];
  const selectedIndex = typeof getHistoryVersionIndex === 'function' ? getHistoryVersionIndex(item.id, versions) : 0;
  const selectedVersion = selectedIndex >= 0 ? versions[selectedIndex] : null;
  navigator.clipboard.writeText(selectedVersion?.prompt || item.latestPrompt || '').then(() => {
    appendLocalActivity('HISTORY_COPY', { threadId, title: item.title || '' });
  });
}

function loadHistoryItem(threadId) {
  const item = loadHistoryThread(threadId);
  if (!item) return;
  if (typeof selectHistoryThread === 'function') {
    selectHistoryThread(threadId);
  }
  setCurrentHistoryThreadId(threadId);
  const versions = Array.isArray(item.versions) ? item.versions : [];
  const selectedIndex = typeof getHistoryVersionIndex === 'function' ? getHistoryVersionIndex(item.id, versions) : 0;
  const selectedVersion = selectedIndex >= 0 ? versions[selectedIndex] : null;
  if (window.state) {
    state.purpose = item.purpose || state.purpose;
    state.keyword = item.keyword || state.keyword;
    state.techniqueId = item.techniqueId || state.techniqueId;
    state.workflowState = item.workflowState || state.workflowState || 'new';
    state.fields = item.fields || state.fields || {};
  }
  const resultSection = document.getElementById('result-section');
  const promptEl = document.getElementById('result-prompt');
  const techniqueEl = document.getElementById('result-technique-name');
  if (promptEl) promptEl.textContent = selectedVersion?.prompt || item.latestPrompt || '';
  if (techniqueEl) techniqueEl.textContent = item.techniqueName || item.title || 'Prompt';
  if (resultSection) {
    resultSection.classList.remove('hidden');
    resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  appendLocalActivity('HISTORY_OPEN', { threadId, title: item.title || '' });
}

async function showHistory() {
  const modal = document.getElementById('history-modal');
  const content = document.getElementById('history-content');
  modal.classList.remove('hidden');

  const localItems = loadLocalHistory();
  if (!historySelectedThreadId && localItems[0] && typeof saveHistorySelectedThreadId === 'function') {
    saveHistorySelectedThreadId(localItems[0].id);
  }
  content.innerHTML = `
    <div class="space-y-5">
      <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div class="text-[10px] uppercase tracking-[0.2em] text-slate-400">무료 로컬 히스토리</div>
            <p class="mt-1 text-sm leading-6 text-slate-300">로그인 없이도 내 프롬프트 기록을 브라우저에 저장합니다. 관리자 토큰이 있으면 서버 로그도 함께 봅니다.</p>
          </div>
          <div class="flex flex-wrap gap-2">
            <button onclick="clearHistory()" class="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-200 hover:bg-red-500/15">내 기록 삭제</button>
            <button onclick="closeHistory()" class="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-white/10">닫기</button>
          </div>
        </div>
        <div class="mt-4">
          <input id="history-search" type="search" placeholder="기술, 키워드, 목적, 본문으로 검색"
            class="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/10" />
        </div>
      </div>
      <div id="local-history-panel">
        ${renderLocalHistoryPanel(localItems)}
      </div>
      <div id="admin-history-panel" class="space-y-4"></div>
    </div>
  `;

  const search = document.getElementById('history-search');
  const localPanel = document.getElementById('local-history-panel');
  const updateLocalPanel = () => {
    historyPanelSearchQuery = search.value || '';
    if (typeof refreshLocalHistoryPanel === 'function') {
      refreshLocalHistoryPanel();
      return;
    }
    localPanel.innerHTML = renderLocalHistoryPanel(loadLocalHistory(), search.value);
  };
  search?.addEventListener('input', updateLocalPanel);

  const token = getAdminToken();
  if (token) {
    const adminPanel = document.getElementById('admin-history-panel');
    adminPanel.innerHTML = '<div class="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-400">관리자 로그를 불러오는 중...</div>';
    const data = await fetchAdminLogs();
    if (data?.unauthorized) {
      clearAdminToken();
      adminPanel.innerHTML = '<div class="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">관리자 토큰이 만료되었거나 유효하지 않습니다.</div>';
      return;
    }
    if (data?.error) {
      adminPanel.innerHTML = `<div class="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">${escapeHtml(data.error)}</div>`;
      return;
    }
    window.__adminLogsCache = data;
    adminPanel.innerHTML = renderAdminPanelV2(data);
    refreshTrainingSamplesSection();
  }
}
