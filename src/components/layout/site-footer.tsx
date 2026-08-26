import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { fetchNavBrands, fetchNavCategories, localNavBrands } from '@/features/catalog/nav-data';

/** Fallback dòng sản phẩm khi backend chưa seed categories. */
const LINES = [
  { name: 'Kem hộp', slug: 'kem-hop' },
  { name: 'Kem que', slug: 'kem-que' },
  { name: 'Kem ốc quế', slug: 'kem-oc-que' },
  { name: 'Kem đá', slug: 'kem-da' },
];
const COMPANY = {
  address: '232/28 Đ. Tô Hiệu, Phú Thạnh, Hồ Chí Minh, Việt Nam',
  phone: '0977 008 879',
  taxCode: '0309879026',
  email: 'hi@mingo.hongtanphat.com',
};
const SOCIALS = [
  { label: 'Facebook', href: 'https://www.facebook.com', icon: '/assets/mingo/home/facebook.svg' },
  { label: 'Instagram', href: 'https://www.instagram.com', icon: '/assets/mingo/home/instagram.svg' },
  { label: 'TikTok', href: 'https://www.tiktok.com', icon: '/assets/mingo/home/tiktok.svg' },
];

export async function SiteFooter() {
  const t = await getTranslations('footer');
  const linkClass = 'block py-0.5 text-[14px] uppercase leading-[26px] text-[#563e2b] transition-colors hover:text-primary lg:text-[16px] lg:leading-7';

  // Thương hiệu & dòng sản phẩm lấy từ backend; rỗng hoặc lỗi (vd chưa cấu hình API URL server-side) -> fallback local.
  const [apiBrands, apiLines] = await Promise.all([
    fetchNavBrands().catch(() => []),
    fetchNavCategories().catch(() => []),
  ]);
  const brands = apiBrands.length > 0 ? apiBrands : localNavBrands();
  const lines = apiLines.length > 0 ? apiLines : LINES;

  return (
    <footer className="bg-white text-[#563e2b]">
      <div className="mx-auto grid h-auto max-w-[1200px] items-start gap-10 px-5 py-10 sm:grid-cols-2 sm:px-8 lg:grid-cols-[minmax(0,270px)_120px_120px_155px_1fr] lg:gap-[31px] lg:py-6 xl:px-0">
        <div>
          <h3 className="mb-3 text-[14px] font-bold uppercase leading-8 lg:text-[16px]">{t('companyTitle')}</h3>
          <address className="text-[14px] not-italic leading-[26px] text-[#563e2b] lg:text-[16px] lg:leading-7">
            <p className="uppercase">{t('addressLabel')}: {COMPANY.address}</p>
            <p className="uppercase">{t('phoneLabel')}: {COMPANY.phone}</p>
            <p className="uppercase">{t('taxLabel')}: {COMPANY.taxCode}</p>
            <p className="uppercase">
              {t('emailLabel')}:{' '}
              <a href={`mailto:${COMPANY.email}`} className="underline transition-colors hover:text-primary">
                {COMPANY.email}
              </a>
            </p>
          </address>
        </div>

        <div>
          <h3 className="mb-3 text-[14px] font-bold uppercase leading-8 lg:text-[16px]">{t('aboutTitle')}</h3>
          <ul>
            <li><Link href="/about" className={linkClass}>{t('aboutUs')}</Link></li>
            <li><Link href="/contact" className={linkClass}>{t('contact')}</Link></li>
            <li><Link href="/policies" className={linkClass}>{t('policy')}</Link></li>
            <li><Link href="/careers" className={linkClass}>{t('career')}</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-[14px] font-bold uppercase leading-8 lg:text-[16px]">{t('brandsTitle')}</h3>
          <ul>
            {brands.map((brand) => (
              <li key={brand.slug}>
                <Link href={`/brands/${brand.slug}`} className={linkClass}>{brand.name}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-[14px] font-bold uppercase leading-8 lg:text-[16px]">{t('linesTitle')}</h3>
          <ul>
            {lines.map((line) => (
              <li key={line.slug}>
                <Link href={`/categories/${line.slug}`} className={linkClass}>{line.name}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col items-start sm:items-end">
          <div className="flex items-center gap-[22px]">
            {SOCIALS.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noreferrer"
                aria-label={social.label}
                className="relative size-6 transition-opacity hover:opacity-65"
              >
                <Image src={social.icon} alt="" fill sizes="24px" />
              </a>
            ))}
          </div>
          <p className="mt-4 text-[14px] font-bold uppercase text-black lg:text-[16px]">{t('tagline')}</p>
            <Image
            src="/assets/mingo/bo-cong-thuong.png"
            alt="Đã thông báo Bộ Công Thương"
            width={300}
            height={150}
            className="mt-4 h-auto w-[300px] shrink-0"
          />
        </div>
      </div>

      <div className="border-t border-[#563e2b]">
        <div className="mx-auto max-w-[1200px] px-5 py-[21px] sm:px-8 xl:px-0">
          <p className="text-[12px] leading-[22px] text-black lg:text-[14px]">
            Hồng Tân Phát Co.,Ltd.
          </p>
        </div>
      </div>
    </footer>
  );
}
