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
| 1. API | `src/lib/api/generated` (orval output, generated from `../shared/openapi.json`) | Machine-generated. Never hand-edit, never import directly into components. |
| 2. View model | `src/features/*/types.ts` | `toXxxView(api, locale)` mappers resolve localized text to plain strings, compute `effectivePrice`, and shape data for the UI. This is the guard against the "2-3 parallel models" problem from the previous repo iteration. |
| 3. Component | `interface XxxProps` per file | Every component has explicit props; pages use typed `params`/`searchParams`. |

Components must only receive tier-2/3 types, never raw API types.

### API layer

Product/category types come from `@/lib/api/generated/ecomAPI.schemas` (`ProductResponseDto`, `ProductListDto`, `ProductCategorySummaryDto`, etc.) — the backend now documents concrete response DTOs and a `LocalizedStringDto` (`{vi?, en?}`) shape for input fields, so these are trustworthy. Two things to know when reading them:
- **Product content fields are read-only pre-resolved strings.** `ProductResponseDto.name`/`slug`/`description`/`short_description`/`meta_title`/`meta_description`, and variant `name`, come back as plain `string` for whichever `locale` query param was passed to the GET request (backend resolves it server-side) — they are NOT `{vi, en}` objects on the read side, only on `CreateProductDto`/`UpdateProductDto` (the write side). `resolveLocalized()` still gets called on them in the tier-2 mappers for safety (it already passes plain strings through unchanged), but don't expect a locale object here.
- **`category`/`collections` are flat strings, not localized.** `Category`/`Collection` entities are plain `varchar` in the backend, not JSONB — `ProductCategorySummaryDto.name`/`slug` are plain `string`. `ProductResponseDto` has no `collections` field at all yet (the backend's `transformProductForLocale()` doesn't populate `productCollections`) — `toProductDetailView()` sets `collectionName`/`collectionSlug` to `null` with a `TODO(collections)` comment until that's wired up as its own backend task.

All HTTP requests go through `src/lib/api/fetcher.ts` (`customFetch`, the orval mutator). Auth (JWT + refresh) is not implemented yet — see TODOs inline there. Note: `products`/`categories`/`colors`/`sizes`/`files` write endpoints (POST/PATCH/DELETE) now require an admin bearer token on the backend — this storefront only reads (GET), so it's unaffected, but any future admin-facing code added here would need auth wired up first.

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
