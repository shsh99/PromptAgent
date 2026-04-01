function renderOptimizeResult(data) {
  setOptimizeText('optimize-score', data.score ?? 0);
  setOptimizeText('optimize-status', data.issues?.length ? '개선 필요' : '반복 가능');
  setOptimizeText('optimize-improved-prompt', data.improvedPrompt || '');
  const issues = data.issues || [];
  const improvements = data.improvements || [];
  const issueHtml = `
    <div class="rounded-2xl bg-gray-50 p-3">
      <div class="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-2">문제점</div>
      <div class="space-y-1">
        ${issues.length ? issues.map((issue) => `<div class="flex items-start gap-2 text-sm text-gray-700"><i class="fas fa-circle-xmark mt-0.5 text-red-500"></i><span>${escapeHtml(issue)}</span></div>`).join('') : '<div class="text-sm text-gray-500">감지된 문제점이 없습니다.</div>'}
      </div>
    </div>
    <div class="rounded-2xl bg-gray-50 p-3">
      <div class="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-2">개선안</div>
      <div class="space-y-1">
        ${improvements.length ? improvements.map((item) => `<div class="flex items-start gap-2 text-sm text-gray-700"><i class="fas fa-arrow-right mt-0.5 text-brand-600"></i><span>${escapeHtml(item)}</span></div>`).join('') : '<div class="text-sm text-gray-500">아직 개선안이 없습니다.</div>'}
      </div>
    </div>
    <div class="rounded-2xl bg-brand-50 p-3">
      <div class="text-[10px] uppercase tracking-[0.2em] text-brand-600 mb-2">다음 실행</div>
      <div class="text-sm text-brand-900">${escapeHtml(data.nextAction || '수정한 프롬프트로 다시 실행해 보세요.')}</div>
    </div>
  `;
  const issueContainer = getOptimizeEl('optimize-issues');
  if (issueContainer) issueContainer.innerHTML = issueHtml;

  const session = getOptimizeSession();
  if (session?.prompt) {
    renderOptimizeCurrentDiff(session, data);
  }
}

function saveOptimizeVersion() {
  const session = getOptimizeSession();
  if (!session.prompt || !session.result) return;
  const history = getOptimizeHistory();
  const entry = {
    id: Date.now(),
    version: history.length + 1,
    prompt: session.result.improvedPrompt || session.prompt,
    basePrompt: session.prompt || '',
    improvedPrompt: session.result.improvedPrompt || session.prompt || '',
    goal: session.goal || '',
    output: session.output || '',
    language: session.language || 'ko',
    issues: session.result.issues || [],
    improvements: session.result.improvements || [],
    score: session.result.score ?? 0,
    createdAt: new Date().toLocaleString('ko-KR'),
  };
  history.unshift(entry);
  saveOptimizeHistory(history);
  if (typeof upsertPromptHistoryVersion === 'function') {
    upsertPromptHistoryVersion({
      kind: 'optimize',
      title: session.goal || '프롬프트 최적화',
      prompt: entry.improvedPrompt || entry.prompt || '',
      inputRaw: session.prompt || '',
      resultMode: 'optimize',
      techniqueId: state?.techniqueId || '',
      techniqueName: state?.techniqueData?.name || state?.techniqueId || 'Prompt',
      purpose: state?.purpose || '',
      keyword: state?.keyword || '',
      workflowState: state?.workflowState || 'new',
      score: entry.score || 0,
    });
  }
  if (typeof sendPersistJson === 'function') {
    sendPersistJson('/api/training-samples', {
      sample: {
        id: `ts_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        visitorId: typeof ensureVisitorId === 'function' ? ensureVisitorId() : 'anonymous',
        sessionId: typeof ensureSessionId === 'function' ? ensureSessionId() : '',
        source: 'optimize',
        kind: 'optimize',
        threadId: state?.activePromptHistoryId || '',
        versionId: '',
        techniqueId: state?.techniqueId || '',
        techniqueName: state?.techniqueData?.name || state?.techniqueId || 'Prompt',
        purpose: state?.purpose || '',
        keyword: state?.keyword || '',
        workflowState: state?.workflowState || 'new',
        inputRaw: session.prompt || '',
        generatedPrompt: entry.improvedPrompt || entry.prompt || '',
        outputText: session.output || '',
        intent: null,
        quality: { percentage: entry.score || 0, issues: entry.issues || [] },
        meta: { goal: session.goal || '' },
        createdAt: new Date().toISOString(),
      },
    });
  }
  renderOptimizeHistory();
  setCurrentCompareId(entry.id);
  renderOptimizeDiff(entry);
}

function renderOptimizeHistory() {
  const container = getOptimizeEl('optimize-history');
  if (!container) return;
  const history = getOptimizeHistory();
  if (!history.length) {
    container.innerHTML = '<div class="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-sm text-gray-500">아직 저장된 버전이 없습니다.</div>';
    return;
  }
  container.innerHTML = history.slice(0, 5).map((item) => `
    <div class="w-full text-left rounded-2xl border border-gray-200 bg-gray-50 p-4 transition hover:border-brand-300 hover:bg-white">
      <div class="flex items-center justify-between mb-2">
        <div class="font-semibold text-gray-900">v${item.version}</div>
        <div class="text-xs text-gray-500">${item.score}%</div>
      </div>
      <div class="text-xs text-gray-500 mb-2">${escapeHtml(item.createdAt || '')}</div>
      <div class="text-sm text-gray-700 line-clamp-2">${escapeHtml(item.prompt || '')}</div>
      <div class="mt-4 flex flex-wrap gap-2">
        <button onclick="loadOptimizeVersion(${item.id})" class="rounded-xl bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-500">불러오기</button>
        <button onclick="compareOptimizeVersion(${item.id})" class="rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-white">비교</button>
        <button onclick="rollbackOptimizeVersion(${item.id})" class="rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-white">되돌리기</button>
      </div>
    </div>
  `).join('');
}

function renderOptimizeDiff(entry) {
  const diffContainer = getOptimizeEl('optimize-diff');
  if (!diffContainer || !entry) return;
  const current = getOptimizeSession();
  const beforeText = entry.basePrompt || entry.prompt || '';
  const afterText = current?.result?.improvedPrompt || current?.prompt || entry.improvedPrompt || entry.prompt || '';
  diffContainer.innerHTML = `
    <div class="rounded-2xl bg-gray-50 p-4">
      <div class="flex items-center justify-between mb-3">
        <div class="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">선택한 버전</div>
        <div class="text-xs text-gray-500">v${entry.version}</div>
      </div>
      <div class="text-sm text-gray-700">${escapeHtml(entry.goal || '저장된 목표가 없습니다.')}</div>
    </div>
    <div class="rounded-2xl border border-gray-200 overflow-hidden">
      <div class="grid grid-cols-2 text-[10px] uppercase tracking-[0.2em] text-gray-500 bg-gray-50 border-b border-gray-200">
        <div class="px-3 py-2">이전</div>
        <div class="px-3 py-2">이후</div>
      </div>
      <div class="p-3 space-y-2 max-h-[360px] overflow-auto">
        ${buildInlineDiff(beforeText, afterText) || '<div class="text-sm text-gray-500">비교 가능한 차이가 없습니다.</div>'}
      </div>
    </div>
  `;
}

function renderOptimizeCurrentDiff(session, data) {
  const diffContainer = getOptimizeEl('optimize-diff');
  if (!diffContainer) return;
  const beforeText = session.prompt || '';
  const afterText = data?.improvedPrompt || '';
  diffContainer.innerHTML = `
    <div class="rounded-2xl bg-gray-50 p-4">
      <div class="flex items-center justify-between mb-3">
        <div class="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">현재 세션</div>
        <div class="text-xs text-gray-500">실시간 미리보기</div>
      </div>
      <div class="text-sm text-gray-700">${escapeHtml(session.goal || '저장된 목표가 없습니다.')}</div>
    </div>
    <div class="rounded-2xl border border-gray-200 overflow-hidden">
      <div class="grid grid-cols-2 text-[10px] uppercase tracking-[0.2em] text-gray-500 bg-gray-50 border-b border-gray-200">
        <div class="px-3 py-2">이전</div>
        <div class="px-3 py-2">이후</div>
      </div>
      <div class="p-3 space-y-2 max-h-[360px] overflow-auto">
        ${buildInlineDiff(beforeText, afterText) || '<div class="text-sm text-gray-500">비교 가능한 차이가 없습니다.</div>'}
      </div>
    </div>
  `;
}

function clearOptimizeCompare() {
  localStorage.removeItem(OPTIMIZE_COMPARE_KEY);
  const diffContainer = getOptimizeEl('optimize-diff');
  if (!diffContainer) return;
  diffContainer.innerHTML = '<div class="rounded-2xl bg-gray-50 px-4 py-5 text-sm text-gray-500">비교할 버전을 선택하세요.</div>';
}

function loadOptimizeVersion(id) {
  const entry = getOptimizeHistory().find((item) => item.id === id);
  if (!entry) return;
  setOptimizeValue('optimize-prompt', entry.basePrompt || entry.prompt || '');
  setOptimizeValue('optimize-goal', entry.goal || '');
  setOptimizeValue('optimize-output', entry.output || '');
  setOptimizeText('optimize-improved-prompt', entry.improvedPrompt || entry.prompt || '');
  setOptimizeText('optimize-score', entry.score ?? 0);
  setOptimizeText('optimize-status', '기록에서 불러옴');
  setCurrentCompareId(id);
  renderOptimizeDiff(entry);
}

function compareOptimizeVersion(id) {
  const entry = getOptimizeHistory().find((item) => item.id === id);
  if (!entry) return;
  setCurrentCompareId(id);
  renderOptimizeDiff(entry);
}

function rollbackOptimizePrompt() {
  const session = getOptimizeSession();
  if (!session?.prompt) return;
  setOptimizeValue('optimize-prompt', session.prompt || '');
  setOptimizeValue('optimize-output', session.output || '');
  setOptimizeValue('optimize-goal', session.goal || '');
  setOptimizeText('optimize-status', '현재 세션으로 되돌림');
}

function rollbackOptimizeVersion(id) {
  const entry = getOptimizeHistory().find((item) => item.id === id);
  if (!entry) return;
  setOptimizeValue('optimize-prompt', entry.basePrompt || entry.prompt || '');
  setOptimizeValue('optimize-output', entry.output || '');
  setOptimizeValue('optimize-goal', entry.goal || '');
  setOptimizeText('optimize-improved-prompt', entry.improvedPrompt || entry.prompt || '');
  setOptimizeText('optimize-score', entry.score ?? 0);
  setOptimizeText('optimize-status', '선택한 버전으로 되돌림');

  const session = {
    prompt: entry.basePrompt || entry.prompt || '',
    output: entry.output || '',
    goal: entry.goal || '',
    language: entry.language || 'ko',
    result: {
      score: entry.score ?? 0,
      issues: entry.issues || [],
      improvements: entry.improvements || [],
      improvedPrompt: entry.improvedPrompt || entry.prompt || '',
      nextAction: '되돌린 뒤에는 다시 최적화해 보세요.',
    },
    createdAt: new Date().toISOString(),
  };
  setOptimizeSession(session);
  setCurrentCompareId(id);
  renderOptimizeDiff(entry);
}


