function normalizeAdminPeriod(period) {
  const value = String(period || 'all').toLowerCase();
  if (value === '7d' || value === 'recent-7d') return '7d';
  if (value === 'month' || value === 'this-month') return 'month';
  return 'all';
}

function getAdminPeriodLabel(period) {
  const value = normalizeAdminPeriod(period);
  if (value === '7d') return '최근 7일';
  if (value === 'month') return '이번 달';
  return '전체';
}

function getAdminPeriodStart(period) {
  const now = new Date();
  const value = normalizeAdminPeriod(period);
  if (value === '7d') return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
  if (value === 'month') return new Date(now.getFullYear(), now.getMonth(), 1);
  return null;
}

function isWithinAdminPeriod(value, period) {
  const start = getAdminPeriodStart(period);
  if (!start) return true;
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return false;
  return date >= start;
}

function filterAdminRecords(records, period) {
  return (records || []).filter((item) => isWithinAdminPeriod(item?.createdAt || item?.updatedAt || item?.timestamp, period));
}

function escapeCsvCell(value) {
  return `"${String(value ?? '').replace(/"/g, '""')}"`;
}

function buildTrainingSampleCsv(samples) {
  const rows = [
    ['createdAt', 'kind', 'source', 'techniqueName', 'techniqueId', 'purpose', 'keyword', 'workflowState', 'visitorId', 'sessionId', 'inputRaw', 'generatedPrompt', 'outputText', 'score', 'grade', 'notes'],
  ];
  (samples || []).forEach((sample) => {
    const quality = sample.quality || {};
    const notes = Array.isArray(quality.suggestions) ? quality.suggestions.join(' | ') : '';
    rows.push([
      sample.createdAt || '',
      sample.kind || '',
      sample.source || '',
      sample.techniqueName || '',
      sample.techniqueId || '',
      sample.purpose || '',
      sample.keyword || '',
      sample.workflowState || '',
      sample.visitorId || '',
      sample.sessionId || '',
      sample.inputRaw || '',
      sample.generatedPrompt || '',
      sample.outputText || '',
      quality.percentage ?? '',
      quality.grade || '',
      notes,
    ]);
  });
  return rows.map((row) => row.map(escapeCsvCell).join(',')).join('\n');
}

function downloadCsv(filename, csvText) {
  const blob = new Blob([`\ufeff${csvText}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

function getFilteredTrainingSamples(samples) {
  const search = String(document.getElementById('training-search')?.value || '').trim().toLowerCase();
  const kind = String(document.getElementById('training-kind-filter')?.value || 'all');
  const source = String(document.getElementById('training-source-filter')?.value || 'all');
  return (samples || []).filter((sample) => {
    if (kind !== 'all' && String(sample.kind || '') !== kind) return false;
    if (source !== 'all' && String(sample.source || '') !== source) return false;
    if (!search) return true;
    const haystack = [
      sample.kind,
      sample.source,
      sample.techniqueName,
      sample.techniqueId,
      sample.purpose,
      sample.keyword,
      sample.workflowState,
      sample.inputRaw,
      sample.generatedPrompt,
      sample.outputText,
    ].join(' ').toLowerCase();
    return haystack.includes(search);
  });
}

function refreshTrainingSamplesSection() {
  const container = document.getElementById('training-samples-section');
  if (!container || !window.__adminLogsCache?.trainingSamples) return;
  container.innerHTML = renderTrainingSamplesSection(window.__adminLogsCache.trainingSamples);
  const search = document.getElementById('training-search');
  const kind = document.getElementById('training-kind-filter');
  const source = document.getElementById('training-source-filter');
  const rerender = () => refreshTrainingSamplesSection();
  search?.addEventListener('input', rerender);
  kind?.addEventListener('change', rerender);
  source?.addEventListener('change', rerender);
}

function exportTrainingSamplesCsv() {
  const samples = window.__adminLogsCache?.trainingSamples || [];
  const filtered = getFilteredTrainingSamples(samples);
  if (!filtered.length) {
    alert('내보낼 학습 샘플이 없습니다.');
    return;
  }
  const csv = buildTrainingSampleCsv(filtered);
  downloadCsv(`promptbuilder-training-samples-${new Date().toISOString().slice(0, 10)}.csv`, csv);
}

function renderTrainingSamplesSection(trainingSamples) {
  const filtered = getFilteredTrainingSamples(trainingSamples);
  const kinds = Array.from(new Set((trainingSamples || []).map((item) => String(item.kind || '').trim()).filter(Boolean))).sort();
  const sources = Array.from(new Set((trainingSamples || []).map((item) => String(item.source || '').trim()).filter(Boolean))).sort();
  const cards = filtered.length
    ? filtered.slice(0, 12).map((entry) => `
      <article class="admin-record-card rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <div class="text-sm font-semibold text-slate-900">${escapeHtml(entry.kind || 'generate')}</div>
            <div class="mt-1 text-[11px] text-slate-500">
              ${entry.visitorId ? `visitor: ${escapeHtml(entry.visitorId)}` : 'anonymous'}
              ${entry.techniqueName ? ` · ${escapeHtml(entry.techniqueName)}` : ''}
            </div>
          </div>
          <span class="text-[10px] text-slate-500">${formatTime(entry.createdAt)}</span>
        </div>
        <p class="mt-3 line-clamp-2 text-xs leading-6 text-slate-600">${escapeHtml(entry.generatedPrompt || '')}</p>
      </article>
    `).join('')
    : '<div class="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-center text-sm leading-7 text-slate-500">조건에 맞는 학습 샘플이 없습니다.</div>';

  return `
    <section class="admin-panel rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div class="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div class="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">학습 샘플</div>
          <h4 class="mt-1 text-lg font-bold text-slate-900">학습 샘플 관리</h4>
          <p class="mt-1 text-sm text-slate-500">생성, 개선, 최적화 결과를 검색하고 CSV로 내보낼 수 있습니다.</p>
        </div>
        <div class="flex flex-wrap gap-2">
          <button onclick="exportTrainingSamplesCsv()" class="admin-action-btn rounded-2xl border border-brand-200 bg-brand-50 px-4 py-2.5 text-xs font-semibold text-brand-700 transition-colors hover:bg-brand-100">
            CSV 다운로드
          </button>
        </div>
      </div>

      <div class="grid gap-3 lg:grid-cols-3">
        <input id="training-search" type="search" placeholder="키워드, 목적, 기술명, 본문 검색"
          class="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-400 focus:outline-none focus:ring-4 focus:ring-brand-500/10" />
        <select id="training-kind-filter" class="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-brand-400 focus:outline-none focus:ring-4 focus:ring-brand-500/10">
          <option value="all">모든 종류</option>
          ${kinds.map((kind) => `<option value="${escapeHtml(kind)}">${escapeHtml(kind)}</option>`).join('')}
        </select>
        <select id="training-source-filter" class="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-brand-400 focus:outline-none focus:ring-4 focus:ring-brand-500/10">
          <option value="all">모든 출처</option>
          ${sources.map((source) => `<option value="${escapeHtml(source)}">${escapeHtml(source)}</option>`).join('')}
        </select>
      </div>

      <div class="mt-3 text-[11px] text-slate-500">
        총 ${trainingSamples.length}개 중 ${filtered.length}개 표시
      </div>

      <div id="training-samples-list" class="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        ${cards}
      </div>
    </section>
  `;
}

function renderSuggestionAdminSection(entries) {
  const suggestions = Array.isArray(entries) ? entries : [];
  const cards = suggestions.length
    ? suggestions.slice(0, 20).map((entry) => `
      <article class="admin-record-card rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <div class="text-sm font-semibold text-slate-900">${escapeHtml(entry.title || entry.meta?.title || '제안')}</div>
            <div class="mt-1 text-[11px] text-slate-500">
              ${entry.visitorId ? `visitor: ${escapeHtml(entry.visitorId)}` : 'anonymous'}
              ${entry.sessionId ? ` · session: ${escapeHtml(entry.sessionId)}` : ''}
            </div>
          </div>
          <span class="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">${escapeHtml(formatTime(entry.createdAt))}</span>
        </div>
        <p class="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-600">${escapeHtml(entry.text || entry.meta?.text || '')}</p>
      </article>
    `).join('')
    : '<div class="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50 p-5 text-center text-sm leading-7 text-slate-500">아직 접수된 제안이 없습니다.</div>';

  return `
    <section data-admin-section="admin-suggestions" class="admin-panel rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div class="mb-4 flex items-center justify-between gap-3">
        <div>
          <div class="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">제안</div>
          <h3 class="mt-1 text-lg font-bold text-slate-900">사용자 제안</h3>
        </div>
        <span class="text-xs text-slate-500">${suggestions.length} items</span>
      </div>
      <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">${cards}</div>
    </section>
  `;
}

function getAdminDashboardPeriod() {
  return normalizeAdminPeriod(window.__adminDashboardPeriod || 'all');
}

function setAdminDashboardPeriod(period) {
  window.__adminDashboardPeriod = normalizeAdminPeriod(period);
  showAdminDashboard();
}

function countBy(items, mapper) {
  const counts = new Map();
  (items || []).forEach((item) => {
    const key = String(mapper(item) || '').trim();
    if (!key) return;
    counts.set(key, (counts.get(key) || 0) + 1);
  });
  return Array.from(counts.entries())
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count || a.key.localeCompare(b.key, 'ko'));
}

function formatCompactNumber(value) {
  return new Intl.NumberFormat('ko-KR').format(Number(value || 0));
}

function getGradeBadgeClass(grade) {
  const value = String(grade || '').toUpperCase();
  if (value === 'S' || value === 'A') return 'admin-grade admin-grade-good';
  if (value === 'B') return 'admin-grade admin-grade-mid';
  if (value === 'C') return 'admin-grade admin-grade-warn';
  return 'admin-grade admin-grade-bad';
}

function renderMetricCard({ label, value, hint, icon, tone = 'brand' }) {
  return `
    <article class="admin-metric-card rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
      <div class="flex items-start justify-between gap-4">
        <div class="min-w-0">
          <div class="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">${escapeHtml(label)}</div>
          <div class="mt-2 text-3xl font-black tracking-tight text-slate-900">${escapeHtml(value)}</div>
          <div class="mt-1 text-sm text-slate-500">${escapeHtml(hint)}</div>
        </div>
        <div class="admin-metric-icon admin-metric-icon-${tone}">
          <i class="fas ${icon} text-base"></i>
        </div>
      </div>
    </article>
  `;
}

function renderSummaryListCard(title, items, emptyText) {
  const max = Math.max(...(items || []).map((item) => Number(item.count || 0)), 0);
  const body = (items || []).length
    ? items.slice(0, 5).map((item) => `
      <div class="grid grid-cols-[1fr_auto] gap-4">
        <div>
          <div class="mb-2 text-sm font-medium text-slate-700">${escapeHtml(item.key)}</div>
          <div class="h-2 overflow-hidden rounded-full bg-slate-100">
            <div class="h-full rounded-full bg-brand-500" style="width:${max ? Math.max(10, Math.round((Number(item.count || 0) / max) * 100)) : 10}%"></div>
          </div>
        </div>
        <div class="text-sm font-semibold text-slate-700">${formatCompactNumber(item.count)}</div>
      </div>
    `).join('')
    : `<div class="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">${escapeHtml(emptyText)}</div>`;

  return `
    <section class="admin-panel rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
      <div class="mb-4 flex items-center justify-between">
        <h3 class="text-sm font-bold text-slate-900">${escapeHtml(title)}</h3>
        <span class="text-[10px] text-slate-400">${(items || []).length} items</span>
      </div>
      <div class="space-y-4">${body}</div>
    </section>
  `;
}

function renderScrollableSection({ id, title, subtitle, countLabel, contentHtml }) {
  return `
    <section data-admin-section="${id}" class="admin-panel rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div class="mb-4 flex items-start justify-between gap-3">
        <div>
          <div class="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">${escapeHtml(title)}</div>
          <h3 class="mt-1 text-lg font-bold text-slate-900">${escapeHtml(subtitle)}</h3>
        </div>
        <span class="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-600">${escapeHtml(countLabel)}</span>
      </div>
      <div class="max-h-[34rem] space-y-3 overflow-y-auto pr-1">
        ${contentHtml}
      </div>
    </section>
  `;
}

function renderRecordCards(entries, type) {
  if (!entries.length) {
    return '<div class="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-center text-sm leading-7 text-slate-500">표시할 항목이 없습니다.</div>';
  }
  return entries.slice(0, 12).map((entry) => {
    const time = formatTime(entry.createdAt || entry.updatedAt || entry.timestamp || '');
    if (type === 'thread') {
      const versionCount = Number(entry.promptCount || (entry.versions || []).length || 0);
      return `
        <article class="admin-record-card rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <div class="truncate text-sm font-semibold text-slate-900">${escapeHtml(entry.title || '프롬프트 스레드')}</div>
              <div class="mt-1 text-[11px] text-slate-500">
                ${entry.visitorId ? `visitor: ${escapeHtml(entry.visitorId)}` : 'anonymous'}
                ${entry.keyword ? ` · keyword: ${escapeHtml(entry.keyword)}` : ''}
                ${entry.techniqueName ? ` · ${escapeHtml(entry.techniqueName)}` : ''}
              </div>
            </div>
            <span class="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-semibold text-brand-700">v${versionCount || 0}</span>
          </div>
          <p class="mt-3 line-clamp-3 text-xs leading-6 text-slate-600">${escapeHtml(entry.latestPrompt || '')}</p>
          <div class="mt-3 text-[10px] text-slate-400">${escapeHtml(time)}</div>
        </article>
      `;
    }
    if (type === 'activity') {
      return `
        <article class="admin-record-card flex items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <div>
            <div class="text-sm font-semibold text-slate-900">${escapeHtml(entry.actionType || 'UNKNOWN')}</div>
            <div class="mt-1 text-[11px] text-slate-500">
              ${entry.visitorId ? escapeHtml(entry.visitorId) : 'anonymous'}
              ${entry.techniqueId ? ` · ${escapeHtml(entry.techniqueId)}` : ''}
            </div>
          </div>
          <div class="text-[10px] text-slate-400">${escapeHtml(time)}</div>
        </article>
      `;
    }
    return `
      <article class="admin-record-card rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <div class="truncate text-sm font-semibold text-slate-900">${escapeHtml(entry.technique || entry.techniqueId || '프롬프트')}</div>
            <div class="mt-1 text-[11px] text-slate-500">
              ${entry.visitorId ? `visitor: ${escapeHtml(entry.visitorId)}` : 'anonymous'}
              ${entry.keyword ? ` · keyword: ${escapeHtml(entry.keyword)}` : ''}
              ${entry.score !== undefined ? ` · score: ${escapeHtml(entry.score)}%` : ''}
            </div>
          </div>
          <span class="${getGradeBadgeClass(entry.grade || entry.quality?.grade || 'C')}">${escapeHtml(entry.grade || entry.quality?.grade || 'C')}</span>
        </div>
        <p class="mt-3 line-clamp-3 text-xs leading-6 text-slate-600">${escapeHtml(entry.prompt || '')}</p>
        <div class="mt-3 text-[10px] text-slate-400">${escapeHtml(time)}</div>
      </article>
    `;
  }).join('');
}

function getAdminDashboardView(data) {
  const period = getAdminDashboardPeriod();
  const promptLogs = filterAdminRecords(data?.promptLogs || [], period);
  const activityLogs = filterAdminRecords(data?.activityLogs || [], period);
  const promptThreads = filterAdminRecords(data?.promptThreads || [], period);
  const suggestions = filterAdminRecords(data?.suggestions || [], period);
  const trainingSamples = filterAdminRecords(data?.trainingSamples || [], period);
  const uniqueVisitors = new Set([
    ...promptLogs,
    ...activityLogs,
    ...promptThreads,
    ...suggestions,
    ...trainingSamples,
  ].map((item) => String(item?.visitorId || '').trim()).filter(Boolean)).size;
  const scores = promptLogs
    .map((entry) => Number(entry?.score ?? entry?.quality?.percentage))
    .filter((value) => Number.isFinite(value));
  const averageScore = scores.length
    ? Math.round((scores.reduce((sum, value) => sum + value, 0) / scores.length) * 10) / 10
    : 0;
  const gradeCounts = countBy(promptLogs, (entry) => String(entry?.grade || entry?.quality?.grade || '미분류').toUpperCase());
  const topGrade = gradeCounts[0]?.key || '미분류';
  const topTechniques = countBy(promptLogs, (entry) => String(entry?.techniqueName || entry?.techniqueId || '기법 없음').trim());
  const topPurposes = countBy(promptLogs, (entry) => String(entry?.purpose || '목적 없음').trim());
  const topActivityTypes = countBy(activityLogs, (entry) => String(entry?.actionType || 'UNKNOWN').trim());
  const copyCount = data?.stats?.copyCount ?? 0;
  const downloadCount = data?.stats?.downloadCount ?? 0;

  return {
    period,
    promptLogs,
    activityLogs,
    promptThreads,
    suggestions,
    trainingSamples,
    uniqueVisitors,
    averageScore,
    topGrade,
    gradeCounts,
    topTechniques,
    topPurposes,
    topActivityTypes,
    copyCount,
    downloadCount,
  };
}

function renderAdminPanelV2(data) {
  const view = getAdminDashboardView(data);
  const activeSection = String(window.__adminDashboardSection || 'admin-overview');
  const periodLabel = getAdminPeriodLabel(view.period);
  const sectionMeta = {
    'admin-overview': { title: '대시보드', subtitle: '테넌트 현황을 한눈에 확인합니다', count: `${periodLabel} 기준` },
    'admin-prompt-logs': { title: '프롬프트 로그', subtitle: '최근 생성 기록', count: `${view.promptLogs.length}개` },
    'admin-history-threads': { title: '히스토리', subtitle: '버전이 쌓인 기록', count: `${view.promptThreads.length}개` },
    'admin-suggestions': { title: '사용자 제안', subtitle: '접수된 제안과 요청', count: `${view.suggestions.length}개` },
    'admin-training-samples': { title: '학습 샘플', subtitle: '검색과 CSV 내보내기', count: `${view.trainingSamples.length}개` },
    'admin-activity-logs': { title: '활동 로그', subtitle: '사용자 행동 추적', count: `${view.activityLogs.length}개` },
  };
  const meta = sectionMeta[activeSection] || sectionMeta['admin-overview'];
  const topButtons = [
    ['all', '전체'],
    ['7d', '최근 7일'],
    ['month', '이번 달'],
  ].map(([value, label]) => {
    const active = value === view.period;
    return `
      <button
        type="button"
        onclick="setAdminDashboardPeriod('${value}')"
        class="admin-filter-btn rounded-2xl border px-4 py-2.5 text-sm font-semibold transition-colors ${active ? 'border-brand-500 bg-brand-600 text-white shadow-sm shadow-brand-500/20' : 'border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300 hover:bg-slate-100 hover:text-slate-700'}"
      >
        ${escapeHtml(label)}
      </button>
    `;
  }).join('');

  const summaryCards = `
    <section class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      ${renderMetricCard({ label: '고유 방문자', value: formatCompactNumber(view.uniqueVisitors), hint: '선택한 기간 기준', icon: 'fa-users', tone: 'brand' })}
      ${renderMetricCard({ label: '프롬프트 기록', value: formatCompactNumber(view.promptLogs.length), hint: '생성된 프롬프트 로그', icon: 'fa-file-lines', tone: 'green' })}
      ${renderMetricCard({ label: '히스토리 스레드', value: formatCompactNumber(view.promptThreads.length), hint: '버전 단위 기록', icon: 'fa-clock-rotate-left', tone: 'amber' })}
      ${renderMetricCard({ label: '활동 로그', value: formatCompactNumber(view.activityLogs.length), hint: '사용자 행동 이벤트', icon: 'fa-bolt', tone: 'rose' })}
      ${renderMetricCard({ label: '제안', value: formatCompactNumber(view.suggestions.length), hint: '접수된 피드백', icon: 'fa-message', tone: 'slate' })}
      ${renderMetricCard({ label: '평균 점수', value: view.averageScore ? `${view.averageScore}점` : '0점', hint: `최고 등급: ${view.topGrade}`, icon: 'fa-gauge-high', tone: 'brand' })}
    </section>
  `;

  const overviewBody = `
    <div class="space-y-4">
      <section class="grid gap-4 xl:grid-cols-3">
        ${renderSummaryListCard('상위 프롬프트 기법', view.topTechniques, '기법 데이터가 없습니다.')}
        ${renderSummaryListCard('자주 쓰는 목적', view.topPurposes, '목적 데이터가 없습니다.')}
        ${renderSummaryListCard('행동 패턴', view.topActivityTypes, '행동 데이터가 없습니다.')}
      </section>
      <section class="grid gap-4 xl:grid-cols-2">
        ${renderScrollableSection({
          id: 'admin-prompt-logs',
          title: '프롬프트 로그',
          subtitle: '최근 생성 기록',
          countLabel: `${view.promptLogs.length}개`,
          contentHtml: renderRecordCards(view.promptLogs, 'prompt'),
        })}
        ${renderScrollableSection({
          id: 'admin-history-threads',
          title: '히스토리',
          subtitle: '버전이 쌓인 기록',
          countLabel: `${view.promptThreads.length}개`,
          contentHtml: renderRecordCards(view.promptThreads, 'thread'),
        })}
      </section>
      <section class="grid gap-4 xl:grid-cols-2">
        ${renderScrollableSection({
          id: 'admin-activity-logs',
          title: '활동 로그',
          subtitle: '사용자 행동 추적',
          countLabel: `${view.activityLogs.length}개`,
          contentHtml: renderRecordCards(view.activityLogs, 'activity'),
        })}
        <div data-admin-section="admin-training-samples">
          ${renderTrainingSamplesSection(view.trainingSamples)}
        </div>
      </section>
    </div>
  `;

  const promptBody = `
    ${renderScrollableSection({
      id: 'admin-prompt-logs',
      title: '프롬프트 로그',
      subtitle: '최근 생성 기록',
      countLabel: `${view.promptLogs.length}개`,
      contentHtml: renderRecordCards(view.promptLogs, 'prompt'),
    })}
  `;

  const historyBody = `
    ${renderScrollableSection({
      id: 'admin-history-threads',
      title: '히스토리',
      subtitle: '버전이 쌓인 기록',
      countLabel: `${view.promptThreads.length}개`,
      contentHtml: renderRecordCards(view.promptThreads, 'thread'),
    })}
  `;

  const suggestionBody = renderSuggestionAdminSection(view.suggestions);

  const trainingBody = `
    <div data-admin-section="admin-training-samples">
      ${renderTrainingSamplesSection(view.trainingSamples)}
    </div>
  `;

  const activityBody = `
    ${renderScrollableSection({
      id: 'admin-activity-logs',
      title: '활동 로그',
      subtitle: '사용자 행동 추적',
      countLabel: `${view.activityLogs.length}개`,
      contentHtml: renderRecordCards(view.activityLogs, 'activity'),
    })}
  `;

  const sectionBodyMap = {
    'admin-overview': overviewBody,
    'admin-prompt-logs': promptBody,
    'admin-history-threads': historyBody,
    'admin-suggestions': suggestionBody,
    'admin-training-samples': trainingBody,
    'admin-activity-logs': activityBody,
  };

  return `
    <div class="space-y-6 p-5 sm:p-6">
      <section class="admin-hero rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div class="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div class="max-w-3xl">
            <div class="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-[11px] font-semibold text-brand-700">
              <i class="fas fa-chart-column"></i>
              프롬프트 관리 센터
            </div>
            <h1 class="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">프로젝트 현황을 한눈에 확인합니다</h1>
            <p class="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
              기록은 아래로 길게 내리지 않고, 왼쪽 탭으로 전환해서 바로 확인할 수 있습니다.
              선택한 기간 기준으로 핵심 수치와 상세 로그를 빠르게 탐색하세요.
            </p>
          </div>
          <div class="flex flex-col gap-3 xl:items-end">
            <div class="flex flex-wrap gap-2">${topButtons}</div>
            <div class="flex flex-wrap gap-2">
              <button type="button" onclick="reloadAdminDashboard()" class="admin-action-btn rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900">
                새로고침
              </button>
              <button type="button" onclick="closeAdminDashboard()" class="admin-action-btn rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900">
                닫기
              </button>
            </div>
          </div>
        </div>
        <div class="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span class="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-600">기준: ${escapeHtml(periodLabel)}</span>
          <span>왼쪽 메뉴를 누르면 화면이 바뀝니다.</span>
        </div>
      </section>

      ${summaryCards}

      <section class="rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div class="mb-4 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div class="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">${escapeHtml(meta.title)}</div>
            <h2 class="mt-1 text-xl font-bold text-slate-900">${escapeHtml(meta.subtitle)}</h2>
          </div>
          <span class="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-600">${escapeHtml(meta.count)}</span>
        </div>
        ${sectionBodyMap[activeSection] || overviewBody}
      </section>
    </div>
  `;
}

function renderAdminDashboardShell(contentHtml) {
  const navItems = [
    { id: 'admin-overview', icon: 'fa-chart-column', label: '대시보드', hint: '전체 현황' },
    { id: 'admin-prompt-logs', icon: 'fa-file-lines', label: '프롬프트 로그', hint: '생성 기록' },
    { id: 'admin-history-threads', icon: 'fa-clock-rotate-left', label: '히스토리', hint: '버전 탐색' },
    { id: 'admin-suggestions', icon: 'fa-message', label: '제안', hint: '피드백 수집' },
    { id: 'admin-training-samples', icon: 'fa-database', label: '학습 샘플', hint: 'CSV 추출' },
    { id: 'admin-activity-logs', icon: 'fa-bolt', label: '활동 로그', hint: '행동 흐름' },
  ];
  const activeSection = String(window.__adminDashboardSection || 'admin-overview');
  const navHtml = navItems.map((item) => {
    const active = item.id === activeSection;
    return `
      <button
        type="button"
        onclick="setAdminDashboardSection('${item.id}')"
        class="admin-nav-btn group flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-colors ${active ? 'admin-nav-btn-active' : ''}"
      >
        <span class="admin-nav-icon">
          <i class="fas ${item.icon} text-sm"></i>
        </span>
        <span class="min-w-0">
          <span class="block text-sm font-semibold">${escapeHtml(item.label)}</span>
          <span class="block text-xs">${escapeHtml(item.hint)}</span>
        </span>
      </button>
    `;
  }).join('');

  return `
    <div class="admin-shell mx-auto flex h-full max-w-[1680px] flex-col gap-4 p-4 sm:p-6 lg:flex-row">
      <aside class="admin-sidebar w-full shrink-0 flex-col overflow-hidden rounded-[30px] border shadow-[0_20px_60px_rgba(15,23,42,0.08)] lg:w-72">
        <div class="admin-sidebar-top border-b px-6 py-5">
          <div class="flex items-center gap-3">
            <div class="admin-logo flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-lg shadow-brand-500/20">
              <i class="fas fa-rocket"></i>
            </div>
            <div>
              <div class="text-base font-bold">PromptBuilder</div>
              <div class="text-xs opacity-70">관리자 대시보드</div>
            </div>
          </div>
        </div>

        <div class="flex-1 px-3 py-4">
          <div class="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.24em] opacity-60">메뉴</div>
          <div class="grid gap-2 sm:grid-cols-2 lg:block lg:space-y-1 lg:gap-0">${navHtml}</div>
        </div>

        <div class="border-t p-4">
          <button type="button" onclick="logoutAdminDashboard()" class="admin-danger-btn flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition-colors">
            <i class="fas fa-right-from-bracket"></i>
            로그아웃
          </button>
          <button type="button" onclick="closeAdminDashboard()" class="admin-close-btn mt-3 flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition-colors">
            <i class="fas fa-xmark"></i>
            닫기
          </button>
        </div>
      </aside>

      <main class="min-w-0 flex-1">
        <div class="admin-main rounded-[30px] border shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          ${contentHtml}
        </div>
      </main>
    </div>
  `;
}

function scrollAdminSection(sectionId) {
  setAdminDashboardSection(sectionId);
}

function setAdminDashboardSection(sectionId) {
  window.__adminDashboardSection = String(sectionId || 'admin-overview');
  const content = document.getElementById('admin-dashboard-content');
  if (content && window.__adminLogsCache) {
    content.innerHTML = renderAdminDashboardShell(renderAdminPanelV2(window.__adminLogsCache));
    refreshTrainingSamplesSection();
    return;
  }
  showAdminDashboard();
}

function logoutAdminDashboard() {
  clearAdminToken();
  closeAdminDashboard();
}

window.scrollAdminSection = scrollAdminSection;
window.setAdminDashboardSection = setAdminDashboardSection;
window.logoutAdminDashboard = logoutAdminDashboard;
