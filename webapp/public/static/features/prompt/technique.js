// ===== technique.js — 목적·기법 선택, 필드 렌더링 =====

// ── 목적 로드 ──────────────────────────────────────────────────────
async function loadPurposes() {
  const res = await fetch('/api/purposes');
  const data = await res.json();
  const grid = document.getElementById('purpose-grid');
  grid.innerHTML = data.purposes.map(p => `
    <button onclick="selectPurpose('${p.id}')" data-purpose="${p.id}"
      class="purpose-card group relative bg-gray-900/50 border border-gray-800 hover:border-brand-500/50 rounded-xl p-4 text-left transition-all duration-200 hover:bg-gray-900">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-slate-100 group-hover:bg-brand-50 rounded-lg flex items-center justify-center transition-colors">
          <i class="fas ${p.icon} text-gray-500 group-hover:text-brand-400 transition-colors"></i>
        </div>
        <div>
          <div class="text-sm font-medium text-white">${p.label}</div>
          <div class="text-[10px] text-gray-600">${p.keywords}</div>
        </div>
      </div>
    </button>
  `).join('');
}

function selectPurpose(id) {
  state.purpose = id;
  document.querySelectorAll('.purpose-card').forEach(el => {
    const s = el.dataset.purpose === id;
    el.classList.toggle('border-brand-500', s);
    el.classList.toggle('bg-brand-500/5', s);
    el.classList.toggle('border-gray-800', !s);
  });
  document.getElementById('keyword-section').classList.remove('hidden');
  document.getElementById('keyword-input').focus();
  activateStep2();
  renderRecommendationPlaceholder();
  // 하위 단계 초기화
  document.getElementById('recommendation-section').classList.add('hidden');
  document.getElementById('step-fields').classList.add('hidden');
  document.getElementById('result-section').classList.add('hidden');
}

function activateStep2() {
  const s = document.getElementById('step-technique');
  s.classList.remove('opacity-40', 'pointer-events-none');
  const b = document.getElementById('step2-badge');
  b.classList.remove('bg-gray-700', 'text-gray-400');
  b.classList.add('bg-brand-500', 'text-white');
}

function renderRecommendationPlaceholder() {
  const reason = document.getElementById('rec-reason');
  const primary = document.getElementById('rec-primary');
  const secondary = document.getElementById('rec-secondary');
  if (reason) reason.textContent = '목적과 키워드를 선택하면 여기서 추천 이유를 보여줍니다.';
  if (primary) {
    primary.innerHTML = `
      <div class="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-500">
        추천 결과가 나오면 가장 적합한 방식이 여기에 표시됩니다.
      </div>`;
  }
  if (secondary) {
    secondary.innerHTML = `
      <div class="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-xs leading-6 text-slate-500">
        아직 보조 추천이 없습니다. 목적을 먼저 선택한 뒤 추천을 눌러보세요.
      </div>`;
  }
}

// ── 추천 ───────────────────────────────────────────────────────────
async function requestRecommendation() {
  const keyword = document.getElementById('keyword-input').value.trim();
  if (!keyword) { document.getElementById('keyword-input').focus(); return; }
  if (!state.purpose) { alert('먼저 프로젝트 목적을 선택하세요.'); return; }
  state.keyword = keyword;

  const btn = document.getElementById('recommend-btn');
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 분석 중...';

  try {
    const res = await fetch('/api/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ purpose: state.purpose, keyword }),
    });
    const data = await res.json();
    state.recommendation = data;
    displayRecommendation(data);
    return data;
  } catch (e) {
    console.error(e);
    renderRecommendationPlaceholder();
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-magic"></i> 추천 경로 보기';
  }
}

function displayRecommendation(data) {
  const section = document.getElementById('recommendation-section');
  section.classList.remove('hidden');
  document.getElementById('rec-reason').textContent = data.reason;

  const catLabels = { prompt: '프롬프트', context: '컨텍스트', harness: '하네스' };
  const catColors = {
    prompt: 'bg-blue-500/20 text-blue-400',
    context: 'bg-cyan-500/20 text-cyan-400',
    harness: 'bg-indigo-500/20 text-indigo-400',
  };

  const p = data.primaryTechnique;
  document.getElementById('rec-primary').innerHTML = `
    <button onclick="selectRecommendedTechnique('${p.id}')"
      class="w-full bg-brand-50 border-2 border-brand-300 hover:border-brand-500 rounded-xl p-4 text-left transition-all group">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-[10px] bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full font-bold">1순위 추천</span>
        <span class="text-[10px] px-2 py-0.5 rounded-full ${catColors[p.category] || ''}">${catLabels[p.category] || ''}</span>
      </div>
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-brand-500/20 rounded-lg flex items-center justify-center">
          <i class="fas ${p.icon} text-brand-400"></i>
        </div>
        <div>
          <div class="text-sm font-semibold text-slate-900 group-hover:text-brand-700">${p.name}</div>
          <div class="text-[10px] text-gray-500">${p.description}</div>
        </div>
      </div>
      <div class="mt-2 text-[10px] text-brand-400 flex items-center gap-1">
        <i class="fas fa-bolt"></i> 클릭하면 자동으로 필드가 채워집니다
      </div>
    </button>`;

  document.getElementById('rec-secondary').innerHTML = `
    <div class="text-[10px] text-gray-500 mb-1">추가 추천</div>
    ${data.secondaryTechniques.map(t => `
      <button onclick="selectRecommendedTechnique('${t.id}')"
        class="w-full bg-white border border-slate-200 hover:border-brand-300 rounded-lg p-3 text-left transition-all group flex items-center gap-3 shadow-sm">
        <div class="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <i class="fas ${t.icon} text-slate-400 group-hover:text-brand-500 text-sm"></i>
        </div>
        <div>
          <div class="text-xs font-medium text-slate-700 group-hover:text-slate-900">${t.name}</div>
          <div class="text-[10px] text-gray-600">${catLabels[t.category] || ''}</div>
        </div>
      </button>`).join('')}`;

  setTimeout(() => section.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
}

// ── 기법 로드 & 선택 ───────────────────────────────────────────────
async function loadTechniques() {
  const res = await fetch('/api/techniques');
  const data = await res.json();
  const grid = document.getElementById('technique-grid');
  const colorMap = {
    blue:   { bg: 'bg-blue-500/10',   text: 'text-blue-400' },
    green:  { bg: 'bg-green-500/10',  text: 'text-green-400' },
    purple: { bg: 'bg-purple-500/10', text: 'text-purple-400' },
    orange: { bg: 'bg-orange-500/10', text: 'text-orange-400' },
    red:    { bg: 'bg-red-500/10',    text: 'text-red-400' },
    teal:   { bg: 'bg-teal-500/10',   text: 'text-teal-400' },
    pink:   { bg: 'bg-pink-500/10',   text: 'text-pink-400' },
    indigo: { bg: 'bg-indigo-500/10', text: 'text-indigo-400' },
    cyan:   { bg: 'bg-cyan-500/10',   text: 'text-cyan-400' },
  };
  const diffColors = {
    '초급': 'bg-green-500/20 text-green-400',
    '중급': 'bg-yellow-500/20 text-yellow-400',
    '고급': 'bg-red-500/20 text-red-400',
  };
  const catLabels = { prompt: '프롬프트', context: '컨텍스트', harness: '하네스' };
  const catColors = {
    prompt:  'bg-blue-500/10 text-blue-400',
    context: 'bg-cyan-500/10 text-cyan-400',
    harness: 'bg-indigo-500/10 text-indigo-400',
  };

  grid.innerHTML = data.techniques.map(t => {
    const c = colorMap[t.color] || colorMap.blue;
    const dc = diffColors[t.difficulty] || '';
    const cc = catColors[t.category] || '';
    return `
      <button onclick="selectTechniqueManual('${t.id}')" data-technique="${t.id}"
        class="technique-card group relative bg-gray-900/50 border border-gray-800 hover:border-gray-600 rounded-xl p-4 text-left transition-all duration-200">
        <div class="flex items-start gap-3">
          <div class="w-10 h-10 ${c.bg} rounded-lg flex items-center justify-center flex-shrink-0">
            <i class="fas ${t.icon} ${c.text}"></i>
          </div>
          <div class="min-w-0">
            <div class="flex items-center gap-2 mb-1 flex-wrap">
              <span class="text-sm font-semibold text-white">${t.name}</span>
              <span class="text-[10px] px-1.5 py-0.5 rounded-full ${dc}">${t.difficulty}</span>
            </div>
            <div class="flex items-center gap-2 mb-1.5">
              <span class="text-[10px] px-1.5 py-0.5 rounded-full ${cc}">${catLabels[t.category] || ''}</span>
            </div>
            <div class="text-xs text-gray-500 line-clamp-2">${t.description}</div>
          </div>
        </div>
      </button>`;
  }).join('');
}

async function selectTechniqueManual(id) {
  await selectRecommendedTechnique(id);
}

async function selectRecommendedTechnique(id) {
  state.techniqueId = id;
  document.querySelectorAll('.technique-card').forEach(el => {
    const s = el.dataset.technique === id;
    el.classList.toggle('border-brand-500', s);
    el.classList.toggle('bg-brand-500/5', s);
    el.classList.toggle('ring-1', s);
    el.classList.toggle('ring-brand-500/30', s);
    el.classList.toggle('border-gray-800', !s);
  });

  const res = await fetch(`/api/techniques/${id}`);
  const data = await res.json();
  state.techniqueData = data;
  renderFields(data);

  // 자동 채우기
  const keyword = state.keyword || document.getElementById('keyword-input').value.trim();
  if (keyword && state.purpose) {
    const autoRes = await fetch('/api/auto-fill', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ purpose: state.purpose, keyword, techniqueId: id }),
    });
    const autoData = await autoRes.json();
    if (autoData.fields) {
      Object.entries(autoData.fields).forEach(([key, val]) => {
        const el = document.getElementById(`field-${key}`);
        if (el) {
          el.value = val;
          el.classList.add('border-brand-500/30', 'bg-brand-500/5');
          updateField(key, val);
        }
      });
    }
  }

  const step3 = document.getElementById('step-fields');
  step3.classList.remove('hidden');
  document.getElementById('fields-title').textContent = `${data.technique.name} - 세부 정보 입력`;
  document.getElementById('result-section').classList.add('hidden');
  setTimeout(() => step3.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
}

// ── 필드 렌더링 ────────────────────────────────────────────────────
function getFieldGroupTitle(techniqueId) {
  if (techniqueId === 'harness') return '기본 입력';
  if (techniqueId === 'context-engineering') return '핵심 정보';
  if (techniqueId === 'role-prompting') return '기본 정보';
  return '입력 정보';
}

function renderFields(data) {
  const container = document.getElementById('fields-container');
  state.fields = {};
  const advancedIds = new Set([
    'project_structure',
    'existing_assets',
    'workflow_steps',
    'code_conventions',
    'branch_strategy',
    'code_review_rules',
    'testing_rules',
    'deployment_rules',
    'risks',
    'appendix_docs',
    'data_governance',
    'access_policy',
    'monitoring_rules',
    'feedback_loop',
    'failure_response',
    'human_in_the_loop',
    'audit_log_rules',
    'compliance_rules',
    'rollback_plan',
  ]);
  const visible = [];
  const advanced = [];
  data.fields.forEach((field) => {
    if (advancedIds.has(field.id) && ['content', 'custom'].includes(state.purpose)) {
      advanced.push(field);
      return;
    }
    visible.push(field);
  });

  const renderField = (f) => renderFieldControl(f, state.fields?.[f.id] || '');

  container.innerHTML = `
    <div class="mb-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm">
      <div class="flex items-center justify-between gap-3">
        <div>
          <div class="font-semibold text-white">${getFieldGroupTitle(state.techniqueId)}</div>
          <div class="mt-1 text-xs text-slate-500">핵심 입력만 먼저 보이고, 필요할 때 선택 입력을 펼칠 수 있습니다.</div>
        </div>
        ${advanced.length ? '<span class="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-semibold text-brand-700">선택 입력 숨김</span>' : ''}
      </div>
    </div>
    <div class="space-y-5">
      ${visible.map(renderField).join('')}
      ${advanced.length ? `
        <details class="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4">
          <summary class="cursor-pointer list-none flex items-center justify-between gap-3 text-sm font-semibold text-slate-900">
            <span>선택 입력</span>
            <span class="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-gray-400">${advanced.length}개</span>
          </summary>
          <div class="mt-4 space-y-5">
            ${advanced.map(renderField).join('')}
          </div>
        </details>
      ` : ''}
    </div>
  `;

  const advancedWrapper = container.querySelector('details .mt-4.space-y-5');
  if (advancedWrapper) {
    const cards = Array.from(advancedWrapper.children);
    cards.forEach((card, index) => {
      if (index > 0) card.classList.add('hidden');
      card.dataset.advancedIndex = String(index);
    });

    const existingButton = container.querySelector('#add-advanced-field-btn');
    if (!existingButton) {
      const button = document.createElement('button');
      button.type = 'button';
      button.id = 'add-advanced-field-btn';
      button.className = 'mt-4 rounded-xl bg-brand-600 px-3 py-2 text-xs font-semibold text-white hover:bg-brand-500';
      button.textContent = cards.length > 1 ? `입력 추가 (${cards.length - 1}개 남음)` : '입력 추가';
      button.onclick = () => {
        addNextAdvancedField();
      };
      container.appendChild(button);
    }
  }
}

function addNextAdvancedField() {
  const hiddenCard = document.querySelector('.mt-4.space-y-5 > div.hidden');
  if (!hiddenCard) {
    const btn = document.getElementById('add-advanced-field-btn');
    if (btn) {
      btn.disabled = true;
      btn.textContent = '모든 선택 입력이 표시됨';
    }
    return;
  }

  hiddenCard.classList.remove('hidden');

  const remaining = document.querySelectorAll('.mt-4.space-y-5 > div.hidden').length;
  const btn = document.getElementById('add-advanced-field-btn');
  if (btn) {
    btn.textContent = remaining > 0 ? `입력 추가 (${remaining}개 남음)` : '모든 선택 입력이 표시됨';
    if (remaining === 0) btn.disabled = true;
  }
}

function updateField(id, value) {
  state.fields[id] = value;
  if (id === 'workflow_state') {
    state.workflowState = value;
    localStorage.setItem('pf_workflow_state', value);
    if (typeof setWorkflowState === 'function') {
      setWorkflowState(value);
    }
  }
}

function resetFields() {
  state.fields = {};
  document.querySelectorAll('.field-input').forEach(el => {
    el.value = '';
    el.classList.remove('border-brand-500/30', 'bg-brand-500/5');
  });
  document.getElementById('result-section').classList.add('hidden');
}

function renderSelectedField(field) {
  const req = field.required ? '<span class="text-red-400 ml-0.5">*</span>' : '';
  const help = field.description ? `<div class="mt-1 text-xs text-gray-500">${field.description}</div>` : '';
  if (field.type === 'textarea') {
    return `
      <div class="mb-3 flex items-center justify-between gap-3">
        <div>
          <div class="text-sm font-semibold text-slate-900">${field.label}${req}</div>
          ${help}
        </div>
      </div>
      <textarea id="field-${field.id}" data-field="${field.id}" placeholder="${field.placeholder}" rows="4"
        class="field-input w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 shadow-sm focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-200 transition-all resize-y"
        oninput="updateField('${field.id}', this.value)"></textarea>
    `;
  }
  return `
    <div class="mb-3 flex items-center justify-between gap-3">
      <div>
        <div class="text-sm font-semibold text-slate-900">${field.label}${req}</div>
        ${help}
      </div>
    </div>
    <input type="text" id="field-${field.id}" data-field="${field.id}" placeholder="${field.placeholder}"
      class="field-input w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 shadow-sm focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-200 transition-all"
      oninput="updateField('${field.id}', this.value)" />
  `;
}

function addSelectedAdvancedField(fieldId) {
  const fields = state.advancedFields || [];
  const field = fields.find((item) => item.id === fieldId);
  if (!field) return;

  const selected = document.getElementById('selected-advanced-fields');
  const picker = document.getElementById('advanced-field-picker');
  if (!selected || !picker) return;

  if (selected.querySelector(`[data-added-field="${fieldId}"]`)) return;

  const wrapper = document.createElement('div');
  wrapper.className = 'rounded-2xl border border-slate-200 bg-white p-4 shadow-sm';
  wrapper.dataset.addedField = fieldId;
  wrapper.innerHTML = renderSelectedField(field);
  selected.appendChild(wrapper);

  const btn = Array.from(picker.querySelectorAll('button')).find((button) => button.textContent?.trim() === field.label);
  if (btn) {
    btn.disabled = true;
    btn.classList.add('opacity-40', 'cursor-not-allowed');
    btn.textContent = `${field.label} 추가됨`;
  }
}

function addBlankInputField() {
  const selected = document.getElementById('selected-advanced-fields');
  if (!selected) return;

  state.customBlankCount = (state.customBlankCount || 0) + 1;
  const index = state.customBlankCount;
  const fieldId = `custom_note_${index}`;

  const wrapper = document.createElement('div');
  wrapper.className = 'rounded-2xl border border-slate-200 bg-white p-4 shadow-sm';
  wrapper.dataset.addedField = fieldId;
  wrapper.innerHTML = `
    <div class="mb-3 flex items-center justify-between gap-3">
      <div>
        <div class="text-sm font-semibold text-slate-900">빈 입력 ${index}</div>
        <div class="mt-1 text-xs text-gray-500">원하는 내용을 자유롭게 적는 칸입니다.</div>
      </div>
      <span class="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-semibold text-brand-700">자유 입력</span>
    </div>
    <textarea id="${fieldId}" data-field="${fieldId}" rows="4" placeholder="여기에 자유롭게 입력하세요."
      class="field-input w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 shadow-sm focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-200 transition-all resize-y"
      oninput="updateField('${fieldId}', this.value)"></textarea>
  `;
  selected.appendChild(wrapper);
}

function renderFields(data) {
  const container = document.getElementById('fields-container');
  state.fields = {};
  state.techniqueFields = data.fields || [];
  const advancedIds = new Set([
    'project_structure',
    'existing_assets',
    'workflow_steps',
    'code_conventions',
    'branch_strategy',
    'code_review_rules',
    'testing_rules',
    'deployment_rules',
    'risks',
    'appendix_docs',
    'data_governance',
    'access_policy',
    'monitoring_rules',
    'feedback_loop',
    'failure_response',
    'human_in_the_loop',
    'audit_log_rules',
    'compliance_rules',
    'rollback_plan',
  ]);

  const visible = [];
  const advanced = [];
  (data.fields || []).forEach((field) => {
    if (advancedIds.has(field.id) && ['content', 'custom'].includes(state.purpose)) {
      advanced.push(field);
      return;
    }
    visible.push(field);
  });
  state.advancedFields = advanced;
  state.customBlankCount = 0;
  state.selectedAdvancedFields = [];
  state.customBlankFields = [];

  const renderField = (f) => {
    const req = f.required ? '<span class="text-red-400 ml-0.5">*</span>' : '';
    if (f.type === 'textarea') {
      return `<div>
        <label class="block text-sm font-medium text-slate-700 mb-1.5">${f.label}${req}</label>
        <textarea id="field-${f.id}" data-field="${f.id}" placeholder="${f.placeholder}" rows="4"
          class="field-input w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 shadow-sm focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-200 transition-all resize-y"
          oninput="updateField('${f.id}', this.value)"
          onfocus="this.classList.remove('border-brand-500/30','bg-brand-500/5')"></textarea>
      </div>`;
    }
    return `<div>
      <label class="block text-sm font-medium text-slate-700 mb-1.5">${f.label}${req}</label>
      <input type="text" id="field-${f.id}" data-field="${f.id}" placeholder="${f.placeholder}"
        class="field-input w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 shadow-sm focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-200 transition-all"
        oninput="updateField('${f.id}', this.value)"
        onfocus="this.classList.remove('border-brand-500/30','bg-brand-500/5')" />
    </div>`;
  };

  container.innerHTML = `
    <div class="mb-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm">
      <div class="flex items-center justify-between gap-3">
        <div>
          <div class="font-semibold text-white">${getFieldGroupTitle(state.techniqueId)}</div>
          <div class="mt-1 text-xs text-gray-400">핵심 입력만 먼저 보이고, 필요한 항목을 골라 하나씩 추가할 수 있습니다.</div>
        </div>
        ${advanced.length ? '<span class="rounded-full bg-brand-500/15 px-2 py-0.5 text-[10px] font-semibold text-brand-300">선택 입력</span>' : ''}
      </div>
    </div>
    <div class="space-y-5">
      ${visible.map(renderField).join('')}
      ${advanced.length ? `
        <div class="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4">
          <div class="flex items-center justify-between gap-3">
            <div>
              <div class="text-sm font-semibold text-gray-200">선택 입력 추가</div>
              <div class="mt-1 text-xs text-gray-400">필요한 것만 골라 추가하세요. 아래 개발용 항목은 사무직에서는 보통 필요하지 않습니다.</div>
            </div>
            <span class="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-gray-400">${advanced.length}개</span>
          </div>
          <div class="mt-4 flex flex-wrap gap-2" id="advanced-field-picker">
            ${advanced.map((field) => `
              <button type="button" data-field-id="${field.id}" data-field-label="${field.label}" class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:border-brand-300 hover:bg-brand-50" onclick="addSelectedAdvancedField('${field.id}')">
                ${field.label}
              </button>
            `).join('')}
            <button type="button" class="rounded-xl border border-dashed border-brand-300 bg-white px-3 py-2 text-xs font-semibold text-brand-700 shadow-sm hover:bg-brand-50" onclick="addBlankInputField()">
              빈 입력 추가
            </button>
          </div>
          <div class="mt-5 space-y-5" id="selected-advanced-fields"></div>
        </div>
      ` : ''}
    </div>
  `;
}

function syncAdvancedPickerButton(fieldId, active) {
  const button = document.querySelector(`#advanced-field-picker [data-field-id="${fieldId}"]`);
  if (!button) return;
  const label = button.dataset.fieldLabel || String(button.textContent || '').replace('선택됨 · ', '').trim() || fieldId;
  button.dataset.selected = active ? 'true' : 'false';
  button.classList.toggle('border-brand-500', active);
  button.classList.toggle('bg-brand-50', active);
  button.classList.toggle('text-white', active);
  button.classList.toggle('text-slate-700', !active);
  button.classList.toggle('opacity-40', active);
  button.classList.toggle('cursor-not-allowed', active);
  button.textContent = active ? `선택됨 · ${label}` : label;
  button.disabled = active;
}

function renderFieldControl(f, value = '', showLabel = true) {
  const req = f.required ? '<span class="text-red-400 ml-0.5">*</span>' : '';
  const baseClass = 'field-input w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 shadow-sm focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-200 transition-all';
  const labelBlock = showLabel ? `<label class="block text-sm font-medium text-slate-700 mb-1.5">${f.label}${req}</label>` : '';
  if (f.type === 'select') {
    const options = (f.options || []).map((opt) => `
      <option value="${escapeHtml(opt.value)}" ${String(value || '').toLowerCase() === String(opt.value || '').toLowerCase() ? 'selected' : ''}>
        ${escapeHtml(opt.label)}
      </option>`).join('');
    return `
      <div>
        ${labelBlock}
        <select id="field-${f.id}" data-field="${f.id}"
          class="${baseClass}"
          onchange="updateField('${f.id}', this.value)">
          ${options}
        </select>
      </div>
    `;
  }
  if (f.type === 'textarea') {
    return `<div>
      ${labelBlock}
      <textarea id="field-${f.id}" data-field="${f.id}" placeholder="${f.placeholder || ''}" rows="4"
        class="${baseClass} resize-y"
        oninput="updateField('${f.id}', this.value)">${escapeHtml(value || '')}</textarea>
    </div>`;
  }
  return `<div>
    ${labelBlock}
    <input type="text" id="field-${f.id}" data-field="${f.id}" placeholder="${f.placeholder || ''}" value="${escapeHtml(value || '')}"
      class="${baseClass}"
      oninput="updateField('${f.id}', this.value)" />
  </div>`;
}

function buildAdvancedCardTitle(label, note) {
  return `
    <div class="text-sm font-semibold text-slate-900">${label}</div>
    ${note ? `<div class="mt-1 text-xs text-gray-500">${note}</div>` : ''}
  `;
}

function renderAdvancedRemoveButton(handlerName, id) {
  return `
    <button type="button"
      class="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
      onclick="${handlerName}('${id}')">
      제거
    </button>
  `;
}

function addSelectedAdvancedField(fieldId) {
  const fields = state.advancedFields || [];
  const field = fields.find((item) => item.id === fieldId);
  if (!field) return;

  state.selectedAdvancedFields = state.selectedAdvancedFields || [];
  if (state.selectedAdvancedFields.some((item) => item.id === fieldId)) return;

  const selected = document.getElementById('selected-advanced-fields');
  if (!selected) return;

  const wrapper = document.createElement('div');
  wrapper.className = 'rounded-2xl border border-slate-200 bg-white p-4 shadow-sm';
  wrapper.dataset.addedField = fieldId;
  wrapper.dataset.addedType = 'advanced';
  wrapper.innerHTML = `
    <div class="mb-3 flex items-center justify-between gap-3">
      <div>
        ${buildAdvancedCardTitle(field.label, field.description || '선택한 항목은 값이 비어 있어도 프롬프트에 포함됩니다.')}
      </div>
      <div class="flex items-center gap-2">
        <span class="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-semibold text-brand-700">선택 입력</span>
        ${renderAdvancedRemoveButton('removeSelectedAdvancedField', field.id)}
      </div>
    </div>
    ${renderFieldControl(field, state.fields?.[field.id] || '', false)}
  `;
  selected.appendChild(wrapper);

  state.selectedAdvancedFields.push({
    id: field.id,
    label: field.label,
    description: field.description || '',
    required: !!field.required,
    placeholder: field.placeholder || '',
    type: field.type || 'text',
  });
  if (!Object.prototype.hasOwnProperty.call(state.fields, field.id)) {
    state.fields[field.id] = '';
  }
  syncAdvancedPickerButton(field.id, true);
}

function removeSelectedAdvancedField(fieldId) {
  const selected = document.getElementById('selected-advanced-fields');
  const wrapper = selected?.querySelector(`[data-added-field="${fieldId}"]`);
  if (wrapper) wrapper.remove();
  state.selectedAdvancedFields = (state.selectedAdvancedFields || []).filter((item) => item.id !== fieldId);
  if (state.fields && Object.prototype.hasOwnProperty.call(state.fields, fieldId)) {
    delete state.fields[fieldId];
  }
  syncAdvancedPickerButton(fieldId, false);
}

function addBlankInputField() {
  const selected = document.getElementById('selected-advanced-fields');
  if (!selected) return;

  state.customBlankCount = (state.customBlankCount || 0) + 1;
  const index = state.customBlankCount;
  const fieldId = `custom_note_${index}`;
  const label = `추가 입력 ${index}`;

  const wrapper = document.createElement('div');
  wrapper.className = 'rounded-2xl border border-slate-200 bg-white p-4 shadow-sm';
  wrapper.dataset.addedField = fieldId;
  wrapper.dataset.addedType = 'blank';
  wrapper.innerHTML = `
    <div class="mb-3 flex items-center justify-between gap-3">
      <div>
        ${buildAdvancedCardTitle(label, '직접 적는 자유 입력입니다. 비어 있어도 생성 프롬프트에 반영됩니다.')}
      </div>
      <div class="flex items-center gap-2">
        <span class="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-semibold text-brand-700">빈 입력</span>
        ${renderAdvancedRemoveButton('removeBlankInputField', fieldId)}
      </div>
    </div>
    <textarea id="${fieldId}" data-field="${fieldId}" rows="4" placeholder="자유롭게 적고 싶은 내용을 입력하세요."
      class="field-input w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 shadow-sm focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-200 transition-all resize-y"
      oninput="updateField('${fieldId}', this.value)"></textarea>
  `;
  selected.appendChild(wrapper);

  state.customBlankFields = state.customBlankFields || [];
  state.customBlankFields.push({
    id: fieldId,
    label,
    value: '',
  });
  state.fields[fieldId] = '';
}

function removeBlankInputField(fieldId) {
  const selected = document.getElementById('selected-advanced-fields');
  const wrapper = selected?.querySelector(`[data-added-field="${fieldId}"]`);
  if (wrapper) wrapper.remove();
  state.customBlankFields = (state.customBlankFields || []).filter((item) => item.id !== fieldId);
  if (state.fields && Object.prototype.hasOwnProperty.call(state.fields, fieldId)) {
    delete state.fields[fieldId];
  }
}

function resetFields() {
  state.fields = {};
  state.selectedAdvancedFields = [];
  state.customBlankFields = [];
  state.customBlankCount = 0;
  document.querySelectorAll('.field-input').forEach(el => {
    el.value = '';
    el.classList.remove('border-brand-500/30', 'bg-brand-500/5');
  });
  document.querySelectorAll('#advanced-field-picker [data-field-id]').forEach((button) => {
    const label = button.dataset.fieldLabel || String(button.textContent || '').replace('선택됨 · ', '').trim() || '';
    button.dataset.selected = 'false';
    button.disabled = false;
    button.classList.remove('border-brand-500', 'bg-brand-500/15', 'text-white', 'opacity-40', 'cursor-not-allowed');
    button.classList.add('text-slate-700');
    button.textContent = label;
  });
  const selected = document.getElementById('selected-advanced-fields');
  if (selected) selected.innerHTML = '';
  document.getElementById('result-section').classList.add('hidden');
}

window.addSelectedAdvancedField = addSelectedAdvancedField;
window.addBlankInputField = addBlankInputField;
window.removeSelectedAdvancedField = removeSelectedAdvancedField;
window.removeBlankInputField = removeBlankInputField;
window.resetFields = resetFields;
