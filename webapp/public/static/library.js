// ===== library.js - 프롬프트 라이브러리 =====

function injectNavLibraryButton() {
  const target = document.querySelector('nav .flex.items-center.gap-3:last-child');
  if (!target || document.getElementById('library-nav-btn')) return;
  const button = document.createElement('button');
  button.id = 'library-nav-btn';
  button.className = 'text-xs text-gray-400 hover:text-brand-400 transition-colors flex items-center gap-1.5';
  button.innerHTML = '<i class="fas fa-bookmark"></i><span class="hidden sm:inline">라이브러리</span>';
  button.onclick = showLibrary;
  target.appendChild(button);
}

function injectLibraryModal() {
  if (document.getElementById('library-modal')) return;
  const root = document.getElementById('app-root');
  if (!root) return;
  const wrapper = document.createElement('div');
  wrapper.id = 'library-modal';
  wrapper.className = 'fixed inset-0 z-[100] hidden';
  wrapper.innerHTML = `
    <div class="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
    <div class="relative max-w-3xl mx-auto mt-20 bg-gray-900 border border-gray-800 rounded-2xl max-h-[80vh] overflow-y-auto m-4">
      <div class="sticky top-0 bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between rounded-t-2xl">
        <h3 class="text-lg font-bold text-white flex items-center gap-2">
          <i class="fas fa-bookmark text-brand-400"></i>프롬프트 라이브러리
        </h3>
        <button id="library-close-btn" class="text-gray-400 hover:text-white">
          <i class="fas fa-xmark text-lg"></i>
        </button>
      </div>
      <div class="p-6">
        <input id="library-search" type="text" placeholder="제목, 태그, 내용 검색"
          class="mb-4 w-full rounded-xl border border-gray-700 bg-gray-800/50 px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500" />
        <div id="library-content"></div>
      </div>
    </div>
  `;
  root.appendChild(wrapper);
  wrapper.firstElementChild.onclick = closeLibrary;
  wrapper.querySelector('#library-close-btn').onclick = closeLibrary;
  wrapper.querySelector('#library-search').addEventListener('input', renderLibrary);
}

function saveToLibrary() {
  const prompt = document.getElementById('result-prompt').textContent?.trim();
  if (!prompt) return;
  const item = {
    id: Date.now(),
    title: state.keyword || state.techniqueId || '저장된 프롬프트',
    technique: document.getElementById('result-technique-name').textContent || '',
    prompt,
    favorite: false,
    tags: state.keyword ? state.keyword.split(/\s+/).slice(0, 4) : [],
    createdAt: new Date().toLocaleString('ko-KR'),
  };
  state.library.unshift(item);
  if (state.library.length > 100) state.library = state.library.slice(0, 100);
  localStorage.setItem('pf_library', JSON.stringify(state.library));
  const btn = document.getElementById('save-library-btn');
  if (btn) {
    const prev = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-check"></i> 저장됨';
    setTimeout(() => { btn.innerHTML = prev; }, 1500);
  }
  if (typeof recordActivity === 'function') {
    recordActivity('LIBRARY_SAVE', {
      techniqueId: state.techniqueId,
      keyword: state.keyword,
    });
  }
}

function showLibrary() {
  document.getElementById('library-modal').classList.remove('hidden');
  renderLibrary();
}

function closeLibrary() {
  document.getElementById('library-modal').classList.add('hidden');
}

function renderLibrary() {
  const content = document.getElementById('library-content');
  const query = (document.getElementById('library-search')?.value || '').trim().toLowerCase();
  const items = state.library.filter(item => {
    const hay = `${item.title} ${item.technique} ${item.prompt} ${(item.tags || []).join(' ')}`.toLowerCase();
    return !query || hay.includes(query);
  });
  if (!items.length) {
    content.innerHTML = '<div class="text-center py-12 text-gray-500"><i class="fas fa-bookmark text-3xl mb-3"></i><p class="text-sm">저장된 프롬프트가 없습니다.</p></div>';
    return;
  }
  content.innerHTML = items.map(item => `
    <div class="mb-3 rounded-xl border border-gray-800 p-4 transition-colors hover:border-gray-700">
      <div class="mb-2 flex items-center justify-between gap-3">
        <div>
          <div class="text-sm font-semibold text-white">${escapeHtml(item.title)}</div>
          <div class="text-[11px] text-gray-500">${escapeHtml(item.technique || '프롬프트')}</div>
        </div>
        <div class="flex items-center gap-2">
          <button onclick="toggleLibraryFavorite(${item.id})" class="text-xs text-gray-400 hover:text-yellow-300">
            <i class="fas ${item.favorite ? 'fa-star text-yellow-400' : 'fa-star'}"></i>
          </button>
          <button onclick="deleteLibraryItem(${item.id})" class="text-xs text-gray-500 hover:text-red-400">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
      ${(item.tags || []).length ? `<div class="mb-2 flex flex-wrap gap-1">${item.tags.map(tag => `<span class="rounded-full bg-gray-800 px-2 py-1 text-[10px] text-gray-400">${escapeHtml(tag)}</span>`).join('')}</div>` : ''}
      <pre class="line-clamp-3 whitespace-pre-wrap font-mono text-xs text-gray-400">${escapeHtml(item.prompt)}</pre>
      <div class="mt-3 flex items-center justify-between">
        <span class="text-[10px] text-gray-600">${item.createdAt}</span>
        <button onclick="loadLibraryItem(${item.id})" class="text-xs text-brand-400 hover:text-brand-300">
          <i class="fas fa-arrow-up-right-from-square mr-1"></i>불러오기
        </button>
      </div>
    </div>
  `).join('');
}

function toggleLibraryFavorite(id) {
  state.library = state.library.map(item => item.id === id ? { ...item, favorite: !item.favorite } : item);
  state.library.sort((a, b) => Number(b.favorite) - Number(a.favorite) || b.id - a.id);
  localStorage.setItem('pf_library', JSON.stringify(state.library));
  renderLibrary();
}

function deleteLibraryItem(id) {
  state.library = state.library.filter(item => item.id !== id);
  localStorage.setItem('pf_library', JSON.stringify(state.library));
  renderLibrary();
  if (typeof recordActivity === 'function') {
    recordActivity('LIBRARY_DELETE', { itemId: id });
  }
}

function loadLibraryItem(id) {
  const item = state.library.find(entry => entry.id === id);
  if (!item) return;
  closeLibrary();
  document.getElementById('result-section').classList.remove('hidden');
  document.getElementById('result-prompt').textContent = item.prompt;
  document.getElementById('result-technique-name').textContent = item.technique || '저장된 프롬프트';
  if (typeof recordActivity === 'function') {
    recordActivity('LIBRARY_LOAD', {
      itemId: id,
    });
  }
  setTimeout(() => document.getElementById('result-section').scrollIntoView({ behavior: 'smooth', block: 'start' }), 200);
}
