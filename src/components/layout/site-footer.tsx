import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

/**
 * Footer theo mockup: 3 cột (Về Mingo / Thương hiệu / Dòng sản phẩm) + social + tagline.
 * TODO: 2 cột Thương hiệu & Dòng sản phẩm nên fetch từ API (collections + categories)
 * thay vì hardcode — giữ tĩnh ở scaffold để không chặn build.
 */
const BRANDS = ['Fruitesia', 'Fruttega', 'Rokka', 'Oasis', 'Impact', 'Sandwich', 'Verano', 'Vivi'];
const LINES = [
  { label: 'Kem hộp', slug: 'kem-hop' },
  { label: 'Kem que', slug: 'kem-que' },
  { label: 'Kem ốc quế', slug: 'kem-oc-que' },
  { label: 'Kem đá', slug: 'kem-da' },
];

export function SiteFooter() {
  const t = useTranslations('footer');

  return (
    <footer className="border-t bg-card">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-[1fr_1fr_1fr_auto] md:px-8">
        <div>
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wide">{t('aboutTitle')}</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/ve-mingo" className="hover:text-primary">{t('aboutUs')}</Link></li>
            <li><Link href="/lien-he" className="hover:text-primary">{t('contact')}</Link></li>
            <li><Link href="/chinh-sach" className="hover:text-primary">{t('policy')}</Link></li>
            <li><Link href="/faqs" className="hover:text-primary">FAQs</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wide">{t('brandsTitle')}</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {BRANDS.map((b) => (
              <li key={b}>
                <Link href={`/thuong-hieu/${b.toLowerCase()}`} className="hover:text-primary">{b}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wide">{t('linesTitle')}</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {LINES.map((l) => (
              <li key={l.slug}>
                <Link href={`/dong-san-pham/${l.slug}`} className="hover:text-primary">{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="text-sm font-bold uppercase">{t('tagline')}</div>
      </div>
      <div className="border-t">
        <p className="mx-auto max-w-7xl px-4 py-4 text-xs text-muted-foreground md:px-8">Hồng Tân Phát Co.,Ltd.</p>
      </div>
    </footer>
  );
}
