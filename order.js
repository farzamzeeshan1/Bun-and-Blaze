// order.js — Menu rendering, cart, dark mode, back button

window.addEventListener('DOMContentLoaded', () => {
  const orderBody   = document.getElementById('orderBody');
  const totalEl     = document.getElementById('totalAmount');
  const confirmBtn  = document.getElementById('confirmBtn');
  const themeToggle = document.getElementById('themeToggle');
  const cartToggle  = document.getElementById('cartToggle');
  const cartItems   = document.getElementById('cartItems');
  const cartTotalEl = document.getElementById('cartTotal');
  const backBtn     = document.getElementById('backBtn');

  // ── Dark mode ──────────────────────────────────────────────
  if (localStorage.getItem('theme') === 'dark') document.body.classList.add('dark');
  themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
  });

  // ── Cart sidebar toggle ────────────────────────────────────
  cartToggle.addEventListener('click', () => document.body.classList.toggle('cart-open'));

  // ── Back button ────────────────────────────────────────────
  backBtn.addEventListener('click', () => history.back());

  // ── Load menu from JSON ────────────────────────────────────
  fetch('menu.json')
    .then(r => r.json())
    .then(items => {
      const savedCart = JSON.parse(sessionStorage.getItem('cart') || '[]');

      items.forEach(item => {
        const tr = document.createElement('tr');
        tr.dataset.price = item.price;

        const nameTd  = document.createElement('td');
        nameTd.textContent = item.name;

        const priceTd = document.createElement('td');
        priceTd.textContent = `$${item.price.toFixed(2)}`;

        const qtyTd  = document.createElement('td');
        const input  = document.createElement('input');
        input.type   = 'number';
        input.min    = '0';
        
        const cartItem = savedCart.find(i => i.name === item.name);
        input.value  = cartItem ? cartItem.qty.toString() : '0';
        
        input.className = 'qty';
        input.addEventListener('input', () => {
          let v = parseInt(input.value, 10);
          if (isNaN(v) || v < 0) v = 0;
          input.value = v;
          updateTotal(); updateCart();
        });
        qtyTd.appendChild(input);

        tr.appendChild(nameTd);
        tr.appendChild(priceTd);
        tr.appendChild(qtyTd);
        orderBody.appendChild(tr);
      });

      updateTotal();
      updateCart();
    })
    .catch(err => console.error('Failed to load menu.json:', err));

  // ── Compute and display order total ───────────────────────
  function updateTotal() {
    let subtotal = 0;
    orderBody.querySelectorAll('tr').forEach(row => {
      const price = parseFloat(row.dataset.price) || 0;
      const qty   = parseInt(row.querySelector('.qty').value, 10) || 0;
      subtotal += price * qty;
    });
    const total = subtotal * 1.07;
    totalEl.textContent = total.toFixed(2);
  }

  // ── Update cart sidebar ───────────────────────────────────
  function updateCart() {
    let sum = 0;
    const rows = orderBody.querySelectorAll('tr');
    let html = '';
    const newCart = [];
    rows.forEach(row => {
      const qty   = parseInt(row.querySelector('.qty').value, 10) || 0;
      if (qty > 0) {
        const name  = row.cells[0].textContent.trim();
        const price = parseFloat(row.dataset.price);
        sum += price * qty;
        newCart.push({ name, price, qty });
        html += `<div class="cart-item" style="display:flex; justify-content:space-between; align-items:center;">
          <div>
            <span>${name} × ${qty}</span><br>
            <span style="color:#888; font-size:12px;">$${(price * qty).toFixed(2)}</span>
          </div>
          <button class="remove-btn" data-name="${name}" style="background:var(--red); color:white; border:none; padding:4px 8px; border-radius:4px; cursor:pointer; font-size:12px;">X</button>
        </div>`;
      }
    });
    sessionStorage.setItem('cart', JSON.stringify(newCart));
    cartItems.innerHTML = html || '<p style="color:#888;font-size:13px;">No items selected.</p>';
    cartTotalEl.textContent = sum.toFixed(2);

    // Attach remove event listeners
    cartItems.querySelectorAll('.remove-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetName = e.target.dataset.name;
        // Find the corresponding row in the table and set qty to 0
        rows.forEach(row => {
          if (row.cells[0].textContent.trim() === targetName) {
            row.querySelector('.qty').value = '0';
          }
        });
        updateTotal();
        updateCart();
      });
    });
  }

  // ── Process Order Logic ─────────────────────────────────
  function processOrder() {
    const rows  = orderBody.querySelectorAll('tr');
    const items = [];
    rows.forEach(row => {
      const qty = parseInt(row.querySelector('.qty').value, 10) || 0;
      if (qty > 0) {
        items.push({
          name:  row.cells[0].textContent.trim(),
          price: parseFloat(row.dataset.price),
          qty
        });
      }
    });

    if (items.length === 0) {
      alert('No items selected! Please choose something first.');
      return;
    }

    // Require sign-in so the order can be attached to a customer
    // and appear in their order history.
    window.BB.requireAuth(() => finalizeOrder(items));
  }

  function finalizeOrder(items) {
    const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
    const tax      = subtotal * 0.07;
    const total    = subtotal + tax;

    const record = window.BB.saveOrder({ items, subtotal, tax, total });

    sessionStorage.setItem('orderData', JSON.stringify(record));
    sessionStorage.removeItem('cart');

    // Go to receipt page
    window.location.href = 'receipt.html';
  }

  // ── Confirm order ─────────────────────────────────────────
  confirmBtn.addEventListener('click', processOrder);
  
  // ── Confirm order from cart ─────────────────────────────────
  const confirmCartBtn = document.getElementById('confirmCartBtn');
  if (confirmCartBtn) confirmCartBtn.addEventListener('click', processOrder);

});
