// ===== utils.js — 공통 유틸리티 =====

function escapeHtml(text) {
  const d = document.createElement('div');
  d.textContent = text;
  return d.innerHTML;
}
