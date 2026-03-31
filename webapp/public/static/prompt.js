// ===== prompt.js - 프롬프트 생성 / 결과 표시 / 복사·다운로드 =====

async function generatePrompt() {
  const btn = document.getElementById('generate-btn');
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 생성 중...';
  try {
    const keyword = document.getElementById('keyword-input')?.value || '';
    state.keyword = keyword;
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        techniqueId: state.techniqueId,
        fields: state.fields,
        selectedAdvancedFields: state.selectedAdvancedFields || [],
        customBlankFields: state.customBlankFields || [],
        purpose: state.purpose,
        keyword,
        language: state.promptLanguage || 'ko',
        promptStyle: state.promptStyle || 'gpt',
        workflowState: state.workflowState || 'new',
      }),
    });
    const data = await res.json();
    if (data.error) {
      alert(data.error);
      return;
    }
    state.chainData = data.chainData;
    state.contextDocMeta = data.contextDocMeta;
    state.generatedVariants = data.variants || [];
    state.selectedGeneratedVariantIndex = 0;
    displayResult(data);
    saveToHistory(data);
    if (typeof loadPublicStats === 'function') {
      setTimeout(() => loadPublicStats(), 400);
    }
    if (typeof recordActivity === 'function') {
      recordActivity('PROMPT_GENERATE', {
        techniqueId: state.techniqueId,
        purpose: state.purpose,
        keyword,
        workflowState: state.workflowState || 'new',
        score: data.qualityReport?.percentage,
      });
    }
  } catch (e) {
    console.error(e);
    alert('프롬프트 생성 중 오류가 발생했습니다.');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-wand-magic-sparkles"></i> 프롬프트 생성';
  }
}

function displayResult(data) {
  const section = document.getElementById('result-section');
  section.classList.remove('hidden');
  document.getElementById('result-prompt').textContent = data.prompt;
  document.getElementById('result-technique-name').textContent = data.technique.name;

  const qr = data.qualityReport;
  const gradeEl = document.getElementById('quality-grade');
  const gc = {
    S: 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white',
    A: 'bg-gradient-to-br from-green-400 to-emerald-500 text-white',
    B: 'bg-gradient-to-br from-blue-400 to-blue-500 text-white',
    C: 'bg-gradient-to-br from-orange-400 to-orange-500 text-white',
    D: 'bg-gradient-to-br from-red-400 to-red-500 text-white',
  };
  gradeEl.className = `w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-black ${gc[qr.grade] || gc.C}`;
  gradeEl.textContent = qr.grade;
  document.getElementById('quality-score').textContent = qr.percentage;
  const labels = { S: '최상급 프롬프트!', A: '매우 좋은 프롬프트', B: '보통 이상의 프롬프트', C: '개선 필요', D: '많은 개선 필요' };
  document.getElementById('quality-label').textContent = labels[qr.grade] || '';
  const qualityChecksHtml = `
    <div class="mb-3 rounded-xl border border-gray-800 bg-gray-950/60 p-3">
      <div class="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-1">요약</div>
      <div class="text-xs text-gray-300 leading-relaxed">${escapeHtml(qr.summary || '요약이 없습니다.')}</div>
      ${(qr.suggestions || []).length ? `
        <div class="mt-2 text-[10px] uppercase tracking-[0.2em] text-gray-500">다음 개선점</div>
        <ul class="mt-1 space-y-1 text-xs text-gray-400">
          ${(qr.suggestions || []).slice(0, 4).map((s) => `
            <li class="flex items-start gap-2">
              <i class="fas fa-arrow-right text-brand-500 mt-0.5 flex-shrink-0"></i>
              <span>${escapeHtml(s)}</span>
            </li>`).join('')}
        </ul>
      ` : ''}
    </div>
  `;
  document.getElementById('quality-checks').innerHTML = qualityChecksHtml + qr.checks.map(c => `
    <div class="flex items-start gap-2 text-xs">
      <div class="mt-0.5 flex-shrink-0">${c.passed ? '<i class="fas fa-circle-check text-green-400"></i>' : '<i class="fas fa-circle-xmark text-gray-600"></i>'}</div>
      <div>
        <span class="${c.passed ? 'text-gray-300' : 'text-gray-500'}">${c.label}</span>
        <span class="text-gray-600 ml-1">- ${c.tip}</span>
      </div>
    </div>`).join('');
  const modelHints = qr.modelHints || {};
  const modelHintItems = Object.entries(modelHints)
    .flatMap(([model, hints]) => (hints || []).slice(0, 2).map((hint) => `${model.toUpperCase()}: ${hint}`));
  document.getElementById('tips-list').innerHTML = [...data.tips, ...modelHintItems].map(t => `
    <li class="flex items-start gap-2">
      <i class="fas fa-angle-right text-brand-500 mt-0.5 flex-shrink-0"></i><span>${t}</span>
    </li>`).join('');

  const chainSection = document.getElementById('chain-section');
  if (data.chainData && data.chainData.length > 0) {
    chainSection.classList.remove('hidden');
    document.getElementById('chain-content').innerHTML = data.chainData.map(c => `
      <div class="border border-gray-800 rounded-xl overflow-hidden mb-3 chain-step-card">
        <div class="flex items-center justify-between px-4 py-3 bg-gray-900/80 border-b border-gray-800 cursor-pointer" onclick="toggleChainStep(this)">
          <div class="flex items-center gap-3">
            <div class="w-7 h-7 bg-teal-500/20 rounded-lg flex items-center justify-center text-teal-400 text-xs font-bold">${c.step}</div>
            <span class="text-sm font-medium text-gray-200">${escapeHtml(c.title)}</span>
          </div>
          <div class="flex items-center gap-2">
            <button onclick="event.stopPropagation(); copyChainStep(${c.step - 1})"
              class="text-[10px] text-gray-500 hover:text-white bg-gray-800 hover:bg-gray-700 px-2 py-1 rounded-lg transition-all flex items-center gap-1">
              <i class="fas fa-copy"></i>복사
            </button>
            <i class="fas fa-chevron-down text-gray-600 text-xs chain-chevron transition-transform"></i>
          </div>
        </div>
        <div class="chain-step-body hidden">
          <pre class="p-4 text-xs text-gray-300 whitespace-pre-wrap font-mono leading-relaxed">${escapeHtml(c.prompt)}</pre>
        </div>
      </div>`).join('');
  } else {
    chainSection.classList.add('hidden');
  }

  renderResultVariants(data.variants || []);

  const ctxSection = document.getElementById('context-doc-section');
  if (data.contextDocMeta) {
    ctxSection.classList.remove('hidden');
    document.getElementById('context-doc-info').innerHTML = `
      <div class="flex items-center gap-3 mb-3">
        <div class="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
          <i class="fas fa-file-lines text-cyan-400"></i>
        </div>
        <div>
          <div class="text-sm font-semibold text-white">${escapeHtml(data.contextDocMeta.filename)}</div>
          <div class="text-[10px] text-gray-500">${data.contextDocMeta.sections}개 섹션 · ${data.contextDocMeta.features}개 기능</div>
        </div>
      </div>
      <p class="text-xs text-cyan-400 mb-3"><i class="fas fa-lightbulb mr-1"></i>${escapeHtml(data.contextDocMeta.tip)}</p>
      <div class="flex gap-2">
        <button onclick="downloadContextDoc()"
          class="flex-1 text-xs bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5">
          <i class="fas fa-download"></i>context.md 다운로드
        </button>
        <button onclick="copyPrompt()"
          class="flex-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-4 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5">
          <i class="fas fa-copy"></i>전체 복사
        </button>
      </div>`;
  } else {
    ctxSection.classList.add('hidden');
  }

  injectResultActionButtons();

  setTimeout(() => section.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
}

function renderResultVariants(variants) {
  const container = document.getElementById('result-variants');
  if (!container) return;
  const list = Array.isArray(variants) ? variants : [];
  if (!list.length) {
    container.innerHTML = '';
    return;
  }
  container.innerHTML = `
    <div class="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
      <div class="mb-3 flex items-center justify-between gap-3">
        <div>
          <h4 class="text-sm font-semibold text-white">3가지 결과</h4>
          <p class="text-xs text-slate-400">같은 입력에서 다른 톤과 밀도로 바로 비교할 수 있습니다.</p>
        </div>
        <div class="text-[10px] uppercase tracking-[0.2em] text-slate-500">compare ready</div>
      </div>
      <div class="grid gap-3 lg:grid-cols-3">
        ${list.map((variant, index) => {
          const qr = variant.qualityReport || {};
          const grade = qr.grade || 'C';
          const score = qr.percentage ?? 0;
          const isActive = index === (state.selectedGeneratedVariantIndex || 0);
          return `
            <div class="rounded-2xl border ${isActive ? 'border-brand-400/40 bg-brand-500/10' : 'border-white/10 bg-white/5'} p-4">
              <div class="flex items-start justify-between gap-3">
                <div>
                  <div class="text-sm font-semibold ${isActive ? 'text-brand-100' : 'text-white'}">${escapeHtml(variant.label || `결과 ${index + 1}`)}</div>
                  <div class="mt-1 text-[11px] ${isActive ? 'text-brand-100/80' : 'text-slate-400'}">${escapeHtml(variant.summary || '')}</div>
                </div>
                <span class="rounded-full ${isActive ? 'bg-brand-500/20 text-brand-100' : 'bg-white/10 text-slate-200'} px-2 py-0.5 text-[10px] font-semibold">${grade} · ${score}%</span>
              </div>
              <div class="mt-3 line-clamp-3 whitespace-pre-wrap text-xs leading-6 ${isActive ? 'text-brand-50' : 'text-slate-300'}">${escapeHtml(variant.prompt || '')}</div>
              <div class="mt-4 flex flex-wrap gap-2">
                <button onclick="selectGeneratedVariant(${index})" class="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-white/10">적용</button>
                <button onclick="copyGeneratedVariant(${index})" class="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-white/10">복사</button>
                <button onclick="openOptimizeFromVariant(${index})" class="rounded-xl border border-brand-500/20 bg-brand-500/10 px-3 py-1.5 text-xs font-semibold text-brand-100 hover:bg-brand-500/15">Optimize</button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

function selectGeneratedVariant(index) {
  const variants = state.generatedVariants || [];
  const variant = variants[index];
  if (!variant) return;
  state.selectedGeneratedVariantIndex = index;
  const resultPrompt = document.getElementById('result-prompt');
  const techniqueName = document.getElementById('result-technique-name');
  if (resultPrompt) resultPrompt.textContent = variant.prompt || '';
  if (techniqueName) techniqueName.textContent = `${state.techniqueData?.name || state.techniqueId || '프롬프트'} · ${variant.label || `결과 ${index + 1}`}`;
  const section = document.getElementById('result-section');
  section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function copyGeneratedVariant(index) {
  const variant = (state.generatedVariants || [])[index];
  if (!variant?.prompt) return;
  navigator.clipboard.writeText(variant.prompt).then(() => {
    if (typeof recordActivity === 'function') {
      recordActivity('PROMPT_VARIANT_COPY', {
        techniqueId: state.techniqueId,
        keyword: state.keyword,
        variant: variant.label || `result-${index + 1}`,
      });
    }
  });
}

function copyPrompt() {
  const text = document.getElementById('result-prompt').textContent;
  navigator.clipboard.writeText(text).then(() => {
    const btn = document.getElementById('copy-btn');
    btn.innerHTML = '<i class="fas fa-check"></i> 복사됨';
    setTimeout(() => { btn.innerHTML = '<i class="fas fa-copy"></i> 복사'; }, 2000);
    if (typeof recordActivity === 'function') {
      recordActivity('PROMPT_COPY', {
        techniqueId: state.techniqueId,
        keyword: state.keyword,
      });
    }
  });
}

function downloadPrompt() {
  const text = document.getElementById('result-prompt').textContent;
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = state.contextDocMeta
    ? state.contextDocMeta.filename
    : `prompt-${state.techniqueId}-${Date.now()}.txt`;
  a.click();
  URL.revokeObjectURL(url);
  if (typeof recordActivity === 'function') {
    recordActivity('PROMPT_DOWNLOAD', {
      techniqueId: state.techniqueId,
      keyword: state.keyword,
    });
  }
}

function downloadContextDoc() {
  const text = document.getElementById('result-prompt').textContent;
  const filename = state.contextDocMeta?.filename || 'context.md';
  const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
  if (typeof recordActivity === 'function') {
    recordActivity('CONTEXT_DOC_DOWNLOAD', {
      techniqueId: state.techniqueId,
      keyword: state.keyword,
      filename,
    });
  }
}

function toggleChainStep(el) {
  const body = el.nextElementSibling;
  const chevron = el.querySelector('.chain-chevron');
  body.classList.toggle('hidden');
  chevron.classList.toggle('rotate-180');
}

function copyChainStep(index) {
  if (!state.chainData || !state.chainData[index]) return;
  navigator.clipboard.writeText(state.chainData[index].prompt).then(() => {
    const cards = document.querySelectorAll('.chain-step-card');
    const btn = cards[index]?.querySelector('button');
    if (btn) {
      const orig = btn.innerHTML;
      btn.innerHTML = '<i class="fas fa-check"></i>복사됨';
      setTimeout(() => { btn.innerHTML = orig; }, 1500);
    }
    if (typeof recordActivity === 'function') {
      recordActivity('CHAIN_STEP_COPY', {
        techniqueId: state.techniqueId,
        keyword: state.keyword,
        step: state.chainData[index].step,
      });
    }
  });
}

function downloadAllChainSteps() {
  if (!state.chainData) return;
  const text = state.chainData
    .map(c => `========== Step ${c.step}: ${c.title} ==========\n\n${c.prompt}`)
    .join('\n\n\n');
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `prompt-chain-${state.keyword || 'project'}-${Date.now()}.txt`;
  a.click();
  URL.revokeObjectURL(url);
  if (typeof recordActivity === 'function') {
    recordActivity('CHAIN_DOWNLOAD', {
      techniqueId: state.techniqueId,
      keyword: state.keyword,
    });
  }
}
