/**
 * Dựng field `offers` cho Product JSON-LD.
 *
 * Quy tắc bắt buộc (Google phạt nếu sai): chỉ khai giá khi giá thật sự công khai.
 * - Sản phẩm "liên hệ để nhận báo giá" (is_featured) -> KHÔNG có offers.
 * - Nhiều variant có giá khác nhau -> AggregateOffer (lowPrice/highPrice/offerCount).
 * - Còn lại -> Offer đơn với giá hiệu lực.
 * Trả về `undefined` để JSON.stringify tự bỏ key (không xuất null/chuỗi rỗng).
 *
 * Tự kiểm: `node src/lib/seo-offers.ts`
 */
export interface ProductOffersInput {
  url: string;
  price: number;
  priceOnRequest: boolean;
  available: boolean;
  variantPrices: number[];
}

export function buildProductOffers({
  url,
  price,
  priceOnRequest,
  available,
  variantPrices,
}: ProductOffersInput): Record<string, unknown> | undefined {
  if (priceOnRequest) return undefined;

  const availability = available ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock';
  const prices = variantPrices.filter((value) => value > 0);
  const low = Math.min(...prices);
  const high = Math.max(...prices);

  if (prices.length > 1 && low !== high) {
    return {
      '@type': 'AggregateOffer',
      url,
      priceCurrency: 'VND',
      lowPrice: low,
      highPrice: high,
      offerCount: prices.length,
      availability,
    };
  }

  const single = prices.length > 0 ? low : price;
  if (single <= 0) return undefined;

  return {
    '@type': 'Offer',
    url,
    priceCurrency: 'VND',
    price: single,
    availability,
    itemCondition: 'https://schema.org/NewCondition',
  };
}

// Self-check: node src/lib/seo-offers.ts
if (process.argv[1]?.endsWith('seo-offers.ts')) {
  const { strict } = await import('node:assert');
  // Annotation tường minh: TS2775 cấm dùng assertion signature qua binding không khai kiểu.
  const eq: (actual: unknown, expected: unknown, message?: string) => void = strict.equal;
  const base = { url: 'https://x/p', available: true };

  eq(
    buildProductOffers({ ...base, price: 35000, priceOnRequest: true, variantPrices: [35000] }),
    undefined,
    'liên hệ báo giá -> không offers',
  );
  eq(
    buildProductOffers({ ...base, price: 0, priceOnRequest: false, variantPrices: [] }),
    undefined,
    'giá 0 -> không offers',
  );
  eq(
    buildProductOffers({ ...base, price: 35000, priceOnRequest: false, variantPrices: [] })?.['@type'],
    'Offer',
    'không variant -> Offer theo giá base',
  );
  eq(
    buildProductOffers({ ...base, price: 35000, priceOnRequest: false, variantPrices: [35000, 35000] })?.['@type'],
    'Offer',
    'variant cùng giá -> Offer đơn',
  );
  const agg = buildProductOffers({ ...base, price: 35000, priceOnRequest: false, variantPrices: [35000, 90000] });
  eq(agg?.['@type'], 'AggregateOffer');
  eq(agg?.lowPrice, 35000);
  eq(agg?.highPrice, 90000);
  eq(agg?.offerCount, 2);
  eq(
    buildProductOffers({ ...base, available: false, price: 35000, priceOnRequest: false, variantPrices: [] })?.availability,
    'https://schema.org/OutOfStock',
  );
  console.log('seo-offers: 8 assert OK');
}
