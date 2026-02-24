# MorphDB 🚀
**Legacy schemas in. Modern data stacks out.**

MorphDB is a next-generation SaaS tool built for Senior Data Engineers. It acts as an AI Co-Pilot to seamlessly translate and migrate legacy database schemas and stored procedures (Oracle, SQL Server) into modern cloud data warehouses (Snowflake, BigQuery) using native `dbt` models.

## The Problem
Database migrations are multi-million dollar nightmares. Proprietary SQL dialects and thousands of undocumented stored procedures take teams of consultants months to decode and rewrite. 

## The Solution
MorphDB leverages advanced LLMs to semantically understand business logic and translate it into clean, modern data pipelines in minutes, ensuring 100% logic preservation and zero data loss.

## Development Phases (Hackathon)

### Phase 1: Landing Page (Frontend)
- Next.js + Tailwind CSS + Framer Motion structural build.
- Modern, "vibe-coded" design targeting Enterprise Data teams (Glassmorphism, dark mode aesthetics, precise typography).
- Sections: Hero, Problem/Solution, Features, How it Works, Waitlist/Pricing.

### Phase 2: Core SaaS Engine (Backend/Fullstack)
- Auth implementation (Supabase).
- Data model setup (Prisma + PostgreSQL).
- AI Translation Engine interface.

## Getting Started
To run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
