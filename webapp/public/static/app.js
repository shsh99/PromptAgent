// ===== app.js - 전역 상태 + 초기화 =====

let state = {
  mode: localStorage.getItem('pf_mode') || 'builder',
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

document.addEventListener('DOMContentLoaded', async () => {
  if (typeof ensureVisitorId === 'function') ensureVisitorId();
  if (typeof recordActivity === 'function') {
    recordActivity('PAGE_VIEW', {
      path: location.pathname,
      title: document.title,
      referrer: document.referrer || '',
    });
  }

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
