/* ============================================================
   account.js — Bun & Blaze account system
   ------------------------------------------------------------
   Handles: Google Sign-In (via Google Identity Services),
   an email/name fallback for when Google isn't configured,
   session state, and per-customer order history.

   IMPORTANT (read this before deploying):
   This is a static, front-end-only site — there is no server
   or database. So "storing" accounts and orders means storing
   them in the signed-in visitor's own browser (localStorage),
   namespaced by their email. That's genuinely how the sign-in
   and "My Orders" experience will work for a real visitor on
   this device/browser — but it is NOT a real multi-device
   account system. Two different browsers/devices will not see
   the same order history, because there's no backend to sync
   them. For a real product you'd swap localStorage for calls
   to a backend (Firebase, Supabase, your own API, etc.) and
   verify the Google ID token server-side. The sign-in UI and
   Google auth flow below are real; only the "database" part
   is simulated locally, which is a normal fit for a portfolio
   / demo project like this one.

   To turn on real Google Sign-In:
   1. Go to https://console.cloud.google.com/apis/credentials
   2. Create an OAuth Client ID (type: Web application)
   3. Add this site's URL under "Authorized JavaScript origins"
   4. Paste the client ID below as GOOGLE_CLIENT_ID
   Until you do that, the site automatically falls back to the
   email sign-in option only, so it still works out of the box.
   ============================================================ */

(function () {
  const GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com";
  const GOOGLE_CONFIGURED = !GOOGLE_CLIENT_ID.startsWith("YOUR_GOOGLE_CLIENT_ID");

  const SESSION_KEY = "bb_session";
  const ORDERS_PREFIX = "bb_orders__";

  const BB = {};
  window.BB = BB;

  /* ---------------- helpers ---------------- */

  function slug(email) {
    return String(email || "").trim().toLowerCase().replace(/[^a-z0-9@._-]/g, "");
  }

  function initials(name) {
    return (name || "?")
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map(w => w[0])
      .join("")
      .toUpperCase();
  }

  function avatarColor(seed) {
    const colors = ["#C8102E", "#F2B705", "#3B2A22", "#2a7a2a", "#1D5C9E", "#7A2A6D"];
    let h = 0;
    for (const ch of String(seed)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    return colors[h % colors.length];
  }

  function escapeHTML(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, c => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));
  }

  // Exposed so other pages (account.html, receipt.html) can reuse them
  // instead of redefining the same logic.
  BB.initials = initials;
  BB.avatarColor = avatarColor;
  BB.escapeHTML = escapeHTML;

  BB.formatMoney = n => `$${Number(n || 0).toFixed(2)}`;

  BB.orderId = () => "BB-" + Math.floor(10000 + Math.random() * 89999);

  /* ---------------- session ---------------- */

  BB.getSession = function () {
    try {
      return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
    } catch (e) {
      return null;
    }
  };

  BB.setSession = function (user) {
    const existing = BB.getSession();
    const session = {
      name: user.name,
      email: user.email,
      picture: user.picture || null,
      provider: user.provider || "email",
      since: (existing && existing.email === user.email) ? existing.since : new Date().toISOString(),
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    renderAuthWidgets();
    return session;
  };

  BB.signOut = function () {
    localStorage.removeItem(SESSION_KEY);
    renderAuthWidgets();
  };

  /* ---------------- order history ---------------- */
  // Orders are stored on the server (data/orders.json, via the
  // /api/orders endpoints in server.js) so a customer's order
  // history is the same across any browser/device they sign in
  // from — not just remembered by one browser.
  //
  // If the API can't be reached (for example the site is opened
  // as plain static files instead of run with `npm start`), we
  // fall back to localStorage so the feature still works, just
  // without the cross-device sync.

  function localOrdersKey(email) {
    return ORDERS_PREFIX + slug(email);
  }

  function getOrdersLocal(email) {
    try {
      const list = JSON.parse(localStorage.getItem(localOrdersKey(email)) || "[]");
      return list.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    } catch (e) {
      return [];
    }
  }

  function saveOrderLocal(email, order) {
    const list = getOrdersLocal(email);
    const record = Object.assign(
      { id: BB.orderId(), timestamp: new Date().toISOString(), status: "Confirmed", eta: 10 + Math.floor(Math.random() * 12) },
      order
    );
    list.unshift(record);
    localStorage.setItem(localOrdersKey(email), JSON.stringify(list));
    return record;
  }

  BB.getOrders = async function (email) {
    const targetEmail = email || (BB.getSession() || {}).email;
    if (!targetEmail) return [];
    try {
      const res = await fetch(`/api/orders?email=${encodeURIComponent(targetEmail)}`);
      if (!res.ok) throw new Error("API error");
      return await res.json();
    } catch (e) {
      return getOrdersLocal(targetEmail);
    }
  };

  BB.saveOrder = async function (order) {
    const session = BB.getSession();
    if (!session) return null;
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.assign({ email: session.email }, order)),
      });
      if (!res.ok) throw new Error("API error");
      return await res.json();
    } catch (e) {
      return saveOrderLocal(session.email, order);
    }
  };

  BB.stats = async function (orders) {
    const list = orders || await BB.getOrders();
    const totalSpent = list.reduce((s, o) => s + (o.total || 0), 0);
    return {
      orderCount: list.length,
      totalSpent,
      points: Math.floor(totalSpent * 10),
    };
  };

  /* ---------------- shared styles ---------------- */

  function injectStyles() {
    if (document.getElementById("bb-account-style")) return;
    const style = document.createElement("style");
    style.id = "bb-account-style";
    style.textContent = `
      #authWidget{position:relative;display:flex;align-items:center;}
      .bb-signin-btn{
        display:inline-flex;align-items:center;gap:8px;padding:9px 16px;
        background:transparent;border:2px solid #FFF8E7;color:#FFF8E7;
        border-radius:4px;font-weight:700;font-size:13px;cursor:pointer;
        font-family:inherit;text-transform:uppercase;letter-spacing:.02em;
        transition:background .2s, color .2s;
      }
      .bb-signin-btn:hover{background:#FFF8E7;color:#1C1C1C;}
      .bb-user-pill{
        display:flex;align-items:center;gap:8px;padding:6px 10px 6px 6px;
        background:rgba(255,248,231,0.08);border:1px solid rgba(255,248,231,0.25);
        border-radius:30px;cursor:pointer;color:#FFF8E7;font-size:13px;font-weight:700;
      }
      .bb-avatar{
        width:28px;height:28px;border-radius:50%;object-fit:cover;
        display:flex;align-items:center;justify-content:center;
        font-size:12px;font-weight:800;color:#fff;flex-shrink:0;
      }
      .bb-dropdown{
        position:absolute;top:calc(100% + 10px);right:0;background:#1C1C1C;
        border:2px solid #F2B705;border-radius:8px;min-width:220px;
        box-shadow:0 12px 30px rgba(0,0,0,.35);z-index:500;overflow:hidden;
        display:none;
      }
      .bb-dropdown.open{display:block;}
      .bb-dropdown .bb-dd-head{padding:14px 16px;border-bottom:1px solid #333;}
      .bb-dropdown .bb-dd-head .n{color:#FFF8E7;font-weight:800;font-size:14px;}
      .bb-dropdown .bb-dd-head .e{color:#999;font-size:12px;margin-top:2px;}
      .bb-dropdown a, .bb-dropdown button{
        display:block;width:100%;text-align:left;padding:12px 16px;
        color:#FFF8E7;background:none;border:none;font-family:inherit;
        font-size:13px;font-weight:700;cursor:pointer;text-decoration:none;
      }
      .bb-dropdown a:hover, .bb-dropdown button:hover{background:rgba(242,183,5,.12);color:#F2B705;}

      #bbSignInModal{
        position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:1000;
        display:none;align-items:center;justify-content:center;padding:20px;
      }
      #bbSignInModal.open{display:flex;}
      .bb-modal-card{
        background:#FFF8E7;color:#1C1C1C;width:100%;max-width:380px;
        border-radius:12px;padding:28px 26px;position:relative;
        border:3px solid #1C1C1C;box-shadow:8px 8px 0 #F2B705;
        font-family:'Archivo',sans-serif;
        animation:bbModalIn .22s ease;
      }
      @keyframes bbModalIn{from{opacity:0;transform:translateY(10px) scale(.98);}to{opacity:1;transform:translateY(0) scale(1);}}
      .bb-modal-card h2{font-family:'Archivo Black',sans-serif;font-size:22px;margin-bottom:6px;color:#C8102E;text-transform:uppercase;}
      .bb-modal-card p.sub{font-size:13px;color:#555;margin-bottom:20px;}
      .bb-modal-close{position:absolute;top:14px;right:16px;background:none;border:none;font-size:20px;cursor:pointer;color:#1C1C1C;}
      #bbGoogleBtnHost{display:flex;justify-content:center;margin-bottom:14px;min-height:40px;}
      .bb-divider{display:flex;align-items:center;gap:10px;margin:16px 0;color:#999;font-size:12px;text-transform:uppercase;font-weight:700;}
      .bb-divider:before,.bb-divider:after{content:'';flex:1;height:1px;background:#ddd;}
      .bb-field{margin-bottom:12px;}
      .bb-field label{display:block;font-size:12px;font-weight:700;margin-bottom:5px;text-transform:uppercase;letter-spacing:.03em;color:#555;}
      .bb-field input{width:100%;padding:10px 12px;border:2px solid #ddd;border-radius:6px;font-size:14px;font-family:inherit;}
      .bb-field input:focus{outline:none;border-color:#C8102E;}
      .bb-modal-submit{
        width:100%;padding:12px;background:#C8102E;color:#FFF8E7;border:none;
        border-radius:6px;font-weight:800;font-size:14px;cursor:pointer;margin-top:6px;
        text-transform:uppercase;letter-spacing:.03em;transition:background .2s;
      }
      .bb-modal-submit:hover{background:#F2B705;color:#1C1C1C;}
      .bb-modal-note{font-size:11px;color:#999;margin-top:14px;line-height:1.5;text-align:center;}
      .bb-error{color:#C8102E;font-size:12px;margin-top:-6px;margin-bottom:10px;display:none;}

      #bbToastHost{position:fixed;bottom:18px;left:18px;z-index:900;display:flex;flex-direction:column;gap:10px;}
      .bb-toast{
        background:#1C1C1C;color:#FFF8E7;border-left:4px solid #F2B705;
        padding:12px 16px;border-radius:6px;font-size:13px;max-width:290px;
        box-shadow:0 8px 22px rgba(0,0,0,.3);animation:bbToastIn .25s ease;
      }
      @keyframes bbToastIn{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}
      @media(max-width:600px){#bbToastHost{left:10px;right:10px;}.bb-toast{max-width:none;}}
    `;
    document.head.appendChild(style);
  }

  /* ---------------- nav widget ---------------- */

  let pendingSuccess = null;

  function renderAuthWidgets() {
    const slots = document.querySelectorAll("#authWidget");
    const session = BB.getSession();
    slots.forEach(slot => {
      slot.innerHTML = "";
      if (!session) {
        const btn = document.createElement("button");
        btn.className = "bb-signin-btn";
        btn.type = "button";
        btn.innerHTML = "👤 Sign In";
        btn.addEventListener("click", () => BB.openSignIn());
        slot.appendChild(btn);
        return;
      }

      const pill = document.createElement("div");
      pill.className = "bb-user-pill";
      pill.innerHTML = avatarHTML(session) + `<span>${escapeHTML(firstName(session.name))}</span>`;

      const dd = document.createElement("div");
      dd.className = "bb-dropdown";
      dd.innerHTML = `
        <div class="bb-dd-head">
          <div class="n">${escapeHTML(session.name)}</div>
          <div class="e">${escapeHTML(session.email)}</div>
        </div>
        <a href="account.html">📋 My Orders</a>
        <button type="button" data-act="signout">🚪 Sign Out</button>
      `;
      dd.querySelector('[data-act="signout"]').addEventListener("click", () => {
        BB.signOut();
      });

      pill.addEventListener("click", (e) => {
        e.stopPropagation();
        document.querySelectorAll(".bb-dropdown.open").forEach(d => { if (d !== dd) d.classList.remove("open"); });
        dd.classList.toggle("open");
      });

      slot.appendChild(pill);
      slot.appendChild(dd);
    });

    document.addEventListener("click", () => {
      document.querySelectorAll(".bb-dropdown.open").forEach(d => d.classList.remove("open"));
    });
  }

  function avatarHTML(session) {
    if (session.picture) {
      return `<img class="bb-avatar" src="${escapeHTML(session.picture)}" alt="${escapeHTML(session.name)}" referrerpolicy="no-referrer">`;
    }
    return `<span class="bb-avatar" style="background:${avatarColor(session.email)}">${escapeHTML(initials(session.name))}</span>`;
  }

  function firstName(name) {
    return String(name || "").split(" ")[0] || "Account";
  }

  // Shared by both sign-in paths (Google + email): saves the session,
  // closes the modal, shows a welcome toast, and resumes whatever the
  // caller was waiting on (e.g. placing an order).
  function completeSignIn(user, viaLabel) {
    const session = BB.setSession(user);
    closeModal();
    BB.toast(`Welcome, ${firstName(session.name)}! ${viaLabel}`);
    if (pendingSuccess) { const cb = pendingSuccess; pendingSuccess = null; cb(session); }
    return session;
  }

  /* ---------------- sign-in modal ---------------- */

  function buildModal() {
    if (document.getElementById("bbSignInModal")) return;
    const modal = document.createElement("div");
    modal.id = "bbSignInModal";
    modal.innerHTML = `
      <div class="bb-modal-card">
        <button class="bb-modal-close" type="button" aria-label="Close">✕</button>
        <h2>Sign In</h2>
        <p class="sub">Sign in to place your order and keep track of your order history.</p>
        <div id="bbGoogleBtnHost"></div>
        <div id="bbGoogleUnavailable" style="display:none;font-size:12px;color:#999;text-align:center;margin-bottom:14px;">
          Google Sign-In isn't configured on this deployment yet — use email below.
        </div>
        <div class="bb-divider">or continue with email</div>
        <form id="bbEmailForm" novalidate>
          <div class="bb-field">
            <label for="bbNameInput">Full name</label>
            <input id="bbNameInput" type="text" autocomplete="name" placeholder="Ali Raza" required>
          </div>
          <div class="bb-field">
            <label for="bbEmailInput">Email</label>
            <input id="bbEmailInput" type="email" autocomplete="email" placeholder="ali@example.com" required>
          </div>
          <div class="bb-error" id="bbFormError">Please enter a valid name and email.</div>
          <button type="submit" class="bb-modal-submit">Continue</button>
        </form>
        <div class="bb-modal-note">We only use this to show your name on orders and save your order history in this browser. No password needed for this demo.</div>
      </div>
    `;
    document.body.appendChild(modal);

    modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });
    modal.querySelector(".bb-modal-close").addEventListener("click", closeModal);

    modal.querySelector("#bbEmailForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const name = modal.querySelector("#bbNameInput").value.trim();
      const email = modal.querySelector("#bbEmailInput").value.trim();
      const err = modal.querySelector("#bbFormError");
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if (!name || !emailOk) {
        err.style.display = "block";
        return;
      }
      err.style.display = "none";
      completeSignIn({ name, email, provider: "email" }, "You're signed in.");
    });
  }

  function closeModal() {
    const modal = document.getElementById("bbSignInModal");
    if (modal) modal.classList.remove("open");
  }

  BB.openSignIn = function (onSuccess) {
    injectStyles();
    buildModal();
    pendingSuccess = onSuccess || null;
    document.getElementById("bbSignInModal").classList.add("open");
    document.getElementById("bbNameInput").value = "";
    document.getElementById("bbEmailInput").value = "";
    document.getElementById("bbFormError").style.display = "none";
    maybeInitGoogle();
  };

  BB.requireAuth = function (onAuthed) {
    const session = BB.getSession();
    if (session) { onAuthed(session); return; }
    BB.openSignIn(onAuthed);
  };

  /* ---------------- toast (used for sign-in + realism ticker) ---------------- */

  BB.toast = function (message) {
    injectStyles();
    let host = document.getElementById("bbToastHost");
    if (!host) {
      host = document.createElement("div");
      host.id = "bbToastHost";
      document.body.appendChild(host);
    }
    const el = document.createElement("div");
    el.className = "bb-toast";
    el.textContent = message;
    host.appendChild(el);
    setTimeout(() => {
      el.style.transition = "opacity .3s, transform .3s";
      el.style.opacity = "0";
      el.style.transform = "translateY(8px)";
      setTimeout(() => el.remove(), 320);
    }, 4200);
  };

  /* ---------------- Google Identity Services ---------------- */

  let googleReadyAttempted = false;

  function decodeJwt(token) {
    try {
      const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
      const json = decodeURIComponent(
        atob(base64).split("").map(c => "%" + c.charCodeAt(0).toString(16).padStart(2, "0")).join("")
      );
      return JSON.parse(json);
    } catch (e) {
      return null;
    }
  }

  function handleGoogleCredential(response) {
    const payload = decodeJwt(response.credential);
    if (!payload || !payload.email) return;
    completeSignIn({
      name: payload.name || payload.email.split("@")[0],
      email: payload.email,
      picture: payload.picture,
      provider: "google",
    }, "Signed in with Google.");
  }

  function maybeInitGoogle() {
    const unavailableNote = document.getElementById("bbGoogleUnavailable");
    if (!GOOGLE_CONFIGURED) {
      if (unavailableNote) unavailableNote.style.display = "block";
      return;
    }
    if (unavailableNote) unavailableNote.style.display = "none";

    const host = document.getElementById("bbGoogleBtnHost");
    if (!host) return;

    function render() {
      if (!window.google || !window.google.accounts || !window.google.accounts.id) return;
      host.innerHTML = "";
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleCredential,
      });
      window.google.accounts.id.renderButton(host, { theme: "outline", size: "large", width: 280 });
    }

    if (window.google && window.google.accounts) {
      render();
      return;
    }
    if (googleReadyAttempted) return;
    googleReadyAttempted = true;
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = render;
    script.onerror = () => {
      if (unavailableNote) {
        unavailableNote.textContent = "Couldn't reach Google Sign-In — use email below.";
        unavailableNote.style.display = "block";
      }
    };
    document.head.appendChild(script);
  }

  /* ---------------- boot ---------------- */

  document.addEventListener("DOMContentLoaded", () => {
    injectStyles();
    renderAuthWidgets();
  });
})();
