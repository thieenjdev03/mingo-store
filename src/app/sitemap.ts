import type { MetadataRoute } from 'next';
import { fetchNavBrands, fetchNavCategories, localNavBrands, localNavCategories } from '@/features/catalog/nav-data';
import { getStorefrontHome } from '@/features/home/api';
import { getCareers } from '@/features/careers/api';
import { getAllProducts } from '@/features/product/api';
import { absoluteUrl, localizedPath } from '@/lib/seo';

// TODO(cache): bật lại sau khi test xong
// export const revalidate = 3600;
export const revalidate = 0;

/** Trang tĩnh luôn có mặt kể cả khi backend chết. */
const STATIC_PATHS = [
  '/products',
  '/brands',
  '/about',
  '/contact',
  '/partnership',
  '/policies',
  '/faqs',
  '/careers',
];

type ChangeFrequency = MetadataRoute.Sitemap[number]['changeFrequency'];

/**
 * Sinh 2 entry (vi + en) cho một pathname, mỗi entry tự khai đủ cặp hreflang.
 * hreflang dùng mã đầy đủ vi-VN / en-US cho khớp với thẻ <link> trong <head>.
 */
function localizedEntries(
  pathname: string,
  changeFrequency: ChangeFrequency,
  priority: number,
  lastModified: Date = new Date(),
): MetadataRoute.Sitemap {
  const languages = {
    'vi-VN': absoluteUrl(localizedPath('vi', pathname)),
    'en-US': absoluteUrl(localizedPath('en', pathname)),
  };
  return (['vi', 'en'] as const).map((locale) => ({
    url: absoluteUrl(localizedPath(locale, pathname)),
    lastModified,
    changeFrequency,
    priority,
    alternates: { languages },
  }));
}

function toDate(value: string | null | undefined): Date {
  const parsed = value ? new Date(value) : null;
  return parsed && !Number.isNaN(parsed.getTime()) ? parsed : new Date();
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Mọi nguồn đều .catch() riêng: backend chết -> sitemap rút gọn còn trang tĩnh,
  // không được throw làm sập build.
  const [apiProducts, apiBrands, apiCategories, home, careers] = await Promise.all([
    getAllProducts({ locale: 'vi', status: 'active' }).catch(() => []),
    fetchNavBrands().catch(() => []),
    fetchNavCategories().catch(() => []),
    getStorefrontHome('vi').catch(() => ({ heroes: [], sections: [] })),
    getCareers({ status: 'published', limit: 100 }).then((response) => response.items).catch(() => []),
  ]);

  const brands = apiBrands.length > 0 ? apiBrands : localNavBrands();
  const categories = apiCategories.length > 0 ? apiCategories : localNavCategories('vi');

  // Sản phẩm chỉ lấy từ API. MOCKUP_CATALOG vẫn render được ở PDP nhưng cố tình
  // KHÔNG vào sitemap — không quảng cáo sản phẩm giả cho Google.
  const products = new Map(apiProducts.map((product) => [product.slug, product]));

  return [
    ...localizedEntries('/', 'daily', 1),
    ...STATIC_PATHS.flatMap((pathname) => localizedEntries(pathname, 'monthly', 0.5)),
    ...categories.flatMap((category) => localizedEntries(`/categories/${category.slug}`, 'weekly', 0.8)),
    ...brands.flatMap((brand) => localizedEntries(`/brands/${brand.slug}`, 'weekly', 0.8)),
    ...home.sections.flatMap((collection) => localizedEntries(`/collections/${collection.slug}`, 'weekly', 0.8)),
    ...Array.from(products.values()).flatMap((product) =>
      localizedEntries(`/products/${product.slug}`, 'weekly', 0.7, toDate(product.updated_at)),
    ),
    ...careers.flatMap((career) => localizedEntries(`/careers/${career.slug}`, 'monthly', 0.5)),
  ];
}
