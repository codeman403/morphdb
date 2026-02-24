# MorphDB

> AI Co-Pilot for Database Migrations

Transform legacy SQL Server and Oracle code into modern, cloud-native SQL — automatically.

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Features

- 🤖 **AI-Powered Translation** — GPT-4o-mini translates SQL between 4 source and 4 target dialects
- 🔐 **Auth** — Email/password via Supabase (sign up, sign in, sign out, session persistence)
- 📊 **Admin Dashboard** — Monitor waitlist, login logs, user stats
- 💳 **Stripe Integration** — Checkout + webhooks for subscriptions
- 🛡️ **Rate Limiting** — Per-IP limits on all mutation endpoints
- 🎨 **Premium UI** — Dark mode, Framer Motion animations, responsive design

## Tech Stack

Next.js 16 • React 19 • Tailwind CSS 4 • Prisma 7 • Supabase • Stripe • OpenAI

## Documentation

See **[ARCHITECTURE.md](./ARCHITECTURE.md)** for full details:
- Architecture diagrams
- API reference
- Database schema
- Deployment guide
- Environment variables
- Changelog & roadmap

## Environment Variables

Copy `.env.local.example` or see [ARCHITECTURE.md](./ARCHITECTURE.md#environment-variables) for the full list.

## License

Private — © 2026 MorphDB
