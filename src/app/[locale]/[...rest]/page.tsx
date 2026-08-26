import { notFound } from 'next/navigation';

// Mọi URL không khớp route nào trong [locale] rơi vào đây -> render
// [locale]/not-found.tsx (có header/footer + đúng ngôn ngữ) thay vì 404 toàn cục.
//
// ponytail: trang trả HTTP 200 thay vì 404 vì middleware next-intl rewrite request
// (hạn chế sẵn có của Next 15 — /products/[slug] gọi notFound() cũng đang 200).
// Nội dung vẫn là trang 404. Nếu SEO cần status thật, chuyển localePrefix sang
// 'always' để bỏ rewrite, hoặc chờ fix upstream.
export default function CatchAllNotFound() {
  notFound();
}
