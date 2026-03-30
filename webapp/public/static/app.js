// ===== app.js — 진입점 (전역 상태 + 초기화) =====
//
// 모듈 구조
//   app.js        이 파일. 전역 state + DOMContentLoaded
//   utils.js      escapeHtml 등 공통 유틸
//   changelog.js  업데이트 로그 데이터 + 모달
//   technique.js  목적·기법 선택, 필드 렌더링
//   prompt.js     프롬프트 생성, 결과 표시, 복사·다운로드
//   library.js    프롬프트 라이브러리 저장·조회·모달
//   history.js    생성 히스토리 저장·조회
//   improve.js    프롬프트 개선기 모달·로직
//   guide.js      가이드 모달
// ─────────────────────────────────────────────────────────────────

let state = {
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
  await loadPurposes();   // technique.js
  await loadTechniques(); // technique.js
  // 동적 주입 (library.js, improve.js)
  injectNavLibraryButton();
  injectLibraryModal();
  injectImproveModal();
  // 업데이트 뱃지 (changelog.js)
  renderUpdatesBadge();
});
