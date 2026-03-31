// ===== app.js - 전역 상태 + 초기화 =====

let state = {
  mode: localStorage.getItem('pf_mode') || 'template',
  theme: localStorage.getItem('pf_theme') || 'light',
  promptLanguage: localStorage.getItem('pf_prompt_lang') || 'ko',
  promptStyle: localStorage.getItem('pf_prompt_style') || 'gpt',
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

function setPromptLanguage(language) {
  const nextLanguage = language === 'en' ? 'en' : 'ko';
  state.promptLanguage = nextLanguage;
  localStorage.setItem('pf_prompt_lang', nextLanguage);
  document.body.classList.toggle('prompt-lang-ko', nextLanguage === 'ko');
  document.body.classList.toggle('prompt-lang-en', nextLanguage === 'en');
  document.querySelectorAll('[data-prompt-lang]').forEach((button) => {
    const active = button.dataset.promptLang === nextLanguage;
    button.classList.toggle('bg-brand-600', active);
    button.classList.toggle('text-white', active);
    button.classList.toggle('bg-white/5', !active);
    button.classList.toggle('text-slate-200', !active);
  });
}

function setPromptStyle(style) {
  const nextStyle = ['gpt', 'claude', 'gemini', 'genspark', 'custom'].includes(style) ? style : 'gpt';
  state.promptStyle = nextStyle;
  localStorage.setItem('pf_prompt_style', nextStyle);
  document.querySelectorAll('[data-prompt-style]').forEach((button) => {
    const active = button.dataset.promptStyle === nextStyle;
    button.classList.toggle('bg-brand-600', active);
    button.classList.toggle('text-white', active);
    button.classList.toggle('bg-white/5', !active);
    button.classList.toggle('text-slate-200', !active);
  });
}

function setModeSelection(mode) {
  const activeMode = ['template', 'builder', 'optimize'].includes(mode) ? mode : 'template';
  document.querySelectorAll('button[onclick*="switchMode("]').forEach((button) => {
    const onclick = button.getAttribute('onclick') || '';
    const isActive =
      onclick.includes(`switchMode('${activeMode}')`) ||
      onclick.includes(`switchMode("${activeMode}")`);
    button.classList.toggle('ring-2', isActive);
    button.classList.toggle('ring-brand-400/50', isActive);
    button.classList.toggle('shadow-lg', isActive);
    button.classList.toggle('shadow-brand-500/10', isActive);
    button.classList.toggle('scale-[1.01]', isActive);
    button.classList.toggle('opacity-70', !isActive);
    button.classList.toggle('border-brand-500/30', isActive);
    button.classList.toggle('bg-brand-500/15', isActive);
    button.classList.toggle('text-white', isActive);
    button.classList.toggle('border-white/10', !isActive);
    button.classList.toggle('bg-white/5', !isActive);
    button.classList.toggle('text-slate-200', !isActive);
  });
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
  setPromptLanguage(state.promptLanguage);
  setPromptStyle(state.promptStyle);
  setModeSelection(state.mode);
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
window.setPromptLanguage = setPromptLanguage;
window.setPromptStyle = setPromptStyle;
window.setModeSelection = setModeSelection;
