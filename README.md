# Bun & Blaze 🔥🍔

A fully responsive, animated website for a fictional fast-food smash-burger brand — built as a portfolio piece to demonstrate front-end design/animation skills plus a real Node.js/Express backend for accounts and order history.

**Live demo:** [add your deployed link here]

---

## Overview

Bun & Blaze is a concept brand built around the idea of fast food that doesn't feel lazy — hand-pressed smash patties, fast service, and a bold diner-meets-streetwear visual identity. The site includes a marketing homepage, a full menu with cart, a checkout flow, Google/email sign-in, and a real per-customer order history backed by a small Node server.

## Features

- **Custom brand identity** — color palette, typography, and a hand-built CSS/HTML burger illustration (layered divs, no images)
- **Hero entrance animation, floating burger graphic, scroll reveals, animated stat counters, 3D card tilt, auto-scrolling testimonials, sticky nav, scroll-to-top** — see `bun-and-blaze.html`
- **Fully responsive & accessibility-conscious** — keyboard focus states, `prefers-reduced-motion` support
- **Sign in with Google (or email)** — real Google Identity Services integration, with an email fallback so it works without any setup
- **Real per-customer order history** — orders are saved through a small Express API to a JSON file on the server (`data/orders.json`), so a customer's order history is the same no matter which browser or device they sign in from
- **Live order tracker** on the receipt page (animated "Received → Kitchen → Grill → Ready" progress) and a social-proof activity ticker on the homepage
- **Shared design system** (`common.css`) — colors, buttons, and the top nav bar are defined once and reused across every inner page instead of being duplicated

## How sign-in & order history actually work

- **Sign-in** uses real [Google Identity Services](https://developers.google.com/identity/gsi/web) — no fake OAuth. To turn it on, create a free OAuth Client ID in the [Google Cloud Console](https://console.cloud.google.com/apis/credentials), add your deployed URL under "Authorized JavaScript origins," and paste the Client ID into `GOOGLE_CLIENT_ID` at the top of `account.js`. Until you do that, the Google button is skipped automatically and visitors sign in with just a name + email instead.
- **Order history is stored server-side** by `server.js`, in `data/orders.json`, grouped by customer email. This means it's genuinely shared across devices/browsers for the same signed-in email — a real step up from browser-only storage.
- **If the server isn't running** (for example if you open the HTML files directly instead of via `npm start`), `account.js` automatically falls back to storing orders in the browser's `localStorage` instead, so the site still works — just without the cross-device sync. Nothing breaks either way.
- One honest limitation: there's still no password or server-verified session — "being signed in" just means the browser remembers a name + email (and, with Google, a token that's decoded but not cryptographically verified server-side). That's fine for a demo; a production version would add server-side Google token verification and a real session/auth layer.

## Tech Stack

- **Node.js + Express** (`server.js`) — serves the site and provides `/api/menu` and `/api/orders`
- **HTML5** — semantic structure
- **CSS3** — custom properties, keyframe animations, Grid/Flexbox, shared `common.css` design system, no frameworks
- **Vanilla JavaScript** — no build step, no front-end framework

## Project Structure

```
bun-and-blaze/
├── server.js          # Express server: static hosting + /api/menu, /api/orders
├── package.json
├── data/              # created automatically at runtime — orders.json lives here
├── common.css          # shared colors, buttons, top nav bar used by every inner page
├── menu.json          # menu data (source of truth for prices/images/descriptions)
├── account.js         # sign-in (Google + email), session, order history client
├── bun-and-blaze.html # homepage
├── menu.html          # full menu + cart
├── order.html          # quick order page
├── receipt.html       # order confirmation + live tracker
├── account.html       # "My Account" — profile + order history
└── *.png              # category fallback images used by menu.js
```

## Running Locally

Requires [Node.js](https://nodejs.org) (any recent LTS version).

```bash
git clone https://github.com/yourusername/bun-and-blaze.git
cd bun-and-blaze
npm install
npm start
```

Then open **http://localhost:3000**.

(You can still just double-click `bun-and-blaze.html` to preview the front end without the server — sign-in and order history will work via the automatic `localStorage` fallback, just without cross-device sync.)

## Deployment

Because this now has a real Node backend, it needs a host that can run Node — not a pure static host:

- **Render / Railway / Fly.io** — connect the repo, set the start command to `npm start`
- Any VPS: `npm install && npm start` behind a process manager (pm2) and a reverse proxy (nginx)

If you only want the static front-end experience (no shared server-side order history), you can still deploy just the HTML/CSS/JS/image files to GitHub Pages, Netlify, or Vercel — the `localStorage` fallback keeps everything working.

## Notes

This is a demonstration/portfolio project built around a fictional brand. All copy, pricing, and "testimonials" are placeholder content created for design purposes — not a real restaurant.

## License

Free to use as a reference or starting point for your own projects.
