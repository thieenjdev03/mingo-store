# Mingo Storefront

Storefront bán kem Mingo — Next.js 15 (App Router) + TypeScript strict + Tailwind CSS v4 + shadcn-style components + next-intl (vi/en) + SWR.

> Đọc kèm: `mingo-storefront-init-plan.md` (kiến trúc & thứ tự build), `mingo-pdp-frontend-plan.md` (spec PDP), `mingo-refactor-roadmap.md` + `mingo-backend-migration-plan.md` (toàn cảnh dự án).

## Chạy lần đầu

```bash
npm install            # hoặc pnpm install
cp .env.example .env.local
npm run dev            # http://localhost:3001 (đổi port nếu backend đang chiếm 3000)
```

Biến môi trường frontend:

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Generate types từ backend

```bash
# Phía backend (ecom-website):
npm run openapi:export           # -> ../shared/openapi.json

# Phía storefront:
npm run api:gen                  # orval sinh types + SWR hooks vào src/lib/api/generated
```

Nếu types gen ra bị `Record<string, any>` hoặc `void` ở response đã có shape xác
định, sửa decorator Swagger phía NestJS rồi export và gen lại. Không vá file
trong `src/lib/api/generated`.

## Quy ước types 3 tầng (bắt buộc)

| Tầng | Ở đâu | Quy tắc |
|---|---|---|
| 1. API | `src/lib/api/generated` | Máy sinh từ OpenAPI. Không sửa tay, không import vào component. |
| 2. View model | `src/features/*/types.ts` | Mapper `toXxxView(api, locale)` resolve JSONB `{vi,en}` → string, tính `effectivePrice`, ép về shape UI cần. Đây là **hàng rào chống lặp lại vụ "2-3 model song song"** của repo cũ. |
| 3. Component | `interface XxxProps` trong từng file | Mọi component có Props tường minh. Page dùng typed `params`/`searchParams`. |

`tsconfig` bật `strict` + `noUncheckedIndexedAccess` — `items[0]` trả về `T | undefined`, xử lý ngay lúc viết.

Quy tắc giá **duy nhất toàn site**: catalog dùng `getEffectivePrice()` trong
`features/product/types.ts`; cart/checkout/order dùng nguyên giá và tổng tiền
backend trả về. Hiển thị tiền qua `fCurrencyVND()` — ví dụ `100.000 ₫`.

## Luồng storefront API

- Homepage: `GET /storefront/home`; chỉ dùng hero local khi endpoint lỗi.
- Cart: mọi request gửi guest token ngẫu nhiên qua `X-Cart-Token`. Cart API là
  nguồn duy nhất cho tồn kho, line total, subtotal và trạng thái hợp lệ.
- Sau đăng nhập/đăng ký, storefront gọi `POST /cart/merge`.
- Checkout: lưu địa chỉ → `POST /shipping/quote` → `POST /checkout/quote` →
  `POST /checkout/create-order` → redirect `paymentUrl` của VNPay.
- Trang `/checkout/vnpay-return` không tin browser return URL để kết luận thành
  công; trang gọi lại `/me/orders/:orderCode` và đọc `paymentStatus`.
- Lịch sử và chi tiết đơn: `/orders`, `/orders/:orderCode`, dữ liệu từ
  `GET /me/orders` và `GET /me/orders/:orderCode`.

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
│   ├── cart/                # Cart API state + X-Cart-Token
│   └── checkout/            # shipping quote + VNPay + order types
├── lib/
│   ├── api/fetcher.ts       # mutator cho orval (TODO: JWT + refresh interceptor)
│   ├── format.ts            # fCurrencyVND
│   └── utils.ts             # cn()
├── i18n/                    # routing, request, navigation (next-intl)
└── types/                   # localized.ts, api-placeholder.ts (XOÁ sau api:gen)
```

## Việc còn lại

1. Bổ sung refresh-token/cookie strategy cho auth thay cho access token trong
   localStorage.
2. Bổ sung test runner và cấu hình ESLint CLI (`next lint` hiện chưa được cấu
   hình trong scaffold).
3. Bổ sung sitemap, JSON-LD và theo dõi lỗi production.
