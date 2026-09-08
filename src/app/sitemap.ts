import type { MetadataRoute } from 'next';
import { fetchNavBrands, fetchNavCategories, localNavBrands } from '@/features/catalog/nav-data';
import { getCareers } from '@/features/careers/api';
import { getActiveCollections, getAllProducts } from '@/features/product/api';
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
  lastModified?: string,
): MetadataRoute.Sitemap {
  const vi = absoluteUrl(localizedPath('vi', pathname));
  const en = absoluteUrl(localizedPath('en', pathname));
  return ([vi, en] as const).map((url) => ({
    url,
    ...(lastModified ? { lastModified } : {}),
    changeFrequency,
    priority,
    // 'x-default' để khớp với hreflang khai báo trong pageMetadata (src/lib/seo.ts).
    alternates: { languages: { vi, en, 'x-default': vi } },
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [apiProducts, apiBrands, apiCategories, collections, careers] = await Promise.all([
    getAllProducts({ locale: 'vi', status: 'active' }).catch(() => []),
    fetchNavBrands().catch(() => []),
    fetchNavCategories().catch(() => []),
    getActiveCollections('vi').catch(() => []),
    getCareers({ status: 'published', limit: 100 }).then((response) => response.items).catch(() => []),
  ]);

  const brands = apiBrands.length > 0 ? apiBrands : localNavBrands();
  // Map thay vì Set: vẫn khử trùng slug, nhưng giữ lại updated_at cho <lastmod>.
  const productUpdatedAt = new Map(apiProducts.map((product) => [product.slug, product.updated_at]));

  return [
    ...STATIC_PATHS.flatMap((pathname) => localizedEntries(pathname, pathname === '/' ? 'daily' : 'weekly', pathname === '/' ? 1 : 0.8)),
    ...Array.from(productUpdatedAt, ([slug, updatedAt]) => localizedEntries(`/products/${slug}`, 'weekly', 0.8, updatedAt)).flat(),
    ...brands.flatMap((brand) => localizedEntries(`/brands/${brand.slug}`, 'weekly', 0.7)),
    ...apiCategories.flatMap((category) => localizedEntries(`/categories/${category.slug}`, 'weekly', 0.7)),
    ...collections.flatMap((collection) => localizedEntries(`/collections/${collection.slug}`, 'weekly', 0.7)),
    ...careers.flatMap((career) => localizedEntries(`/careers/${career.slug}`, 'weekly', 0.6, career.updated_at)),
  ];
}
