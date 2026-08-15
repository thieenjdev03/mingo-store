# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## What this is

Mingo Storefront — ice cream e-commerce site. Next.js 15 (App Router) + TypeScript strict + Tailwind CSS v4 + shadcn-style components + next-intl (vi/en) + SWR. The backend is a separate NestJS repo (`ecom-website`, sibling directory) exposing OpenAPI; this frontend is currently running ahead of it on placeholder types (see "API layer" below).

## Commands

```bash
npm run dev       # next dev — http://localhost:3000
npm run dev:lan   # http://0.0.0.0:3001 (use when the backend already holds 3000)
npm run build
npm run lint      # ESLint is currently disabled during build (next.config.ts: eslint.ignoreDuringBuilds) until eslint-config-next is added
npm run api:gen   # orval: generate types + SWR hooks from ../shared/openapi.json into src/lib/api/generated
```

There is no test runner configured in this repo. **`npx tsc --noEmit` is the verification gate** — run it after any change. It is genuinely load-bearing here: because API types are generated, a backend contract change surfaces as a type error in this repo and nowhere else. After `npm run api:gen`, always typecheck.

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
- **`category` is a flat string, not localized.** `Category` entities are plain `varchar` in the backend, not JSONB — `ProductCategorySummaryDto.name`/`slug` are plain `string`.
- **`ProductResponseDto` no longer carries `collections`, `compare_at_price`, `weight_grams`, `allergens`, or `nutrition`.** As of the collections refactor the product read DTO dropped these. `toProductDetailView()` sets `collectionName`/`collectionSlug` to `null` (fetch the collection separately if needed); "giá gạch" (`compareAtPrice`) is derived from `price` vs `sale_price` gated on `enable_sale_tag`; weight comes as `weight` (kg) only — use `weightKgToGrams()` in `product/types.ts` for gram labels; nutrition is now the single `nutrition_information` HTML string.
- **Homepage collection sections come from `GET /collections/homepage`** (`HomepageSectionDto[]`), consumed hand-typed via `customFetch` in `src/features/home/{api,types}.ts` (endpoint post-dates the last `api:gen`). There is no `/storefront/home`; hero banners are a separate module (`/homepage/banners`).

All HTTP requests go through `src/lib/api/fetcher.ts` (`customFetch`, the orval mutator). It attaches `Authorization: Bearer` from `src/lib/auth/token.ts` when a token is present; only the **refresh-token interceptor** is still a TODO, so a 401 currently just fails rather than retrying. Write endpoints (POST/PATCH/DELETE on products/categories/colors/sizes/files) require an admin bearer token on the backend — the public storefront only reads, but `/admin` (below) does write and relies on this header.

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

### Cart and checkout

- The cart is server-side. `src/features/cart/cart-token.ts` creates a random guest token in browser storage and every cart/checkout request sends it as `X-Cart-Token`.
- `src/features/cart/cart-context.tsx` stores only the latest Cart API response. Never calculate subtotal, line totals, stock validity, shipping fee, or checkout total in the browser.
- Login/register calls `/cart/merge`; the server owns merge and stock validation.
- Checkout is authenticated and follows: save shipping address → `/shipping/quote` → `/checkout/quote` → `/checkout/create-order` → redirect the returned VNPay URL.
- The VNPay browser return is read-only. It must fetch `/me/orders/:orderCode` and only show success when the backend reports `paymentStatus === "PAID"`.

### The `/admin` app — different rules from the storefront

`src/app/admin/**` is a second app inside this repo, and **most storefront conventions above do not apply to it**. Confusing the two is the easiest mistake to make here:

| | Storefront (`src/app/[locale]/**`) | Admin (`src/app/admin/**`) |
|---|---|---|
| Routing | `Link`/`useRouter` from `@/i18n/navigation` | plain `next/link` / `next/navigation` — admin is **not** localized, has no `[locale]` segment |
| Strings | `messages/*.json` via next-intl | hardcoded Vietnamese in the components |
| Data | reads (GET) | reads **and writes** (POST/PATCH/DELETE), needs the admin bearer token |
| Session | `src/lib/auth/token.ts` | `src/lib/admin/auth.ts` — same token key so `customFetch` picks it up, plus a separate `mingo-admin-user` entry for the role guard |

Feature logic lives in `src/features/admin/*`, shared chrome in `src/components/admin/*` (`admin-shell.tsx`, `admin-guard.tsx`, and its own `ui/` primitives — separate from `src/components/ui/`).

**There is also a second, older admin in the sibling `ecom-client` repo** (Next.js + MUI/Minimals, far more complete: product forms, orders, colors, careers). When a task says "admin" without qualifying, check which one it means before editing — `ecom-client` is usually the intended target for anything involving MUI theming or the mature CRUD screens.

### Design system

- Tokens in `src/styles/globals.css` (`:root` + `@theme inline`) are currently estimated from mockups, not Figma. When Figma variables land, update values there only — never hardcode colors in components; use semantic classes (`bg-primary`, `text-foreground`, etc.).
- shadcn/ui is configured (`components.json`). Add new primitives with `npx shadcn@latest add <name>`, then re-brand to match existing ones (`button.tsx`, `accordion.tsx`).
- Fonts are live via `next/font/google` in `src/app/[locale]/layout.tsx`: **Montserrat** (`--font-display`, headlines) and **Be Vietnam Pro** (`--font-sans`, body), both subsetting `vietnamese`.
  - **Keep the declared `weight` array covering every `font-*` utility actually used.** A weight that's used but not loaded gets synthesized from the nearest loaded face; its metrics differ from the swap-in fallback, and the text visibly shifts on load. This presents as "random" layout jitter in whichever component uses the missing weight most (it was the footer), so grep the weights before blaming the component:
    ```bash
    grep -rhoE 'font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)' src | sort | uniq -c
    ```

### TypeScript strictness

`strict` + `noUncheckedIndexedAccess` are both on — `items[0]` types as `T | undefined`; handle it at the call site, don't cast it away.
