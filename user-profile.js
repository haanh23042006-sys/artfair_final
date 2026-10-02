/**
 * ARTFAIR - User Profile Dashboard Logic (Đồng Bộ Khung Giá Mới)
 */

const DASH_STATE = {
  currentRole: 'collector',
  profileData: null,
  activeBuyerTab: 'following',
  activeCreatorTab: 'inbox'
};

function formatPriceOrBudget(val) {
  if (!val) return '0 VNĐ';
  if (typeof val === 'string' && val.includes('VNĐ')) return val;
  const num = Number(String(val).replace(/[^0-9]/g, ''));
  if (isNaN(num) || num === 0) return '0 VNĐ';
  return typeof formatVND === 'function' ? formatVND(num) : num.toLocaleString('vi-VN') + ' VNĐ';
}

document.addEventListener('DOMContentLoaded', () => {
  loadUserDashboardSession();
  initDashboardUI();
});

function loadUserDashboardSession() {
  try {
    const saved = localStorage.getItem('artfair_user');
    if (saved) {
      const u = JSON.parse(saved);
      DASH_STATE.currentRole = u.role === 'artist' ? 'artist' : 'collector';
    }
  } catch (e) {}

  if (typeof MOCK_USER_PROFILES !== 'undefined') {
    DASH_STATE.profileData = MOCK_USER_PROFILES[DASH_STATE.currentRole] || MOCK_USER_PROFILES['collector'];
  }
  renderDashboardHeader(DASH_STATE.profileData);
  renderCurrentRoleView();
}

function renderDashboardHeader(u) {
  if (!u) return;
  if (document.getElementById('dashUserName')) document.getElementById('dashUserName').textContent = u.name;
  if (document.getElementById('dashUserEmail')) document.getElementById('dashUserEmail').textContent = u.email;
  if (document.getElementById('dashUserBio')) document.getElementById('dashUserBio').textContent = `"${u.bio}"`;
  if (document.getElementById('dashUserAvatar') && u.avatar) document.getElementById('dashUserAvatar').src = u.avatar;
}

function switchRoleView(role) {
  DASH_STATE.currentRole = role;
  if (typeof MOCK_USER_PROFILES !== 'undefined') {
    DASH_STATE.profileData = MOCK_USER_PROFILES[role];
  }
  document.getElementById('btnRoleBuyer')?.classList.toggle('active', role === 'collector');
  document.getElementById('btnRoleCreator')?.classList.toggle('active', role === 'artist');
  renderDashboardHeader(DASH_STATE.profileData);
  renderCurrentRoleView();
}

function renderCurrentRoleView() {
  const bView = document.getElementById('viewBuyerDashboard');
  const cView = document.getElementById('viewCreatorDashboard');

  if (DASH_STATE.currentRole === 'collector') {
    if (bView) { bView.classList.add('active'); bView.style.display = 'block'; }
    if (cView) { cView.classList.remove('active'); cView.style.display = 'none'; }
    renderBuyerTracker();
    renderBuyerCollectorHub();
  } else {
    if (cView) { cView.classList.add('active'); cView.style.display = 'block'; }
    if (bView) { bView.classList.remove('active'); bView.style.display = 'none'; }
    renderCreatorInbox();
    renderCreatorMyArtworks();
  }
}

function switchBuyerTab(tab) {
  DASH_STATE.activeBuyerTab = tab;
  document.querySelectorAll('.dash-tab-btn[data-buyertab]').forEach(b => b.classList.toggle('active', b.dataset.buyertab === tab));
  document.querySelectorAll('.buyer-tab-pane').forEach(p => p.classList.toggle('active', p.id === `paneBuyer${tab.charAt(0).toUpperCase() + tab.slice(1)}`));
}

function switchCreatorTab(tab) {
  DASH_STATE.activeCreatorTab = tab;
  document.querySelectorAll('.dash-tab-btn[data-creatortab]').forEach(b => b.classList.toggle('active', b.dataset.creatortab === tab));
  document.querySelectorAll('.creator-tab-pane').forEach(p => p.classList.toggle('active', p.id === `paneCreator${tab.charAt(0).toUpperCase() + tab.slice(1)}`));
}

function renderBuyerTracker() {
  const container = document.getElementById('liveTrackerList');
  const commissions = DASH_STATE.profileData?.liveCommissions || [];
  if (!container) return;

  container.innerHTML = commissions.map(item => `
    <div class="tracker-item-card" style="padding:16px; border:1px solid #e2e8f0; border-radius:14px; margin-bottom:12px;">
      <h4>${item.projectTitle}</h4>
      <p>Nghệ sĩ: <strong>${item.artistName}</strong> • Ngân sách: <strong style="color:#ef4444;">${formatPriceOrBudget(item.budget)}</strong></p>
      <span>Trạng thái: <strong>${item.stepLabel}</strong></span>
    </div>
  `).join('');
}

function renderBuyerCollectorHub() {
  const container = document.getElementById('purchasedLicensesGrid');
  const licenses = DASH_STATE.profileData?.purchasedLicenses || [];
  if (!container) return;

  container.innerHTML = licenses.map(lic => `
    <div class="license-card-item" style="display:flex; gap:16px; padding:16px; border:1px solid #e2e8f0; border-radius:14px; margin-bottom:12px;">
      <img src="${lic.image}" style="width:90px; height:90px; object-fit:cover; border-radius:10px;">
      <div>
        <h4 style="margin:0 0 4px 0;">${lic.title}</h4>
        <p style="margin:0; font-size:0.85rem; color:#ef4444;"><strong>${lic.licenseTier}</strong></p>
        <p style="margin:4px 0 0 0; font-size:0.8rem; color:#64748b;">Mã cấp phép: ${lic.certificateId || lic.id}</p>
      </div>
    </div>
  `).join('');
}

function renderCreatorInbox() {
  const container = document.getElementById('commissionInboxList');
  const requests = DASH_STATE.profileData?.incomingRequests || [];
  if (!container) return;

  container.innerHTML = requests.map(req => `
    <div class="inbox-request-card" style="padding:16px; border:1px solid #e2e8f0; border-radius:14px; margin-bottom:12px;">
      <h4>${req.projectTitle}</h4>
      <p>Khách hàng: <strong>${req.clientName}</strong> • Ngân sách: <strong style="color:#ef4444;">${formatPriceOrBudget(req.budget)}</strong></p>
      <p style="font-style:italic; font-size:0.85rem; color:#475569;">"${req.briefSummary}"</p>
    </div>
  `).join('');
}

function renderCreatorMyArtworks() {
  const container = document.getElementById('creatorArtworksGrid');
  if (!container || typeof ARTWORKS_DATABASE === 'undefined') return;

  container.innerHTML = ARTWORKS_DATABASE.slice(0, 6).map(art => `
    <div class="artwork-card" style="border:1px solid #e2e8f0; border-radius:12px; overflow:hidden;">
      <img src="${art.image}" style="width:100%; height:150px; object-fit:cover;">
      <div style="padding:12px;">
        <h4 style="margin:0 0 6px 0; font-size:0.95rem;">${art.title}</h4>
        <strong style="color:#ef4444; font-size:0.9rem;">${formatVND(art.basePrice)} - ${formatVND(art.exclusivePrice)}</strong>
      </div>
    </div>
  `).join('');
}

function initDashboardUI() {}
window.switchRoleView = switchRoleView;
window.switchBuyerTab = switchBuyerTab;
window.switchCreatorTab = switchCreatorTab;