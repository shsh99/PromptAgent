// ===== history.js - 관리자 로그 / 활동 추적 =====

const VISITOR_ID_KEY = 'pf_visitor_id';
const SESSION_ID_KEY = 'pf_session_id';
const ADMIN_TOKEN_KEY = 'pf_admin_token';
const USER_HISTORY_KEY = 'pf_user_history';
const USER_ACTIVITY_KEY = 'pf_user_activity';
const ACTIVE_PROMPT_HISTORY_KEY = 'pf_active_prompt_history_id';
const MAX_LOCAL_HISTORY = 120;
const MAX_LOCAL_ACTIVITY = 300;

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

function ensureSessionId() {
  let sessionId = sessionStorage.getItem(SESSION_ID_KEY);
  if (!sessionId) {
    sessionId = createVisitorId().replace(/^v_/, 's_');
    sessionStorage.setItem(SESSION_ID_KEY, sessionId);
  }
  return sessionId;
}

function createLocalRecordId(prefix = 'r') {
  if (window.crypto?.randomUUID) return `${prefix}_${crypto.randomUUID()}`;
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

function loadLocalJson(key, fallback) {
  return safeJsonParse(localStorage.getItem(key), fallback);
}

function saveLocalJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function loadLocalHistory() {
  const items = loadLocalJson(USER_HISTORY_KEY, []);
  return Array.isArray(items) ? items : [];
}

function saveLocalHistory(items) {
  saveLocalJson(USER_HISTORY_KEY, (Array.isArray(items) ? items : []).slice(0, MAX_LOCAL_HISTORY));
}

function loadLocalActivities() {
  const items = loadLocalJson(USER_ACTIVITY_KEY, []);
  return Array.isArray(items) ? items : [];
}

function saveLocalActivities(items) {
  saveLocalJson(USER_ACTIVITY_KEY, (Array.isArray(items) ? items : []).slice(0, MAX_LOCAL_ACTIVITY));
}

function getCurrentHistoryThreadId() {
  return localStorage.getItem(ACTIVE_PROMPT_HISTORY_KEY) || '';
}

function setCurrentHistoryThreadId(id) {
  if (!id) return;
  localStorage.setItem(ACTIVE_PROMPT_HISTORY_KEY, id);
}

function buildHistoryTitle(data = {}) {
  return String(data.title || data.technique?.name || state?.techniqueData?.name || state?.techniqueId || 'Prompt').trim();
}

function upsertPromptHistoryVersion(data = {}) {
  const threadId = String(data.threadId || getCurrentHistoryThreadId() || createLocalRecordId('ph'));
  const history = loadLocalHistory();
  const createdAt = data.createdAt || new Date().toISOString();
  let thread = history.find((item) => item.id === threadId);

  if (!thread) {
    thread = {
      id: threadId,
      userId: ensureVisitorId(),
      sessionId: ensureSessionId(),
      title: buildHistoryTitle(data),
      purpose: data.purpose || '',
      keyword: data.keyword || '',
      techniqueId: data.techniqueId || '',
      techniqueName: data.techniqueName || '',
      workflowState: data.workflowState || '',
      createdAt,
      updatedAt: createdAt,
      latestPrompt: String(data.prompt || ''),
      promptCount: 0,
      versions: [],
      references: [],
    };
    history.unshift(thread);
  }

  const versions = Array.isArray(thread.versions) ? thread.versions : [];
  const version = {
    id: data.versionId || createLocalRecordId('pv'),
    versionNumber: versions.length + 1,
    kind: data.kind || 'generate',
    title: data.title || '',
    prompt: String(data.prompt || ''),
    inputRaw: String(data.inputRaw || ''),
    intent: data.intent || null,
    resultMode: data.resultMode || '',
    techniqueId: data.techniqueId || '',
    techniqueName: data.techniqueName || '',
    purpose: data.purpose || '',
    keyword: data.keyword || '',
    workflowState: data.workflowState || '',
    score: Number(data.score || 0),
    qualityGrade: data.qualityGrade || '',
    createdAt,
  };

  thread.title = buildHistoryTitle(data) || thread.title;
  thread.purpose = data.purpose || thread.purpose || '';
  thread.keyword = data.keyword || thread.keyword || '';
  thread.techniqueId = data.techniqueId || thread.techniqueId || '';
  thread.techniqueName = data.techniqueName || thread.techniqueName || '';
  thread.workflowState = data.workflowState || thread.workflowState || '';
  thread.updatedAt = createdAt;
  thread.latestPrompt = String(data.prompt || thread.latestPrompt || '');
  thread.promptCount = versions.length + 1;
  thread.fields = data.fields || thread.fields || {};
  thread.versions = [version, ...versions].slice(0, 10);

  saveLocalHistory(history);
  setCurrentHistoryThreadId(threadId);
  if (window.state) {
    state.activePromptHistoryId = threadId;
  }
  return thread;
}

function loadHistoryThread(threadId) {
  return loadLocalHistory().find((item) => item.id === threadId) || null;
}

function appendLocalActivity(actionType, meta = {}) {
  const entry = {
    id: createLocalRecordId('a'),
    actionType,
    meta,
    visitorId: ensureVisitorId(),
    sessionId: ensureSessionId(),
    createdAt: new Date().toISOString(),
  };
  const items = loadLocalActivities();
  items.unshift(entry);
  saveLocalActivities(items);
  return entry;
}

function filterHistoryItems(items, query) {
  const needle = String(query || '').trim().toLowerCase();
  if (!needle) return items;
  return items.filter((item) => {
    const haystack = [
      item.title,
      item.purpose,
      item.keyword,
      item.techniqueName,
      item.techniqueId,
      item.latestPrompt,
      ...(item.versions || []).map((version) => version.prompt || ''),
    ].join(' ').toLowerCase();
    return haystack.includes(needle);
  });
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
  return loadLocalHistory();
}

function loadActivityLogs() {
  return loadLocalActivities();
}

function recordActivity(actionType, meta = {}) {
  const entry = {
    id: createLocalRecordId('a'),
    actionType,
    meta,
    visitorId: ensureVisitorId(),
    sessionId: ensureSessionId(),
    createdAt: new Date().toISOString(),
  };
  appendLocalActivity(actionType, meta);
  sendLogEvent('activity', {
    actionType,
    meta,
    visitorId: entry.visitorId,
    sessionId: entry.sessionId,
    createdAt: entry.createdAt,
  });
  return entry;
}

function saveToHistory(data) {
  const entry = upsertPromptHistoryVersion({
    threadId: data.threadId || getCurrentHistoryThreadId(),
    versionId: data.versionId,
    kind: data.kind || 'generate',
    title: data.title || buildHistoryTitle(data),
    prompt: data.prompt || '',
    inputRaw: data.inputRaw || '',
    intent: data.intent || null,
    resultMode: data.resultMode || '',
    techniqueId: data.techniqueId || state.techniqueId || '',
    techniqueName: data.technique?.name || state.techniqueData?.name || state.techniqueId || '',
    purpose: data.purpose || state.purpose || '',
    keyword: data.keyword || state.keyword || '',
    workflowState: data.workflowState || state.workflowState || 'new',
    score: data.qualityReport?.percentage || 0,
    qualityGrade: data.qualityReport?.grade || 'C',
    fields: data.fields || state.fields || {},
    createdAt: new Date().toISOString(),
  });
  const logEntry = {
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

  sendLogEvent('prompt', logEntry);
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

function renderLocalHistoryPanel(items, query = '') {
  const filtered = filterHistoryItems(items, query);
  const totalVersions = filtered.reduce((sum, item) => sum + ((item.versions || []).length || 0), 0);
  const latest = filtered[0];

  return `
    <div class="mb-4 grid gap-3 sm:grid-cols-3">
      <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div class="text-[10px] uppercase tracking-[0.2em] text-slate-400">내 기록</div>
        <div class="mt-2 text-2xl font-bold text-white">${filtered.length}</div>
      </div>
      <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div class="text-[10px] uppercase tracking-[0.2em] text-slate-400">버전 수</div>
        <div class="mt-2 text-2xl font-bold text-white">${totalVersions}</div>
      </div>
      <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div class="text-[10px] uppercase tracking-[0.2em] text-slate-400">최근 갱신</div>
        <div class="mt-2 text-sm font-semibold text-white">${escapeHtml(latest ? formatTime(latest.updatedAt) : '없음')}</div>
      </div>
    </div>
    <div class="space-y-3">
      ${filtered.length ? filtered.map((item) => `
        <article class="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-2">
                <h4 class="truncate text-sm font-semibold text-white">${escapeHtml(item.title || 'Prompt')}</h4>
                <span class="rounded-full bg-brand-500/10 px-2 py-0.5 text-[10px] text-brand-200">v${item.promptCount || (item.versions || []).length || 1}</span>
                ${item.techniqueName ? `<span class="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-slate-300">${escapeHtml(item.techniqueName)}</span>` : ''}
              </div>
              <div class="mt-1 text-xs leading-5 text-slate-400">
                ${item.keyword ? `<span class="mr-3">키워드: ${escapeHtml(item.keyword)}</span>` : ''}
                ${item.purpose ? `<span class="mr-3">목적: ${escapeHtml(item.purpose)}</span>` : ''}
                <span>${escapeHtml(formatTime(item.updatedAt || item.createdAt))}</span>
              </div>
            </div>
            <div class="flex flex-wrap gap-2">
              <button onclick="loadHistoryItem('${escapeHtml(item.id)}')" class="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-white/10">불러오기</button>
              <button onclick="copyHistoryItem('${escapeHtml(item.id)}')" class="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-white/10">복사</button>
            </div>
          </div>
          <pre class="mt-3 whitespace-pre-wrap rounded-2xl border border-white/10 bg-slate-950/40 p-3 text-xs leading-6 text-slate-300">${escapeHtml((item.latestPrompt || '').slice(0, 600))}</pre>
          ${(item.versions || []).length > 1 ? `
            <div class="mt-3 flex flex-wrap gap-2 text-[10px] text-slate-400">
              ${(item.versions || []).slice(0, 3).map((version) => `<span class="rounded-full border border-white/10 bg-white/5 px-2 py-0.5">v${version.versionNumber || 1} · ${escapeHtml(version.kind || 'generate')}</span>`).join('')}
            </div>
          ` : ''}
        </article>
      `).join('') : '<div class="rounded-2xl border border-dashed border-white/15 bg-white/5 p-6 text-center text-sm leading-7 text-slate-400">아직 저장된 기록이 없습니다. 프롬프트를 생성하면 여기에 자동 저장됩니다.</div>'}
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

async function promptAdminToken() {
  const token = prompt('관리자 토큰을 입력하세요.') || '';
  if (!token.trim()) return;
  setAdminToken(token.trim());
  await showAdminDashboard();
}

function copyHistoryItem(threadId) {
  const item = loadHistoryThread(threadId);
  if (!item) return;
  navigator.clipboard.writeText(item.latestPrompt || '').then(() => {
    appendLocalActivity('HISTORY_COPY', { threadId, title: item.title || '' });
  });
}

function loadHistoryItem(threadId) {
  const item = loadHistoryThread(threadId);
  if (!item) return;
  setCurrentHistoryThreadId(threadId);
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
  if (promptEl) promptEl.textContent = item.latestPrompt || '';
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
    adminPanel.innerHTML = renderAdminPanel(data);
  }
}

function renderAdminDashboardShell(contentHtml) {
  return `
    <div class="mx-auto h-full max-w-7xl overflow-y-auto rounded-3xl border border-white/10 bg-slate-950/70 p-4 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-6">
      ${contentHtml}
    </div>
  `;
}

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
  content.innerHTML = renderAdminDashboardShell(renderAdminPanel(data));
}

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
