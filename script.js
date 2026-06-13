// =============================================
//  CityPharm — script.js
// =============================================

// カート状態
const cart = [];

// ===== カートに追加ボタン =====
document.querySelectorAll('.add-cart').forEach(button => {
  button.addEventListener('click', function () {
    const card  = this.closest('.prod-card');
    const name  = card.querySelector('.prod-name').textContent.trim();
    const priceText = card.querySelector('.prod-price').childNodes[0].textContent.trim();

    // カートに追加
    const existing = cart.find(item => item.name === name);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ name, price: priceText, qty: 1 });
    }

    // ボタンのアニメーション
    this.textContent = '✓ Нэмэгдлээ!';
    this.style.background = '#16a34a';
    this.disabled = true;

    setTimeout(() => {
      this.textContent = 'Сагсанд нэмэх';
      this.style.background = '';
      this.disabled = false;
    }, 1500);

    // カウンター更新
    updateCartCount();

    // トースト通知
    showToast(`"${name}" сагсанд нэмэгдлээ!`);
  });
});

// ===== カートカウンター更新 =====
function updateCartCount() {
  const total = cart.reduce((sum, item) => sum + item.qty, 0);
  let badge = document.querySelector('.cart-badge');

  if (!badge) {
    badge = document.createElement('span');
    badge.className = 'cart-badge';
    document.querySelector('.btn-login').appendChild(badge);
  }

  badge.textContent = total;
  badge.style.display = total > 0 ? 'inline-block' : 'none';
}

// ===== トースト通知 =====
function showToast(message) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<i class="ti ti-circle-check"></i> ${message}`;
  document.body.appendChild(toast);

  setTimeout(() => toast.classList.add('toast--show'), 10);
  setTimeout(() => {
    toast.classList.remove('toast--show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ===== カートモーダル表示 =====
function showCartModal() {
  const existing = document.querySelector('.cart-modal-overlay');
  if (existing) existing.remove();

  // 合計金額計算
  const total = cart.reduce((sum, item) => {
    const num = parseInt(item.price.replace(/[^\d]/g, ''));
    return sum + num * item.qty;
  }, 0);

  // 商品リストHTML
  const itemsHTML = cart.length === 0
    ? `<div class="cart-empty">
         <i class="ti ti-shopping-cart-off"></i>
         <p>Сагс хоосон байна</p>
       </div>`
    : cart.map((item, index) => `
        <div class="cart-item">
          <span class="cart-item-name">${item.name}</span>
          <div class="cart-item-controls">
            <button class="qty-btn" data-index="${index}" data-action="minus">−</button>
            <span class="cart-item-qty">${item.qty}</span>
            <button class="qty-btn" data-index="${index}" data-action="plus">＋</button>
          </div>
          <span class="cart-item-price">${item.price}</span>
          <button class="cart-item-remove" data-index="${index}"><i class="ti ti-trash"></i></button>
        </div>
      `).join('');

  const overlay = document.createElement('div');
  overlay.className = 'cart-modal-overlay';
  overlay.innerHTML = `
    <div class="cart-modal">
      <div class="cart-modal-header">
        <h3><i class="ti ti-shopping-cart"></i> Миний сагс</h3>
        <button class="cart-close"><i class="ti ti-x"></i></button>
      </div>
      <div class="cart-modal-body">
        ${itemsHTML}
      </div>
      ${cart.length > 0 ? `
      <div class="cart-modal-footer">
        <span>Нийт дүн:</span>
        <strong>₮${total.toLocaleString()}</strong>
      </div>
      <button class="cart-order-btn">Захиалга хийх</button>
      ` : ''}
    </div>
  `;

  document.body.appendChild(overlay);

  // 閉じる
  overlay.querySelector('.cart-close').addEventListener('click', () => overlay.remove());
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });

  // 数量ボタン
  overlay.querySelectorAll('.qty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const index  = parseInt(btn.dataset.index);
      const action = btn.dataset.action;
      if (action === 'plus') {
        cart[index].qty += 1;
      } else {
        cart[index].qty -= 1;
        if (cart[index].qty <= 0) cart.splice(index, 1);
      }
      updateCartCount();
      showCartModal(); // 再描画
    });
  });

  // 削除ボタン
  overlay.querySelectorAll('.cart-item-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      const index = parseInt(btn.dataset.index);
      cart.splice(index, 1);
      updateCartCount();
      showCartModal(); // 再描画
    });
  });

  // 注文ボタン
  const orderBtn = overlay.querySelector('.cart-order-btn');
  if (orderBtn) {
    orderBtn.addEventListener('click', () => {
      overlay.remove();
      showToast('Захиалга баталгаажлаа! Удахгүй холбоо барина.');
      cart.length = 0;
      updateCartCount();
    });
  }
}

// ===== カートボタン（右上）クリックでモーダル表示 =====
document.querySelector('.btn-login').addEventListener('click', function (e) {
  e.preventDefault();
  showCartModal();
});
