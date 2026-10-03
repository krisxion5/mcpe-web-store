# MCPE Web Store (demo)
Next.js 15 + MongoDB. Demo checkout only: no payments are processed.

## Setup
1. `npm install`
2. `cp .env.example .env.local` and fill `MONGODB_URI`, `MONGODB_DB`, `AUTH_SECRET` (`openssl rand -base64 48`).
3. MongoDB: create a free Atlas cluster, add a DB user with readWrite on one database, allow your IP (or Vercel's), paste the connection string.
4. `MONGODB_URI="..." npm run db:setup` once (creates indexes, seeds products/patrons).
5. `npm run dev` (http://localhost:3000). Without MongoDB the store shows seed products.
5. `npm run build && npm start` to test production.
6. Make an admin: register, then in Mongo set that user's `role` to `"ADMIN"`. `/admin` checks this server-side.

## Deploy to Vercel
Push to GitHub, import the repo in Vercel, add the same env vars under Project Settings > Environment Variables (Production + Preview), deploy. Never prefix secrets with `NEXT_PUBLIC_`.

## Security checklist
- [x] Secrets server-only (`server-only` import, no NEXT_PUBLIC secrets)
- [x] bcrypt (cost 12), httpOnly/secure/sameSite session cookie, role read from DB
- [x] typeof input checks (NoSQL injection), Origin check (CSRF), React escaping (XSS), security headers + CSP
- [ ] Global rate limiting (current limiter is per-instance; use Upstash/Vercel KV)
- [ ] Add Mongo collection validators (indexes + seed data: `npm run db:setup`)
- [ ] `git log -p | grep -i mongodb+srv` before first push; rotate any leaked secret

## Not built yet
Product detail pages, skeleton loaders, orders API and history, admin CRUD, `og:image`, real IGN verification (`lib/ign.js`), real payments.

## Hire button
Set `NEXT_PUBLIC_HIRE_LINK` (a mailto:, Discord or portfolio URL). Without it the button emails the support address.

## Reseeding after the store change
Old products stay in MongoDB until you reset them: `node --env-file=.env scripts/setup-db.mjs --reset`

## Currencies
Prices are regional store prices, not live FX. Edit the `CUR` table at the top of `components/Store.js` (r = multiplier on the USD base price, s = rounding step). Base prices live in `lib/seed.mjs` (USD).
