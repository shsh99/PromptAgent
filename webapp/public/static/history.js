// ===== history.js — 생성 히스토리 =====

function saveToHistory(data) {
  state.history.unshift({
    id: Date.now(),
    technique: data.technique.name,
    prompt: data.prompt,
    grade: data.qualityReport.grade,
    score: data.qualityReport.percentage,
    timestamp: new Date().toLocaleString('ko-KR'),
    purpose: state.purpose,
    keyword: state.keyword,
  });
  if (state.history.length > 20) state.history = state.history.slice(0, 20);
  localStorage.setItem('pf_history', JSON.stringify(state.history));
}

function showHistory() {
  document.getElementById('history-modal').classList.remove('hidden');
  const content = document.getElementById('history-content');
  if (!state.history.length) {
    content.innerHTML = '<div class="text-center py-12 text-gray-500"><i class="fas fa-inbox text-3xl mb-3"></i><p class="text-sm">아직 생성된 프롬프트가 없습니다.</p></div>';
    return;
  }
  const gc = {
    S: 'bg-yellow-500/20 text-yellow-400',
    A: 'bg-green-500/20 text-green-400',
    B: 'bg-blue-500/20 text-blue-400',
    C: 'bg-orange-500/20 text-orange-400',
    D: 'bg-red-500/20 text-red-400',
  };
  content.innerHTML = state.history.map(h => `
    <div class="border border-gray-800 rounded-xl p-4 mb-3 hover:border-gray-700 transition-colors">
      <div class="flex items-center justify-between mb-2">
        <div class="flex items-center gap-2">
          <span class="text-xs px-2 py-0.5 rounded-full font-bold ${gc[h.grade] || ''}">${h.grade}</span>
          <span class="text-sm font-medium text-white">${escapeHtml(h.technique)}</span>
        </div>
        <span class="text-[10px] text-gray-600">${h.timestamp}</span>
      </div>
      ${h.keyword ? `<div class="text-[10px] text-gray-500 mb-2"><i class="fas fa-tag mr-1"></i>${escapeHtml(h.keyword)}</div>` : ''}
      <pre class="text-xs text-gray-400 whitespace-pre-wrap line-clamp-3 font-mono">${escapeHtml(h.prompt)}</pre>
      <button onclick="loadFromHistory(${h.id})" class="mt-2 text-[10px] text-brand-400 hover:text-brand-300">
        <i class="fas fa-arrow-up-right-from-square mr-1"></i>이 프롬프트 사용하기
      </button>
    </div>`).join('');
}

function loadFromHistory(id) {
  const entry = state.history.find(h => h.id === id);
  if (!entry) return;
  closeHistory();
  document.getElementById('result-section').classList.remove('hidden');
  document.getElementById('result-prompt').textContent = entry.prompt;
  document.getElementById('result-technique-name').textContent = entry.technique;
  setTimeout(() => document.getElementById('result-section').scrollIntoView({ behavior: 'smooth', block: 'start' }), 200);
}

function clearHistory() {
  if (confirm('모든 히스토리를 삭제하시겠습니까?')) {
    state.history = [];
    localStorage.removeItem('pf_history');
    showHistory();
  }
}

function closeHistory() {
  document.getElementById('history-modal').classList.add('hidden');
}
