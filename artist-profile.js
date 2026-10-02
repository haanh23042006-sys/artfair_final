/**
 * ARTFAIR - Artist Profile Page Logic (Bản Sửa Lỗi Hiển Thị Kho Tranh & Feedback)
 */

let CURRENT_ARTIST = null;
let CURRENT_SHOP_CATEGORY = 'all';
let CURRENT_SHOP_SORT = 'newest';
let SELECTED_ARTWORK_DETAIL = null;

document.addEventListener('DOMContentLoaded', () => {
  initArtistProfilePage();
  initCartListeners();
  updateArtistCartCounters();
});

function getArtistParam() {
  const params = new URLSearchParams(window.location.search);
  let id = params.get('id') || params.get('artist');
  if (!id) {
    // Dự phòng nếu không có tham số URL, mặc định là lanchi
    return 'lanchi';
  }
  if (typeof ARTISTS_DATA !== 'undefined' && ARTISTS_DATA[id]) return id;
  if (typeof getArtistSlugByName === 'function') return getArtistSlugByName(id);
  return id.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function initArtistProfilePage() {
  const artistSlug = getArtistParam();
  
  // Đảm bảo ARTISTS_DATA đã sẵn sàng
  if (typeof ARTISTS_DATA !== 'undefined') {
    CURRENT_ARTIST = ARTISTS_DATA[artistSlug] || ARTISTS_DATA['lanchi'];
  }

  if (!CURRENT_ARTIST) {
    CURRENT_ARTIST = {
      id: 'lanchi',
      name: 'Lan Chi (Chi Art Studio)',
      shortName: 'Lan Chi',
      roleTitle: 'Chuyên Họa Màu Nước & Storybook Illustration',
      avatar: '2e72c41b49afad2d08530b6a0475ba66.jpg',
      coverImage: '45fbff086b31157aa2e23b94f086bd06.jpg',
      bio: 'Kể lại những giấc mơ tuổi trẻ qua gam màu pastel dịu dàng và nét vẽ thanh tao.',
      location: 'Hà Nội, Việt Nam',
      joinedDate: 'Tháng 3, 2024',
      rating: 4.95,
      reviewsCount: 128,
      responseRate: '99%',
      responseTime: '< 1 giờ',
      artworksSold: 142,
      followersCount: '1.4k',
      specialties: ['Minh Họa Màu Nước', 'Bìa Sách Văn Học', 'Áo Thun Pastel'],
      commissionPackages: [
        { id: 'pkg-1', title: 'Gói Phác Thảo Màu Nước', badge: 'Cơ Bản', price: 200000, deliveryDays: 5, revisions: 2, features: ['Chân dung nhân vật', 'File PNG 300 DPI'] },
        { id: 'pkg-2', title: 'Gói Minh Họa Bìa Sách', badge: 'Phổ Biến', popular: true, price: 650000, deliveryDays: 10, revisions: 3, features: ['Tranh hoàn chỉnh', 'File PSD phân lớp'] }
      ]
    };
  }

  renderArtistHeroInfo();
  renderCommissionPackages();
  renderArtistArtworks();
  renderArtistReviews('all');
  populateBriefPackageOptions();
}

function renderArtistHeroInfo() {
  const a = CURRENT_ARTIST;
  if (!a) return;

  document.title = `${a.name} - Gian Hàng Nghệ Sĩ | ARTFAIR`;
  if (document.getElementById('artistCoverImg') && a.coverImage) document.getElementById('artistCoverImg').src = a.coverImage;
  if (document.getElementById('artistAvatarImg') && a.avatar) document.getElementById('artistAvatarImg').src = a.avatar;
  if (document.getElementById('artistFullName')) document.getElementById('artistFullName').textContent = a.name;
  if (document.getElementById('artistRoleTitle')) document.getElementById('artistRoleTitle').textContent = a.roleTitle || '';
  if (document.getElementById('artistBioText')) document.getElementById('artistBioText').textContent = `"${a.bio || ''}"`;
  if (document.getElementById('breadcrumbArtistName')) document.getElementById('breadcrumbArtistName').textContent = a.name;

  const specBox = document.getElementById('artistSpecialties');
  if (specBox && Array.isArray(a.specialties)) {
    specBox.innerHTML = a.specialties.map(s => `<span class="specialty-chip"><i class="fa-solid fa-palette"></i> ${s}</span>`).join('');
  }

  if (document.getElementById('artistLocation')) document.getElementById('artistLocation').textContent = a.location || 'Hà Nội, Việt Nam';
  if (document.getElementById('artistJoinDate')) document.getElementById('artistJoinDate').textContent = a.joinedDate || 'Tháng 3, 2024';
  if (document.getElementById('artistFollowersCount')) document.getElementById('artistFollowersCount').textContent = a.followersCount || '1.4k';

  if (document.getElementById('statRatingVal')) document.getElementById('statRatingVal').textContent = a.rating ? a.rating.toFixed(2) : '4.95';
  if (document.getElementById('statReviewCount')) document.getElementById('statReviewCount').textContent = a.reviewsCount || '128';
  if (document.getElementById('statResponseRate')) document.getElementById('statResponseRate').textContent = a.responseRate || '99%';
  if (document.getElementById('statResponseTime')) document.getElementById('statResponseTime').textContent = a.responseTime || '< 1 giờ';
  if (document.getElementById('statSoldVal')) document.getElementById('statSoldVal').textContent = a.artworksSold || '142';

  if (document.getElementById('commArtistNameHeading')) document.getElementById('commArtistNameHeading').textContent = a.shortName || a.name;
  if (document.getElementById('formBriefTitle')) document.getElementById('formBriefTitle').textContent = `Gửi Yêu Cầu Commission Cho ${a.shortName || a.name}`;
  if (document.getElementById('submitBtnArtistName')) document.getElementById('submitBtnArtistName').textContent = a.shortName || a.name;
  if (document.getElementById('aboutStoryText') && a.bio) document.getElementById('aboutStoryText').textContent = a.bio;
}

// 1. RENDER GÓI COMMISSION
function renderCommissionPackages() {
  const grid = document.getElementById('commissionPackagesGrid');
  if (!grid || !CURRENT_ARTIST) return;

  const pkgs = CURRENT_ARTIST.commissionPackages || [];
  grid.innerHTML = pkgs.map(p => `
    <div class="commission-pkg-card ${p.popular ? 'popular' : ''}">
      ${p.popular ? '<span class="popular-badge"><i class="fa-solid fa-fire"></i> LỰA CHỌN PHỔ BIẾN</span>' : ''}
      <div class="pkg-header">
        <span class="pkg-badge">${p.badge || 'Gói Dịch Vụ'}</span>
        <h3 class="pkg-title">${p.title}</h3>
        <div class="pkg-price-row"><strong class="pkg-price">${typeof formatVND === 'function' ? formatVND(p.price) : Number(p.price).toLocaleString('vi-VN') + ' VNĐ'}</strong></div>
        <p class="pkg-delivery"><i class="fa-regular fa-clock"></i> ~${p.deliveryDays || 7} ngày • ${p.revisions || 2} lần sửa</p>
      </div>
      <ul class="pkg-features-list">
        ${(p.features || []).map(f => `<li><i class="fa-solid fa-circle-check text-mint"></i> <span>${f}</span></li>`).join('')}
      </ul>
      <button type="button" class="btn ${p.popular ? 'btn-primary' : 'btn-outline'} w-100" onclick="selectCommissionPackage('${p.id}', ${p.price})">
        <i class="fa-solid fa-pen-nib"></i> Chọn Gói Này & Điền Brief
      </button>
    </div>
  `).join('');
}

function populateBriefPackageOptions() {
  const select = document.getElementById('directSelectedPackage');
  if (!select || !CURRENT_ARTIST) return;
  const pkgs = CURRENT_ARTIST.commissionPackages || [];
  select.innerHTML = pkgs.map(p => `<option value="${p.id}" data-price="${p.price}">${p.title} (${typeof formatVND === 'function' ? formatVND(p.price) : p.price + ' VNĐ'})</option>`).join('');
}

function selectCommissionPackage(pkgId, price) {
  const select = document.getElementById('directSelectedPackage');
  if (select) select.value = pkgId;
  const slider = document.getElementById('directBudgetSlider');
  if (slider && price) {
    slider.value = price;
    if (typeof updateDirectSlider === 'function') updateDirectSlider(price);
  }
  document.getElementById('artistBriefBox')?.scrollIntoView({ behavior: 'smooth' });
}

function handlePackageSelectChange(pkgId) {
  const select = document.getElementById('directSelectedPackage');
  if (!select) return;
  const opt = select.options[select.selectedIndex];
  const price = opt ? opt.getAttribute('data-price') : null;
  if (price) {
    const slider = document.getElementById('directBudgetSlider');
    if (slider) slider.value = price;
    if (typeof updateDirectSlider === 'function') updateDirectSlider(price);
  }
}

// 2. RENDER KHO TRANH CỦA NGHỆ SĨ
function renderArtistArtworks() {
  const grid = document.getElementById('artistArtworkGrid');
  const countBadge = document.getElementById('tabGalleryCount');
  if (!grid) return;

  // Lấy danh sách tác phẩm từ ARTWORKS_DATABASE hoặc mảng dự phòng
  let list = [];
  if (typeof ARTWORKS_DATABASE !== 'undefined' && Array.isArray(ARTWORKS_DATABASE)) {
    const a = CURRENT_ARTIST;
    const nameLower = (a.shortName || a.name || '').toLowerCase();
    list = ARTWORKS_DATABASE.filter(item => {
      const artArtist = (item.artist || '').toLowerCase();
      return artArtist.includes('lan chi') || artArtist.includes('kiệt') || artArtist.includes(nameLower) || a.id === 'lanchi';
    });
    // Nếu lọc không ra, mặc định lấy toàn bộ kho tranh cho Lan Chi
    if (list.length === 0) list = ARTWORKS_DATABASE;
  }

  if (countBadge) countBadge.textContent = list.length;

  if (CURRENT_SHOP_CATEGORY !== 'all') {
    list = list.filter(item => item.category === CURRENT_SHOP_CATEGORY);
  }

  if (list.length === 0) {
    grid.innerHTML = '';
    const emp = document.getElementById('artistGalleryEmpty');
    if (emp) emp.style.display = 'block';
    return;
  }
  document.getElementById('artistGalleryEmpty')?.setAttribute('style', 'display: none !important');

  grid.innerHTML = list.map(art => `
    <div class="artwork-card" data-id="${art.id}">
      <div class="card-media-wrapper" role="button" onclick="openArtworkDetail('${art.id}')">
        <img src="${art.image}" alt="${art.title}" class="card-art-img" loading="lazy">
        <span class="card-cat-badge">${art.categoryName || art.category}</span>
      </div>
      <div class="card-info-box">
        <h3 class="artwork-card-title"><button type="button" class="artwork-card-title-btn" onclick="openArtworkDetail('${art.id}')">${art.title}</button></h3>
        <div class="card-footer-strip">
          <div class="card-pricing">
            <span class="license-label">Bản quyền từ</span>
            <span class="price-tag">${typeof formatVND === 'function' ? formatVND(art.basePrice) : art.basePrice + ' VNĐ'}</span>
          </div>
          <button class="btn-card-buy" onclick="openArtworkDetail('${art.id}')"><i class="fa-solid fa-bolt"></i> Mua Ngay</button>
        </div>
      </div>
    </div>
  `).join('');
}

// 3. RENDER FEEDBACK & ĐÁNH GIÁ
function renderArtistReviews(filterType = 'all') {
  const container = document.getElementById('reviewsFeedList');
  const tabReviewsCount = document.getElementById('tabReviewsCount');
  const countRevAll = document.getElementById('countRevAll');
  if (!container || !CURRENT_ARTIST) return;

const DEFAULT_REVIEWS = [
    {
      id: 'rev-default-1',
      author: 'Nguyễn Hải Đăng',
      authorAvatar: '34afaac0faa70a1bb6c4b5ad89b77756-2.jpg',
      badge: 'Đã mua bản quyền POD',
      rating: 5,
      type: 'pod',
      date: '2 ngày trước',
      comment: 'Nét vẽ thực sự đỉnh chóp! File PSD bàn giao rất ngăn nắp, tách layer chuẩn để xưởng in áo thun làm việc trơn tru.',
      artistReply: 'Cảm ơn bạn đã tin tưởng ủng hộ Studio! ❤️'
    },
    {
      id: 'rev-default-2',
      author: 'Trần Thảo Ly',
      authorAvatar: '45fbff086b31157aa2e23b94f086bd06.jpg',
      badge: 'Đã đặt Commission',
      rating: 5,
      type: 'commission',
      date: '1 tuần trước',
      comment: 'Giao tranh đúng tiến độ, màu sắc ngoài đời in lên canvas siêu nét và có hồn. Rất ưng ý!',
      artistReply: 'Dạ em cảm ơn chị Ly nhiều ạ!'
    }
  ];
// Dùng review của artist nếu có, nếu mảng rỗng/không có thì dùng review mẫu
  let reviews = (Array.isArray(CURRENT_ARTIST.reviews) && CURRENT_ARTIST.reviews.length > 0)
    ? CURRENT_ARTIST.reviews
    : DEFAULT_REVIEWS;

  if (tabReviewsCount) tabReviewsCount.textContent = CURRENT_ARTIST.reviewsCount || reviews.length;
  if (countRevAll) countRevAll.textContent = CURRENT_ARTIST.reviewsCount || reviews.length;
const sumCount = document.getElementById('reviewSummaryCount');
  const sumScore = document.getElementById('reviewSummaryScore');
  if (sumCount) sumCount.textContent = CURRENT_ARTIST.reviewsCount || reviews.length;
  if (sumScore && CURRENT_ARTIST.rating) sumScore.textContent = CURRENT_ARTIST.rating.toFixed(2);

  let filtered = reviews;
  if (filterType === '5star') filtered = reviews.filter(r => r.rating === 5);
  else if (filterType === 'pod') filtered = reviews.filter(r => (r.badge && r.badge.includes('POD')) || r.type === 'pod');

  container.innerHTML = filtered.map(r => `
    <div class="review-card-item">
      <div class="review-header-row">
        <div class="reviewer-meta">
          <img src="${r.authorAvatar || '2e72c41b49afad2d08530b6a0475ba66.jpg'}" alt="${r.author}" class="reviewer-avatar">
          <div>
            <h4 class="reviewer-name">${r.author || r.name} <span class="badge-buyer-verified">✓ Đã Mua Bản Quyền</span></h4>
            <div class="review-date">${r.date || 'Gần đây'} • ${r.badge || 'Khách hàng xác minh'}</div>
          </div>
        </div>
        <div class="star-rating-row">${'<i class="fa-solid fa-star"></i>'.repeat(r.rating || 5)}</div>
      </div>
      <p class="review-body-text">"${r.comment}"</p>
      ${r.artistReply ? `<div class="artist-reply-bubble"><strong class="artist-reply-title"><i class="fa-solid fa-reply"></i> Phản hồi từ Artist:</strong><p class="artist-reply-text">${r.artistReply}</p></div>` : ''}
    </div>
  `).join('');
}

function filterReviews(type) {
  document.querySelectorAll('.review-chip').forEach(btn => btn.classList.toggle('active', btn.getAttribute('data-revfilter') === type));
  renderArtistReviews(type);
}

// 4. MỞ MODAL CHI TIẾT TRANH
function openArtworkDetail(artId) {
  if (typeof ARTWORKS_DATABASE === 'undefined') return;
  const art = ARTWORKS_DATABASE.find(a => a.id === artId);
  if (!art) return;

  SELECTED_ARTWORK_DETAIL = art;
  document.getElementById('modalArtImg').src = art.image;
  document.getElementById('modalArtTitle').textContent = art.title;
  document.getElementById('modalArtCategory').textContent = art.categoryName || art.category;
  document.getElementById('modalArtId').textContent = `ID: #${art.id}`;
  document.getElementById('modalArtDesc').textContent = art.description || '';

  const pPersonal = document.getElementById('modalPricePersonal');
  const pComm = document.getElementById('modalPriceCommercial');
  const pExcl = document.getElementById('modalPriceExclusive');

  const basePrice = Number(art.basePrice) || 150000;
  const commPrice = Number(art.commercialPrice) || 500000;
  const exclPrice = Number(art.exclusivePrice) || 4500000;

  if (pPersonal) pPersonal.textContent = typeof formatVND === 'function' ? formatVND(basePrice) : basePrice.toLocaleString('vi-VN') + ' VNĐ';
  if (pComm) pComm.textContent = typeof formatVND === 'function' ? formatVND(commPrice) : commPrice.toLocaleString('vi-VN') + ' VNĐ';
  if (pExcl) pExcl.textContent = typeof formatVND === 'function' ? formatVND(exclPrice) : exclPrice.toLocaleString('vi-VN') + ' VNĐ';

  const radios = document.querySelectorAll('input[name="modalTierSelect"]');
  radios.forEach((r, idx) => {
    r.checked = idx === 0;
    if (idx === 0) r.value = basePrice;
    if (idx === 1) r.value = commPrice;
    if (idx === 2) r.value = exclPrice;
    r.closest('.modal-tier-radio')?.classList.toggle('active', idx === 0);
  });

  const displayPrice = document.getElementById('modalDetailPriceDisplay');
  if (displayPrice) {
    displayPrice.textContent = typeof formatVND === 'function' ? formatVND(basePrice) : basePrice.toLocaleString('vi-VN') + ' VNĐ';
  }

  const modal = document.getElementById('artworkDetailModalOverlay');
  if (modal) { modal.classList.add('active'); modal.style.display = 'flex'; }
}

function updateProfileModalPrice() {
  const sel = document.querySelector('input[name="modalTierSelect"]:checked');
  if (!sel) return;

  document.querySelectorAll('.modal-tier-radio').forEach(r => {
    r.classList.toggle('active', r.querySelector('input') === sel);
  });

  const display = document.getElementById('modalDetailPriceDisplay');
  if (display) {
    const val = Number(sel.value);
    display.textContent = typeof formatVND === 'function' ? formatVND(val) : val.toLocaleString('vi-VN') + ' VNĐ';
  }
}

function closeDetailModal() {
  const m = document.getElementById('artworkDetailModalOverlay');
  if (m) { m.classList.remove('active'); m.style.display = 'none'; }
}

// 5. THÊM VÀO GIỎ HÀNG
function handleDetailAddToCart() {
  if (!SELECTED_ARTWORK_DETAIL) return;
  const radio = document.querySelector('input[name="modalTierSelect"]:checked');
  const price = radio ? Number(radio.value) : (Number(SELECTED_ARTWORK_DETAIL.basePrice) || 150000);

  let tierName = 'Cá Nhân';
  if (price >= 3000000) tierName = 'Độc Quyền Toàn Phần';
  else if (price >= 400000) tierName = 'Thương Mại POD Nhỏ';

  let cart = JSON.parse(localStorage.getItem('artfair_cart') || '[]');
  cart.push({
    id: 'CART-' + Date.now(),
    title: SELECTED_ARTWORK_DETAIL.title,
    artist: SELECTED_ARTWORK_DETAIL.artist || (CURRENT_ARTIST ? CURRENT_ARTIST.name : 'Lan Chi'),
    img: SELECTED_ARTWORK_DETAIL.image,
    price: price,
    tier: tierName
  });

  localStorage.setItem('artfair_cart', JSON.stringify(cart));
  closeDetailModal();
  updateArtistCartCounters();
  openCartDrawer();
}

function handleDetailBuyNow() {
  handleDetailAddToCart();
}

// 6. GIỎ HÀNG TRƯỢT
function initCartListeners() {
  document.getElementById('btnHeaderCart')?.addEventListener('click', openCartDrawer);
  document.getElementById('closeCartDrawer')?.addEventListener('click', closeCartDrawer);
  document.getElementById('cartDrawerOverlay')?.addEventListener('click', (e) => {
    if (e.target === document.getElementById('cartDrawerOverlay')) closeCartDrawer();
  });
}

function openCartDrawer() {
  renderArtistCartDrawer();
  const drawer = document.getElementById('cartDrawerOverlay');
  if (drawer) {
    drawer.style.display = 'block';
    drawer.classList.add('active', 'open');
  }
}

function closeCartDrawer() {
  const drawer = document.getElementById('cartDrawerOverlay');
  if (drawer) {
    drawer.style.display = 'none';
    drawer.classList.remove('active', 'open');
  }
}

function renderArtistCartDrawer() {
  const container = document.getElementById('cartItemsContainer');
  const subtotalLabel = document.getElementById('cartSubtotal');
  const grandTotalLabel = document.getElementById('cartGrandTotal');
  if (!container) return;

  const cart = JSON.parse(localStorage.getItem('artfair_cart') || '[]');
  updateArtistCartCounters();

  if (cart.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px 10px; color: #64748b;">
        <i class="fa-solid fa-bag-shopping" style="font-size: 2.8rem; color: #cbd5e1; margin-bottom: 12px;"></i>
        <h4>Giỏ hàng của bạn đang trống</h4>
        <p>Khám phá kho tranh để sở hữu bản quyền.</p>
        <button class="btn btn-outline btn-sm" onclick="closeCartDrawer()">Tiếp tục xem tranh</button>
      </div>
    `;
    if (subtotalLabel) subtotalLabel.textContent = '0 VNĐ';
    if (grandTotalLabel) grandTotalLabel.textContent = '0 VNĐ';
    return;
  }

  let sum = 0;
  container.innerHTML = cart.map((item, idx) => {
    const raw = Number(item.price) || 0;
    sum += raw;
    const formatted = typeof formatVND === 'function' ? formatVND(raw) : raw.toLocaleString('vi-VN') + ' VNĐ';

    return `
      <div style="display:flex; gap:12px; padding:12px 0; border-bottom:1px solid #f1f5f9; align-items:center;">
        <img src="${item.img || item.image}" alt="${item.title}" style="width:55px; height:55px; border-radius:10px; object-fit:cover;">
        <div style="flex:1;">
          <h4 style="margin:0; font-size:0.88rem; color:#0f172a;">${item.title}</h4>
          <span style="font-size:0.75rem; color:#64748b;">${item.tier || 'Cá Nhân'}</span>
          <div style="font-weight:800; color:#ef4444; font-size:0.9rem; margin-top:2px;">${formatted}</div>
        </div>
        <button onclick="removeArtistCartItem(${idx})" style="background:none; border:none; color:#94a3b8; cursor:pointer; font-size:1.2rem;">&times;</button>
      </div>
    `;
  }).join('');

  const formattedSum = typeof formatVND === 'function' ? formatVND(sum) : sum.toLocaleString('vi-VN') + ' VNĐ';
  if (subtotalLabel) subtotalLabel.textContent = formattedSum;
  if (grandTotalLabel) grandTotalLabel.textContent = formattedSum;
}

function removeArtistCartItem(idx) {
  let cart = JSON.parse(localStorage.getItem('artfair_cart') || '[]');
  cart.splice(idx, 1);
  localStorage.setItem('artfair_cart', JSON.stringify(cart));
  renderArtistCartDrawer();
  updateArtistCartCounters();
}

function updateArtistCartCounters() {
  const cart = JSON.parse(localStorage.getItem('artfair_cart') || '[]');
  const badge = document.getElementById('cartCountBadge');
  const drawerCount = document.getElementById('cartDrawerCount');
  if (badge) badge.textContent = cart.length;
  if (drawerCount) drawerCount.textContent = cart.length;
}

function handleProfileCheckout() {
  let cart = JSON.parse(localStorage.getItem('artfair_cart') || '[]');
  if (cart.length === 0) {
    alert('Giỏ hàng đang trống!');
    return;
  }
  if (!localStorage.getItem('artfair_is_logged_in')) {
    alert('Vui lòng đăng nhập trước khi thanh toán bản quyền!');
    return;
  }

  let user = {};
  try { user = JSON.parse(localStorage.getItem('artfair_user') || '{}'); } catch(e){}
  const safeEmail = (user.email || 'my.streetwear@gmail.com').toLowerCase().replace(/[^a-z0-9]/g, '_');
  const userScopedKey = `artfair_purchased_licenses_${safeEmail}`;

  let myLicenses = JSON.parse(localStorage.getItem(userScopedKey) || '[]');
  cart.forEach(item => {
    const rawPrice = Number(item.price) || 150000;
    const formattedPrice = typeof formatVND === 'function' ? formatVND(rawPrice) : rawPrice.toLocaleString('vi-VN') + ' VNĐ';
    
    myLicenses.unshift({
      id: 'LIC-' + Date.now() + '-' + Math.floor(100 + Math.random() * 900),
      code: 'LIC-' + Date.now() + '-' + Math.floor(100 + Math.random() * 900),
      title: item.title,
      artist: item.artist || CURRENT_ARTIST.name,
      tier: `${item.tier || 'Cá Nhân'} (${formattedPrice})`,
      price: rawPrice,
      date: new Date().toLocaleDateString('vi-VN'),
      purchaseDate: new Date().toLocaleDateString('vi-VN'),
      formats: 'PNG, PSD Layered 300 DPI, Vector',
      format: 'PNG, PSD Layered 300 DPI, Vector',
      img: item.img || '45fbff086b31157aa2e23b94f086bd06.jpg',
      image: item.img || '45fbff086b31157aa2e23b94f086bd06.jpg'
    });
  });

  localStorage.setItem(userScopedKey, JSON.stringify(myLicenses));
  localStorage.setItem('artfair_cart', JSON.stringify([]));

  updateArtistCartCounters();
  closeCartDrawer();
  alert('🎉 Mua bản quyền thành công! Tác phẩm đã được chuyển vào kho của bạn.');
  window.location.href = 'user-profile.html#paneBuyerCollector';
}

function switchProfileTab(tab) {
  document.querySelectorAll('.profile-tab-item').forEach(b => b.classList.toggle('active', b.getAttribute('data-tab') === tab));
  document.querySelectorAll('.profile-main-content .tab-pane').forEach(p => p.classList.remove('active'));
  document.getElementById(`pane-${tab}`)?.classList.add('active');
  if (tab === 'gallery') renderArtistArtworks();
  if (tab === 'commission') renderCommissionPackages();
  if (tab === 'reviews') renderArtistReviews('all');
}

function filterArtistShop(cat) {
  CURRENT_SHOP_CATEGORY = cat;
  document.querySelectorAll('.shop-filter-chip').forEach(b => b.classList.toggle('active', b.getAttribute('data-shopcat') === cat));
  renderArtistArtworks();
}

function sortArtistShop(s) {
  CURRENT_SHOP_SORT = s;
  renderArtistArtworks();
}

function updateDirectSlider(val) {
  const d = document.getElementById('directSliderVal');
  if (d) d.textContent = typeof formatVND === 'function' ? formatVND(val) : Number(val).toLocaleString('vi-VN') + ' VNĐ';
}

function copyProfileShareLink() {
  navigator.clipboard.writeText(window.location.href);
  alert('📋 Đã sao chép link trang nghệ sĩ!');
}
function handleDirectMessage() {
  alert('💬 Đang kết nối trò chuyện cùng nghệ sĩ...');
}
function handleProfileFollow() {
  alert('❤️ Đã theo dõi gian hàng nghệ sĩ!');
}
function scrollToCommissionTab() {
  switchProfileTab('commission');
  document.getElementById('pane-commission')?.scrollIntoView({ behavior: 'smooth' });
}
function applyProfileCoupon() {
  alert('Mã giảm giá đã được áp dụng!');
}

window.switchProfileTab = switchProfileTab;
window.filterArtistShop = filterArtistShop;
window.sortArtistShop = sortArtistShop;
window.filterReviews = filterReviews;
window.selectCommissionPackage = selectCommissionPackage;
window.handlePackageSelectChange = handlePackageSelectChange;
window.openArtworkDetail = openArtworkDetail;
window.closeDetailModal = closeDetailModal;
window.handleDetailAddToCart = handleDetailAddToCart;
window.handleDetailBuyNow = handleDetailBuyNow;
window.updateDirectSlider = updateDirectSlider;
window.updateProfileModalPrice = updateProfileModalPrice;
window.handleProfileFollow = handleProfileFollow;
window.handleDirectMessage = handleDirectMessage;
window.copyProfileShareLink = copyProfileShareLink;
window.scrollToCommissionTab = scrollToCommissionTab;
window.openCartDrawer = openCartDrawer;
window.closeCartDrawer = closeCartDrawer;
window.removeArtistCartItem = removeArtistCartItem;
window.handleProfileCheckout = handleProfileCheckout;
window.applyProfileCoupon = applyProfileCoupon;