import '@/styles/globals.css';

/**
 * 404 toàn cục (Next `experimental.globalNotFound`): dùng cho các URL không khớp bất kỳ
 * segment nào, kể cả ngoài [locale] (vd /admin/khong-ton-tai). App không có root layout
 * chung (storefront và admin mỗi bên một root layout) nên file này phải tự render <html>/<body>.
 * 404 trong phạm vi storefront vẫn do src/app/[locale]/not-found.tsx đảm nhận (có bản dịch).
 */
export const metadata = { title: '404 — Không tìm thấy trang' };

export default function GlobalNotFound() {
  return (
    <html lang="vi" className="storefront-theme">
      <body className="flex min-h-screen flex-col items-center justify-center bg-background px-5 text-center">
        <p className="text-[88px] font-extrabold leading-none text-primary sm:text-[120px]">404</p>
        <h1 className="mt-4 text-[26px] font-bold text-foreground sm:text-[34px]">Không tìm thấy trang</h1>
        <p className="mt-3 max-w-[480px] text-base text-muted-foreground">
          Trang bạn tìm không tồn tại hoặc đã được chuyển đi.
        </p>
        <a
          href="/"
          className="mt-8 inline-flex h-12 items-center rounded-full bg-primary px-6 text-sm font-bold uppercase tracking-wide text-primary-foreground transition-colors hover:bg-primary-dark"
        >
          Về trang chủ
        </a>
      </body>
    </html>
  );
}
