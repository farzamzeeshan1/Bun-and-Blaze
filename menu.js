// menu.js — Menu rendering with categories, cart sidebar, back button

window.addEventListener('DOMContentLoaded', () => {
  const container  = document.getElementById('menuContainer');
  const backBtn    = document.getElementById('backBtn');
  const cartToggle = document.getElementById('cartToggle');

  // ── Back button ────────────────────────────────────────────
  backBtn.addEventListener('click', () => history.back());

  // ── Cart sidebar toggle ────────────────────────────────────
  cartToggle.addEventListener('click', () => document.body.classList.toggle('cart-open'));

  // ── Cart render ────────────────────────────────────────────
  function renderCart() {
    const cart       = JSON.parse(sessionStorage.getItem('cart') || '[]');
    const cartItems  = document.getElementById('cartItems');
    const cartTotalEl = document.getElementById('cartTotal');
    if (!cartItems || !cartTotalEl) return;

    if (cart.length === 0) {
      cartItems.innerHTML = '<li style="color:#888;font-size:13px;">Cart is empty.</li>';
    } else {
      cartItems.innerHTML = '';
      cart.forEach((i, index) => {
        const li = document.createElement('li');
        li.style.cssText = 'padding:8px 0; border-bottom:1px solid #333; display:flex; justify-content:space-between; align-items:center;';
        li.innerHTML = `
          <span>${i.name} × ${i.qty} — $${(i.price * i.qty).toFixed(2)}</span>
          <button class="remove-btn" data-index="${index}" style="background:var(--red); color:white; border:none; padding:4px 8px; border-radius:4px; cursor:pointer; font-size:12px;">X</button>
        `;
        cartItems.appendChild(li);
      });
      // Attach remove event listeners
      cartItems.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const idx = parseInt(e.target.dataset.index, 10);
          cart.splice(idx, 1);
          sessionStorage.setItem('cart', JSON.stringify(cart));
          renderCart();
        });
      });
    }
    const sum = cart.reduce((s, i) => s + i.price * i.qty, 0);
    cartTotalEl.textContent = sum.toFixed(2);
  }

  // ── Add to cart ────────────────────────────────────────────
  function addToCart(item) {
    const cart     = JSON.parse(sessionStorage.getItem('cart') || '[]');
    const existing = cart.find(i => i.name === item.name);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ name: item.name, price: item.price, qty: 1 });
    }
    sessionStorage.setItem('cart', JSON.stringify(cart));
    renderCart();

    // Brief flash on button
    const btn = document.querySelector(`[data-cart-name="${item.name}"]`);
    if (btn) {
      btn.textContent = '✓ Added!';
      setTimeout(() => { btn.textContent = '+ Add to Cart'; }, 1200);
    }
  }

  // ── Category helper ────────────────────────────────────────
  function getCategory(item) {
    if (item.category) return item.category;
    const n = item.name.toLowerCase();
    if (n.includes('burger') || n.includes('blaze') || n.includes('smash') || n.includes('cheezious') || n.includes('zinger')) return 'Burgers';
    if (n.includes('fries') || n.includes('nuggets') || n.includes('onion') || n.includes('chips') || n.includes('loaded') || n.includes('cheese sticks')) return 'Sides';
    if (n.includes('shake')) return 'Shakes';
    if (n.includes('coke') || n.includes('drink') || n.includes('sprite') || n.includes('fanta') || n.includes('water')) return 'Drinks';
    if (n.includes('salad')) return 'Salads';
    if (n.includes('pie') || n.includes('mousse') || n.includes('ice cream') || n.includes('dessert')) return 'Desserts';
    return 'Other';
  }

  // ── Fallback image per category (used if the remote photo fails to load) ──
  const fallbackImg = {
    Burgers: 'burger.png', Sides: 'side.png', Shakes: 'shake.png',
    Drinks: 'drink.png', Salads: 'salad.png', Desserts: 'dessert.png', Other: 'burger.png'
  };

  // ── Fetch and render menu ──────────────────────────────────
  fetch('menu.json')
    .then(r => r.json())
    .then(items => {
      // Group by category
      const categories = {};
      items.forEach(item => {
        const cat = getCategory(item);
        if (!categories[cat]) categories[cat] = [];
        categories[cat].push(item);
      });

      Object.keys(categories).forEach(cat => {
        // Section heading
        const heading = document.createElement('h2');
        heading.textContent = cat;
        heading.style.cssText = 'font-family:"Archivo Black",sans-serif; color:#C8102E; margin:32px 0 16px; font-size:26px; border-bottom:3px solid #F2B705; padding-bottom:8px;';
        container.appendChild(heading);

        // Grid
        const grid = document.createElement('div');
        grid.className = 'menu-grid';
        container.appendChild(grid);

        categories[cat].forEach(item => {
          const card = document.createElement('div');
          card.className = 'card';
          card.innerHTML = `
            <img src="${item.image}" alt="${item.name}" data-fallback="${fallbackImg[cat] || 'burger.png'}" onerror="this.onerror=null;this.src=this.dataset.fallback;"/>
            <div class="card-body">
              <h3>${item.name}</h3>
              <p>${item.description || ''}</p>
              <div class="card-footer">
                <span class="price">$${item.price.toFixed(2)}</span>
                <button class="add-btn" data-cart-name="${item.name}">+ Add to Cart</button>
              </div>
            </div>
          `;
          card.querySelector('.add-btn').addEventListener('click', () => addToCart(item));
          grid.appendChild(card);
        });
      });

      renderCart();
    })
    .catch(err => {
      console.error('Failed to load menu.json:', err);
      container.innerHTML = '<p style="color:red;padding:20px;">Couldn\'t load the menu. Please check menu.json.</p>';
    });

  // ── Confirm order from cart ──────────────────────────────────
  const confirmCartBtn = document.getElementById('confirmCartBtn');
  if (confirmCartBtn) {
    confirmCartBtn.addEventListener('click', () => {
      const cart = JSON.parse(sessionStorage.getItem('cart') || '[]');
      if (cart.length === 0) {
        alert('Your cart is empty! Add something first.');
        return;
      }
      
      const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
      const tax      = subtotal * 0.07;
      const total    = subtotal + tax;

      sessionStorage.setItem('orderData', JSON.stringify({
        items: cart, subtotal, tax, total,
        timestamp: new Date().toISOString()
      }));

      // Go to receipt page
      window.location.href = 'receipt.html';
    });
  }
});
