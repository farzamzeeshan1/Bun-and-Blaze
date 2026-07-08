# Bun & Blaze 🔥🍔

A fully responsive, animated single-page website for a fictional fast-food smash-burger brand — built as a front-end portfolio piece to demonstrate design, animation, and vanilla JavaScript skills (no frameworks, no libraries).

**Live demo:** [add your deployed link here]

---

## Overview

Bun & Blaze is a concept brand built around the idea of fast food that doesn't feel lazy — hand-pressed smash patties, fast service, and a bold diner-meets-streetwear visual identity. The entire site, from the color palette to the burger graphic in the hero, was designed and coded from scratch — no stock photography, no UI kits.

## Features

- **Custom brand identity** — color palette, typography, and a hand-built CSS/HTML burger illustration (layered divs, no images)
- **Hero entrance animation** — staggered fade/slide-in for headline, copy, and CTA buttons on page load
- **Floating burger graphic** — gentle bobbing motion with a sizzling patty micro-jitter and rising steam particles
- **Scroll-triggered reveals** — sections fade and rise into view using the Intersection Observer API
- **Animated stat counters** — count up from zero when scrolled into view
- **3D cursor-tilt hover effect** on menu cards
- **Auto-scrolling testimonial carousel** — pauses on hover
- **Sticky navigation bar** that compresses on scroll
- **Scroll-to-top button** with fade-in on scroll
- **Fully responsive** — desktop, tablet, and mobile breakpoints
- **Accessibility-conscious** — visible keyboard focus states, and full `prefers-reduced-motion` support to disable animation for users who need it
- **Sign in with Google (or email)** — real Google Identity Services integration, with an email fallback so it works without any setup
- **Per-customer order history** — every confirmed order is saved to the signed-in customer's account and viewable on the "My Account" page, with order tracking, reorder, and loyalty points
- **Live order tracker** on the receipt page (animated "Received → Kitchen → Grill → Ready" progress) and a social-proof activity ticker on the homepage

## Accounts & Order History — how it actually works

This is a static front-end site with no server or database, so "accounts" work like this:

- **Sign-in** uses real [Google Identity Services](https://developers.google.com/identity/gsi/web) — no fake OAuth. To turn it on, create a free OAuth Client ID in the [Google Cloud Console](https://console.cloud.google.com/apis/credentials), add your deployed URL under "Authorized JavaScript origins," and paste the Client ID into `GOOGLE_CLIENT_ID` at the top of `account.js`. Until you do that, the Google button is skipped automatically and visitors sign in with just a name + email instead — the rest of the app works identically either way.
- **Order history is stored in the browser** (`localStorage`), namespaced by the signed-in email. That means it persists across visits *on the same browser/device*, which is enough to demo a real "My Orders" experience — but it is **not** a real multi-device account system, since there's no backend to sync data between devices. A production version would replace the `localStorage` calls in `account.js` with requests to a real backend (Firebase, Supabase, your own API, etc.) and verify the Google ID token server-side instead of decoding it client-side.
- Files involved: `account.js` (shared auth widget, sign-in modal, order storage), `account.html` (My Account / order history page). Every page includes `account.js` and has an `#authWidget` slot in its nav.

## Tech Stack

- **HTML5** — semantic structure
- **CSS3** — custom properties (CSS variables), keyframe animations, Grid/Flexbox layout, no frameworks
- **Vanilla JavaScript** — Intersection Observer for scroll reveals, `requestAnimationFrame` for smooth counter animation, no external libraries

## Project Structure

```
bun-and-blaze/
└── index.html   # everything (HTML, CSS, JS) in a single file
```

## Running Locally

No build step or dependencies required.

1. Clone or download this repository
2. Open `index.html` directly in any modern browser

```bash
git clone https://github.com/yourusername/bun-and-blaze.git
cd bun-and-blaze
open index.html   # or just double-click the file
```

## Deployment

This is a static site — it can be deployed anywhere that serves static files:

- **GitHub Pages** — enable under repo Settings → Pages, source: `main` branch, `/ (root)`
- **Netlify** — drag-and-drop `index.html` at [app.netlify.com/drop](https://app.netlify.com/drop)
- **Vercel** — similar drag-and-drop deploy flow

## Notes

This is a demonstration/portfolio project built around a fictional brand. All copy, pricing, and "testimonials" are placeholder content created for design purposes — not a real restaurant.

## License

Free to use as a reference or starting point for your own projects.
