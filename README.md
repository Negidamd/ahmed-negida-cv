# Ahmed Negida — CV

Personal academic CV site for Ahmed Negida, MD, PhD. Lives at [cv.negida.com](https://cv.negida.com).

Companion to the main hub at [negida.com](https://negida.com) and the academic deep-dive at [negidamd.github.io](https://negidamd.github.io).

## Stack

- **Vite** + **React 18** + **TypeScript**
- **Tailwind CSS** + **shadcn/ui** (Radix primitives)
- **Supabase** for auth + dashboard CMS
- **Mapbox GL** for the geographic roadmap section
- **TanStack Query**, **React Hook Form**, **Zod**

## Local development

Requires Node 18+ and a package manager (`bun`, `npm`, or `pnpm`).

```bash
# 1. Clone
git clone https://github.com/Negidamd/ahmed-negida-cv.git
cd ahmed-negida-cv

# 2. Install
bun install        # or: npm install / pnpm install

# 3. Configure environment
cp .env.example .env
# Then edit .env with real values from Supabase + Mapbox

# 4. Run dev server
bun run dev        # or: npm run dev
# → http://localhost:8080
```

## Build

```bash
bun run build      # → dist/
bun run preview    # serve dist/ locally
```

## Project structure

```
src/
  components/      Section components (HeroSection, PublicationsSection, etc.)
  pages/           Index, Auth, Dashboard
  contexts/        AuthContext (Supabase)
  schemas/         Zod schemas for publications, projects, lectures, modules
  hooks/           useCounterAnimation, useIntersectionObserver, etc.
  integrations/    Supabase client
  lib/             Utility helpers
supabase/
  functions/       Edge functions
  migrations/      SQL migrations
```

## Deployment

Deployed to **Vercel** with custom domain `cv.negida.com`. Environment variables are configured in the Vercel dashboard. Pushes to `main` auto-deploy to production.

## Contact

Ahmed Negida, MD, PhD · ahmed.said.negida@gmail.com · [ORCID 0000-0001-5363-6369](https://orcid.org/0000-0001-5363-6369)
