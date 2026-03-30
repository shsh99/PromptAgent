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
        <div class="w-10 h-10 bg-gray-800 group-hover:bg-brand-500/10 rounded-lg flex items-center justify-center transition-colors">
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
  } catch (e) {
    console.error(e);
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-magic"></i> 추천 받기';
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
      class="w-full bg-brand-500/10 border-2 border-brand-500/40 hover:border-brand-500 rounded-xl p-4 text-left transition-all group">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-[10px] bg-brand-500/30 text-brand-300 px-2 py-0.5 rounded-full font-bold">1순위 추천</span>
        <span class="text-[10px] px-2 py-0.5 rounded-full ${catColors[p.category] || ''}">${catLabels[p.category] || ''} 엔지니어링</span>
      </div>
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-brand-500/20 rounded-lg flex items-center justify-center">
          <i class="fas ${p.icon} text-brand-400"></i>
        </div>
        <div>
          <div class="text-sm font-semibold text-white group-hover:text-brand-300">${p.name}</div>
          <div class="text-[10px] text-gray-500 font-mono">${p.nameEn}</div>
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
        class="w-full bg-gray-800/50 border border-gray-700 hover:border-gray-500 rounded-lg p-3 text-left transition-all group flex items-center gap-3">
        <div class="w-8 h-8 bg-gray-700/50 rounded-lg flex items-center justify-center flex-shrink-0">
          <i class="fas ${t.icon} text-gray-400 group-hover:text-brand-400 text-sm"></i>
        </div>
        <div>
          <div class="text-xs font-medium text-gray-300 group-hover:text-white">${t.name}</div>
          <div class="text-[10px] text-gray-600">${catLabels[t.category] || ''} 엔지니어링</div>
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
              <span class="text-[10px] text-gray-600 font-mono">${t.nameEn}</span>
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
function renderFields(data) {
  const container = document.getElementById('fields-container');
  state.fields = {};
  container.innerHTML = data.fields.map(f => {
    const req = f.required ? '<span class="text-red-400 ml-0.5">*</span>' : '';
    if (f.type === 'textarea') {
      return `<div>
        <label class="block text-sm font-medium text-gray-300 mb-1.5">${f.label}${req}</label>
        <textarea id="field-${f.id}" data-field="${f.id}" placeholder="${f.placeholder}" rows="4"
          class="field-input w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all resize-y"
          oninput="updateField('${f.id}', this.value)"
          onfocus="this.classList.remove('border-brand-500/30','bg-brand-500/5')"></textarea>
      </div>`;
    }
    return `<div>
      <label class="block text-sm font-medium text-gray-300 mb-1.5">${f.label}${req}</label>
      <input type="text" id="field-${f.id}" data-field="${f.id}" placeholder="${f.placeholder}"
        class="field-input w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
        oninput="updateField('${f.id}', this.value)"
        onfocus="this.classList.remove('border-brand-500/30','bg-brand-500/5')" />
    </div>`;
  }).join('');
}

function updateField(id, value) {
  state.fields[id] = value;
}

function resetFields() {
  state.fields = {};
  document.querySelectorAll('.field-input').forEach(el => {
    el.value = '';
    el.classList.remove('border-brand-500/30', 'bg-brand-500/5');
  });
  document.getElementById('result-section').classList.add('hidden');
}
