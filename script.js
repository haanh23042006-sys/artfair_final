/**
 * ARTFAIR - Main Interactive Application Logic (Đã vá toàn bộ lỗi click tranh & xác thực)
 */

var ARTWORKS_DATABASE = (typeof window !== 'undefined' && window.ARTWORKS_DATABASE) ? window.ARTWORKS_DATABASE : [];

const APP_STATE = {
  currentUser: null,
  cart: [],
  currentCategory: 'all',
  searchQuery: '',
  priceRange: 'all',
  licenseType: 'all',
  sortBy: 'featured',
  selectedArtwork: null
};

document.addEventListener('DOMContentLoaded', () => {
  loadLocalStorageSession();
  initUIComponents();
  initSearchAndFilters();
  renderArtworkGallery();
  updateHeaderCounters();
});

function loadLocalStorageSession() {
  try {
    const savedUser = localStorage.getItem('artfair_user');
    if (savedUser) {
      APP_STATE.currentUser = JSON.parse(savedUser);
    }
    const savedCart = localStorage.getItem('artfair_cart');
    if (savedCart) APP_STATE.cart = JSON.parse(savedCart);
  } catch (e) {}
}

function initUIComponents() {
  document.getElementById('btnOpenLogin')?.addEventListener('click', () => openAuthModal('login'));
  document.getElementById('btnOpenRegister')?.addEventListener('click', () => openAuthModal('register'));
  document.getElementById('closeAuthModal')?.addEventListener('click', closeAuthModal);
  document.getElementById('closeDetailModal')?.addEventListener('click', () => {
    document.getElementById('artworkDetailModalOverlay').classList.remove('active');
  });
  document.getElementById('btnHeaderCart')?.addEventListener('click', openCartDrawer);
  document.getElementById('closeCartDrawer')?.addEventListener('click', closeCartDrawer);

  document.getElementById('btnLogout')?.addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem('artfair_is_logged_in');
    localStorage.removeItem('artfair_user');
    window.location.reload();
  });
}

function openAuthModal(tab = 'login') {
  const modal = document.getElementById('authModalOverlay');
  if (modal) {
    modal.classList.add('active');
    modal.style.display = 'flex';
  }
  switchAuthTab(tab);
}

function closeAuthModal() {
  const modal = document.getElementById('authModalOverlay');
  if (modal) {
    modal.classList.remove('active');
    modal.style.display = 'none';
  }
}

function switchAuthTab(tabName) {
  const tabBtnLogin = document.getElementById('tabBtnLogin');
  const tabBtnRegister = document.getElementById('tabBtnRegister');
  const paneLogin = document.getElementById('paneLogin');
  const paneRegister = document.getElementById('paneRegister');

  if (tabBtnLogin) tabBtnLogin.classList.toggle('active', tabName === 'login');
  if (tabBtnRegister) tabBtnRegister.classList.toggle('active', tabName === 'register');
  if (paneLogin) paneLogin.style.display = tabName === 'login' ? 'block' : 'none';
  if (paneRegister) paneRegister.style.display = tabName === 'register' ? 'block' : 'none';
}

function handleLoginSubmit(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail')?.value.trim() || 'haanh23042006@gmail.com';
  loginSuccess({ name: 'Anh Hà', email: email, role: 'collector' });
}

function handleRegisterSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('regFullName')?.value.trim() || 'Thành Viên Mới';
  const email = document.getElementById('regEmail')?.value.trim() || 'you@artfair.vn';
  const role = document.getElementById('regRole')?.value || 'collector';
  loginSuccess({ name: name, email: email, role: role });
}

function handleGoogleLogin(e) {
  if (e) e.preventDefault();
  loginSuccess({ name: 'Anh Hà', email: 'haanh23042006@gmail.com', role: 'collector' });
}

function handleFacebookLogin() {
  loginSuccess({ name: 'Anh Hà', email: 'haanh23042006@gmail.com', role: 'collector' });
}

function loginSuccess(userObj) {
  APP_STATE.currentUser = userObj;
  localStorage.setItem('artfair_is_logged_in', 'true');
  localStorage.setItem('artfair_user', JSON.stringify(userObj));
  closeAuthModal();
  window.location.reload();
}

function initSearchAndFilters() {
  const searchInput = document.getElementById('headerSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      APP_STATE.searchQuery = e.target.value.trim().toLowerCase();
      renderArtworkGallery();
    });
  }

  document.querySelectorAll('.category-tab-btn').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.category-tab-btn').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      APP_STATE.currentCategory = tab.dataset.category;
      renderArtworkGallery();
    });
  });

  document.getElementById('priceFilterSelect')?.addEventListener('change', (e) => {
    APP_STATE.priceRange = e.target.value;
    renderArtworkGallery();
  });
}

function renderArtworkGallery() {
  const container = document.getElementById('artworkGrid');
  const countLabel = document.getElementById('resultsCount');
  if (!container || typeof ARTWORKS_DATABASE === 'undefined') return;

  const items = ARTWORKS_DATABASE.filter(item => {
    if (APP_STATE.currentCategory !== 'all' && item.category !== APP_STATE.currentCategory) return false;
    if (APP_STATE.searchQuery) {
      const q = APP_STATE.searchQuery;
      if (!item.title.toLowerCase().includes(q) && !item.artist.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  if (countLabel) countLabel.textContent = `Hiển thị ${items.length} tác phẩm`;

  if (items.length === 0) {
    container.innerHTML = `<p style="grid-column: 1/-1; text-align:center; padding: 40px; color:#64748b;">Không tìm thấy tác phẩm phù hợp.</p>`;
    return;
  }

  container.innerHTML = items.map(art => {
    const priceVal = Number(art.basePrice) || 150000;
    const formattedPrice = typeof formatVND === 'function' ? formatVND(priceVal) : priceVal.toLocaleString('vi-VN') + ' VNĐ';

    return `
      <div class="artwork-card" data-id="${art.id}" style="background:#fff; border-radius:16px; overflow:hidden; border:1px solid #eee; cursor:pointer;" onclick="openArtworkDetail('${art.id}')">
        <div class="card-media-wrapper" style="height:220px; overflow:hidden;">
          <img src="${art.image}" alt="${art.title}" style="width:100%; height:100%; object-fit:cover;">
          <span class="card-cat-badge" style="position:absolute; top:12px; left:12px; background:rgba(0,0,0,0.6); color:#fff; padding:3px 10px; border-radius:12px; font-size:0.75rem;">${art.categoryName || art.category}</span>
        </div>
        <div class="card-info-box" style="padding:16px;">
          <h3 style="font-size:1rem; font-weight:700; margin:0 0 6px 0; color:#1a1a1a;">${art.title}</h3>
          <p style="font-size:0.8rem; color:#666; margin:0 0 12px 0;">${art.artist}</p>
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <strong style="color:#ef4444; font-size:0.95rem;">${formattedPrice}</strong>
            <button class="btn btn-primary btn-sm" onclick="event.stopPropagation(); openArtworkDetail('${art.id}')"><i class="fa-solid fa-bolt"></i> Xem</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function openArtworkDetail(artId) {
  const art = ARTWORKS_DATABASE.find(a => a.id === artId);
  if (!art) return;

  APP_STATE.selectedArtwork = art;
  document.getElementById('modalArtImg').src = art.image;
  document.getElementById('modalArtTitle').textContent = art.title;
  document.getElementById('modalArtCategory').textContent = art.categoryName || art.category;
  document.getElementById('modalArtDesc').textContent = art.description || 'Tác phẩm nghệ thuật chất lượng cao.';

  const basePrice = Number(art.basePrice) || 150000;
  const commPrice = Number(art.commercialPrice) || 500000;
  const exclPrice = Number(art.exclusivePrice) || 4500000;

  if (document.getElementById('modalPricePersonal')) document.getElementById('modalPricePersonal').textContent = formatVND(basePrice);
  if (document.getElementById('modalPriceCommercialSmall')) document.getElementById('modalPriceCommercialSmall').textContent = formatVND(commPrice);
  if (document.getElementById('modalPriceExclusive')) document.getElementById('modalPriceExclusive').textContent = formatVND(exclPrice);
  if (document.getElementById('modalFinalPrice')) document.getElementById('modalFinalPrice').textContent = formatVND(basePrice);

  const modal = document.getElementById('artworkDetailModalOverlay');
  if (modal) { modal.classList.add('active'); modal.style.display = 'flex'; }
}

function updateModalPrice() {
  const art = APP_STATE.selectedArtwork;
  if (!art) return;
  const radio = document.querySelector('input[name="modalSelectedTier"]:checked');
  const val = radio?.value === 'commercial_small' ? (art.commercialPrice || 500000) :
              radio?.value === 'exclusive' ? (art.exclusivePrice || 4500000) : (art.basePrice || 150000);

  if (document.getElementById('modalFinalPrice')) {
    document.getElementById('modalFinalPrice').textContent = typeof formatVND === 'function' ? formatVND(val) : val.toLocaleString('vi-VN') + ' VNĐ';
  }
}

function handleModalAddToCart() {
  const art = APP_STATE.selectedArtwork;
  if (!art) return;
  const radio = document.querySelector('input[name="modalSelectedTier"]:checked');
  const price = radio?.value === 'commercial_small' ? (art.commercialPrice || 500000) :
                radio?.value === 'exclusive' ? (art.exclusivePrice || 4500000) : (art.basePrice || 150000);

  let cart = JSON.parse(localStorage.getItem('artfair_cart') || '[]');
  cart.push({
    id: 'CART-' + Date.now(),
    title: art.title,
    artist: art.artist,
    img: art.image,
    price: price,
    tier: radio?.value === 'exclusive' ? 'Độc Quyền' : (radio?.value === 'commercial_small' ? 'Thương Mại POD' : 'Cá Nhân')
  });

  localStorage.setItem('artfair_cart', JSON.stringify(cart));
  document.getElementById('artworkDetailModalOverlay').style.display = 'none';
  updateHeaderCounters();
  openCartDrawer();
}

function handleModalBuyNow() {
  handleModalAddToCart();
}

function openCartDrawer() {
  renderCartDrawerItems();
  document.getElementById('cartDrawerOverlay').style.display = 'block';
}

function closeCartDrawer() {
  document.getElementById('cartDrawerOverlay').style.display = 'none';
}

function renderCartDrawerItems() {
  const container = document.getElementById('cartItemsContainer');
  const grandTotal = document.getElementById('cartGrandTotal');
  if (!container) return;

  const cart = JSON.parse(localStorage.getItem('artfair_cart') || '[]');
  updateHeaderCounters();

  if (cart.length === 0) {
    container.innerHTML = `<p style="text-align:center; padding:30px; color:#64748b;">Giỏ hàng đang trống.</p>`;
    if (grandTotal) grandTotal.textContent = '0 VNĐ';
    return;
  }

  let sum = 0;
  container.innerHTML = cart.map((item, idx) => {
    sum += Number(item.price) || 0;
    return `
      <div style="display:flex; gap:12px; padding:12px 0; border-bottom:1px solid #f1f5f9; align-items:center;">
        <img src="${item.img}" style="width:55px; height:55px; border-radius:10px; object-fit:cover;">
        <div style="flex:1;">
          <h4 style="margin:0; font-size:0.9rem; color:#0f172a;">${item.title}</h4>
          <span style="font-size:0.75rem; color:#64748b;">${item.tier}</span>
          <div style="font-weight:800; color:#ef4444; font-size:0.9rem;">${typeof formatVND === 'function' ? formatVND(item.price) : item.price + ' VNĐ'}</div>
        </div>
        <button onclick="removeCartItem(${idx})" style="background:none; border:none; color:#94a3b8; cursor:pointer; font-size:1.2rem;">&times;</button>
      </div>
    `;
  }).join('');

  if (grandTotal) grandTotal.textContent = typeof formatVND === 'function' ? formatVND(sum) : sum.toLocaleString('vi-VN') + ' VNĐ';
}

function removeCartItem(idx) {
  let cart = JSON.parse(localStorage.getItem('artfair_cart') || '[]');
  cart.splice(idx, 1);
  localStorage.setItem('artfair_cart', JSON.stringify(cart));
  renderCartDrawerItems();
  updateHeaderCounters();
}

function updateHeaderCounters() {
  const cart = JSON.parse(localStorage.getItem('artfair_cart') || '[]');
  const badge = document.getElementById('cartCountBadge');
  const drawerCount = document.getElementById('cartDrawerCount');
  if (badge) badge.textContent = cart.length;
  if (drawerCount) drawerCount.textContent = cart.length;
}

function handleProceedCheckout() {
  let cart = JSON.parse(localStorage.getItem('artfair_cart') || '[]');
  if (cart.length === 0) { alert('Giỏ hàng trống!'); return; }
  if (!localStorage.getItem('artfair_is_logged_in')) { alert('Vui lòng đăng nhập!'); openAuthModal('login'); return; }

  let user = {};
  try { user = JSON.parse(localStorage.getItem('artfair_user') || '{}'); } catch(e){}
  const safeEmail = (user.email || 'haanh23042006@gmail.com').toLowerCase().replace(/[^a-z0-9]/g, '_');
  const userScopedKey = `artfair_purchased_licenses_${safeEmail}`;

  let myLicenses = JSON.parse(localStorage.getItem(userScopedKey) || '[]');
  cart.forEach(item => {
    myLicenses.unshift({
      id: 'LIC-' + Date.now(),
      code: 'LIC-' + Date.now(),
      title: item.title,
      artist: item.artist || 'Họa sĩ',
      tier: `${item.tier} (${typeof formatVND === 'function' ? formatVND(item.price) : item.price + ' VNĐ'})`,
      date: new Date().toLocaleDateString('vi-VN'),
      formats: 'PNG, PSD 300 DPI, Vector',
      img: item.img
    });
  });

  localStorage.setItem(userScopedKey, JSON.stringify(myLicenses));
  localStorage.setItem('artfair_cart', JSON.stringify([]));
  closeCartDrawer();
  alert('🎉 Thanh toán bản quyền thành công! Đã chuyển vào kho của bạn.');
  window.location.href = 'user-profile.html#paneBuyerCollector';
}

window.openArtworkDetail = openArtworkDetail;
window.updateModalPrice = updateModalPrice;
window.handleModalAddToCart = handleModalAddToCart;
window.handleModalBuyNow = handleModalBuyNow;
window.removeCartItem = removeCartItem;
window.handleProceedCheckout = handleProceedCheckout;