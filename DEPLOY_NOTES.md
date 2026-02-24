# Vercel Deployment Checklist

## Date: 2026-02-24
## Project: MorphDB

---

## ⚙️ Environment Variables to Set in Vercel Dashboard

Go to: Project → Settings → Environment Variables

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://jqkrbvdimhvfhaoyvaaj.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | *(from Supabase → Settings → API → anon public key)* |
| `DATABASE_URL` | *(Supabase connection pooler URL — port 6543)* |
| `DIRECT_URL` | *(Supabase direct connection URL — port 5432)* |
| `NEXT_PUBLIC_SITE_URL` | `https://your-app.vercel.app` ← **UPDATE after deploy** |
| `STRIPE_SECRET_KEY` | *(from Stripe Dashboard → Developers → API Keys)* |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | *(from Stripe Dashboard → Developers → API Keys)* |
| `STRIPE_WEBHOOK_SECRET` | *(from Stripe Dashboard → Webhooks → signing secret)* |
| `STRIPE_DESIGN_PARTNER_PRICE_ID` | *(Stripe Price ID for $499/mo Design Partner plan)* |

---

## 🔧 Code Changes (Already Done)

- [x] `src/app/api/auth/signout/route.ts` — uses `NEXT_PUBLIC_SITE_URL` correctly
- [x] `package.json` — `postinstall: prisma generate` added for Vercel build
- [x] Login logging — captures IP, country (`x-vercel-ip-country`), user-agent
- [x] Stripe checkout route — `POST /api/stripe/checkout`
- [x] Stripe webhook route — `POST /api/stripe/webhook`

---

## 🗄️ Database Tables (All Created)

- [x] `waitlist_entries`
- [x] `profiles` — run `supabase-setup.sql` in Supabase SQL Editor
- [x] `login_logs`
- [x] `subscriptions`

---

## 🚀 Deployment Steps

1. Push all changes: `git push origin main`
2. Go to [vercel.com](https://vercel.com) → Import repo
3. Set all environment variables in Vercel dashboard
4. Deploy — Vercel auto-runs `npm install && npm run build`
5. `postinstall` will auto-run `prisma generate` during build
6. After deploy, update `NEXT_PUBLIC_SITE_URL` to the real domain

---

## 💳 Stripe Setup Steps (Before Monetization Goes Live)

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Create a Product: "MorphDB Design Partner" → Price: $499/mo recurring
3. Copy the **Price ID** → set as `STRIPE_DESIGN_PARTNER_PRICE_ID`
4. Go to Stripe → Developers → Webhooks → Add endpoint:
   - URL: `https://your-domain.vercel.app/api/stripe/webhook`
   - Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
5. Copy **Webhook Signing Secret** → set as `STRIPE_WEBHOOK_SECRET`

---

## 🧪 Post-Deploy Smoke Tests

- [ ] Landing page loads with correct domain
- [ ] Sign Up creates user in Supabase Auth + `profiles` table
- [ ] Sign In works, logs appear in `login_logs` (with country on Vercel)
- [ ] Sign Out redirects to homepage (not broken URL)
- [ ] Waitlist form submits to `waitlist_entries`
- [ ] `/dashboard` redirects to `/login` if unauthenticated
- [ ] Stripe Checkout opens when "Join the Waitlist" is clicked (post Stripe setup)
- [ ] Webhook updates `subscriptions` table after payment
