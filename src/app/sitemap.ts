import type { MetadataRoute } from 'next';
import { fetchNavBrands, fetchNavCategories, localNavBrands } from '@/features/catalog/nav-data';
import { getStorefrontHome } from '@/features/home/api';
import { getCareers } from '@/features/careers/api';
import { getAllProducts } from '@/features/product/api';
import { absoluteUrl, localizedPath } from '@/lib/seo';

export const revalidate = 3600;

const STATIC_PATHS = [
  '/',
  '/products',
  '/brands',
  '/about',
  '/contact',
  '/partnership',
  '/policies',
  '/faqs',
  '/careers',
];

function localizedEntries(
  pathname: string,
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'],
  priority: number,
): MetadataRoute.Sitemap {
  return (['vi', 'en'] as const).map((locale) => ({
    url: absoluteUrl(localizedPath(locale, pathname)),
    changeFrequency,
    priority,
    alternates: {
      languages: {
        vi: absoluteUrl(localizedPath('vi', pathname)),
        en: absoluteUrl(localizedPath('en', pathname)),
      },
    },
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [apiProducts, apiBrands, apiCategories, home, careers] = await Promise.all([
    getAllProducts({ locale: 'vi', status: 'active' }).catch(() => []),
    fetchNavBrands().catch(() => []),
    fetchNavCategories().catch(() => []),
    getStorefrontHome('vi').catch(() => ({ heroes: [], sections: [] })),
    getCareers({ status: 'published', limit: 100 }).then((response) => response.items).catch(() => []),
  ]);

  const productSlugs = new Set(apiProducts.map((product) => product.slug));
  const brands = apiBrands.length > 0 ? apiBrands : localNavBrands();
  const categories = apiCategories;

  return [
    ...STATIC_PATHS.flatMap((pathname) => localizedEntries(pathname, pathname === '/' ? 'daily' : 'weekly', pathname === '/' ? 1 : 0.8)),
    ...Array.from(productSlugs).flatMap((slug) => localizedEntries(`/products/${slug}`, 'weekly', 0.8)),
    ...brands.flatMap((brand) => localizedEntries(`/brands/${brand.slug}`, 'weekly', 0.7)),
    ...categories.flatMap((category) => localizedEntries(`/categories/${category.slug}`, 'weekly', 0.7)),
    ...home.sections.flatMap((collection) => localizedEntries(`/collections/${collection.slug}`, 'weekly', 0.7)),
    ...careers.flatMap((career) => localizedEntries(`/careers/${career.slug}`, 'weekly', 0.6)),
  ];
}
