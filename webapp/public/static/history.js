// ===== history.js - 관리자 로그 / 활동 추적 =====

const VISITOR_ID_KEY = 'pf_visitor_id';
const ADMIN_TOKEN_KEY = 'pf_admin_token';

function safeJsonParse(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function createVisitorId() {
  if (window.crypto?.randomUUID) return `v_${crypto.randomUUID()}`;
  return `v_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

function ensureVisitorId() {
  let visitorId = localStorage.getItem(VISITOR_ID_KEY);
  if (!visitorId) {
    visitorId = createVisitorId();
    localStorage.setItem(VISITOR_ID_KEY, visitorId);
  }
  if (window.state) state.visitorId = visitorId;
  return visitorId;
}

function getAdminToken() {
  return sessionStorage.getItem(ADMIN_TOKEN_KEY) || '';
}

function setAdminToken(token) {
  if (token) sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
}

function clearAdminToken() {
  sessionStorage.removeItem(ADMIN_TOKEN_KEY);
}

function sendLogEvent(kind, payload) {
  const body = JSON.stringify({
    kind,
    visitorId: ensureVisitorId(),
    ...payload,
  });
  const url = '/api/logs';
  if (navigator.sendBeacon) {
    try {
      const blob = new Blob([body], { type: 'application/json' });
      navigator.sendBeacon(url, blob);
      return;
    } catch {
      // fallback to fetch
    }
  }
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    keepalive: true,
  }).catch(() => {});
}

function loadPromptLogs() {
  return [];
}

function loadActivityLogs() {
  return [];
}

function recordActivity(actionType, meta = {}) {
  const entry = {
    actionType,
    meta,
    createdAt: new Date().toISOString(),
  };
  sendLogEvent('activity', {
    actionType,
    meta,
    createdAt: entry.createdAt,
  });
  return entry;
}

function saveToHistory(data) {
  const entry = {
    promptId: data.id || Date.now(),
    visitorId: ensureVisitorId(),
    actionType: 'RUN',
    techniqueId: data.techniqueId || state.techniqueId || '',
    technique: data.technique?.name || state.techniqueData?.name || state.techniqueId || '',
    prompt: data.prompt,
    grade: data.qualityReport?.grade || 'C',
    score: data.qualityReport?.percentage || 0,
    purpose: data.purpose || state.purpose || '',
    keyword: data.keyword || state.keyword || '',
    model: data.model || data.technique?.nameEn || '',
    createdAt: new Date().toISOString(),
  };

  sendLogEvent('prompt', entry);
  return entry;
}

function formatTime(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString('ko-KR');
}

async function fetchAdminLogs() {
  const token = getAdminToken();
  if (!token) return { ok: false, unauthorized: true };
  const res = await fetch('/api/admin/logs', {
    headers: { 'X-Admin-Token': token },
  });
  if (res.status === 401) return { ok: false, unauthorized: true };
  if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };
  return res.json();
}

function renderStatCard(label, value, accent = '') {
  return `
    <div class="rounded-xl border border-gray-800 bg-gray-950/70 p-4">
      <div class="text-[10px] uppercase tracking-[0.2em] text-gray-500">${label}</div>
      <div class="mt-2 text-2xl font-bold ${accent || 'text-white'}">${value}</div>
    </div>
  `;
}

function renderListBlock(title, items) {
  return `
    <div class="rounded-2xl border border-gray-800 bg-gray-950/60 p-4">
      <div class="mb-2 text-sm font-semibold text-white">${title}</div>
      <div class="space-y-2 text-sm text-gray-300">
        ${items.length
          ? items.map((item) => `<div class="flex items-center justify-between"><span>${escapeHtml(item.key)}</span><span class="text-gray-500">${item.count}</span></div>`).join('')
          : '<div class="text-gray-500">데이터 없음</div>'}
      </div>
    </div>
  `;
}

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

async function showHistory() {
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
  content.innerHTML = renderAdminPanel(data);
}

function clearHistory() {
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
    await showHistory();
  });
}

function closeHistory() {
  document.getElementById('history-modal').classList.add('hidden');
}
