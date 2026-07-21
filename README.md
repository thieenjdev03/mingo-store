# Mingo Storefront

Storefront bán kem Mingo — Next.js 15 (App Router) + TypeScript strict + Tailwind CSS v4 + shadcn-style components + next-intl (vi/en) + SWR.

> Đọc kèm: `mingo-storefront-init-plan.md` (kiến trúc & thứ tự build), `mingo-pdp-frontend-plan.md` (spec PDP), `mingo-refactor-roadmap.md` + `mingo-backend-migration-plan.md` (toàn cảnh dự án).

## Chạy lần đầu

```bash
npm install            # hoặc pnpm install
cp .env.example .env.local
npm run dev            # http://localhost:3001 (đổi port nếu backend đang chiếm 3000)
```

## Generate types từ backend (việc ĐẦU TIÊN khi có backend)

```bash
# Phía backend (ecom-website):
npm run openapi:export           # -> docs/openapi.json

# Phía storefront:
npm run api:gen                  # orval sinh types + SWR hooks vào src/lib/api/generated
```

Sau khi gen xong:
1. **Xoá `src/types/api-placeholder.ts`** (placeholder chỉ để scaffold compile được).
2. Sửa import trong `src/features/product/types.ts` sang types generated.
3. Nếu types gen ra bị `Record<string, any>` ở các field JSONB (name đa ngôn ngữ, variants, order items) → **sửa decorator `@ApiProperty` phía NestJS** (tạo class `LocalizedString`, `ProductVariantDto`...) rồi export + gen lại. KHÔNG vá tay ở FE.

## Quy ước types 3 tầng (bắt buộc)

| Tầng | Ở đâu | Quy tắc |
|---|---|---|
| 1. API | `src/lib/api/generated` | Máy sinh từ OpenAPI. Không sửa tay, không import vào component. |
| 2. View model | `src/features/*/types.ts` | Mapper `toXxxView(api, locale)` resolve JSONB `{vi,en}` → string, tính `effectivePrice`, ép về shape UI cần. Đây là **hàng rào chống lặp lại vụ "2-3 model song song"** của repo cũ. |
| 3. Component | `interface XxxProps` trong từng file | Mọi component có Props tường minh. Page dùng typed `params`/`searchParams`. |

`tsconfig` bật `strict` + `noUncheckedIndexedAccess` — `items[0]` trả về `T | undefined`, xử lý ngay lúc viết.

Quy tắc giá **duy nhất toàn site**: `getEffectivePrice()` trong `features/product/types.ts` (`variant.price ?? sale_price ?? price`). Hiển thị tiền qua `fCurrencyVND()` — "100.000Đ".

## Design system

- Tokens tại `src/styles/globals.css` (`:root` + `@theme inline`) — hiện là **ước lượng từ mockup**; khi có Figma variables chỉ cần thay giá trị Ở ĐÂY, không sửa component.
- Component không hardcode màu — chỉ dùng class semantic (`bg-primary`, `text-foreground`...).
- shadcn/ui: đã có `components.json`; thêm component mới bằng `npx shadcn@latest add <name>` rồi chỉnh theo brand (tham khảo `button.tsx`, `accordion.tsx` đã brand hoá theo mockup).
- **Font**: đang dùng fallback stack. Khi chốt font ở Figma → bật `next/font` theo hướng dẫn comment trong `src/app/[locale]/layout.tsx` (nhớ subset `vietnamese`).

## i18n

- next-intl, `vi` mặc định không prefix (`/products`), `en` có prefix (`/en/products`).
- Điều hướng dùng `Link`/`useRouter` từ `@/i18n/navigation` — **không** dùng `next/link` trực tiếp.
- Chuỗi UI ở `messages/vi.json` / `en.json`. Label uppercase bằng CSS, không viết hoa trong file dịch.
- Nội dung sản phẩm đa ngôn ngữ đến từ API (JSONB), resolve qua `resolveLocalized()` trong mapper — không nhét vào messages.

### Route mapping

Route segment luôn dùng tiếng Anh; locale chỉ thêm prefix cho `en` (không localize
path bằng tính năng `pathnames` của next-intl).

| Route cũ | Route chuẩn |
|---|---|
| `/san-pham` | `/products` |
| `/san-pham/[slug]` | `/products/[slug]` |
| `/dong-san-pham/[slug]` | `/categories/[slug]` |
| `/thuong-hieu` | `/brands` |
| `/thuong-hieu/[slug]` | `/brands/[slug]` |
| `/hop-tac` | `/partnership` |
| `/ve-mingo` | `/about` |
| `/lien-he` | `/contact` |
| `/chinh-sach` | `/policies` |
| `/gio-hang` | `/cart` |
| `/tai-khoan` | `/account` |

Các route tương lai như `/checkout`, `/orders`, `/login`, `/register` và
`/forgot-password` cũng giữ nguyên tên tiếng Anh.

## Cấu trúc

```
src/
├── app/[locale]/            # layout (header/footer/providers) + pages
│   ├── page.tsx             # Landing (stub theo mockup)
│   └── products/[slug]/     # PDP (stub, đã chạy đúng pipeline mapper + cart)
├── components/
│   ├── ui/                  # primitives shadcn-style đã brand hoá
│   ├── layout/              # SiteHeader, SiteFooter
│   └── product/             # ProductCard
├── features/
│   ├── product/             # types.ts (view model + mapper), purchase-panel
│   └── cart/                # CartProvider (reducer + localStorage persist)
├── lib/
│   ├── api/fetcher.ts       # mutator cho orval (TODO: JWT + refresh interceptor)
│   ├── format.ts            # fCurrencyVND
│   └── utils.ts             # cn()
├── i18n/                    # routing, request, navigation (next-intl)
└── types/                   # localized.ts, api-placeholder.ts (XOÁ sau api:gen)
```

## Việc tiếp theo (theo thứ tự trong init plan §6)

1. Connect Figma → thay tokens + bật next/font.
2. `api:gen` + xoá placeholder → nối landing "Phải thử" với `is_featured=true`.
3. Hero carousel thật (config hardcode v1) + listing/filter.
4. PDP hoàn chỉnh theo `mingo-pdp-frontend-plan.md` (gallery nhiều ảnh, parser markdown 4 accordion, suggestions).
5. Cart page + Checkout multi-step (port `onValidateAndRefreshCart` từ repo cũ) — COD/PayPal trước, VNPay cắm sau khi BE-1 xong.
6. Auth JWT (port từ repo cũ, chỉ giữ JWT) + account + đơn hàng.
7. ESLint config (`eslint-config-next`) + bỏ `ignoreDuringBuilds` trong `next.config.ts`; sitemap + JSON-LD.
