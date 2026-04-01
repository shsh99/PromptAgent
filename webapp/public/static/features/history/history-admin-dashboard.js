async function showAdminDashboard() {
  const dashboard = document.getElementById('admin-dashboard');
  const content = document.getElementById('admin-dashboard-content');
  if (!dashboard || !content) return;
  dashboard.classList.remove('hidden');
  content.innerHTML = '<div class="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-slate-400">관리자 통계를 불러오는 중...</div>';
  const token = getAdminToken();
  if (!token) {
    content.innerHTML = '<div class="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-sm text-red-200">관리자 토큰이 없습니다. 상단의 관리자 버튼으로 다시 입력하세요.</div>';
    return;
  }
  const data = await fetchAdminLogs();
  if (data?.unauthorized) {
    clearAdminToken();
    content.innerHTML = '<div class="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-sm text-red-200">관리자 토큰이 유효하지 않습니다.</div>';
    return;
  }
  if (data?.error) {
    content.innerHTML = `<div class="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-sm text-red-200">${escapeHtml(data.error)}</div>`;
    return;
  }
  window.__adminLogsCache = data;
  content.innerHTML = renderAdminDashboardShell(`
    <div class="grid gap-4">
      ${renderAdminPanelV2(data)}
      ${renderSuggestionAdminSectionV2(data.suggestions || [])}
    </div>
  `);
  refreshTrainingSamplesSection();
}

window.showAdminDashboard = showAdminDashboard;
window.reloadAdminDashboard = reloadAdminDashboard;
window.closeAdminDashboard = closeAdminDashboard;
window.clearHistory = clearHistory;

async function reloadAdminDashboard() {
  const dashboard = document.getElementById('admin-dashboard');
  if (dashboard && !dashboard.classList.contains('hidden')) {
    await showAdminDashboard();
  }
}

function closeAdminDashboard() {
  const dashboard = document.getElementById('admin-dashboard');
  if (dashboard) dashboard.classList.add('hidden');
}

function clearHistory() {
  localStorage.removeItem(USER_HISTORY_KEY);
  localStorage.removeItem(USER_ACTIVITY_KEY);
  localStorage.removeItem(ACTIVE_PROMPT_HISTORY_KEY);

  const token = getAdminToken();
  if (!token) {
    showHistory();
    return;
  }
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
    await showHistory();
  });
}

function renderAdminPanelV2(data) {
  const promptLogs = data?.promptLogs || [];
  const activityLogs = data?.activityLogs || [];
  const promptThreads = data?.promptThreads || [];
  const suggestions = data?.suggestions || [];
  const trainingSamples = data?.trainingSamples || [];
  const stats = data?.stats || {};
  const tokenState = getAdminToken() ? '연결됨' : '없음';

  const renderPromptCards = () => (promptLogs.length
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
    : '<div class="text-center py-8 text-gray-600 text-sm">저장된 프롬프트 로그가 없습니다.</div>');

  const renderActivityCards = () => (activityLogs.length
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
    : '<div class="text-center py-8 text-gray-600 text-sm">저장된 활동 로그가 없습니다.</div>');

  const renderThreadCards = () => (promptThreads.length
    ? promptThreads.slice(0, 12).map((thread) => `
      <div class="rounded-xl border border-gray-800 bg-gray-950/40 p-4">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <div class="text-sm font-semibold text-white">${escapeHtml(thread.title || 'Prompt')}</div>
            <div class="mt-1 text-[11px] text-gray-500">
              ${thread.visitorId ? `visitor: ${escapeHtml(thread.visitorId)}` : 'anonymous'}
              ${thread.keyword ? ` · keyword: ${escapeHtml(thread.keyword)}` : ''}
              ${thread.techniqueName ? ` · ${escapeHtml(thread.techniqueName)}` : ''}
            </div>
          </div>
          <span class="rounded-full bg-brand-500/15 px-2 py-0.5 text-[10px] font-semibold text-brand-200">v${thread.promptCount || 0}</span>
        </div>
        <p class="mt-3 line-clamp-2 text-xs leading-6 text-gray-400">${escapeHtml(thread.latestPrompt || '')}</p>
      </div>
    `).join('')
    : '<div class="text-center py-8 text-gray-600 text-sm">저장된 히스토리 스레드가 없습니다.</div>');

  const renderSuggestionCards = () => (suggestions.length
    ? suggestions.slice(0, 12).map((item) => `
      <div class="rounded-xl border border-gray-800 bg-gray-950/40 p-4">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <div class="text-sm font-semibold text-white">${escapeHtml(item.title || '건의사항')}</div>
            <div class="mt-1 text-[11px] text-gray-500">
              ${item.visitorId ? `visitor: ${escapeHtml(item.visitorId)}` : 'anonymous'}
              ${item.sessionId ? ` · session: ${escapeHtml(item.sessionId)}` : ''}
            </div>
          </div>
          <span class="text-[10px] text-gray-600">${formatTime(item.createdAt)}</span>
        </div>
        <p class="mt-3 whitespace-pre-wrap text-xs leading-6 text-gray-400">${escapeHtml(item.text || '')}</p>
      </div>
    `).join('')
    : '<div class="text-center py-8 text-gray-600 text-sm">저장된 건의사항이 없습니다.</div>');

  const topTechniques = (stats.topPromptTechniques || []).slice(0, 5);
  const topPurposes = (stats.topPromptPurposes || []).slice(0, 5);
  const topActivityTypes = (stats.topActivityTypes || []).slice(0, 5);
  const gradeCounts = (stats.promptGradeCounts || []).map((item) => ({ key: item.key, count: item.count }));

  return `
    <div class="grid grid-cols-2 gap-3 mb-5 sm:grid-cols-3 xl:grid-cols-6">
      ${renderStatCard('생성 수', stats.promptCount || 0)}
      ${renderStatCard('방문 수', stats.pageViewCount || 0)}
      ${renderStatCard('최적화 수', stats.optimizeRunCount || 0)}
      ${renderStatCard('활동 수', stats.activityCount || 0)}
      ${renderStatCard('사용자 수', stats.visitorCount || 0)}
      ${renderStatCard('Token', tokenState, 'text-white')}
    </div>

    <div class="grid grid-cols-2 gap-3 mb-5 sm:grid-cols-4">
      ${renderStatCard('히스토리 스레드', promptThreads.length || 0)}
      ${renderStatCard('건의사항', suggestions.length || 0)}
      ${renderStatCard('복사 수', stats.copyCount || 0)}
      ${renderStatCard('다운로드 수', stats.downloadCount || 0)}
    </div>

    <div class="grid grid-cols-1 gap-3 mb-5 lg:grid-cols-3">
      ${renderListBlock('인기 프롬프트 유형', topTechniques)}
      ${renderListBlock('자주 쓰는 목적', topPurposes)}
      ${renderListBlock('행동 패턴', topActivityTypes)}
    </div>

    <div class="grid grid-cols-1 gap-3 mb-5 lg:grid-cols-4">
      ${renderListBlock('프롬프트 등급 분포', gradeCounts)}
      ${renderStatCard('복사 수', stats.copyCount || 0)}
      ${renderStatCard('다운로드 수', stats.downloadCount || 0)}
      ${renderStatCard('생성 이벤트', stats.promptGenerateCount || 0)}
      ${renderStatCard('학습 샘플', stats.trainingSampleCount || trainingSamples.length || 0)}
    </div>

    <div class="grid grid-cols-1 gap-4">
      <section class="rounded-2xl border border-gray-800 bg-gray-950/60 p-4">
        <div class="mb-3 flex items-center justify-between">
          <h4 class="text-sm font-semibold text-white">히스토리 스레드</h4>
          <span class="text-[10px] text-gray-500">${promptThreads.length} items</span>
        </div>
        <div class="space-y-3">${renderThreadCards()}</div>
      </section>
      <section class="rounded-2xl border border-gray-800 bg-gray-950/60 p-4">
        <div class="mb-3 flex items-center justify-between">
          <h4 class="text-sm font-semibold text-white">관리자 프롬프트 로그</h4>
          <span class="text-[10px] text-gray-500">${promptLogs.length} entries</span>
        </div>
        ${renderPromptCards()}
      </section>
      <section class="rounded-2xl border border-gray-800 bg-gray-950/60 p-4">
        <div class="mb-3 flex items-center justify-between">
          <h4 class="text-sm font-semibold text-white">관리자 활동 로그</h4>
          <span class="text-[10px] text-gray-500">${activityLogs.length} events</span>
        </div>
        ${renderActivityCards()}
      </section>
      <section class="rounded-2xl border border-gray-800 bg-gray-950/60 p-4">
        <div class="mb-3 flex items-center justify-between">
          <h4 class="text-sm font-semibold text-white">건의사항</h4>
          <span class="text-[10px] text-gray-500">${suggestions.length} items</span>
        </div>
        <div class="space-y-3">${renderSuggestionCards()}</div>
      </section>
      <div id="training-samples-section">
        ${renderTrainingSamplesSection(trainingSamples)}
      </div>
    </div>
  `;
}

function renderSuggestionAdminSectionV2(suggestions) {
  const cards = (suggestions || []).length
    ? suggestions.slice(0, 20).map((entry) => `
      <div class="rounded-2xl border border-emerald-500/15 bg-emerald-500/5 p-4">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <div class="text-sm font-semibold text-white">${escapeHtml(entry.title || '건의사항')}</div>
            <div class="mt-1 text-[11px] text-slate-500">
              ${entry.visitorId ? `visitor: ${escapeHtml(entry.visitorId)}` : 'anonymous'}
              ${entry.sessionId ? ` · session: ${escapeHtml(entry.sessionId)}` : ''}
            </div>
          </div>
          <span class="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-200">${escapeHtml(formatTime(entry.createdAt))}</span>
        </div>
        <p class="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-300">${escapeHtml(entry.text || '')}</p>
      </div>
    `).join('')
    : '<div class="rounded-2xl border border-dashed border-emerald-500/20 bg-emerald-500/5 p-5 text-center text-sm leading-7 text-slate-400">저장된 건의사항이 없습니다.</div>';

  return `
    <section class="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-6">
      <div class="mb-4 flex items-center justify-between gap-3">
        <div>
          <div class="text-[10px] uppercase tracking-[0.2em] text-slate-400">건의사항</div>
          <h3 class="mt-1 text-lg font-bold text-white">접수된 건의사항</h3>
        </div>
        <span class="text-xs text-slate-400">${(suggestions || []).length} items</span>
      </div>
      <div class="space-y-3">${cards}</div>
    </section>
  `;
}



