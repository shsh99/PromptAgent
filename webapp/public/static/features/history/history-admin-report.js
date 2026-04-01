function renderAdminDashboardShell(contentHtml) {
  return `
    <div class="mx-auto h-full max-w-7xl overflow-y-auto rounded-3xl border border-white/10 bg-slate-950/70 p-4 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-6">
      ${contentHtml}
    </div>
  `;
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

function renderTrainingSamplesSection(trainingSamples) {
  const filtered = getFilteredTrainingSamples(trainingSamples);
  const kinds = Array.from(new Set((trainingSamples || []).map((item) => String(item.kind || '').trim()).filter(Boolean))).sort();
  const sources = Array.from(new Set((trainingSamples || []).map((item) => String(item.source || '').trim()).filter(Boolean))).sort();
  const cards = filtered.length
    ? filtered.slice(0, 12).map((entry) => `
      <div class="rounded-xl border border-cyan-500/15 bg-cyan-500/5 p-4">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <div class="text-sm font-semibold text-white">${escapeHtml(entry.kind || 'generate')}</div>
            <div class="mt-1 text-[11px] text-gray-500">
              ${entry.visitorId ? `visitor: ${escapeHtml(entry.visitorId)}` : 'anonymous'}
              ${entry.techniqueName ? ` · ${escapeHtml(entry.techniqueName)}` : ''}
            </div>
          </div>
          <span class="text-[10px] text-gray-600">${formatTime(entry.createdAt)}</span>
        </div>
        <p class="mt-3 line-clamp-2 text-xs leading-6 text-gray-400">${escapeHtml(entry.generatedPrompt || '')}</p>
      </div>
    `).join('')
    : '<div class="rounded-2xl border border-dashed border-cyan-500/20 bg-cyan-500/5 p-5 text-center text-sm leading-7 text-slate-400">조건에 맞는 학습 샘플이 없습니다.</div>';

  return `
    <section class="rounded-2xl border border-gray-800 bg-gray-950/60 p-4">
      <div class="mb-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h4 class="text-sm font-semibold text-white">학습 샘플</h4>
          <p class="mt-1 text-[11px] text-gray-500">생성, 개선, 최적화 결과를 검색하고 CSV로 내려받을 수 있습니다.</p>
        </div>
        <div class="flex flex-wrap gap-2">
          <button onclick="exportTrainingSamplesCsv()" class="rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-3 py-2 text-xs font-semibold text-cyan-200 hover:bg-cyan-500/15">CSV 다운로드</button>
        </div>
      </div>
      <div class="grid gap-2 sm:grid-cols-3">
        <input id="training-search" type="search" placeholder="기술, 키워드, 목적, 본문 검색"
          class="rounded-2xl border border-gray-800 bg-gray-900/70 px-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/10" />
        <select id="training-kind-filter" class="rounded-2xl border border-gray-800 bg-gray-900/70 px-4 py-2.5 text-sm text-white focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/10">
          <option value="all">모든 종류</option>
          ${kinds.map((kind) => `<option value="${escapeHtml(kind)}">${escapeHtml(kind)}</option>`).join('')}
        </select>
        <select id="training-source-filter" class="rounded-2xl border border-gray-800 bg-gray-900/70 px-4 py-2.5 text-sm text-white focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/10">
          <option value="all">모든 출처</option>
          ${sources.map((source) => `<option value="${escapeHtml(source)}">${escapeHtml(source)}</option>`).join('')}
        </select>
      </div>
      <div class="mt-3 text-[11px] text-gray-500">
        총 ${trainingSamples.length}개 중 ${filtered.length}개 표시
      </div>
      <div id="training-samples-list" class="mt-3 space-y-3">
        ${cards}
      </div>
    </section>
  `;
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

function renderSuggestionAdminSection(activityLogs) {
  const suggestionLogs = (activityLogs || []).filter((entry) => String(entry.actionType || '').toUpperCase() === 'SUGGESTION_SUBMIT');
  const cards = suggestionLogs.length
    ? suggestionLogs.slice(0, 20).map((entry) => `
      <div class="rounded-2xl border border-emerald-500/15 bg-emerald-500/5 p-4">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <div class="text-sm font-semibold text-white">${escapeHtml(entry.meta?.title || '건의사항')}</div>
            <div class="mt-1 text-[11px] text-slate-500">
              ${entry.visitorId ? `visitor: ${escapeHtml(entry.visitorId)}` : 'anonymous'}
              ${entry.sessionId ? ` · session: ${escapeHtml(entry.sessionId)}` : ''}
            </div>
          </div>
          <span class="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-200">${escapeHtml(formatTime(entry.createdAt))}</span>
        </div>
        <p class="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-300">${escapeHtml(entry.meta?.text || '')}</p>
      </div>
    `).join('')
    : '<div class="rounded-2xl border border-dashed border-emerald-500/20 bg-emerald-500/5 p-5 text-center text-sm leading-7 text-slate-400">아직 접수된 건의가 없습니다.</div>';

  return `
    <section class="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-6">
      <div class="mb-4 flex items-center justify-between gap-3">
        <div>
          <div class="text-[10px] uppercase tracking-[0.2em] text-slate-400">건의사항</div>
          <h3 class="mt-1 text-lg font-bold text-white">접수된 건의사항</h3>
        </div>
        <span class="text-xs text-slate-400">${suggestionLogs.length} items</span>
      </div>
      <div class="space-y-3">
        ${cards}
      </div>
    </section>
  `;
}

