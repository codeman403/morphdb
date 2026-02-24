# Agent Instructions: MorphDB

Welcome to the `MorphDB` hackathon repository!

## Project Overview
MorphDB is a B2B SaaS platform designed to act as an "AI Co-Pilot for Database Migrations." It helps Data Engineers translate legacy SQL dialects (e.g., Oracle, SQL Server) into modern data warehouse formats (e.g., Snowflake, PostgreSQL, dbt) rapidly and accurately.

## Tech Stack Expectations
- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS (Strictly Tailwind, avoid custom CSS files unless doing complex WebGL/Canvas shading)
- **Icons:** Lucide React or similar lightweight SVG libraries
- **Animations:** Framer Motion (for buttery smooth spring entrances and interactions)
- **Backend/DB:** Prisma + PostgreSQL + Supabase (to be implemented after landing page)

## Repository Structure Guidelines
When scaffolding the frontend, adhere to the following strict componentization:
- `src/components/layout/` (Navbar, Footer)
- `src/components/sections/` (Hero, Features, Testimonials, Pricing, HowItWorks)
- `src/components/ui/` (Reusable micro-components like Buttons, Cards, Inputs, Gradients)
- `src/assets/media/` (Local storage for extracted videos, noise overlays)

## Guidelines for AI Agents
1. **Never copy exact proprietary designs.** Get inspired by reference URLs, but adapt the copy and styling to fit the "MorphDB" brand (modern, fast, data-centric).
2. **Never expose or commit API keys/secrets.** Use `.env.local` for all environment variables.
3. **80/20 Workflow:** Build the structural layout (semantic HTML + basic Flex/Grid) first. Only after the structure is approved should you focus on complex animations (Framer Motion) or deep CSS polish.
4. **Visual-First UI:** Focus on high-fidelity details—glassmorphism, subtle glows, noise overlays, and precise typography.
5. **Commits:** Follow conventional commit formats (e.g., `feat:`, `fix:`, `docs:`, `chore:`).
6. **Context Checking:** Always verify the working directory before running `npm` commands or editing files.
