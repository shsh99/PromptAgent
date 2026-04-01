async function showAdminDashboard() {
  const dashboard = document.getElementById('admin-dashboard');
  const content = document.getElementById('admin-dashboard-content');
  if (!dashboard || !content) return;
  dashboard.classList.remove('hidden');
  content.innerHTML = '<div class="admin-loading rounded-[28px] border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">관리자 대시보드를 불러오는 중입니다...</div>';

  try {
    const token = getAdminToken();
    if (!token) {
      content.innerHTML = '<div class="admin-error rounded-[28px] border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700 shadow-sm">관리자 토큰이 없습니다. 상단 관리자 버튼으로 다시 입력해 주세요.</div>';
      return;
    }

    const data = await fetchAdminLogs();
    if (data?.unauthorized) {
      clearAdminToken();
      content.innerHTML = '<div class="admin-error rounded-[28px] border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700 shadow-sm">관리자 토큰이 유효하지 않습니다.</div>';
      return;
    }
    if (data?.error) {
      content.innerHTML = `<div class="admin-error rounded-[28px] border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700 shadow-sm">${escapeHtml(data.error)}</div>`;
      return;
    }

    window.__adminLogsCache = data;
    if (!window.__adminDashboardSection) {
      window.__adminDashboardSection = 'admin-overview';
    }

    content.innerHTML = renderAdminDashboardShell(renderAdminPanelV2(data));
    refreshTrainingSamplesSection();
  } catch (error) {
    content.innerHTML = `<div class="admin-error rounded-[28px] border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700 shadow-sm">관리자 대시보드를 열지 못했습니다. ${escapeHtml(error?.message || '알 수 없는 오류')}</div>`;
  }
}

async function reloadAdminDashboard() {
  const dashboard = document.getElementById('admin-dashboard');
  if (dashboard && !dashboard.classList.contains('hidden')) {
    await showAdminDashboard();
  }
}

function closeAdminDashboard() {
  const dashboard = document.getElementById('admin-dashboard');
  if (dashboard) dashboard.classList.add('hidden');
}

function clearHistory() {
  localStorage.removeItem(USER_HISTORY_KEY);
  localStorage.removeItem(USER_ACTIVITY_KEY);
  localStorage.removeItem(ACTIVE_PROMPT_HISTORY_KEY);

  const token = getAdminToken();
  if (!token) {
    showHistory();
    return;
  }

  fetch('/api/admin/logs', {
    method: 'DELETE',
    headers: { 'X-Admin-Token': token },
  }).then(async (res) => {
    if (res.status === 401) {
      clearAdminToken();
      alert('관리자 토큰이 유효하지 않습니다.');
      return;
    }
    if (!res.ok) {
      alert('로그 초기화에 실패했습니다.');
      return;
    }
    await showHistory();
  });
}

window.showAdminDashboard = showAdminDashboard;
window.reloadAdminDashboard = reloadAdminDashboard;
window.closeAdminDashboard = closeAdminDashboard;
window.clearHistory = clearHistory;
