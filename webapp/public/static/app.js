// ===== app.js - 전역 상태 + 초기화 =====

let state = {
  mode: localStorage.getItem('pf_mode') || 'template',
  theme: localStorage.getItem('pf_theme') || 'light',
  purpose: null,
  keyword: '',
  techniqueId: null,
  techniqueData: null,
  fields: {},
  visitorId: localStorage.getItem('pf_visitor_id') || null,
  history: [],
  activityLogs: [],
  library: JSON.parse(localStorage.getItem('pf_library') || '[]'),
  recommendation: null,
  chainData: null,
  contextDocMeta: null,
};

function setTheme(theme) {
  const nextTheme = theme === 'light' ? 'light' : 'dark';
  state.theme = nextTheme;
  localStorage.setItem('pf_theme', nextTheme);
  document.body.classList.toggle('theme-light', nextTheme === 'light');
  document.body.classList.toggle('theme-dark', nextTheme === 'dark');
  localStorage.setItem('pf_mode', state.mode || 'builder');
}

document.addEventListener('DOMContentLoaded', async () => {
  if (typeof ensureVisitorId === 'function') ensureVisitorId();
  if (typeof recordActivity === 'function') {
    recordActivity('PAGE_VIEW', {
      path: location.pathname,
      title: document.title,
      referrer: document.referrer || '',
    });
  }

  setTheme(state.theme);
  await loadPurposes();
  await loadTechniques();

  injectNavLibraryButton();
  injectLibraryModal();
  injectImproveModal();
  renderUpdatesBadge();

  if (typeof polishHomepageCopy === 'function') {
    polishHomepageCopy();
  }
  if (typeof initializeMode === 'function') {
    initializeMode(state.mode);
  }
});

window.setTheme = setTheme;
