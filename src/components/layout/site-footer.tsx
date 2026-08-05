import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { BRANDS } from '@/config/brands';
const LINES = [
  { label: 'Kem hộp', slug: 'kem-hop' },
  { label: 'Kem que', slug: 'kem-que' },
  { label: 'Kem ốc quế', slug: 'kem-oc-que' },
  { label: 'Kem đá', slug: 'kem-da' },
];
const SOCIALS = [
  { label: 'Facebook', href: 'https://www.facebook.com', icon: '/assets/mingo/home/facebook.svg' },
  { label: 'Instagram', href: 'https://www.instagram.com', icon: '/assets/mingo/home/instagram.svg' },
  { label: 'TikTok', href: 'https://www.tiktok.com', icon: '/assets/mingo/home/tiktok.svg' },
];

export async function SiteFooter() {
  const t = await getTranslations('footer');
  const linkClass = 'block py-0.5 text-[14px] uppercase leading-[26px] text-[#563e2b] transition-colors hover:text-primary lg:text-[16px] lg:leading-7';

  return (
    <footer className="bg-white text-[#563e2b]">
      <div className="mx-auto grid h-auto max-w-[1200px] items-start gap-10 px-5 py-10 sm:grid-cols-2 sm:px-8 lg:grid-cols-[120px_120px_155px_1fr] lg:gap-[31px] lg:py-6 xl:px-0">
        <div>
          <h3 className="mb-3 text-[14px] font-bold uppercase leading-8 lg:text-[16px]">{t('aboutTitle')}</h3>
          <ul>
            <li><Link href="/about" className={linkClass}>{t('aboutUs')}</Link></li>
            <li><Link href="/contact" className={linkClass}>{t('contact')}</Link></li>
            <li><Link href="/policies" className={linkClass}>{t('policy')}</Link></li>
            <li><Link href="/careers" className={linkClass}>{t('career')}</Link></li>
            <li><Link href="/faqs" className={linkClass}>FAQs</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-[14px] font-bold uppercase leading-8 lg:text-[16px]">{t('brandsTitle')}</h3>
          <ul>
            {BRANDS.map((brand) => (
              <li key={brand.slug}>
                <Link href={`/brands/${brand.slug}`} className={linkClass}>{brand.name}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-[14px] font-bold uppercase leading-8 lg:text-[16px]">{t('linesTitle')}</h3>
          <ul>
            {LINES.map((line) => (
              <li key={line.slug}>
                <Link href={`/categories/${line.slug}`} className={linkClass}>{line.label}</Link>
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
        </div>
      </div>

      <div className="border-t border-[#563e2b]">
        <p className="mx-auto max-w-[1200px] px-5 py-[21px] text-[12px] leading-[22px] text-black sm:px-8 lg:text-[14px] xl:px-0">
          Hồng Tân Phát Co.,Ltd.
        </p>
      </div>
    </footer>
  );
}
