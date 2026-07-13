/* ============================================================
   server.js — Bun & Blaze backend
   ------------------------------------------------------------
   A small Express server that does two jobs:

   1. Serves the site itself (all the .html/.js/.css/images)
      exactly like a static host would.
   2. Provides a real API for the menu and for order history,
      backed by a JSON file on disk (data/orders.json) instead
      of the browser's localStorage. That's the key upgrade:
      order history now lives on the server, so it's the same
      for a customer whichever browser or device they sign in
      from — not just "remembered" by one browser.

   This still isn't a full production setup (see README for what
   a real deployment would add — a proper database, server-side
   verification of the Google sign-in token, HTTPS, etc.), but
   it's a genuine Node.js backend doing genuine persistence,
   which is the right shape for a portfolio piece to build on.

   Run it with:
     npm install
     npm start
   Then open http://localhost:3000
   ============================================================ */

const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

const ROOT_DIR = __dirname;
const DATA_DIR = path.join(ROOT_DIR, 'data');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const MENU_FILE = path.join(ROOT_DIR, 'menu.json');

app.use(express.json());

/* ---------------- tiny JSON-file "database" ---------------- */
// Orders are grouped by customer email:
//   { "someone@example.com": [ {id, timestamp, items, ...}, ... ] }

function readOrdersDB() {
  try {
    return JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf8'));
  } catch (e) {
    return {};
  }
}

function writeOrdersDB(db) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(db, null, 2));
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function makeOrderId() {
  return 'BB-' + Math.floor(10000 + Math.random() * 89999);
}

/* ---------------- API routes ---------------- */

// Menu data. Kept as an API route (rather than just letting the
// front end fetch menu.json directly) so a future version could
// swap in a real database here without touching any HTML/JS.
app.get('/api/menu', (req, res) => {
  try {
    const menu = JSON.parse(fs.readFileSync(MENU_FILE, 'utf8'));
    res.json(menu);
  } catch (e) {
    res.status(500).json({ error: 'Could not load menu.' });
  }
});

// Get a customer's order history, newest first.
app.get('/api/orders', (req, res) => {
  const email = normalizeEmail(req.query.email);
  if (!email) return res.status(400).json({ error: 'email query param is required.' });

  const db = readOrdersDB();
  const list = (db[email] || [])
    .slice()
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  res.json(list);
});

// Save a new order for a customer.
app.post('/api/orders', (req, res) => {
  const { email, items, subtotal, tax, total } = req.body || {};
  const key = normalizeEmail(email);

  if (!key || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'email and a non-empty items array are required.' });
  }

  const record = {
    id: makeOrderId(),
    timestamp: new Date().toISOString(),
    status: 'Confirmed',
    eta: 10 + Math.floor(Math.random() * 12),
    items,
    subtotal: Number(subtotal) || 0,
    tax: Number(tax) || 0,
    total: Number(total) || 0,
  };

  const db = readOrdersDB();
  if (!db[key]) db[key] = [];
  db[key].unshift(record);
  writeOrdersDB(db);

  res.status(201).json(record);
});

/* ---------------- static site ---------------- */
// Everything else (the HTML pages, account.js, images, etc.)
// is served exactly as it was before — this just adds the API
// on top of the same static files.
app.use(express.static(ROOT_DIR));

app.listen(PORT, () => {
  console.log(`Bun & Blaze server running at http://localhost:${PORT}`);
});
