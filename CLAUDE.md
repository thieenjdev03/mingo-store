# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Mingo Storefront — ice cream e-commerce site. Next.js 15 (App Router) + TypeScript strict + Tailwind CSS v4 + shadcn-style components + next-intl (vi/en) + SWR. The backend is a separate NestJS repo (`ecom-website`, sibling directory) exposing OpenAPI; this frontend is currently running ahead of it on placeholder types (see "API layer" below).

## Commands

```bash
npm run dev      # http://localhost:3001 (backend commonly occupies 3000)
npm run build
npm run lint      # ESLint is currently disabled during build (next.config.ts: eslint.ignoreDuringBuilds) until eslint-config-next is added
npm run api:gen   # orval: generate types + SWR hooks from ../shared/openapi.json into src/lib/api/generated
```

There is no test runner configured in this repo yet.

## Architecture

### Three-tier type convention (enforced, not optional)

| Tier | Location | Rule |
|---|---|---|
| 1. API | `src/lib/api/generated` (orval output) / `src/types/api-placeholder.ts` (temporary, pre-codegen) | Machine-generated or backend-shaped. Never hand-edit, never import directly into components. |
| 2. View model | `src/features/*/types.ts` | `toXxxView(api, locale)` mappers resolve localized JSONB (`{vi, en}`) to plain strings, compute `effectivePrice`, and shape data for the UI. This is the guard against the "2-3 parallel models" problem from the previous repo iteration. |
| 3. Component | `interface XxxProps` per file | Every component has explicit props; pages use typed `params`/`searchParams`. |

Components must only receive tier-2/3 types, never raw API types.

### API layer (transitional state)

`src/types/api-placeholder.ts` mirrors the backend's documented shape (`docs backend §3`: JSONB localized fields, embedded variants, snake_case) just so mappers compile before codegen exists. Once the backend exports `docs/openapi.json` and `npm run api:gen` runs:
1. Delete `src/types/api-placeholder.ts`.
2. Repoint imports in `src/features/*/types.ts` to `@/lib/api/generated`.
3. If generated JSONB fields collapse to `Record<string, any>`, fix it via the NestJS `@ApiProperty` decorators (e.g. a `LocalizedString` class) and regenerate — do not patch shapes by hand on the frontend.

All HTTP requests go through `src/lib/api/fetcher.ts` (`customFetch`, the orval mutator). Auth (JWT + refresh) is not implemented yet — see TODOs inline there.

### Pricing — single source of truth

`getEffectivePrice()` in `src/features/product/types.ts`: `variant.price ?? sale_price ?? price`. Never compute price elsewhere. Display via `fCurrencyVND()` in `src/lib/format.ts` (`"100.000Đ"` format).

### i18n (next-intl)

- Locales: `vi` (default, no URL prefix, e.g. `/products`) and `en` (prefixed, `/en/products`) — `localePrefix: 'as-needed'` in `src/i18n/routing.ts`.
- Always navigate via `Link`/`useRouter`/`usePathname` from `@/i18n/navigation` — never `next/link` directly — so locale is carried automatically.
- UI strings live in `messages/vi.json` / `messages/en.json`, lowercase (uppercase is applied via CSS, not baked into translations).
- Product/content strings are multilingual JSONB from the API, resolved through `resolveLocalized()` in `src/types/localized.ts` (fallback order: requested locale → vi → en → `''`). Do not put product content in `messages/*.json`.

### Route naming

Route segments are always named in English regardless of locale; only content is localized. This applies even to routes not yet built — use these names when creating them:

| Route |
|---|
| `/products`, `/products/[slug]` |
| `/categories/[slug]` |
| `/brands`, `/brands/[slug]` |
| `/partnership` |
| `/about` |
| `/contact` |
| `/policies` |
| `/cart` |
| `/account` |
| `/checkout`, `/orders`, `/login`, `/register`, `/forgot-password` (future) |

### Cart

`src/features/cart/cart-context.tsx` — reducer + Context, persisted to `localStorage` (key `mingo-cart-v1`), hydrated post-mount to avoid SSR mismatch. Cart item prices are a snapshot at add-time; checkout must re-validate stock/price against the server before payment (not yet implemented — see `TODO(checkout)` in that file, porting `onValidateAndRefreshCart` from the previous repo).

### Design system

- Tokens in `src/styles/globals.css` (`:root` + `@theme inline`) are currently estimated from mockups, not Figma. When Figma variables land, update values there only — never hardcode colors in components; use semantic classes (`bg-primary`, `text-foreground`, etc.).
- shadcn/ui is configured (`components.json`). Add new primitives with `npx shadcn@latest add <name>`, then re-brand to match existing ones (`button.tsx`, `accordion.tsx`).
- Font is currently a fallback stack; `next/font` setup is commented in `src/app/[locale]/layout.tsx`, ready to enable once a font is chosen (must subset `vietnamese`).

### TypeScript strictness

`strict` + `noUncheckedIndexedAccess` are both on — `items[0]` types as `T | undefined`; handle it at the call site, don't cast it away.
