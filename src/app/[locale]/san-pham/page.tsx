import { setRequestLocale } from 'next-intl/server';

/** LISTING (stub) — filter category/brand/flavor/price. TODO: build theo storefront plan mục 6.2 */
export default async function ProductListPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 md:px-8">
      <h1 className="font-display text-4xl text-primary">Dòng sản phẩm</h1>
      <p className="mt-4 text-muted-foreground">TODO: danh sách + bộ lọc (category / thương hiệu / vị / giá).</p>
    </div>
  );
}
