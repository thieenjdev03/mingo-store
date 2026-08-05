import type { ProductResponseDto } from '@/lib/api/generated/ecomAPI.schemas';
import { resolveLocalized, type Locale, type LocalizedString } from '@/types/localized';
import type { ProductDetailApiDto } from './api';

/**
 * Catalog mockup DÙNG CHUNG cho trang listing (/products), trang chi tiết (/products/[slug])
 * và trang danh mục (/categories/[slug]).
 *
 * Dữ liệu được migrate từ catalog thương hiệu Mingo (mingoicecream.com) — 11 nhóm sản phẩm,
 * ảnh packshot tải về `public/assets/mingo/products/<slug>.png`. Nội dung song ngữ { vi, en };
 * GIÁ hiện là PLACEHOLDER (trang gốc không công bố giá) — cập nhật khi có bảng giá thật.
 *
 * Backend chưa seed sản phẩm nào (GET /products rỗng) nên storefront hiển thị các mục này,
 * có gắn nhãn "Mockup" ở UI. Khi backend có dữ liệu thật, sản phẩm thật hiện trước, mockup
 * nối phía sau cho tới khi được gỡ. Một nguồn duy nhất -> click listing sang chi tiết luôn khớp.
 */

export interface MockupCategory {
  slug: string;
  name: LocalizedString;
  /** Quy cách đóng gói mặc định cho sản phẩm thuộc nhóm (dùng làm variant label). */
  pack: LocalizedString;
}

export interface MockupProduct {
  slug: string;
  categorySlug: string;
  name: LocalizedString;
  description: LocalizedString;
  /** VND, số nguyên — placeholder cho tới khi có giá thật. */
  price: number;
  /** Ghi đè quy cách nếu khác mặc định của nhóm. */
  pack?: LocalizedString;
}

/** Ảnh packshot theo slug (tải từ mingoicecream.com). */
export function mockupImage(slug: string): string {
  return `/assets/mingo/products/${slug}.png`;
}

export const MOCKUP_CATEGORIES: MockupCategory[] = [
  { slug: 'oasis', name: { vi: 'Oasis', en: 'Oasis' }, pack: { vi: 'Hũ 3oz', en: '3oz cup' } },
  { slug: 'cup', name: { vi: 'Kem ly', en: 'Cup' }, pack: { vi: 'Hũ 4oz', en: '4oz cup' } },
  { slug: 'pint', name: { vi: 'Kem hộp Pint', en: 'Pint' }, pack: { vi: 'Hộp 473ml', en: '473ml pint' } },
  { slug: 'cone', name: { vi: 'Kem ốc quế', en: 'Cone' }, pack: { vi: 'Cây', en: 'Single cone' } },
  { slug: 'extreme-chocolate', name: { vi: 'Extreme Chocolate', en: 'Extreme Chocolate' }, pack: { vi: 'Cây', en: 'Single bar' } },
  { slug: 'big', name: { vi: 'BIG Bite!', en: 'BIG Bite!' }, pack: { vi: 'Cây lớn', en: 'Single big bar' } },
  { slug: 'tropical-tasty', name: { vi: 'Tropical Tasty', en: 'Tropical Tasty' }, pack: { vi: 'Hộp', en: 'Single tub' } },
  { slug: 'sweet-and-sour', name: { vi: 'Sweet & Sour', en: 'Sweet & Sour' }, pack: { vi: 'Lốc', en: 'Multipack' } },
  { slug: 'dessert-collection', name: { vi: 'Bộ sưu tập tráng miệng', en: 'Dessert Collection' }, pack: { vi: 'Hũ', en: 'Single cup' } },
  { slug: 'signature', name: { vi: 'Signature Series', en: 'Signature Series' }, pack: { vi: 'Hộp', en: 'Tub' } },
  { slug: 'sandwich', name: { vi: 'Kem Sandwich', en: 'Sandwich' }, pack: { vi: 'Cây', en: 'Single sandwich' } },
];

export function getMockupCategory(slug: string): MockupCategory | undefined {
  return MOCKUP_CATEGORIES.find((category) => category.slug === slug);
}

export const MOCKUP_CATALOG: MockupProduct[] = [
  // ── Oasis (kem hũ nhỏ cho trẻ em) ────────────────────────────────────────────
  {
    slug: 'oasis-cup-lychee',
    categorySlug: 'oasis',
    name: { vi: 'Oasis ly Vải', en: 'Oasis Cup Lychee' },
    description: { vi: 'Kem ly vị vải ngọt thanh, vui nhộn — món khoái khẩu của bé ngày nắng.', en: 'Fun and yummy lychee cup — a kid’s favourite for a sunny day!' },
    price: 15000,
  },
  {
    slug: 'oasis-cup-chocolate',
    categorySlug: 'oasis',
    name: { vi: 'Oasis ly Chocolate', en: 'Oasis Cup Chocolate' },
    description: { vi: 'Kem ly chocolate đậm đà, vui nhộn — món khoái khẩu của bé ngày nắng.', en: 'Fun and yummy chocolate cup — a kid’s favourite for a sunny day!' },
    price: 15000,
  },
  {
    slug: 'oasis-cup-lime',
    categorySlug: 'oasis',
    name: { vi: 'Oasis ly Chanh', en: 'Oasis Cup Lime' },
    description: { vi: 'Kem ly vị chanh chua ngọt mát lạnh, giải nhiệt tức thì.', en: 'A zesty lime cup — cool and refreshing in an instant.' },
    price: 15000,
  },
  {
    slug: 'oasis-cup-vanilla',
    categorySlug: 'oasis',
    name: { vi: 'Oasis ly Vanilla', en: 'Oasis Cup Vanilla' },
    description: { vi: 'Kem ly vanilla béo mịn, ngọt dịu, ai cũng mê.', en: 'A creamy, gently sweet vanilla cup everyone loves.' },
    price: 15000,
  },
  {
    slug: 'oasis-cup-strawberry',
    categorySlug: 'oasis',
    name: { vi: 'Oasis ly Dâu', en: 'Oasis Cup Strawberry' },
    description: { vi: 'Kem ly vị dâu tươi hồng xinh, chua ngọt hài hoà.', en: 'A pretty pink strawberry cup with a sweet-tart balance.' },
    price: 15000,
  },
  {
    slug: 'oasis-cola',
    categorySlug: 'oasis',
    name: { vi: 'Oasis Cola', en: 'Oasis Cola' },
    description: { vi: 'Kem vị cola sảng khoái, lạ miệng và đầy năng lượng.', en: 'A refreshing, playful cola-flavoured treat.' },
    price: 12000,
  },
  {
    slug: 'oasis-colours',
    categorySlug: 'oasis',
    name: { vi: 'Oasis Thập cẩm', en: 'Oasis Colours' },
    description: { vi: 'Lốc kem nhiều màu nhiều vị, niềm vui rực rỡ cho cả nhà.', en: 'A colourful multi-flavour pack — bright joy for the whole family.' },
    price: 60000,
    pack: { vi: 'Lốc nhiều màu', en: 'Assorted pack' },
  },
  {
    slug: 'oasis-lime',
    categorySlug: 'oasis',
    name: { vi: 'Oasis Chanh', en: 'Oasis Lime' },
    description: { vi: 'Kem que vị chanh chua mát, tan nhanh sảng khoái.', en: 'A tangy lime ice — cool and refreshing.' },
    price: 12000,
  },
  {
    slug: 'oasis-nomyen',
    categorySlug: 'oasis',
    name: { vi: 'Oasis Sữa hồng Nom Yen', en: 'Oasis Nom Yen' },
    description: { vi: 'Kem vị sữa hồng Nom Yen kiểu Thái, ngọt thơm dễ thương.', en: 'Thai-style pink “Nom Yen” milk flavour — sweet and charming.' },
    price: 12000,
  },
  {
    slug: 'oasis-orange',
    categorySlug: 'oasis',
    name: { vi: 'Oasis Cam', en: 'Oasis Orange' },
    description: { vi: 'Kem vị cam mọng nước, chua ngọt tươi mát.', en: 'A juicy orange treat — fresh and citrusy.' },
    price: 12000,
  },

  // ── Cup (dòng PickMeUp, hũ 4oz) ──────────────────────────────────────────────
  {
    slug: 'cup-durian',
    categorySlug: 'cup',
    name: { vi: 'Sầu riêng', en: 'Durian' },
    description: { vi: 'Kem hũ sầu riêng béo ngậy, thơm nồng đặc trưng.', en: 'A rich, aromatic durian cup for true fans.' },
    price: 25000,
  },
  {
    slug: 'cup-classic-coconut',
    categorySlug: 'cup',
    name: { vi: 'Dừa', en: 'Classic Coconut' },
    description: { vi: 'Kem hũ dừa tươi nguyên chất, mát lạnh béo thơm.', en: 'A classic coconut cup — creamy and refreshing.' },
    price: 25000,
  },
  {
    slug: 'cup-salted-caramel-brownie',
    categorySlug: 'cup',
    name: { vi: 'Brownie Caramel Muối', en: 'Salted Caramel Brownie' },
    description: { vi: 'Kem caramel muối hoà quyện brownie chocolate ngọt mặn cuốn hút.', en: 'Salted caramel swirled with chocolate brownie — sweet meets savoury.' },
    price: 27000,
  },
  {
    slug: 'cup-matcha-green-tea',
    categorySlug: 'cup',
    name: { vi: 'Trà Xanh Matcha', en: 'Matcha Green Tea' },
    description: { vi: 'Kem matcha trà xanh thanh mát, đắng nhẹ tinh tế.', en: 'A smooth matcha green tea cup with a delicate bitter note.' },
    price: 27000,
  },
  {
    slug: 'cup-thai-tea',
    categorySlug: 'cup',
    name: { vi: 'Trà Thái', en: 'Thai Tea' },
    description: { vi: 'Kem vị trà Thái đậm đà, ngọt béo đúng điệu.', en: 'A bold, creamy Thai tea cup done right.' },
    price: 25000,
  },
  {
    slug: 'cup-mango',
    categorySlug: 'cup',
    name: { vi: 'Xoài', en: 'Mango' },
    description: { vi: 'Kem xoài chín vàng óng, ngọt thơm nhiệt đới.', en: 'A ripe golden mango cup — sweet and tropical.' },
    price: 25000,
  },
  {
    slug: 'cup-chocolate-chip',
    categorySlug: 'cup',
    name: { vi: 'Chocolate Chip', en: 'Chocolate Chip' },
    description: { vi: 'Kem sữa điểm vụn chocolate giòn tan trong từng thìa.', en: 'Creamy vanilla studded with crunchy chocolate chips.' },
    price: 25000,
  },
  {
    slug: 'cup-double-chocolate',
    categorySlug: 'cup',
    name: { vi: 'Chocolate Đôi', en: 'Double Chocolate' },
    description: { vi: 'Kem chocolate nhân đôi đậm đà cho tín đồ sô-cô-la.', en: 'A double dose of chocolate for true chocoholics.' },
    price: 27000,
  },
  {
    slug: 'cup-tutti-frutti',
    categorySlug: 'cup',
    name: { vi: 'Tutti Frutti', en: 'Tutti Frutti' },
    description: { vi: 'Kem trái cây tổng hợp nhiều vị, rực rỡ và vui miệng.', en: 'A medley of fruity flavours — bright and playful.' },
    price: 25000,
  },

  // ── Pint (hộp 473ml) ─────────────────────────────────────────────────────────
  {
    slug: 'pint-chocolate',
    categorySlug: 'pint',
    name: { vi: 'Chocolate', en: 'Chocolate' },
    description: { vi: 'Hộp kem chocolate đậm đà để chia sẻ cả nhà.', en: 'A rich chocolate pint made for sharing.' },
    price: 95000,
  },
  {
    slug: 'pint-durian',
    categorySlug: 'pint',
    name: { vi: 'Sầu riêng', en: 'Durian' },
    description: { vi: 'Hộp kem sầu riêng béo ngậy, thơm nồng khó cưỡng.', en: 'A rich, aromatic durian pint that’s hard to resist.' },
    price: 105000,
  },
  {
    slug: 'pint-mango',
    categorySlug: 'pint',
    name: { vi: 'Xoài', en: 'Mango' },
    description: { vi: 'Hộp kem xoài chín ngọt thơm, mát lạnh nhiệt đới.', en: 'A tropical, sweet ripe-mango pint.' },
    price: 95000,
  },
  {
    slug: 'pint-strawberry',
    categorySlug: 'pint',
    name: { vi: 'Dâu', en: 'Strawberry' },
    description: { vi: 'Hộp kem dâu tươi chua ngọt hài hoà, hồng xinh.', en: 'A pretty pink strawberry pint with balanced sweet-tart notes.' },
    price: 95000,
  },
  {
    slug: 'pint-tropicana',
    categorySlug: 'pint',
    name: { vi: 'Tropicana', en: 'Tropicana' },
    description: { vi: 'Hộp kem trái cây nhiệt đới đầy nắng, tươi mát sảng khoái.', en: 'A sunny tropical-fruit pint — fresh and vibrant.' },
    price: 95000,
  },
  {
    slug: 'pint-tutti-frutti',
    categorySlug: 'pint',
    name: { vi: 'Tutti Frutti', en: 'Tutti Frutti' },
    description: { vi: 'Hộp kem nhiều vị trái cây rực rỡ, vui cho mọi nhà.', en: 'A colourful multi-fruit pint for everyone.' },
    price: 95000,
  },
  {
    slug: 'pint-vanilla',
    categorySlug: 'pint',
    name: { vi: 'Vanilla', en: 'Vanilla' },
    description: { vi: 'Hộp kem vanilla béo mịn kinh điển, hợp mọi món tráng miệng.', en: 'A classic creamy vanilla pint that pairs with any dessert.' },
    price: 95000,
  },

  // ── Cone (dòng Rokka) ────────────────────────────────────────────────────────
  {
    slug: 'cone-rokka-chocolate',
    categorySlug: 'cone',
    name: { vi: 'Rokka Chocolate', en: 'Rokka Chocolate' },
    description: { vi: 'Ốc quế giòn rụm, topping hảo hạng và một viên chocolate cuối đáy ốc quế.', en: 'Luxurious toppings, a crunchy cone, and a chocolate bit at the end.' },
    price: 20000,
  },
  {
    slug: 'cone-rokka-vanilla',
    categorySlug: 'cone',
    name: { vi: 'Rokka Vanilla', en: 'Rokka Vanilla' },
    description: { vi: 'Ốc quế giòn với kem vanilla béo mịn và topping hảo hạng.', en: 'A crunchy cone with creamy vanilla and luxurious toppings.' },
    price: 20000,
  },
  {
    slug: 'cone-rokka-strawberry',
    categorySlug: 'cone',
    name: { vi: 'Rokka Dâu', en: 'Rokka Strawberry' },
    description: { vi: 'Ốc quế giòn với kem dâu chua ngọt và topping hảo hạng.', en: 'A crunchy cone with sweet-tart strawberry and luxurious toppings.' },
    price: 20000,
  },
  {
    slug: 'cone-rokka-salted-caramel-brownie',
    categorySlug: 'cone',
    name: { vi: 'Rokka Brownie Caramel Muối', en: 'Rokka Salted Caramel Brownie' },
    description: { vi: 'Ốc quế giòn cùng caramel muối và brownie chocolate ngọt mặn cuốn hút.', en: 'A crunchy cone with salted caramel and chocolate brownie.' },
    price: 22000,
  },
  {
    slug: 'cone-rokka-cookies-and-cream',
    categorySlug: 'cone',
    name: { vi: 'Rokka Cookies & Cream', en: 'Rokka Cookies and Cream' },
    description: { vi: 'Ốc quế giòn với kem sữa và vụn bánh cookies giòn tan.', en: 'A crunchy cone with cookies-and-cream goodness.' },
    price: 22000,
  },

  // ── Extreme Chocolate (dòng Impact) ──────────────────────────────────────────
  {
    slug: 'impact-mocha',
    categorySlug: 'extreme-chocolate',
    name: { vi: 'Impact Mocha', en: 'Impact Mocha' },
    description: { vi: 'Kem mocha phủ lớp chocolate và đậu phộng giòn đậm đà.', en: 'Mocha ice cream coated with chocolate and peanuts.' },
    price: 22000,
  },
  {
    slug: 'impact-vanilla',
    categorySlug: 'extreme-chocolate',
    name: { vi: 'Impact Vanilla', en: 'Impact Vanilla' },
    description: { vi: 'Kem vanilla phủ lớp chocolate và đậu phộng giòn đậm đà.', en: 'Vanilla ice cream coated with chocolate and peanuts.' },
    price: 22000,
  },

  // ── BIG Bite! ────────────────────────────────────────────────────────────────
  {
    slug: 'big-chocolate',
    categorySlug: 'big',
    name: { vi: 'BIG Chocolate', en: 'BIG Chocolate' },
    description: { vi: 'Cây kem chocolate cỡ lớn, đã miệng cho cơn thèm ngọt.', en: 'A big-size chocolate bar for a bigger craving.' },
    price: 30000,
  },

  // ── Tropical Tasty (dòng Fruitesia, nền dừa) ─────────────────────────────────
  {
    slug: 'fruitesia-taro',
    categorySlug: 'tropical-tasty',
    name: { vi: 'Fruitesia Khoai Môn', en: 'Fruitesia Taro' },
    description: { vi: 'Hương vị nhiệt đới đích thực trên nền kem dừa béo mịn — vị khoai môn.', en: 'Authentic tropical taro on a signature creamy coconut base.' },
    price: 30000,
  },
  {
    slug: 'fruitesia-durian',
    categorySlug: 'tropical-tasty',
    name: { vi: 'Fruitesia Sầu Riêng', en: 'Fruitesia Durian' },
    description: { vi: 'Hương vị nhiệt đới đích thực trên nền kem dừa béo mịn — vị sầu riêng.', en: 'Authentic tropical durian on a signature creamy coconut base.' },
    price: 30000,
  },
  {
    slug: 'fruitesia-black-bean',
    categorySlug: 'tropical-tasty',
    name: { vi: 'Fruitesia Đậu Đen', en: 'Fruitesia Black Bean' },
    description: { vi: 'Hương vị nhiệt đới đích thực trên nền kem dừa béo mịn — vị đậu đen.', en: 'Authentic tropical black bean on a signature creamy coconut base.' },
    price: 30000,
  },
  {
    slug: 'fruitesia-tropicana',
    categorySlug: 'tropical-tasty',
    name: { vi: 'Fruitesia Tropicana', en: 'Fruitesia Tropicana' },
    description: { vi: 'Hương vị nhiệt đới đích thực trên nền kem dừa béo mịn — vị trái cây Tropicana.', en: 'Authentic tropical medley on a signature creamy coconut base.' },
    price: 30000,
  },
  {
    slug: 'fruitesia-nata-de-coco',
    categorySlug: 'tropical-tasty',
    name: { vi: 'Fruitesia Thạch Dừa', en: 'Fruitesia Nata De Coco' },
    description: { vi: 'Nền kem dừa béo mịn điểm thạch dừa nata de coco dai giòn vui miệng.', en: 'Creamy coconut base with chewy nata de coco bits.' },
    price: 30000,
  },

  // ── Sweet & Sour ─────────────────────────────────────────────────────────────
  {
    slug: 'fruttega-summer-berries',
    categorySlug: 'sweet-and-sour',
    name: { vi: 'Fruttega Berry Mùa Hè', en: 'Fruttega Summer Berries' },
    description: { vi: 'Lốc kem các loại berry mùa hè chua ngọt tươi mát, rực rỡ sắc màu.', en: 'A pack of tangy-sweet summer berries — bright and refreshing.' },
    price: 45000,
  },
  {
    slug: 'verano-lime-vanilla',
    categorySlug: 'sweet-and-sour',
    name: { vi: 'Verano Chanh & Vanilla', en: 'Verano Lime & Vanilla' },
    description: { vi: 'Kem chanh chua mát quyện cùng vanilla béo dịu, cân bằng chua ngọt.', en: 'Zesty lime meets creamy vanilla — a balanced sweet-and-sour treat.' },
    price: 45000,
  },

  // ── Dessert Collection ───────────────────────────────────────────────────────
  {
    slug: 'creme-caramel',
    categorySlug: 'dessert-collection',
    name: { vi: 'Bánh Flan Caramel', en: 'Creme Caramel' },
    description: { vi: 'Kem vị bánh flan caramel custard mềm mịn, ngọt dịu tan ngay trong miệng.', en: 'A silky crème caramel custard dessert that melts in your mouth.' },
    price: 35000,
  },
  {
    slug: 'matcha-red-bean',
    categorySlug: 'dessert-collection',
    name: { vi: 'Matcha Đậu Đỏ', en: 'Matcha Red Bean' },
    description: { vi: 'Kem matcha thanh mát kết hợp đậu đỏ bùi béo, hài hoà tinh tế.', en: 'Refreshing matcha paired with sweet, nutty red bean.' },
    price: 35000,
  },

  // ── Signature Series ─────────────────────────────────────────────────────────
  {
    slug: 'signature-durian',
    categorySlug: 'signature',
    name: { vi: 'Signature Sầu Riêng', en: 'Signature Durian' },
    description: { vi: 'Hộp 1L kem sầu riêng cao cấp, béo ngậy đậm đà đúng chất Mingo.', en: 'A premium 1L durian tub — rich and indulgent, the Mingo way.' },
    price: 250000,
    pack: { vi: 'Hộp 1L', en: '1L tub' },
  },
  {
    slug: 'signature-mango',
    categorySlug: 'signature',
    name: { vi: 'Signature Xoài', en: 'Signature Mango' },
    description: { vi: 'Hộp 1L kem xoài cao cấp, ngọt thơm nhiệt đới đậm đà.', en: 'A premium 1L mango tub — sweet, tropical and indulgent.' },
    price: 250000,
    pack: { vi: 'Hộp 1L', en: '1L tub' },
  },
  {
    slug: 'signature-extremely-chocolate',
    categorySlug: 'signature',
    name: { vi: 'Signature Chocolate Đậm Đặc', en: 'Signature Extremely Chocolate' },
    description: { vi: 'Hộp 150ml kem chocolate đậm đặc cao cấp cho tín đồ sô-cô-la.', en: 'A premium 150ml extremely-chocolate tub for chocoholics.' },
    price: 60000,
    pack: { vi: 'Hộp 150ml', en: '150ml tub' },
  },
  {
    slug: 'signature-bourbon-vanilla',
    categorySlug: 'signature',
    name: { vi: 'Signature Vanilla Bourbon', en: 'Signature Bourbon Vanilla' },
    description: { vi: 'Hộp 150ml kem vanilla Bourbon cao cấp, thơm mịn tinh tế.', en: 'A premium 150ml Bourbon vanilla tub — fragrant and refined.' },
    price: 60000,
    pack: { vi: 'Hộp 150ml', en: '150ml tub' },
  },

  // ── Sandwich ─────────────────────────────────────────────────────────────────
  {
    slug: 'sandwich-chocolate-chip',
    categorySlug: 'sandwich',
    name: { vi: 'Sandwich Chocolate Chip', en: 'Sandwich Chocolate Chip' },
    description: { vi: 'Kem sandwich kẹp bánh mềm, kem sữa điểm vụn chocolate giòn tan.', en: 'A soft ice cream sandwich with chocolate-chip filling.' },
    price: 25000,
  },
  {
    slug: 'sandwich-coconut',
    categorySlug: 'sandwich',
    name: { vi: 'Sandwich Dừa', en: 'Sandwich Coconut' },
    description: { vi: 'Kem sandwich kẹp bánh mềm, nhân kem dừa mát lạnh béo thơm.', en: 'A soft ice cream sandwich with creamy coconut filling.' },
    price: 25000,
  },
  {
    slug: 'sandwich-chocolate',
    categorySlug: 'sandwich',
    name: { vi: 'Sandwich Chocolate', en: 'Sandwich Chocolate' },
    description: { vi: 'Kem sandwich kẹp bánh mềm, nhân kem chocolate đậm đà.', en: 'A soft ice cream sandwich with rich chocolate filling.' },
    price: 25000,
  },
];

export function getMockupBySlug(slug: string): MockupProduct | undefined {
  return MOCKUP_CATALOG.find((product) => product.slug === slug);
}

/** Card cho lưới sản phẩm — cùng shape với ProductListCard, đã resolve theo locale. */
export interface MockupCard {
  id: string;
  slug: string;
  name: string;
  image: string;
  price: number;
  categoryName: string | null;
  categorySlug: string;
  /** Quy cách đóng gói đã resolve (vd "24 Cây/Thùng") — dùng cho dòng spec ở trang danh mục. */
  spec: string | null;
  isMockup: true;
}

/** Danh sách card đã resolve locale; optionally lọc theo categorySlug. */
export function getMockupCards(locale: Locale, categorySlug?: string): MockupCard[] {
  return MOCKUP_CATALOG.filter((p) => !categorySlug || p.categorySlug === categorySlug).map((mockup) => {
    const category = getMockupCategory(mockup.categorySlug);
    const pack = mockup.pack ?? category?.pack;
    return {
      id: `mockup-${mockup.slug}`,
      slug: mockup.slug,
      name: resolveLocalized(mockup.name, locale),
      image: mockupImage(mockup.slug),
      price: mockup.price,
      categoryName: category ? resolveLocalized(category.name, locale) : null,
      categorySlug: mockup.categorySlug,
      spec: pack ? resolveLocalized(pack, locale) : null,
      isMockup: true,
    };
  });
}

/** Khối lượng ước lượng theo nhóm (kg) — placeholder cho tới khi có dữ liệu thật, để chip khối lượng hiển thị. */
const MOCKUP_WEIGHT_KG: Record<string, number> = {
  oasis: 0.08,
  cup: 0.12,
  pint: 0.45,
  cone: 0.07,
  'extreme-chocolate': 0.08,
  big: 0.1,
  'tropical-tasty': 0.5,
  'sweet-and-sour': 0.3,
  'dessert-collection': 0.1,
  signature: 0.5,
  sandwich: 0.09,
};

/**
 * Nội dung HTML mô tả cho mockup (mô tả / dị ứng / hướng dẫn / lưu ý) — sinh từ tên & nhóm
 * để mỗi sản phẩm có nội dung riêng. Mục đích: xác nhận PDP render đúng rich HTML
 * (đoạn văn, danh sách, in đậm, bảng, link). Locale đã resolve sẵn chuỗi truyền vào.
 */
function mockupDetailHtml(
  locale: Locale,
  name: string,
  categoryName: string | null,
  description: string,
  packLabel: string,
): { description: string; allergens: string; usage: string; notes: string } {
  const vi = locale === 'vi';
  const cat = categoryName ?? (vi ? 'kem' : 'ice cream');
  return {
    description: vi
      ? `<p>${description}</p>\n<p><strong>${name}</strong> thuộc dòng ${cat}, làm từ nguyên liệu chọn lọc, không phẩm màu nhân tạo.</p>\n<ul><li>Vị béo mịn, tan ngay trong miệng</li><li>Quy cách đóng gói: ${packLabel}</li><li>Phù hợp dùng ngay hoặc làm quà tặng</li></ul>`
      : `<p>${description}</p>\n<p><strong>${name}</strong> is part of our ${cat} line, crafted from selected ingredients with no artificial colours.</p>\n<ul><li>Silky, melt-in-your-mouth texture</li><li>Packaging: ${packLabel}</li><li>Great to enjoy now or give as a gift</li></ul>`,
    allergens: vi
      ? `<p>Thành phần có thể chứa: <strong>sữa, đậu nành</strong>.</p>\n<ul><li>Sản xuất trên dây chuyền có sử dụng <strong>các loại hạt</strong></li><li>Không phù hợp với người dị ứng đạm sữa</li></ul>`
      : `<p>May contain: <strong>milk, soy</strong>.</p>\n<ul><li>Produced on a line that also handles <strong>tree nuts</strong></li><li>Not suitable for those with a milk-protein allergy</li></ul>`,
    usage: vi
      ? `<p>Bảo quản ở <strong>-18°C</strong>. Ngon nhất khi dùng trong vòng 5 phút sau khi lấy khỏi tủ đông.</p>\n<table><thead><tr><th>Thông tin</th><th>Giá trị</th></tr></thead><tbody><tr><td>Năng lượng</td><td>180 kcal</td></tr><tr><td>Đường</td><td>20 g</td></tr><tr><td>Khẩu phần</td><td>${packLabel}</td></tr></tbody></table>`
      : `<p>Keep frozen at <strong>-18°C</strong>. Best enjoyed within 5 minutes of leaving the freezer.</p>\n<table><thead><tr><th>Info</th><th>Value</th></tr></thead><tbody><tr><td>Energy</td><td>180 kcal</td></tr><tr><td>Sugar</td><td>20 g</td></tr><tr><td>Serving</td><td>${packLabel}</td></tr></tbody></table>`,
    notes: vi
      ? `<p><em>Sản phẩm mockup</em> dùng để kiểm thử giao diện. <a href="/products">Xem thêm sản phẩm</a>.</p>`
      : `<p><em>Mockup product</em> for UI testing. <a href="/products">See more products</a>.</p>`,
  };
}

/** Dựng ProductDetailApiDto từ 1 mockup để trang chi tiết chạy qua đúng pipeline tier-2 như dữ liệu thật. */
export function toMockupProductDto(mockup: MockupProduct, locale: Locale): ProductDetailApiDto {
  const category = getMockupCategory(mockup.categorySlug);
  const packLabel = resolveLocalized(mockup.pack ?? category?.pack, locale);
  const categoryName = category ? resolveLocalized(category.name, locale) : null;
  const html = mockupDetailHtml(
    locale,
    resolveLocalized(mockup.name, locale),
    categoryName,
    resolveLocalized(mockup.description, locale),
    packLabel,
  );
  return {
    id: `mockup-${mockup.slug}`,
    name: resolveLocalized(mockup.name, locale),
    slug: mockup.slug,
    description: html.description,
    short_description: html.allergens,
    price: mockup.price,
    sale_price: null,
    cost_price: null,
    images: [mockupImage(mockup.slug)],
    stock_quantity: 12,
    sku: null,
    barcode: null,
    tags: [],
    status: 'active',
    is_featured: true,
    enable_sale_tag: false,
    meta_title: null,
    meta_description: null,
    weight: MOCKUP_WEIGHT_KG[mockup.categorySlug] ?? null,
    nutrition_information: null,
    usage_instructions: html.usage,
    notes: html.notes,
    dimensions: null,
    created_at: new Date(0).toISOString(),
    updated_at: new Date(0).toISOString(),
    category: category
      ? { id: `mockup-cat-${category.slug}`, name: resolveLocalized(category.name, locale), slug: category.slug }
      : null,
    brand: null,
    variants: [
      {
        sku: `${mockup.slug}-pack`,
        name: packLabel,
        price: mockup.price,
        stock: 12,
        color_id: '00000000-0000-0000-0000-000000000000',
        size_id: '00000000-0000-0000-0000-000000000001',
      },
    ],
  };
}
