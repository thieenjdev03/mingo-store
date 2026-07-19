import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/product/product-card';
import type { ProductCardView } from '@/features/product/types';

/**
 * LANDING (stub) — theo mockup: Hero carousel + "Phải thử" + footer.
 * TODO(hero): hero v1 hardcode config (quyết định trong backend plan) — thay mảng dưới bằng
 *   config thật (ảnh chiến dịch, màu nền, link) hoặc bảng banners ở P2.
 * TODO(data): thay MOCK bằng useGetProducts({ is_featured: true }) sau khi chạy api:gen.
 */
const MOCK_FEATURED: ProductCardView[] = [
  { id: '1', slug: 'creme-caramel', name: 'Creme Caramel', image: null, price: 100000 },
  { id: '2', slug: 'matcha-red-bean', name: 'Matcha Red Bean', image: null, price: 100000 },
  { id: '3', slug: 'creme-caramel-2', name: 'Creme Caramel', image: null, price: 100000 },
  { id: '4', slug: 'matcha-red-bean-2', name: 'Matcha Red Bean', image: null, price: 100000 },
];

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('home');

  return (
    <>
      {/* HERO — nền xanh + wave kem theo mockup */}
      <section className="bg-secondary text-secondary-foreground">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 py-20 text-center md:px-8">
          <p className="font-display text-xl">New!</p>
          <h1 className="font-display text-5xl md:text-6xl">Crème Custard Caramel</h1>
          <Button variant="outline" size="lg" className="normal-case">
            {t('seeProduct')}
          </Button>
        </div>
        {/* wave chuyển sang nền kem */}
        <div className="h-16 rounded-t-[100%_100%] bg-cream" aria-hidden />
      </section>

      {/* PHẢI THỬ */}
      <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        <h2 className="mb-10 font-display text-4xl text-primary md:text-5xl">{t('mustTry')}</h2>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {MOCK_FEATURED.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </>
  );
}
