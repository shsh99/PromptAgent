// ===== prompt.js - prompt generation / results / copy & download =====

function isEnglishPrompt() {
  return (state.promptLanguage || 'ko') === 'en';
}

function uiText(ko, en) {
  return isEnglishPrompt() ? en : ko;
}

async function generatePrompt() {
  const btn = document.getElementById('generate-btn');
  if (!btn) return;

  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ' + uiText('생성 중...', 'Generating...');

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

    state.chainData = data.chainData || null;
    state.contextDocMeta = data.contextDocMeta || null;
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
  } catch (error) {
    console.error(error);
    alert(uiText('프롬프트 생성 중 오류가 발생했습니다.', 'An error occurred while generating the prompt.'));
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-wand-magic-sparkles"></i> ' + uiText('프롬프트 생성', 'Generate Prompt');
  }
}

function displayResult(data) {
  const section = document.getElementById('result-section');
  const promptEl = document.getElementById('result-prompt');
  const techniqueEl = document.getElementById('result-technique-name');
  const gradeEl = document.getElementById('quality-grade');
  const scoreEl = document.getElementById('quality-score');
  const labelEl = document.getElementById('quality-label');
  const checksEl = document.getElementById('quality-checks');
  const tipsEl = document.getElementById('tips-list');
  const chainSection = document.getElementById('chain-section');
  const chainContent = document.getElementById('chain-content');
  const ctxSection = document.getElementById('context-doc-section');
  const ctxInfo = document.getElementById('context-doc-info');

  if (!section) return;

  section.classList.remove('hidden');
  if (promptEl) promptEl.textContent = data.prompt || '';
  if (techniqueEl) {
    techniqueEl.textContent = isEnglishPrompt()
      ? data.technique?.nameEn || data.technique?.name || uiText('프롬프트', 'Prompt')
      : data.technique?.name || data.technique?.nameEn || uiText('프롬프트', 'Prompt');
  }

  const qr = data.qualityReport || {};
  const gradeClasses = {
    S: 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white',
    A: 'bg-gradient-to-br from-green-400 to-emerald-500 text-white',
    B: 'bg-gradient-to-br from-blue-400 to-blue-500 text-white',
    C: 'bg-gradient-to-br from-orange-400 to-orange-500 text-white',
    D: 'bg-gradient-to-br from-red-400 to-red-500 text-white',
  };
  const gradeLabels = isEnglishPrompt()
    ? { S: 'Excellent', A: 'Very Good', B: 'Good', C: 'Needs Improvement', D: 'Needs Work' }
    : { S: '최상급 프롬프트!', A: '매우 좋은 프롬프트', B: '보통 이상 프롬프트', C: '개선 필요', D: '많은 개선 필요' };

  if (gradeEl) {
    gradeEl.className = `flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-black ${gradeClasses[qr.grade] || gradeClasses.C}`;
    gradeEl.textContent = qr.grade || '';
  }
  if (scoreEl) scoreEl.textContent = String(qr.percentage ?? 0);
  if (labelEl) labelEl.textContent = gradeLabels[qr.grade] || '';

  if (checksEl) {
    const summaryTitle = uiText('요약', 'Summary');
    const suggestionsTitle = uiText('다음 개선', 'Suggestions');
    const summaryText = qr.summary || uiText('요약이 없습니다.', 'No summary available.');
    const suggestionItems = (qr.suggestions || []).slice(0, 4);

    checksEl.innerHTML = `
      <div class="mb-3 rounded-xl border border-gray-800 bg-gray-950/60 p-3">
        <div class="mb-1 text-[10px] uppercase tracking-[0.2em] text-gray-500">${summaryTitle}</div>
        <div class="text-xs leading-relaxed text-gray-300">${escapeHtml(summaryText)}</div>
        ${suggestionItems.length ? `
          <div class="mt-2 text-[10px] uppercase tracking-[0.2em] text-gray-500">${suggestionsTitle}</div>
          <ul class="mt-1 space-y-1 text-xs text-gray-400">
            ${suggestionItems.map((item) => `
              <li class="flex items-start gap-2">
                <i class="fas fa-arrow-right mt-0.5 flex-shrink-0 text-brand-500"></i>
                <span>${escapeHtml(item)}</span>
              </li>
            `).join('')}
          </ul>
        ` : ''}
      </div>
      ${(qr.checks || []).map((check) => `
        <div class="flex items-start gap-2 text-xs">
          <div class="mt-0.5 flex-shrink-0">
            ${check.passed ? '<i class="fas fa-circle-check text-green-400"></i>' : '<i class="fas fa-circle-xmark text-gray-600"></i>'}
          </div>
          <div>
            <span class="${check.passed ? 'text-gray-300' : 'text-gray-500'}">${escapeHtml(check.label || '')}</span>
            <span class="ml-1 text-gray-600">- ${escapeHtml(check.tip || '')}</span>
          </div>
        </div>
      `).join('')}
    `;
  }

  if (tipsEl) {
    const modelHints = qr.modelHints || {};
    const hints = Object.entries(modelHints).flatMap(([model, items]) =>
      (items || []).slice(0, 2).map((hint) => `${model.toUpperCase()}: ${hint}`),
    );
    tipsEl.innerHTML = [...(data.tips || []), ...hints].map((tip) => `
      <li class="flex items-start gap-2">
        <i class="fas fa-angle-right mt-0.5 flex-shrink-0 text-brand-500"></i>
        <span>${escapeHtml(tip)}</span>
      </li>
    `).join('');
  }

  if (chainSection && chainContent) {
    if (Array.isArray(data.chainData) && data.chainData.length > 0) {
      chainSection.classList.remove('hidden');
      chainContent.innerHTML = data.chainData.map((item) => `
        <div class="chain-step-card mb-3 overflow-hidden rounded-xl border border-gray-800">
          <div class="flex cursor-pointer items-center justify-between border-b border-gray-800 bg-gray-900/80 px-4 py-3" onclick="toggleChainStep(this)">
            <div class="flex items-center gap-3">
              <div class="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-500/20 text-xs font-bold text-teal-400">${item.step}</div>
              <span class="text-sm font-medium text-gray-200">${escapeHtml(item.title || '')}</span>
            </div>
            <div class="flex items-center gap-2">
              <button onclick="event.stopPropagation(); copyChainStep(${item.step - 1})" class="flex items-center gap-1 rounded-lg bg-gray-800 px-2 py-1 text-[10px] text-gray-500 transition-all hover:bg-gray-700 hover:text-white">
                <i class="fas fa-copy"></i>${uiText('복사', 'Copy')}
              </button>
              <i class="fas fa-chevron-down chain-chevron text-xs text-gray-600 transition-transform"></i>
            </div>
          </div>
          <div class="chain-step-body hidden">
            <pre class="whitespace-pre-wrap p-4 font-mono text-xs leading-relaxed text-gray-300">${escapeHtml(item.prompt || '')}</pre>
          </div>
        </div>
      `).join('');
    } else {
      chainSection.classList.add('hidden');
      chainContent.innerHTML = '';
    }
  }

  renderResultVariants(data.variants || []);

  if (ctxSection && ctxInfo) {
    if (data.contextDocMeta) {
      ctxSection.classList.remove('hidden');
      ctxInfo.innerHTML = `
        <div class="mb-3 flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/20">
            <i class="fas fa-file-lines text-cyan-400"></i>
          </div>
          <div>
            <div class="text-sm font-semibold text-white">${escapeHtml(data.contextDocMeta.filename || '')}</div>
            <div class="text-[10px] text-gray-500">${data.contextDocMeta.sections || 0}${uiText('개 섹션', ' sections')} • ${data.contextDocMeta.features || 0}${uiText('개 기능', ' features')}</div>
          </div>
        </div>
        <p class="mb-3 text-xs text-cyan-400"><i class="fas fa-lightbulb mr-1"></i>${escapeHtml(data.contextDocMeta.tip || '')}</p>
        <div class="flex gap-2">
          <button onclick="downloadContextDoc()" class="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-cyan-600 px-4 py-2 text-xs text-white transition-all hover:bg-cyan-500">
            <i class="fas fa-download"></i>context.md ${uiText('다운로드', 'Download')}
          </button>
          <button onclick="copyPrompt()" class="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-gray-700 px-4 py-2 text-xs text-gray-300 transition-all hover:bg-gray-600">
            <i class="fas fa-copy"></i>${uiText('전체 복사', 'Copy All')}
          </button>
        </div>
      `;
    } else {
      ctxSection.classList.add('hidden');
      ctxInfo.innerHTML = '';
    }
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
          <h4 class="text-sm font-semibold text-white">${uiText('3가지 결과', 'Three variants')}</h4>
          <p class="text-xs text-slate-400">${uiText('같은 입력에서 다른 결과를 비교해볼 수 있습니다.', 'Compare alternative outputs from the same input.')}</p>
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
                  <div class="text-sm font-semibold ${isActive ? 'text-brand-100' : 'text-white'}">${escapeHtml(variant.label || `${uiText('결과', 'Variant')} ${index + 1}`)}</div>
                  <div class="mt-1 text-[11px] ${isActive ? 'text-brand-100/80' : 'text-slate-400'}">${escapeHtml(variant.summary || '')}</div>
                </div>
                <span class="rounded-full ${isActive ? 'bg-brand-500/20 text-brand-100' : 'bg-white/10 text-slate-200'} px-2 py-0.5 text-[10px] font-semibold">${grade} • ${score}%</span>
              </div>
              <div class="mt-3 line-clamp-3 whitespace-pre-wrap text-xs leading-6 ${isActive ? 'text-brand-50' : 'text-slate-300'}">${escapeHtml(variant.prompt || '')}</div>
              <div class="mt-4 flex flex-wrap gap-2">
                <button onclick="selectGeneratedVariant(${index})" class="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-white/10">${uiText('적용', 'Apply')}</button>
                <button onclick="copyGeneratedVariant(${index})" class="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-white/10">${uiText('복사', 'Copy')}</button>
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
  if (techniqueName) {
    techniqueName.textContent = `${state.techniqueData?.name || state.techniqueId || uiText('프롬프트', 'Prompt')} • ${variant.label || `${uiText('결과', 'Variant')} ${index + 1}`}`;
  }

  document.getElementById('result-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
  const text = document.getElementById('result-prompt')?.textContent || '';
  if (!text) return;
  navigator.clipboard.writeText(text).then(() => {
    const btn = document.getElementById('copy-btn');
    if (btn) {
      const original = btn.innerHTML;
      btn.innerHTML = '<i class="fas fa-check"></i> ' + uiText('복사됨', 'Copied');
      setTimeout(() => {
        btn.innerHTML = original;
      }, 2000);
    }
    if (typeof recordActivity === 'function') {
      recordActivity('PROMPT_COPY', {
        techniqueId: state.techniqueId,
        keyword: state.keyword,
      });
    }
  });
}

function downloadPrompt() {
  const text = document.getElementById('result-prompt')?.textContent || '';
  if (!text) return;
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = state.contextDocMeta ? state.contextDocMeta.filename : `prompt-${state.techniqueId}-${Date.now()}.txt`;
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
  const text = document.getElementById('result-prompt')?.textContent || '';
  const filename = state.contextDocMeta?.filename || 'context.md';
  if (!text) return;

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
  const body = el?.nextElementSibling;
  const chevron = el?.querySelector('.chain-chevron');
  if (!body || !chevron) return;
  body.classList.toggle('hidden');
  chevron.classList.toggle('rotate-180');
}

function copyChainStep(index) {
  if (!state.chainData || !state.chainData[index]) return;
  navigator.clipboard.writeText(state.chainData[index].prompt).then(() => {
    const cards = document.querySelectorAll('.chain-step-card');
    const btn = cards[index]?.querySelector('button');
    if (btn) {
      const original = btn.innerHTML;
      btn.innerHTML = '<i class="fas fa-check"></i> ' + uiText('복사됨', 'Copied');
      setTimeout(() => {
        btn.innerHTML = original;
      }, 1500);
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
  const text = state.chainData.map((c) => `========== Step ${c.step}: ${c.title} ==========\n\n${c.prompt}`).join('\n\n\n');
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
