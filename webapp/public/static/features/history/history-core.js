// ===== history.js - 관리자 로그 / 활동 추적 =====

const VISITOR_ID_KEY = 'pf_visitor_id';
const SESSION_ID_KEY = 'pf_session_id';
const ADMIN_TOKEN_KEY = 'pf_admin_token';
const USER_HISTORY_KEY = 'pf_user_history';
const USER_ACTIVITY_KEY = 'pf_user_activity';
const USER_SUGGESTION_KEY = 'pf_user_suggestions';
const USER_SUGGESTION_DRAFT_KEY = 'pf_suggestion_draft';
const ACTIVE_PROMPT_HISTORY_KEY = 'pf_active_prompt_history_id';
const HISTORY_SELECTED_THREAD_KEY = 'pf_history_selected_thread_id';
const HISTORY_VERSION_SELECTION_KEY = 'pf_history_version_selection';
const MAX_LOCAL_HISTORY = 120;
const MAX_LOCAL_ACTIVITY = 300;
const MAX_LOCAL_SUGGESTIONS = 60;

let historyVersionSelection = safeJsonParse(localStorage.getItem(HISTORY_VERSION_SELECTION_KEY), {});
let historySelectedThreadId = localStorage.getItem(HISTORY_SELECTED_THREAD_KEY) || '';
let historyPanelSearchQuery = '';

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

function loadLocalSuggestions() {
  const items = loadLocalJson(USER_SUGGESTION_KEY, []);
  return Array.isArray(items) ? items : [];
}

function saveLocalSuggestions(items) {
  saveLocalJson(USER_SUGGESTION_KEY, (Array.isArray(items) ? items : []).slice(0, MAX_LOCAL_SUGGESTIONS));
}

function saveHistoryVersionSelection() {
  localStorage.setItem(HISTORY_VERSION_SELECTION_KEY, JSON.stringify(historyVersionSelection || {}));
}

function saveHistorySelectedThreadId(threadId) {
  historySelectedThreadId = threadId || '';
  if (threadId) {
    localStorage.setItem(HISTORY_SELECTED_THREAD_KEY, threadId);
  } else {
    localStorage.removeItem(HISTORY_SELECTED_THREAD_KEY);
  }
}

function getHistoryVersionIndex(threadId, versions) {
  if (!Array.isArray(versions) || !versions.length) return -1;
  const selected = Number(historyVersionSelection?.[threadId]);
  if (Number.isInteger(selected) && selected >= 0 && selected < versions.length) return selected;
  return 0;
}

function refreshLocalHistoryPanel() {
  const panel = document.getElementById('local-history-panel');
  if (!panel) return;
  panel.innerHTML = renderLocalHistoryPanel(loadLocalHistory(), historyPanelSearchQuery);
}

function selectHistoryThread(threadId) {
  if (!threadId) return;
  saveHistorySelectedThreadId(threadId);
  refreshLocalHistoryPanel();
}

function selectHistoryVersion(threadId, versionIndex) {
  if (!threadId) return;
  historyVersionSelection = { ...(historyVersionSelection || {}), [threadId]: versionIndex };
  saveHistoryVersionSelection();
  refreshLocalHistoryPanel();
}

function getSuggestionDraft() {
  return safeJsonParse(localStorage.getItem(USER_SUGGESTION_DRAFT_KEY), { title: '', text: '' }) || { title: '', text: '' };
}

function setSuggestionDraft(value) {
  localStorage.setItem(USER_SUGGESTION_DRAFT_KEY, JSON.stringify(value || { title: '', text: '' }));
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
  const threadId = String(data.threadId || createLocalRecordId('ph'));
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
      variants: [],
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
  thread.variants = Array.isArray(data.variants) ? data.variants : thread.variants || [];
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

function saveSuggestionItem(text, title = '') {
  const content = String(text || '').trim();
  if (!content) return null;
  const entry = {
    id: createLocalRecordId('s'),
    title: String(title || '건의사항').trim(),
    text: content,
    visitorId: ensureVisitorId(),
    sessionId: ensureSessionId(),
    createdAt: new Date().toISOString(),
    status: '접수됨',
  };
  const items = loadLocalSuggestions();
  items.unshift(entry);
  saveLocalSuggestions(items);
  sendPersistJson('/api/suggestions', {
    suggestion: {
      id: entry.id,
      visitorId: entry.visitorId,
      sessionId: entry.sessionId,
      title: entry.title,
      text: entry.text,
      status: entry.status,
      createdAt: entry.createdAt,
    },
  });
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

function sendPersistJson(url, payload) {
  const body = JSON.stringify(payload || {});
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
  const variants = Array.isArray(data.variants) ? data.variants : Array.isArray(state.generatedVariants) ? state.generatedVariants : [];
  const threadId = data.threadId || createLocalRecordId('ph');
  const samplePayload = {
    id: data.versionId || createLocalRecordId('ts'),
    visitorId: ensureVisitorId(),
    sessionId: ensureSessionId(),
    source: 'generate',
    kind: data.kind || 'generate',
    threadId: data.threadId || getCurrentHistoryThreadId(),
    versionId: data.versionId || '',
    techniqueId: data.techniqueId || state.techniqueId || '',
    techniqueName: data.technique?.name || state.techniqueData?.name || state.techniqueId || '',
    purpose: data.purpose || state.purpose || '',
    keyword: data.keyword || state.keyword || '',
    workflowState: data.workflowState || state.workflowState || 'new',
    inputRaw: data.inputRaw || '',
    generatedPrompt: data.prompt || '',
    outputText: data.outputText || '',
    intent: data.intent || null,
    quality: {
      percentage: data.qualityReport?.percentage || 0,
      grade: data.qualityReport?.grade || 'C',
      summary: data.qualityReport?.summary || '',
      checks: data.qualityReport?.checks || [],
      suggestions: data.qualityReport?.suggestions || [],
    },
    meta: {
      fields: data.fields || state.fields || {},
      resultMode: data.resultMode || '',
      variants,
    },
    createdAt: new Date().toISOString(),
  };
  const entry = upsertPromptHistoryVersion({
    threadId,
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
    variants,
    createdAt: new Date().toISOString(),
  });
  const logEntry = {
    promptId: data.id || Date.now(),
    threadId: entry.id,
    versionNumber: entry.promptCount,
    visitorId: ensureVisitorId(),
    sessionId: ensureSessionId(),
    actionType: 'RUN',
    techniqueId: data.techniqueId || state.techniqueId || '',
    technique: data.technique?.name || state.techniqueData?.name || state.techniqueId || '',
    prompt: data.prompt,
    grade: data.qualityReport?.grade || 'C',
    score: data.qualityReport?.percentage || 0,
    purpose: data.purpose || state.purpose || '',
    keyword: data.keyword || state.keyword || '',
    model: data.model || data.technique?.nameEn || '',
    workflowState: data.workflowState || state.workflowState || 'new',
    createdAt: new Date().toISOString(),
  };

  sendLogEvent('prompt', logEntry);
  sendPersistJson('/api/history/persist', {
    thread: {
      id: entry.id,
      visitorId: entry.userId,
      sessionId: entry.sessionId,
      title: entry.title,
      purpose: entry.purpose,
      keyword: entry.keyword,
      techniqueId: entry.techniqueId,
      techniqueName: entry.techniqueName,
      workflowState: entry.workflowState,
      latestPrompt: entry.latestPrompt,
      promptCount: entry.promptCount,
      fields: entry.fields || {},
      variants: entry.variants || variants,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
    },
    version: {
      id: `pv_${entry.id}_${entry.promptCount}`,
      threadId: entry.id,
      versionNumber: entry.promptCount,
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
      variants,
      createdAt: new Date().toISOString(),
    },
  });
  sendPersistJson('/api/training-samples', {
    sample: samplePayload,
  });
  if (typeof loadPublicStats === 'function') {
    setTimeout(() => loadPublicStats(), 400);
  }
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
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const res = await fetch('/api/admin/logs', {
      headers: { 'X-Admin-Token': token },
      signal: controller.signal,
    });
    if (res.status === 401) return { ok: false, unauthorized: true };
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };
    try {
      return await res.json();
    } catch (error) {
      return { ok: false, error: 'JSON 파싱에 실패했습니다.' };
    }
  } catch (error) {
    return { ok: false, error: error?.name === 'AbortError' ? '관리자 로그 요청이 시간 초과되었습니다.' : '관리자 로그를 불러오지 못했습니다.' };
  } finally {
    clearTimeout(timeout);
  }
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
  const selectedThread = filtered.find((item) => item.id === historySelectedThreadId) || latest || null;
  const versions = Array.isArray(selectedThread?.versions) ? selectedThread.versions : [];
  const selectedVersionIndex = selectedThread ? getHistoryVersionIndex(selectedThread.id, versions) : -1;
  const selectedVersion = selectedVersionIndex >= 0 ? versions[selectedVersionIndex] : null;
  const selectedPrompt = selectedVersion?.prompt || selectedThread?.latestPrompt || '';
  const selectedTime = selectedVersion?.createdAt || selectedThread?.updatedAt || selectedThread?.createdAt || '';

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
    ${filtered.length ? `
      <div class="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside class="rounded-2xl border border-white/10 bg-white/5 p-3">
          <div class="mb-3 flex items-center justify-between">
            <h4 class="text-sm font-semibold text-white">기록 목록</h4>
            <span class="text-[10px] text-slate-400">${filtered.length}개</span>
          </div>
          <div class="max-h-[52vh] space-y-2 overflow-y-auto pr-1">
            ${filtered.map((item) => {
              const threadVersions = Array.isArray(item.versions) ? item.versions : [];
              const isActive = item.id === (selectedThread?.id || '');
              return `
                <button type="button" onclick="selectHistoryThread('${escapeHtml(item.id)}')" class="w-full rounded-2xl border p-3 text-left transition-colors ${isActive ? 'border-brand-400/40 bg-brand-500/15' : 'border-white/10 bg-slate-950/30 hover:bg-white/10'}">
                  <div class="flex items-start justify-between gap-3">
                    <div class="min-w-0">
                      <div class="truncate text-sm font-semibold ${isActive ? 'text-brand-100' : 'text-white'}">${escapeHtml(item.title || 'Prompt')}</div>
                      <div class="mt-1 truncate text-[11px] ${isActive ? 'text-brand-100/80' : 'text-slate-400'}">${escapeHtml(item.keyword || item.purpose || '기록')}</div>
                    </div>
                    <span class="rounded-full border px-2 py-0.5 text-[10px] font-semibold ${isActive ? 'border-brand-300/30 bg-brand-500/20 text-brand-50' : 'border-white/10 bg-white/5 text-slate-400'}">v${item.promptCount || threadVersions.length || 1}</span>
                  </div>
                  <div class="mt-2 flex items-center justify-between text-[10px] ${isActive ? 'text-brand-100/75' : 'text-slate-500'}">
                    <span>${escapeHtml(formatTime(item.updatedAt || item.createdAt))}</span>
                    <span>${escapeHtml(item.techniqueName || 'Prompt')}</span>
                  </div>
                </button>
              `;
            }).join('')}
          </div>
        </aside>
        <section class="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div class="flex flex-col gap-3 border-b border-white/10 pb-4 sm:flex-row sm:items-start sm:justify-between">
            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-2">
                <h4 class="truncate text-sm font-semibold text-white">${escapeHtml(selectedThread?.title || 'Prompt')}</h4>
                <span class="rounded-full bg-brand-500/10 px-2 py-0.5 text-[10px] text-brand-200">v${selectedThread?.promptCount || versions.length || 1}</span>
                ${selectedThread?.techniqueName ? `<span class="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-slate-300">${escapeHtml(selectedThread.techniqueName)}</span>` : ''}
              </div>
              <div class="mt-1 text-xs leading-5 text-slate-400">
                ${selectedThread?.keyword ? `<span class="mr-3">키워드: ${escapeHtml(selectedThread.keyword)}</span>` : ''}
                ${selectedThread?.purpose ? `<span class="mr-3">목적: ${escapeHtml(selectedThread.purpose)}</span>` : ''}
                <span>${escapeHtml(formatTime(selectedThread?.updatedAt || selectedThread?.createdAt || ''))}</span>
              </div>
            </div>
            <div class="flex flex-wrap gap-2">
              <button onclick="loadHistoryItem('${escapeHtml(selectedThread?.id || '')}')" class="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-white/10">불러오기</button>
              <button onclick="copyHistoryItem('${escapeHtml(selectedThread?.id || '')}')" class="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-white/10">복사</button>
            </div>
          </div>
          <div class="mt-4 flex flex-wrap gap-2">
            ${versions.length
              ? versions.map((version, index) => {
                  const active = index === selectedVersionIndex;
                  const label = `v${version.versionNumber || versions.length - index}`;
                  const kind = version.kind || 'generate';
                  return `<button type="button" onclick="selectHistoryVersion('${escapeHtml(selectedThread?.id || '')}', ${index})" class="rounded-full border px-3 py-1 text-[10px] font-semibold transition-colors ${active ? 'border-brand-400/40 bg-brand-500/20 text-brand-100' : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:bg-white/10'}">${label} · ${escapeHtml(kind)}${active ? ' · 선택됨' : ''}</button>`;
                }).join('')
              : '<span class="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] text-slate-400">버전 없음</span>'}
          </div>
          <div class="mt-2 text-[11px] text-slate-500">
            <span class="mr-3">선택 버전: ${escapeHtml(selectedVersion ? `v${selectedVersion.versionNumber || selectedVersionIndex + 1}` : '없음')}</span>
            <span>${escapeHtml(formatTime(selectedTime || ''))}</span>
          </div>
          <pre class="mt-3 max-h-[48vh] overflow-y-auto whitespace-pre-wrap rounded-2xl border border-white/10 bg-slate-950/40 p-3 text-xs leading-6 text-slate-300">${escapeHtml(String(selectedPrompt || '').slice(0, 1200))}</pre>
        </section>
      </div>
    ` : '<div class="rounded-2xl border border-dashed border-white/15 bg-white/5 p-6 text-center text-sm leading-7 text-slate-400">아직 저장된 기록이 없습니다. 프롬프트를 생성하면 여기에 자동 저장됩니다.</div>'}
  `;
}

function renderSuggestionBoardContent() {
  const items = loadLocalSuggestions();
  const draft = getSuggestionDraft();
  return `
    <div class="mx-auto grid h-full max-w-7xl gap-4 lg:grid-cols-[1.05fr_0.95fr]">
      <section class="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-6">
        <div class="mb-4 flex items-center justify-between gap-3">
          <div>
            <div class="text-[10px] uppercase tracking-[0.2em] text-slate-400">건의 작성</div>
            <h2 class="mt-1 text-xl font-bold text-white">자유롭게 수정 요청을 남겨주세요</h2>
            <p class="mt-1 text-sm leading-6 text-slate-300">버그, 개선, 기능 제안, 문구 수정 요청까지 모두 받을 수 있습니다.</p>
          </div>
          <span class="rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-semibold text-emerald-200">무료 게시판</span>
        </div>
        <div class="space-y-4">
          <div>
            <label class="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">건의 제목</label>
            <input id="suggestion-title" type="text" value="${escapeHtml(draft.title || '')}" placeholder="예: 결과 버튼 대비 개선 요청"
              class="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/10" />
          </div>
          <div>
            <label class="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">건의 내용</label>
            <textarea id="suggestion-text" rows="10" placeholder="어떤 부분이 불편했는지, 무엇을 바꾸면 좋은지 편하게 적어주세요."
              class="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm leading-7 text-white placeholder:text-slate-500 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/10">${escapeHtml(draft.text || '')}</textarea>
          </div>
          <div class="flex flex-col gap-2 sm:flex-row">
            <button onclick="submitSuggestion()" class="flex-1 rounded-2xl bg-brand-600 px-5 py-3 font-semibold text-white hover:bg-brand-500">건의 제출</button>
            <button onclick="clearSuggestionDraft()" class="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-semibold text-slate-200 hover:bg-white/10">초안 지우기</button>
          </div>
          <div class="rounded-2xl border border-dashed border-white/15 bg-white/5 p-4 text-sm leading-7 text-slate-400">
            제출된 건의는 로컬에 저장되고, 관리자 대시보드에도 표시됩니다.
          </div>
        </div>
      </section>
      <section class="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-6">
        <div class="mb-4 flex items-center justify-between gap-3">
          <div>
            <div class="text-[10px] uppercase tracking-[0.2em] text-slate-400">최근 건의</div>
            <h3 class="mt-1 text-lg font-bold text-white">내가 남긴 건의 목록</h3>
          </div>
          <span class="text-xs text-slate-400">${items.length}개</span>
        </div>
        <div class="space-y-3">
          ${items.length ? items.slice(0, 12).map((item) => `
            <article class="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <div class="text-sm font-semibold text-white">${escapeHtml(item.title || '건의사항')}</div>
                  <div class="mt-1 text-[11px] text-slate-500">${escapeHtml(formatTime(item.createdAt))} · ${escapeHtml(item.status || '접수됨')}</div>
                </div>
                <button onclick="copySuggestionText('${escapeHtml(item.id)}')" class="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-white/10">복사</button>
              </div>
              <p class="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-300">${escapeHtml(item.text || '')}</p>
            </article>
          `).join('') : '<div class="rounded-2xl border border-dashed border-white/15 bg-white/5 p-6 text-center text-sm leading-7 text-slate-400">아직 건의가 없습니다. 왼쪽에서 첫 건의를 남겨보세요.</div>'}
        </div>
      </section>
    </div>
  `;
}
