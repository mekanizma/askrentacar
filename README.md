# ASK RENT A CAR

Premium Rent A Car platform for Northern Cyprus (KKTC), built as a production-ready SaaS-style frontend with a mock-first data layer.

## Stack

- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS 4 + custom premium design system
- TanStack Query, React Hook Form, Zod
- Framer Motion, GSAP-ready hooks, Lenis, Embla, React Three Fiber
- Repository pattern with mock JSON/localStorage provider (Supabase-ready)

## Quick start

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Demo accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@askrentacar.com | Admin123! |
| Customer | demo@askrentacar.com | Demo123! |

## Scripts

```bash
pnpm dev
pnpm build
pnpm start
pnpm lint
pnpm test
pnpm typecheck
```

## Architecture

```
UI (app/components)
  -> hooks
  -> services (validation + orchestration)
  -> repository contracts
  -> mock provider (default)
  -> supabase provider (future switch only)
```

Switching to Supabase later requires replacing adapters in `src/repositories` and flipping the provider flag. UI and business flows stay unchanged.

## Mock data

Seeded deterministically in `src/mock/seed.ts`:

- 120 vehicles
- 50 users
- 250 bookings
- 40 blog posts
- 15 campaigns
- 20 reviews
- 10 categories
- 9 KKTC pickup points

Browser CRUD persists to `localStorage` key `cpd_mock_db_v1`. Clear site data to reset.

## Key routes

- `/` premium home + 3D showroom
- `/vehicles`, `/vehicles/[slug]`
- `/booking` multi-step reservation
- `/account/*` customer panel
- `/admin/*` admin CRUD dashboard
- `/blog`, `/campaigns`, `/categories`, `/contact`, `/compare`

## Localization & currency

- Languages: Türkçe, English, Русский
- Currencies: TRY, GBP, EUR (mock FX from settings)

## Notes

- No live Supabase connection is configured by design.
- Email/WhatsApp/PDF flows are mocked but interactive.
- Images use Unsplash remote placeholders with `next/image` optimization.
