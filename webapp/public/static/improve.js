// ===== improve.js - 프롬프트 개선기 =====

function injectResultActionButtons() {
  const actionRow = document.querySelector('#result-section .flex.items-center.gap-2');
  if (!actionRow) return;
  if (!document.getElementById('save-library-btn')) {
    const saveBtn = document.createElement('button');
    saveBtn.id = 'save-library-btn';
    saveBtn.className = 'text-xs text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5';
    saveBtn.innerHTML = '<i class="fas fa-bookmark"></i>저장';
    saveBtn.onclick = saveToLibrary;
    actionRow.insertBefore(saveBtn, actionRow.lastElementChild);
  }
  if (!document.getElementById('improve-prompt-btn')) {
    const improveBtn = document.createElement('button');
    improveBtn.id = 'improve-prompt-btn';
    improveBtn.className = 'text-xs text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5';
    improveBtn.innerHTML = '<i class="fas fa-wand-magic-sparkles"></i>개선';
    improveBtn.onclick = openImproveFromResult;
    actionRow.insertBefore(improveBtn, actionRow.firstElementChild);
  }
}

function injectImproveModal() {
  if (document.getElementById('improve-modal')) return;
  const root = document.getElementById('app-root');
  if (!root) return;
  const wrapper = document.createElement('div');
  wrapper.id = 'improve-modal';
  wrapper.className = 'fixed inset-0 z-[100] hidden';
  wrapper.innerHTML = `
    <div class="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
    <div class="relative max-w-4xl mx-auto mt-20 bg-gray-900 border border-gray-800 rounded-2xl max-h-[80vh] overflow-y-auto m-4">
      <div class="sticky top-0 bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between rounded-t-2xl">
        <h3 class="text-lg font-bold text-white flex items-center gap-2">
          <i class="fas fa-wand-magic-sparkles text-brand-400"></i>프롬프트 개선기
        </h3>
        <button id="improve-close-btn" class="text-gray-400 hover:text-white">
          <i class="fas fa-xmark text-lg"></i>
        </button>
      </div>
      <div class="grid grid-cols-1 gap-4 p-6 lg:grid-cols-2">
        <div>
          <label class="mb-2 block text-sm font-medium text-gray-300">원본 프롬프트</label>
          <textarea id="improve-input" rows="14"
            class="w-full rounded-xl border border-gray-700 bg-gray-800/50 px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            placeholder="개선할 프롬프트를 붙여넣으세요."></textarea>
          <label class="mb-2 mt-4 block text-sm font-medium text-gray-300">개선 목표</label>
          <input id="improve-goal" type="text"
            class="w-full rounded-xl border border-gray-700 bg-gray-800/50 px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            placeholder="더 명확한 지시, 결과 형식 강화, 제약 조건 반영" />
          <button id="improve-submit-btn"
            class="mt-4 w-full rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 px-5 py-3 text-sm font-semibold text-white transition-all hover:from-brand-500 hover:to-brand-400">
            개선하기
          </button>
        </div>
        <div>
          <label class="mb-2 block text-sm font-medium text-gray-300">개선 결과</label>
          <pre id="improve-output" class="min-h-[420px] whitespace-pre-wrap rounded-xl border border-gray-800 bg-gray-950/80 p-4 font-mono text-sm leading-relaxed text-gray-200"></pre>
          <div class="mt-4 flex gap-2">
            <button id="improve-copy-btn" class="flex-1 rounded-xl bg-gray-800 px-4 py-3 text-xs text-gray-300 transition-all hover:bg-gray-700 hover:text-white">
              <i class="fas fa-copy mr-1"></i>복사
            </button>
            <button id="improve-save-btn" class="flex-1 rounded-xl bg-gray-800 px-4 py-3 text-xs text-gray-300 transition-all hover:bg-gray-700 hover:text-white">
              <i class="fas fa-bookmark mr-1"></i>라이브러리에 저장
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
  root.appendChild(wrapper);
  wrapper.firstElementChild.onclick = closeImproveModal;
  wrapper.querySelector('#improve-close-btn').onclick = closeImproveModal;
  wrapper.querySelector('#improve-submit-btn').onclick = improvePrompt;
  wrapper.querySelector('#improve-copy-btn').onclick = copyImprovedPrompt;
  wrapper.querySelector('#improve-save-btn').onclick = saveImprovedPromptToLibrary;
}

function openImproveFromResult() {
  const current = document.getElementById('result-prompt')?.textContent?.trim() || '';
  document.getElementById('improve-input').value = current;
  document.getElementById('improve-output').textContent = '';
  document.getElementById('improve-goal').value = '더 명확한 지시, 결과 형식 강화, 제약 조건 반영';
  document.getElementById('improve-modal').classList.remove('hidden');
}

function closeImproveModal() {
  document.getElementById('improve-modal').classList.add('hidden');
}

async function improvePrompt() {
  const input = document.getElementById('improve-input').value.trim();
  const goal = document.getElementById('improve-goal').value.trim();
  const output = document.getElementById('improve-output');
  const button = document.getElementById('improve-submit-btn');
  if (!input) return;
  button.disabled = true;
  button.innerHTML = '개선 중...';
  output.textContent = '';
  try {
    const res = await fetch('/api/improve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: input, goal }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    output.textContent = data.improvedPrompt || '';
    if (typeof upsertPromptHistoryVersion === 'function') {
      upsertPromptHistoryVersion({
        kind: 'improve',
        title: goal || '프롬프트 개선',
        prompt: data.improvedPrompt || input,
        inputRaw: input,
        resultMode: 'improve',
        techniqueId: state.techniqueId || '',
        techniqueName: state.techniqueData?.name || state.techniqueId || 'Prompt',
        purpose: state.purpose || '',
        keyword: state.keyword || '',
        workflowState: state.workflowState || 'new',
        score: 0,
      });
    }
    if (typeof sendPersistJson === 'function') {
      sendPersistJson('/api/training-samples', {
        sample: {
          id: `ts_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          visitorId: typeof ensureVisitorId === 'function' ? ensureVisitorId() : 'anonymous',
          sessionId: typeof ensureSessionId === 'function' ? ensureSessionId() : '',
          source: 'improve',
          kind: 'improve',
          threadId: state.activePromptHistoryId || '',
          versionId: '',
          techniqueId: state.techniqueId || '',
          techniqueName: state.techniqueData?.name || state.techniqueId || 'Prompt',
          purpose: state.purpose || '',
          keyword: state.keyword || '',
          workflowState: state.workflowState || 'new',
          inputRaw: input,
          generatedPrompt: data.improvedPrompt || input,
          outputText: '',
          intent: null,
          quality: { percentage: 0, grade: 'C' },
          meta: { goal },
          createdAt: new Date().toISOString(),
        },
      });
    }
    if (typeof recordActivity === 'function') {
      recordActivity('PROMPT_IMPROVE', {
        techniqueId: state.techniqueId,
        keyword: state.keyword,
      });
    }
  } catch (error) {
    output.textContent = `오류: ${error.message}`;
  } finally {
    button.disabled = false;
    button.innerHTML = '개선하기';
  }
}

function copyImprovedPrompt() {
  const text = document.getElementById('improve-output').textContent?.trim();
  if (!text) return;
  navigator.clipboard.writeText(text);
  if (typeof recordActivity === 'function') {
    recordActivity('PROMPT_IMPROVED_COPY', {
      techniqueId: state.techniqueId,
      keyword: state.keyword,
    });
  }
}

function saveImprovedPromptToLibrary() {
  const prompt = document.getElementById('improve-output').textContent?.trim();
  if (!prompt) return;
  state.library.unshift({
    id: Date.now(),
    title: document.getElementById('improve-goal').value.trim() || '개선된 프롬프트',
    technique: '프롬프트 개선기',
    prompt,
    favorite: false,
    tags: ['improved'],
    createdAt: new Date().toLocaleString('ko-KR'),
  });
  localStorage.setItem('pf_library', JSON.stringify(state.library));
  renderLibrary();
  if (typeof recordActivity === 'function') {
    recordActivity('PROMPT_IMPROVED_SAVE', {
      techniqueId: state.techniqueId,
      keyword: state.keyword,
    });
  }
}
