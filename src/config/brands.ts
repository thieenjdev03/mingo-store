// Sub-brand của Mingo — logo nguồn: public/Logo/Sub-brand.
// Fruttega chưa có file logo (chỉ hiện text link ở footer, ẩn khỏi grid trang brands).
export interface Brand {
  slug: string;
  name: string;
  logo: string | null;
}

export const BRANDS: Brand[] = [
  { slug: 'impact', name: 'Impact', logo: '/Logo/Sub-brand/IMPACT/Impact_Logo-RGB.png' },
  { slug: 'rokka', name: 'Rokka', logo: '/Logo/Sub-brand/ROKKA/Rokka_Logo-RGB.png' },
  { slug: 'oasis', name: 'Oasis', logo: '/Logo/Sub-brand/Oasis/Oasis_Logo-RGB.png' },
  { slug: 'vivi', name: 'ViVi', logo: '/Logo/Sub-brand/ViVi/ViVi by Mingo_Primary Logo_Indulgent.png' },
  { slug: 'sandwich', name: 'Ice Cream Sandwich', logo: '/Logo/Sub-brand/SANDWICH/Ice_Cream_Sandwich_EN-RGB.png' },
  { slug: 'fruttega', name: 'Fruttega', logo: null },
  { slug: 'verano', name: 'Verano', logo: '/Logo/Sub-brand/VERANO/Verano_Logo_EN-RGB.png' },
  { slug: 'fruitesia', name: 'Fruitesia', logo: '/Logo/Sub-brand/Fruitesia/Fruitesia_Logo-RGB.png' },
];
