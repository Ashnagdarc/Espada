# Espada

Full-stack e-commerce application with a customer storefront and administrative workflows.

Espada is a portfolio project exploring the moving parts of an online store: product browsing, customer accounts, checkout, payment verification, order management, and catalogue administration. It is not presented as a security-audited or production-certified service.

## Implemented areas

- Product catalogue, detail pages, cart, checkout, and payment callback flow
- Customer sign-up, sign-in, account, orders, and password-reset flows
- Administrative product, order, customer, homepage, settings, and analytics pages
- Supabase-backed authentication and data access
- Paystack payment initialization, verification, and webhook routes

## Stack

Next.js 15 · TypeScript · Supabase · PostgreSQL · Tailwind CSS · Zustand · Paystack

## Run locally

Requirements: Node.js 18+ and pnpm (the committed lockfile is pnpm).

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Open `http://localhost:3000`.

## Environment

Supabase credentials are required. Paystack credentials are required to exercise payment flows. See [`.env.example`](.env.example) for the complete local-development template. Keep real credentials out of source control.

## Checks

```bash
pnpm lint
pnpm typecheck
pnpm build
```

There is no automated test suite configured yet. Contributions should add focused coverage alongside new behaviour.

## Repository layout

- `app` — Next.js pages and route handlers
- `components` — storefront and administration interface components
- `lib` and `utils` — Supabase, payments, auth, and shared helpers
- `scripts` — local administrative utilities
- `public` — static storefront assets

## Deployment

The app can be deployed to a Node-compatible Next.js host after its environment variables and Supabase configuration are set. Validate the build and production settings in a non-production project before handling real orders or customer data.
