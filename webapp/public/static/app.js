// ===== PromptForge v2.1 - AI 프롬프트 생성기 =====
let state = {
  purpose: null, keyword: '', techniqueId: null, techniqueData: null,
  fields: {}, history: JSON.parse(localStorage.getItem('pf_history') || '[]'),
  recommendation: null, chainData: null, contextDocMeta: null,
};

document.addEventListener('DOMContentLoaded', async () => {
  await loadPurposes();
  await loadTechniques();
});

// ===== Step 1 =====
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
  // 추천 초기화
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

// ===== 추천 요청 =====
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
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ purpose: state.purpose, keyword }),
    });
    const data = await res.json();
    state.recommendation = data;
    displayRecommendation(data);
  } catch (e) { console.error(e); }
  finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-magic"></i> 추천 받기';
  }
}

function displayRecommendation(data) {
  const section = document.getElementById('recommendation-section');
  section.classList.remove('hidden');
  document.getElementById('rec-reason').textContent = data.reason;

  const catLabels = { prompt: '프롬프트', context: '컨텍스트', harness: '하네스' };
  const catColors = { prompt: 'bg-blue-500/20 text-blue-400', context: 'bg-cyan-500/20 text-cyan-400', harness: 'bg-indigo-500/20 text-indigo-400' };

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
    </button>
  `;

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
      </button>
    `).join('')}
  `;

  setTimeout(() => section.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
}

// ===== 추천 기법 선택 (자동 채우기 포함) =====
async function selectRecommendedTechnique(id) {
  state.techniqueId = id;
  // 기법 카드 하이라이트
  document.querySelectorAll('.technique-card').forEach(el => {
    const s = el.dataset.technique === id;
    el.classList.toggle('border-brand-500', s);
    el.classList.toggle('bg-brand-500/5', s);
    el.classList.toggle('ring-1', s);
    el.classList.toggle('ring-brand-500/30', s);
    el.classList.toggle('border-gray-800', !s);
  });

  // 필드 로드
  const res = await fetch(`/api/techniques/${id}`);
  const data = await res.json();
  state.techniqueData = data;
  renderFields(data);

  // 자동 채우기
  const keyword = state.keyword || document.getElementById('keyword-input').value.trim();
  if (keyword && state.purpose) {
    const autoRes = await fetch('/api/auto-fill', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
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

// ===== Step 2: 수동 기법 선택 =====
async function loadTechniques() {
  const res = await fetch('/api/techniques');
  const data = await res.json();
  const grid = document.getElementById('technique-grid');
  const colorMap = {
    blue: { bg: 'bg-blue-500/10', text: 'text-blue-400' },
    green: { bg: 'bg-green-500/10', text: 'text-green-400' },
    purple: { bg: 'bg-purple-500/10', text: 'text-purple-400' },
    orange: { bg: 'bg-orange-500/10', text: 'text-orange-400' },
    red: { bg: 'bg-red-500/10', text: 'text-red-400' },
    teal: { bg: 'bg-teal-500/10', text: 'text-teal-400' },
    pink: { bg: 'bg-pink-500/10', text: 'text-pink-400' },
    indigo: { bg: 'bg-indigo-500/10', text: 'text-indigo-400' },
    cyan: { bg: 'bg-cyan-500/10', text: 'text-cyan-400' },
  };
  const diffColors = { '초급': 'bg-green-500/20 text-green-400', '중급': 'bg-yellow-500/20 text-yellow-400', '고급': 'bg-red-500/20 text-red-400' };
  const catLabels = { prompt: '프롬프트', context: '컨텍스트', harness: '하네스' };
  const catColors = { prompt: 'bg-blue-500/10 text-blue-400', context: 'bg-cyan-500/10 text-cyan-400', harness: 'bg-indigo-500/10 text-indigo-400' };

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
      </button>
    `;
  }).join('');
}

async function selectTechniqueManual(id) {
  // 수동 선택도 자동채우기 적용
  await selectRecommendedTechnique(id);
}

// ===== Step 3: 필드 =====
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
          oninput="updateField('${f.id}', this.value)" onfocus="this.classList.remove('border-brand-500/30','bg-brand-500/5')"></textarea>
      </div>`;
    }
    return `<div>
      <label class="block text-sm font-medium text-gray-300 mb-1.5">${f.label}${req}</label>
      <input type="text" id="field-${f.id}" data-field="${f.id}" placeholder="${f.placeholder}"
        class="field-input w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
        oninput="updateField('${f.id}', this.value)" onfocus="this.classList.remove('border-brand-500/30','bg-brand-500/5')" />
    </div>`;
  }).join('');
}

function updateField(id, value) { state.fields[id] = value; }

function resetFields() {
  state.fields = {};
  document.querySelectorAll('.field-input').forEach(el => {
    el.value = '';
    el.classList.remove('border-brand-500/30', 'bg-brand-500/5');
  });
  document.getElementById('result-section').classList.add('hidden');
}

// ===== 프롬프트 생성 =====
async function generatePrompt() {
  const btn = document.getElementById('generate-btn');
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 생성 중...';
  try {
    const keyword = document.getElementById('keyword-input')?.value || '';
    state.keyword = keyword;
    const res = await fetch('/api/generate', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ techniqueId: state.techniqueId, fields: state.fields, purpose: state.purpose, keyword }),
    });
    const data = await res.json();
    if (data.error) { alert(data.error); return; }
    state.chainData = data.chainData;
    state.contextDocMeta = data.contextDocMeta;
    displayResult(data);
    saveToHistory(data);
  } catch (e) { console.error(e); alert('프롬프트 생성 중 오류가 발생했습니다.'); }
  finally { btn.disabled = false; btn.innerHTML = '<i class="fas fa-wand-magic-sparkles"></i> 프롬프트 생성'; }
}

// ===== 결과 =====
function displayResult(data) {
  const section = document.getElementById('result-section');
  section.classList.remove('hidden');
  document.getElementById('result-prompt').textContent = data.prompt;
  document.getElementById('result-technique-name').textContent = `${data.technique.name} (${data.technique.nameEn})`;
  const qr = data.qualityReport;
  const gradeEl = document.getElementById('quality-grade');
  const gc = { S:'bg-gradient-to-br from-yellow-400 to-orange-500 text-white', A:'bg-gradient-to-br from-green-400 to-emerald-500 text-white', B:'bg-gradient-to-br from-blue-400 to-blue-500 text-white', C:'bg-gradient-to-br from-orange-400 to-orange-500 text-white', D:'bg-gradient-to-br from-red-400 to-red-500 text-white' };
  gradeEl.className = `w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-black ${gc[qr.grade]||gc.C}`;
  gradeEl.textContent = qr.grade;
  document.getElementById('quality-score').textContent = qr.percentage;
  const labels = { S:'완벽한 프롬프트!', A:'매우 좋은 프롬프트', B:'양호한 프롬프트', C:'개선 필요', D:'많은 개선 필요' };
  document.getElementById('quality-label').textContent = labels[qr.grade]||'';
  document.getElementById('quality-checks').innerHTML = qr.checks.map(c => `
    <div class="flex items-start gap-2 text-xs">
      <div class="mt-0.5 flex-shrink-0">${c.passed?'<i class="fas fa-circle-check text-green-400"></i>':'<i class="fas fa-circle-xmark text-gray-600"></i>'}</div>
      <div><span class="${c.passed?'text-gray-300':'text-gray-500'}">${c.label}</span><span class="text-gray-600 ml-1">— ${c.tip}</span></div>
    </div>`).join('');
  document.getElementById('tips-list').innerHTML = data.tips.map(t => `
    <li class="flex items-start gap-2"><i class="fas fa-angle-right text-brand-500 mt-0.5 flex-shrink-0"></i><span>${t}</span></li>`).join('');

  // 체이닝 단계별 프롬프트 표시
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
            <button onclick="event.stopPropagation(); copyChainStep(${c.step - 1})" class="text-[10px] text-gray-500 hover:text-white bg-gray-800 hover:bg-gray-700 px-2 py-1 rounded-lg transition-all flex items-center gap-1">
              <i class="fas fa-copy"></i>복사
            </button>
            <i class="fas fa-chevron-down text-gray-600 text-xs chain-chevron transition-transform"></i>
          </div>
        </div>
        <div class="chain-step-body hidden">
          <pre class="p-4 text-xs text-gray-300 whitespace-pre-wrap font-mono leading-relaxed">${escapeHtml(c.prompt)}</pre>
        </div>
      </div>
    `).join('');
  } else {
    chainSection.classList.add('hidden');
  }

  // 컨텍스트 문서 메타 표시
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
        <button onclick="downloadContextDoc()" class="flex-1 text-xs bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5">
          <i class="fas fa-download"></i>context.md 다운로드
        </button>
        <button onclick="copyPrompt()" class="flex-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-4 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5">
          <i class="fas fa-copy"></i>전체 복사
        </button>
      </div>
    `;
  } else {
    ctxSection.classList.add('hidden');
  }

  setTimeout(() => section.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
}

// ===== 복사 & 다운로드 =====
function copyPrompt() {
  const text = document.getElementById('result-prompt').textContent;
  navigator.clipboard.writeText(text).then(() => {
    const btn = document.getElementById('copy-btn');
    btn.innerHTML = '<i class="fas fa-check"></i> 복사됨!';
    setTimeout(() => { btn.innerHTML = '<i class="fas fa-copy"></i> 복사'; }, 2000);
  });
}
function downloadPrompt() {
  const text = document.getElementById('result-prompt').textContent;
  const ext = state.contextDocMeta ? 'md' : 'txt';
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = state.contextDocMeta ? state.contextDocMeta.filename : `prompt-${state.techniqueId}-${Date.now()}.txt`; a.click();
  URL.revokeObjectURL(url);
}

function downloadContextDoc() {
  const text = document.getElementById('result-prompt').textContent;
  const filename = state.contextDocMeta?.filename || 'context.md';
  const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
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
    if (btn) { const orig = btn.innerHTML; btn.innerHTML = '<i class="fas fa-check"></i>복사됨!'; setTimeout(() => { btn.innerHTML = orig; }, 1500); }
  });
}

function downloadAllChainSteps() {
  if (!state.chainData) return;
  const text = state.chainData.map(c => `========== Step ${c.step}: ${c.title} ==========\n\n${c.prompt}`).join('\n\n\n');
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `prompt-chain-${state.keyword || 'project'}-${Date.now()}.txt`; a.click();
  URL.revokeObjectURL(url);
}

// ===== 히스토리 =====
function saveToHistory(data) {
  state.history.unshift({
    id: Date.now(), technique: data.technique.name, prompt: data.prompt,
    grade: data.qualityReport.grade, score: data.qualityReport.percentage,
    timestamp: new Date().toLocaleString('ko-KR'), purpose: state.purpose, keyword: state.keyword,
  });
  if (state.history.length > 20) state.history = state.history.slice(0, 20);
  localStorage.setItem('pf_history', JSON.stringify(state.history));
}
function showHistory() {
  document.getElementById('history-modal').classList.remove('hidden');
  const content = document.getElementById('history-content');
  if (!state.history.length) { content.innerHTML = '<div class="text-center py-12 text-gray-500"><i class="fas fa-inbox text-3xl mb-3"></i><p class="text-sm">아직 생성된 프롬프트가 없습니다.</p></div>'; return; }
  const gc = { S:'bg-yellow-500/20 text-yellow-400', A:'bg-green-500/20 text-green-400', B:'bg-blue-500/20 text-blue-400', C:'bg-orange-500/20 text-orange-400', D:'bg-red-500/20 text-red-400' };
  content.innerHTML = state.history.map(h => `
    <div class="border border-gray-800 rounded-xl p-4 mb-3 hover:border-gray-700 transition-colors">
      <div class="flex items-center justify-between mb-2">
        <div class="flex items-center gap-2"><span class="text-xs px-2 py-0.5 rounded-full font-bold ${gc[h.grade]||''}">${h.grade}</span><span class="text-sm font-medium text-white">${h.technique}</span></div>
        <span class="text-[10px] text-gray-600">${h.timestamp}</span>
      </div>
      ${h.keyword?`<div class="text-[10px] text-gray-500 mb-2"><i class="fas fa-tag mr-1"></i>${escapeHtml(h.keyword)}</div>`:''}
      <pre class="text-xs text-gray-400 whitespace-pre-wrap line-clamp-3 font-mono">${escapeHtml(h.prompt)}</pre>
      <button onclick="loadFromHistory(${h.id})" class="mt-2 text-[10px] text-brand-400 hover:text-brand-300"><i class="fas fa-arrow-up-right-from-square mr-1"></i>이 프롬프트 사용하기</button>
    </div>`).join('');
}
function loadFromHistory(id) {
  const entry = state.history.find(h => h.id === id); if (!entry) return;
  closeHistory();
  document.getElementById('result-section').classList.remove('hidden');
  document.getElementById('result-prompt').textContent = entry.prompt;
  document.getElementById('result-technique-name').textContent = entry.technique;
  setTimeout(() => document.getElementById('result-section').scrollIntoView({ behavior: 'smooth', block: 'start' }), 200);
}
function clearHistory() { if (confirm('모든 히스토리를 삭제하시겠습니까?')) { state.history = []; localStorage.removeItem('pf_history'); showHistory(); } }
function closeHistory() { document.getElementById('history-modal').classList.add('hidden'); }

// ===== 가이드 =====
function showGuide() {
  document.getElementById('guide-modal').classList.remove('hidden');
  document.getElementById('guide-content').innerHTML = `
    <div>
      <h4 class="text-base font-bold text-white mb-2 flex items-center gap-2"><i class="fas fa-circle-info text-brand-400"></i>프롬프트 엔지니어링이란?</h4>
      <p class="text-gray-400 text-sm leading-relaxed">프롬프트 엔지니어링은 AI에게 <strong class="text-white">원하는 맥락</strong>을 제공하고, <strong class="text-white">정확한 지시</strong>를 내려 효과적이고 관련성 높은 출력을 얻는 기술입니다.</p>
    </div>
    <div>
      <h4 class="text-base font-bold text-white mb-3 flex items-center gap-2"><i class="fas fa-diagram-project text-cyan-400"></i>3가지 엔지니어링 유형</h4>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div class="bg-blue-500/5 border border-blue-500/20 rounded-lg p-3">
          <div class="text-sm font-semibold text-blue-400 mb-1">프롬프트 엔지니어링</div>
          <div class="text-xs text-gray-400">개별 프롬프트의 구조와 표현을 최적화. 제로샷, 퓨샷, CoT, ToT, 역할 프롬프트 등</div>
        </div>
        <div class="bg-cyan-500/5 border border-cyan-500/20 rounded-lg p-3">
          <div class="text-sm font-semibold text-cyan-400 mb-1">컨텍스트 엔지니어링</div>
          <div class="text-xs text-gray-400">프로젝트 전체 맥락 설계. 시스템 프롬프트, 프로젝트 스펙, 기술 요구사항 종합</div>
        </div>
        <div class="bg-indigo-500/5 border border-indigo-500/20 rounded-lg p-3">
          <div class="text-sm font-semibold text-indigo-400 mb-1">하네스 엔지니어링</div>
          <div class="text-xs text-gray-400">역할+컨텍스트+작업+형식+제약을 체계적으로 결합하는 종합 기법</div>
        </div>
      </div>
    </div>
    <div>
      <h4 class="text-base font-bold text-white mb-3 flex items-center gap-2"><i class="fas fa-key text-yellow-400"></i>프롬프트의 핵심 요소</h4>
      <div class="grid grid-cols-2 gap-3">
        <div class="bg-gray-800/50 rounded-lg p-3"><div class="text-sm font-semibold text-brand-400 mb-1">컨텍스트</div><div class="text-xs text-gray-400">배경이나 역할 설정</div></div>
        <div class="bg-gray-800/50 rounded-lg p-3"><div class="text-sm font-semibold text-brand-400 mb-1">지시사항</div><div class="text-xs text-gray-400">정확한 작업 명시</div></div>
        <div class="bg-gray-800/50 rounded-lg p-3"><div class="text-sm font-semibold text-brand-400 mb-1">출력 형식</div><div class="text-xs text-gray-400">원하는 결과 형태</div></div>
        <div class="bg-gray-800/50 rounded-lg p-3"><div class="text-sm font-semibold text-brand-400 mb-1">톤 & 제약</div><div class="text-xs text-gray-400">어조, 길이, 수준</div></div>
      </div>
    </div>
    <div>
      <h4 class="text-base font-bold text-white mb-3 flex items-center gap-2"><i class="fas fa-stairs text-green-400"></i>사용법</h4>
      <div class="space-y-2">
        <div class="flex items-start gap-3 bg-gray-800/50 rounded-lg p-3"><div class="w-6 h-6 bg-brand-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">1</div><div><div class="text-sm font-medium text-white">목적 + 키워드 입력</div><div class="text-xs text-gray-400">프로젝트 유형을 선택하고 핵심 키워드를 입력합니다.</div></div></div>
        <div class="flex items-start gap-3 bg-gray-800/50 rounded-lg p-3"><div class="w-6 h-6 bg-brand-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">2</div><div><div class="text-sm font-medium text-white">"추천 받기" 클릭</div><div class="text-xs text-gray-400">AI가 최적의 기법을 추천하고, 필드를 자동으로 채워줍니다.</div></div></div>
        <div class="flex items-start gap-3 bg-gray-800/50 rounded-lg p-3"><div class="w-6 h-6 bg-brand-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">3</div><div><div class="text-sm font-medium text-white">자동 채워진 필드 검토/수정</div><div class="text-xs text-gray-400">AI가 채운 내용을 확인하고 필요 시 수정합니다.</div></div></div>
        <div class="flex items-start gap-3 bg-gray-800/50 rounded-lg p-3"><div class="w-6 h-6 bg-brand-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">4</div><div><div class="text-sm font-medium text-white">"프롬프트 생성" 클릭</div><div class="text-xs text-gray-400">완성된 프롬프트를 복사하여 AI 도구에 붙여넣으세요!</div></div></div>
      </div>
    </div>
    <div class="bg-brand-500/5 border border-brand-500/20 rounded-xl p-4">
      <h4 class="text-sm font-bold text-brand-400 mb-2"><i class="fas fa-lightbulb mr-1"></i>바이브 코딩 팁</h4>
      <ul class="text-xs text-gray-400 space-y-1.5">
        <li class="flex items-start gap-2"><i class="fas fa-check text-brand-500 mt-0.5"></i>프로젝트의 전체 그림을 먼저 설명하세요.</li>
        <li class="flex items-start gap-2"><i class="fas fa-check text-brand-500 mt-0.5"></i>컨텍스트 엔지니어링으로 프로젝트 스펙 문서를 만드세요.</li>
        <li class="flex items-start gap-2"><i class="fas fa-check text-brand-500 mt-0.5"></i>프롬프트 체이닝으로 단계별 개발을 진행하세요.</li>
        <li class="flex items-start gap-2"><i class="fas fa-check text-brand-500 mt-0.5"></i>한 번에 모든 것을 요청하지 말고 나누세요.</li>
      </ul>
    </div>`;
}
function closeGuide() { document.getElementById('guide-modal').classList.add('hidden'); }

function escapeHtml(text) { const d = document.createElement('div'); d.textContent = text; return d.innerHTML; }
