export interface ShowcaseProduct {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
  imageAlt: string;
}

export const MINGO_HOME_ASSETS = {
  heroBackground: '/assets/mingo/home/hero-background.jpg',
  heroTitle: '/assets/mingo/home/hero-title.svg',
  heroProduct: '/assets/mingo/home/hero-creme-product.png',
  heroPudding: '/assets/mingo/home/hero-pudding.png',
} as const;

export const MUST_TRY_PRODUCTS: ShowcaseProduct[] = [
  {
    id: 'creme-caramel-1',
    name: 'Creme Caramel',
    slug: 'creme-caramel',
    imageUrl: '/assets/mingo/home/product-creme-caramel.png',
    imageAlt: 'Kem que Creme Caramel của Mingo',
  },
  {
    id: 'matcha-red-bean-1',
    name: 'Matcha Red Bean',
    slug: 'matcha-red-bean',
    imageUrl: '/assets/mingo/home/product-matcha-red-bean.png',
    imageAlt: 'Kem que Matcha Red Bean của Mingo',
  },
  {
    id: 'creme-caramel-2',
    name: 'Creme Caramel',
    slug: 'creme-caramel',
    imageUrl: '/assets/mingo/home/product-creme-caramel.png',
    imageAlt: 'Kem que Creme Caramel của Mingo',
  },
  {
    id: 'matcha-red-bean-2',
    name: 'Matcha Red Bean',
    slug: 'matcha-red-bean',
    imageUrl: '/assets/mingo/home/product-matcha-red-bean.png',
    imageAlt: 'Kem que Matcha Red Bean của Mingo',
  },
];
