
1. Phân tích cấu trúc landing page

Trang trong ảnh có 4 vùng chính:

LandingPage
├── Header
├── HeroBanner
├── MustTryProducts
└── Footer

Chi tiết:

MingoHomePage
├── MingoHeader
│   ├── Logo
│   ├── DesktopNavigation
│   └── HeaderActions
│       ├── Account
│       ├── Cart
│       └── Search
│
├── HeroCarousel
│   ├── HeroSlideBackground
│   ├── HeroProductArtwork
│   ├── HeroTitleArtwork/Text
│   ├── HeroCTA
│   └── CarouselNavigation
│
├── MustTrySection
│   ├── SectionHeading
│   └── ProductCarousel
│       ├── PreviousButton
│       ├── ProductCard × N
│       └── NextButton
│
└── MingoFooter
    ├── FooterNavigationColumns
    ├── SocialLinks
    └── CopyrightBar

Đây là landing page thiên về visual merchandising, không phải homepage có quá nhiều nội dung. Do đó ưu tiên:

* Hình ảnh sản phẩm lớn.
* Khoảng trắng nhiều.
* Typography đậm.
* Animation nhẹ.
* Carousel mượt.
* Responsive theo tỉ lệ ảnh.

⸻

2. Kiến trúc thư mục đề xuất

Không nên nhét tất cả vào một file page.tsx.

src/
├── app/
│   └── page.tsx
│
├── sections/
│   └── mingo-home/
│       ├── mingo-home-view.tsx
│       │
│       ├── header/
│       │   ├── mingo-header.tsx
│       │   ├── desktop-navigation.tsx
│       │   ├── mobile-navigation.tsx
│       │   └── header-actions.tsx
│       │
│       ├── hero/
│       │   ├── hero-carousel.tsx
│       │   ├── hero-slide.tsx
│       │   ├── hero-navigation.tsx
│       │   └── hero.types.ts
│       │
│       ├── must-try/
│       │   ├── must-try-section.tsx
│       │   ├── product-carousel.tsx
│       │   └── product-slide-card.tsx
│       │
│       └── footer/
│           ├── mingo-footer.tsx
│           ├── footer-column.tsx
│           └── social-links.tsx
│
├── components/
│   ├── mingo-container/
│   │   └── mingo-container.tsx
│   ├── mingo-icon-button/
│   └── responsive-image/
│
├── config/
│   ├── mingo-navigation.ts
│   ├── mingo-footer.ts
│   └── mingo-home-content.ts
│
├── types/
│   └── mingo-home.ts
│
└── theme/
    ├── palette.ts
    ├── typography.ts
    ├── spacing.ts
    └── components/

page.tsx chỉ nên làm nhiệm vụ compose:

import { MingoHomeView } from '@/sections/mingo-home/mingo-home-view';
export default function HomePage() {
  return <MingoHomeView />;
}

⸻

3. Design system cần trích từ Figma

Trước khi code section, lấy token từ Figma và map vào MUI theme.

Color palette

Từ ảnh có thể xác định sơ bộ:

const mingoColors = {
  orange: '#F4510B',
  blue: '#003ECD',
  cream: '#F7E8C7',
  brown: '#4A3023',
  white: '#FFFFFF',
  lightGray: '#F5F5F5',
  border: '#D8D1CB',
};

Đây chỉ là màu ước lượng từ ảnh. Khi có Figma, lấy trực tiếp màu inspect để tránh sai.

Nên map semantic:

export const palette = {
  brand: {
    primary: '#F4510B',
    secondary: '#003ECD',
    cream: '#F7E8C7',
    brown: '#4A3023',
  },
  background: {
    default: '#FFFFFF',
    soft: '#F6F6F6',
  },
  text: {
    primary: '#3F3028',
    secondary: '#6E625B',
    inverse: '#FFFFFF',
  },
};

Không dùng hex rải rác trong component.

Sai:

<Typography color="#F4510B" />

Đúng:

<Typography color="brand.primary" />

Typography

Trong ảnh có ít nhất 3 nhóm font:

Logo                  → custom script font hoặc SVG logo
Navigation/body       → sans-serif, medium/semi-bold
Hero product title    → display serif/artwork
Section heading       → bold sans-serif

Nên dùng logo và hero title dưới dạng SVG/ảnh nếu đó là asset branding đặc biệt.

Typography MUI:

typography: {
  fontFamily: '"Inter", "Arial", sans-serif',
  h1: {
    fontSize: 'clamp(2.5rem, 5vw, 5rem)',
    fontWeight: 700,
    lineHeight: 1,
  },
  h2: {
    fontSize: 'clamp(2rem, 3.5vw, 3rem)',
    fontWeight: 800,
    lineHeight: 1.1,
  },
  body1: {
    fontSize: '1rem',
    lineHeight: 1.5,
  },
  button: {
    fontWeight: 700,
    textTransform: 'none',
  },
}

Nếu Figma dùng font thương hiệu riêng, cần xác minh license và load bằng next/font/local hoặc Google Font.

Spacing

Từ ảnh desktop khoảng 1024 px rộng:

export const mingoLayout = {
  headerHeightDesktop: 72,
  headerHeightMobile: 60,
  contentMaxWidth: 1200,
  pageGutterDesktop: 80,
  pageGutterTablet: 32,
  pageGutterMobile: 20,
  sectionSpacingDesktop: 80,
  sectionSpacingMobile: 48,
};

Nên tạo MingoContainer:

export function MingoContainer({
  children,
  maxWidth = 1200,
}: PropsWithChildren<{ maxWidth?: number }>) {
  return (
    <Box
      sx={{
        width: '100%',
        maxWidth,
        mx: 'auto',
        px: {
          xs: 2.5,
          sm: 4,
          lg: 8,
        },
      }}
    >
      {children}
    </Box>
  );
}

⸻

4. Header implementation plan

Layout desktop

Ảnh cho thấy header:

Logo bên trái
Navigation ở giữa
Account / Cart / Search bên phải

Tỷ lệ gần đúng:

Logo: 18%
Navigation: 58%
Actions: 24%

Component:

<header>
  <MingoContainer>
    <Box display="grid" gridTemplateColumns="1fr auto 1fr">
      <Logo />
      <DesktopNavigation />
      <HeaderActions />
    </Box>
  </MingoContainer>
</header>

Sử dụng grid thay vì flex đơn thuần giúp navigation luôn ở giữa viewport, không bị lệch theo độ rộng logo/action.

<Box
  component="header"
  sx={{
    height: { xs: 60, md: 72 },
    bgcolor: 'background.paper',
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
    zIndex: 20,
  }}
>
  <MingoContainer>
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: 'auto 1fr auto',
          md: '1fr auto 1fr',
        },
        alignItems: 'center',
      }}
    >
      ...
    </Box>
  </MingoContainer>
</Box>

Navigation data

Không hardcode từng menu trong JSX.

export const MAIN_NAV_ITEMS = [
  {
    label: 'DÒNG SẢN PHẨM',
    href: '/categories',
  },
  {
    label: 'THƯƠNG HIỆU',
    href: '/brands',
  },
  {
    label: 'HỢP TÁC',
    href: '/partnership',
  },
  {
    label: 'VỀ MINGO',
    href: '/about-us',
  },
];

Render:

<Stack direction="row" spacing={5}>
  {MAIN_NAV_ITEMS.map((item) => (
    <Link key={item.href} href={item.href}>
      {item.label}
    </Link>
  ))}
</Stack>

Header actions

Nên dùng icon từ MUI hoặc SVG riêng:

<Stack direction="row" spacing={2}>
  <IconButton aria-label="Tài khoản">
    <AccountCircleOutlinedIcon />
  </IconButton>
  <IconButton aria-label="Giỏ hàng">
    <Badge badgeContent={cartCount}>
      <ShoppingBagOutlinedIcon />
    </Badge>
  </IconButton>
  <IconButton aria-label="Tìm kiếm">
    <SearchOutlinedIcon />
  </IconButton>
</Stack>

Interaction:

* Account → /user/account hoặc /auth/login.
* Cart → mở mini cart drawer hoặc /checkout.
* Search → mở search overlay.
* Cart count đọc từ Checkout Context hiện có.

Mobile header

Mobile không nên giữ navigation ngang.

Logo | Search | Cart | Hamburger

Menu mở bằng MUI Drawer.

const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

Tuy nhiên đừng làm toàn bộ Header thành client component nếu không cần. Có thể tách:

MingoHeader                 Server/normal component
├── DesktopNavigation
└── MobileHeaderActions     Client component

⸻

5. Hero banner implementation plan

Hero là phần quan trọng nhất và khó nhất.

Ảnh hero gồm:

Blue background
Cream wave ở đáy
Product image lớn bên phải
Typography bên trái/giữa
Các mảnh caramel trang trí
CTA button
Previous / Next arrow

Có hai cách implement.

Cách A — Dùng một ảnh banner hoàn chỉnh

Nếu Figma/marketing đã export toàn bộ hero thành một ảnh:

hero-desktop.webp
hero-tablet.webp
hero-mobile.webp

Ưu điểm:

* Sát design gần như tuyệt đối.
* Code nhanh.
* Không phải position nhiều layer.

Nhược điểm:

* Text nằm trong ảnh, không SEO/accessibility tốt.
* Không responsive linh hoạt.
* Khó đổi campaign.
* Khó animate từng thành phần.
* Desktop/mobile cần asset riêng.

Dùng khi hero là artwork campaign phức tạp và thay đổi theo mùa.

Cách B — Layer từng asset

Tách Figma asset thành:

hero-background.svg
hero-cream-wave.svg
hero-product.webp
hero-pudding.webp
hero-caramel-piece-01.webp
hero-caramel-piece-02.webp
hero-bean.webp
hero-title.svg

Sau đó layout bằng position: absolute.

Ưu điểm:

* Responsive tốt hơn.
* Animate được.
* CTA và text là HTML thật.
* Dễ thay product.

Nhược điểm:

* Tốn effort.
* Cần kiểm soát tọa độ theo breakpoint.

Với Mingo, tao khuyên hybrid:

Background + decorative artwork → image layer
CTA + accessibility text → HTML
Product image → separate transparent WebP

Hero data model

export interface HeroSlide {
  id: string;
  eyebrow?: string;
  title: string;
  titleAssetUrl?: string;
  productImageUrl: string;
  backgroundImageUrl?: string;
  mobileBackgroundImageUrl?: string;
  href: string;
  ctaLabel: string;
  theme: {
    backgroundColor: string;
    textColor: string;
  };
}

Config tạm thời:

export const HERO_SLIDES: HeroSlide[] = [
  {
    id: 'creme-custard-caramel',
    eyebrow: 'New!',
    title: 'Crème Custard Caramel',
    titleAssetUrl: '/assets/mingo/hero/creme-title.svg',
    productImageUrl: '/assets/mingo/hero/creme-product.webp',
    backgroundImageUrl: '/assets/mingo/hero/creme-background.webp',
    mobileBackgroundImageUrl:
      '/assets/mingo/hero/creme-background-mobile.webp',
    href: '/product/creme-custard-caramel',
    ctaLabel: 'See Product',
    theme: {
      backgroundColor: '#003ECD',
      textColor: '#FFFFFF',
    },
  },
];

Hero sizing

Không nên dùng fixed height duy nhất.

sx={{
  minHeight: {
    xs: 540,
    sm: 620,
    md: 570,
    lg: 640,
  },
}}

Hoặc dựa trên aspect ratio:

aspectRatio: {
  xs: '4 / 5',
  md: '16 / 9',
  lg: '16 / 8.5',
}

Do ảnh design desktop khá rộng và cao khoảng 560 px, có thể dùng:

height: {
  xs: 'calc(100svh - 60px)',
  md: 'min(70vw, 640px)',
}

Nhưng tránh hero chiếm toàn màn hình trên desktop nếu Figma không yêu cầu.

Hero component skeleton

<Box
  component="section"
  sx={{
    position: 'relative',
    overflow: 'hidden',
    bgcolor: slide.theme.backgroundColor,
    height: {
      xs: 560,
      md: 570,
      lg: 640,
    },
  }}
>
  <HeroBackground />
  <Box
    sx={{
      position: 'absolute',
      inset: 0,
      display: 'grid',
      gridTemplateColumns: {
        xs: '1fr',
        md: '45% 55%',
      },
    }}
  >
    <HeroContent />
    <HeroProductVisual />
  </Box>
  <HeroNavigation />
</Box>

CTA button

Trong ảnh button có:

* Nền cream.
* Border nâu.
* Bo pill.
* Text nâu đậm.

<Button
  component={Link}
  href={slide.href}
  variant="outlined"
  sx={{
    borderRadius: 999,
    borderColor: 'brand.brown',
    color: 'brand.brown',
    bgcolor: 'brand.cream',
    px: 3,
    py: 1,
    '&:hover': {
      bgcolor: 'brand.brown',
      color: 'common.white',
      borderColor: 'brand.brown',
    },
  }}
>
  See Product
</Button>

Carousel library

Có thể dùng:

* Embla Carousel.
* Swiper.
* Keen Slider.

Tao ưu tiên Embla Carousel vì nhẹ, dễ control và không ép CSS.

Cấu trúc client component:

'use client';
import useEmblaCarousel from 'embla-carousel-react';

Features:

* Loop.
* Arrow navigation.
* Auto-play tùy chọn.
* Pause khi hover.
* Swipe trên mobile.
* Keyboard navigation.
* Respect prefers-reduced-motion.

Không autoplay quá nhanh. Khoảng 5–7 giây là hợp lý.

⸻

6. Must Try section

Ảnh có section:

Nền xám/trắng rất nhạt
Heading "Phải thử" màu cam
4 sản phẩm trên desktop
Arrow hai bên
Tên sản phẩm dưới ảnh

Section layout

<Box
  component="section"
  sx={{
    bgcolor: '#F7F7F7',
    py: {
      xs: 6,
      md: 9,
    },
  }}
>
  <MingoContainer>
    <Typography variant="h2" color="brand.primary">
      Phải thử
    </Typography>
    <ProductCarousel />
  </MingoContainer>
</Box>

Heading trong ảnh cách khá xa carousel. Desktop có thể dùng:

mb: {
  xs: 4,
  md: 7,
}

Product card

Card trong ảnh không có border, background hay shadow.

Image floating
Tên sản phẩm centered
Không thấy giá
Không thấy nút Add to cart

Do vậy đây nên là ProductShowcaseCard, không tái sử dụng card shop đầy đủ nếu card shop có nhiều metadata.

export interface ShowcaseProduct {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
  imageAlt: string;
}

Component:

<Link href={`/product/${product.slug}`}>
  <Box
    sx={{
      textAlign: 'center',
      textDecoration: 'none',
      color: 'inherit',
      display: 'block',
    }}
  >
    <Box
      sx={{
        position: 'relative',
        height: {
          xs: 260,
          md: 320,
        },
      }}
    >
      <Image
        src={product.imageUrl}
        alt={product.imageAlt}
        fill
        sizes="(max-width: 600px) 70vw, 25vw"
        style={{
          objectFit: 'contain',
        }}
      />
    </Box>
    <Typography
      sx={{
        mt: 2,
        fontSize: {
          xs: 18,
          md: 22,
        },
        fontWeight: 700,
        color: 'brand.brown',
      }}
    >
      {product.name}
    </Typography>
  </Box>
</Link>

Carousel behavior

Desktop:

>= 1200px: 4 items
900–1199px: 3 items
600–899px: 2 items
<600px: 1.2 items

Việc hiển thị 1.2 items trên mobile cho user biết còn sản phẩm phía sau.

Embla slide width:

flex: {
  xs: '0 0 82%',
  sm: '0 0 48%',
  md: '0 0 33.333%',
  lg: '0 0 25%',
}

Nếu số product chỉ có 4 mà design muốn lặp carousel vô hạn, có thể loop: true. Nhưng nên tránh render duplicate thủ công nếu thư viện đã hỗ trợ loop.

Data fetching

Nếu API đã hỗ trợ is_featured:

export async function MustTrySection() {
  const products = await getProducts({
    featured: true,
    limit: 8,
    status: 'active',
  });
  return <ProductCarousel products={products} />;
}

Nếu chưa có field riêng cho “Phải thử”, có thể:

* Dùng collection slug must-try.
* Dùng tag must-try.
* Dùng is_featured.

Tao khuyên dùng Collection:

Collection: Phải thử
slug: must-try

Vì marketing có thể quản lý danh sách mà không cần sửa code.

⸻

7. Footer implementation plan

Footer trong ảnh gồm:

3 cột link bên trái
Social media bên phải
Tagline
Copyright bar dưới cùng

Footer config

export const FOOTER_COLUMNS = [
  {
    title: 'VỀ MINGO',
    links: [
      { label: 'VỀ CHÚNG TÔI', href: '/about-us' },
      { label: 'LIÊN HỆ', href: '/contact-us' },
      { label: 'CHÍNH SÁCH', href: '/policies' },
      { label: 'NGHỀ NGHIỆP', href: '/careers' },
      { label: 'FAQs', href: '/faqs' },
    ],
  },
  {
    title: 'THƯƠNG HIỆU',
    links: [
      { label: 'FRUITESIA', href: '/brands/fruitesia' },
      { label: 'FRUTTEGA', href: '/brands/fruttega' },
      { label: 'ROKKA', href: '/brands/rokka' },
      { label: 'OASIS', href: '/brands/oasis' },
      { label: 'IMPACT', href: '/brands/impact' },
      { label: 'SANDWICH', href: '/brands/sandwich' },
      { label: 'VERANO', href: '/brands/verano' },
      { label: 'VIVI', href: '/brands/vivi' },
    ],
  },
  {
    title: 'DÒNG SẢN PHẨM',
    links: [
      { label: 'KEM HỘP', href: '/categories/kem-hop' },
      { label: 'KEM QUE', href: '/categories/kem-que' },
      { label: 'KEM ỐC QUẾ', href: '/categories/kem-oc-que' },
      { label: 'KEM ĐÁ', href: '/categories/kem-da' },
    ],
  },
];

Desktop footer layout

<Box
  sx={{
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: 8,
  }}
>
  <Box
    sx={{
      display: 'grid',
      gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
      gap: 4,
    }}
  >
    ...
  </Box>
  <SocialSection />
</Box>

Mobile footer

Mobile nên dùng accordion để giảm chiều dài:

VỀ MINGO          +
THƯƠNG HIỆU       +
DÒNG SẢN PHẨM     +

Hoặc stack toàn bộ nếu số link ít.

Responsive:

display: {
  xs: 'block',
  md: 'grid',
}

Copyright bar

Ảnh có border top riêng:

<Box
  sx={{
    borderTop: '1px solid',
    borderColor: 'divider',
    py: 2,
  }}
>
  <MingoContainer>
    <Typography variant="caption">
      Hồng Tân Phát Co., Ltd.
    </Typography>
  </MingoContainer>
</Box>

Tên công ty và nội dung pháp lý nên được lấy từ config, không hardcode trong component.

⸻

8. Responsive plan chi tiết

Desktop lớn: ≥ 1440 px

Container tối đa khoảng 1280–1360px
Header height 76–84px
Hero height 620–700px
Must Try 4 products
Footer 3 columns + social block

Không scale hero product vô hạn. Giới hạn kích thước hình bằng max-width.

Desktop thường: 1024–1439 px

Đây gần với ảnh:

Header 70–76px
Hero 550–620px
4 product cards
Padding ngang 48–80px

Tablet: 768–1023 px

Navigation có thể vẫn hiển thị nếu đủ chỗ, hoặc chuyển hamburger sớm ở 900px
Hero 2 columns nhỏ hơn
Product carousel 2–3 items
Footer có thể 2 rows

Mobile: <768 px

Hero nên thay bố cục:

Title phía trên
Product ở giữa
CTA phía dưới
Background artwork được crop riêng

Không thu nhỏ nguyên banner desktop, vì text và CTA sẽ quá nhỏ.

Layout:

Header
Hero:
  New!
  Crème Custard Caramel
  Product image
  CTA
Must Try:
  Heading
  1.2 product cards
Footer accordion

Nên có asset mobile riêng cho hero.

⸻

9. Asset plan từ Figma

Khi export Figma, phân loại asset:

SVG

Dùng cho:

* Logo.
* Icon custom.
* Hero title artwork.
* Decorative wave.
* Pattern đơn giản.
* Social icon nếu không dùng icon library.

WebP hoặc AVIF

Dùng cho:

* Product packshot.
* Hero decorative image.
* Background có texture.
* Banner campaign.

PNG

Chỉ dùng khi cần transparency và WebP pipeline chưa hỗ trợ tốt. Thực tế Next.js hỗ trợ WebP tốt, nên ưu tiên WebP.

Naming:

public/
└── assets/
    └── mingo/
        ├── logo/
        │   ├── logo-full.svg
        │   └── logo-mark.svg
        │
        ├── hero/
        │   ├── creme-caramel-product.webp
        │   ├── creme-caramel-bg-desktop.webp
        │   ├── creme-caramel-bg-mobile.webp
        │   └── creme-caramel-title.svg
        │
        ├── products/
        │   ├── creme-caramel.webp
        │   └── matcha-red-bean.webp
        │
        └── icons/

Không đặt tên kiểu:

image1.png
Group 123.svg
Frame 21.png

⸻

10. Tối ưu hình ảnh

Hero là nơi dễ gây LCP chậm nhất.

Hero image đầu tiên:

<Image
  src={slide.productImageUrl}
  alt={slide.title}
  fill
  priority
  fetchPriority="high"
  sizes="(max-width: 768px) 90vw, 55vw"
/>

Chỉ slide đầu tiên priority. Các slide còn lại lazy-load.

Product carousel:

<Image
  loading="lazy"
  sizes="(max-width: 600px) 80vw, (max-width: 1200px) 33vw, 25vw"
/>

Các nguyên tắc:

* Hero background desktop khoảng dưới 400–600 KB.
* Product transparent image dưới 200 KB nếu có thể.
* Không export ảnh 4000 px cho vùng chỉ hiển thị 600 px.
* Tránh base64 image.
* Dùng object-fit: contain cho packshot.
* Dùng object-fit: cover cho background.

⸻

11. Animation plan

Landing page này phù hợp với animation nhẹ, không nên quá nhiều.

Hero:

Product image → fade + translateY
Title → fade
Decorations → parallax nhẹ
Slide transition → crossfade hoặc horizontal

Product card:

Hover image → translateY(-8px) hoặc scale(1.03)
Name → đổi màu cam

CTA:

Hover → background brown, text cream

Respect reduced motion:

const prefersReducedMotion = useMediaQuery(
  '(prefers-reduced-motion: reduce)'
);

Nếu reduced motion:

* Tắt autoplay.
* Tắt parallax.
* Giảm transition xuống gần 0.

⸻

12. Accessibility

Những thứ phải có:

<nav aria-label="Điều hướng chính">
<button aria-label="Sản phẩm trước">
<button aria-label="Sản phẩm tiếp theo">
<Image
  alt="Kem que Crème Custard Caramel của Mingo"
/>

Carousel cần:

* Điều khiển bằng bàn phím.
* Focus visible.
* Không autoplay liên tục mà không cho pause.
* aria-live không nên announce mọi animation slide tự động.

Logo:

<Link href="/" aria-label="Trang chủ Mingo">

⸻

13. Data contract cho frontend

Hero API hoặc config

Ban đầu có thể dùng local config. Sau này có thể chuyển sang CMS/admin.

export interface HomeHeroDto {
  id: string;
  title: string;
  subtitle?: string;
  desktopImageUrl: string;
  mobileImageUrl: string;
  productImageUrl?: string;
  ctaLabel: string;
  ctaHref: string;
  sortOrder: number;
  isActive: boolean;
}

Must Try API

Có thể gọi:

GET /collections/must-try/products?limit=8

Frontend adapter:

export interface MustTryProductViewModel {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
}

Không đưa toàn bộ DTO Product nặng vào carousel nếu chỉ cần 4 field.

⸻

14. Server Component và Client Component split

Plan tốt nhất:

page.tsx                         Server
└── MingoHomeView               Server
    ├── MingoHeader             Server
    │   └── HeaderInteractive   Client
    ├── HeroSection             Server
    │   └── HeroCarousel        Client
    ├── MustTrySection          Server
    │   └── ProductCarousel     Client
    └── MingoFooter             Server

Data fetch ở Server Component:

export async function MingoHomeView() {
  const [heroSlides, mustTryProducts] = await Promise.all([
    getHeroSlides(),
    getMustTryProducts(),
  ]);
  return (
    <>
      <MingoHeader />
      <HeroCarousel slides={heroSlides} />
      <MustTrySection products={mustTryProducts} />
      <MingoFooter />
    </>
  );
}

Không fetch lại trong client bằng SWR nếu homepage data không cần real-time.

Có thể dùng Next cache:

fetch(url, {
  next: {
    revalidate: 300,
    tags: ['home-products'],
  },
});

⸻

15. Loading, error và empty states

Dù landing page đơn giản, vẫn cần xử lý.

Hero empty:

Không có slide active
→ Render banner fallback branding Mingo

Must Try empty:

Không có sản phẩm
→ Ẩn toàn bộ section

Không nên render dòng “Không có sản phẩm” trên homepage marketing.

Image error:

→ Fallback product placeholder

API error:

→ Hero local fallback
→ Must Try section không render

Trang marketing không nên crash toàn bộ chỉ vì product API lỗi.

⸻

16. SEO plan

Metadata:

export const metadata: Metadata = {
  title: 'Mingo – Kem ngon cho mọi khoảnh khắc',
  description:
    'Khám phá các dòng kem que, kem hộp và kem ốc quế của Mingo.',
  openGraph: {
    title: 'Mingo Ice Cream',
    description: 'Joy in every bite!',
    images: ['/assets/mingo/og/home.jpg'],
  },
};

Hero title nếu dùng SVG vẫn nên có heading HTML ẩn hoặc visible:

<Typography component="h1" sx={visuallyHidden}>
  Kem Crème Custard Caramel mới từ Mingo
</Typography>

Product links phải là anchor thật qua next/link, không chỉ click handler.

⸻

17. Break task để implement

Task 1 — Foundation

* Thêm Mingo palette.
* Thêm typography.
* Thêm spacing và radius.
* Tạo MingoContainer.
* Chuẩn hóa responsive breakpoints.
* Import logo và icon assets.

Task 2 — Header

* Build desktop header.
* Build mobile header.
* Tạo navigation config.
* Connect account route.
* Connect checkout context với cart count.
* Build search overlay hoặc route search.
* Kiểm tra sticky/non-sticky theo Figma.

Task 3 — Hero

* Export asset từ Figma.
* Tạo hero data model.
* Build static hero slide đầu tiên.
* Build responsive layout.
* Thêm arrow controls.
* Thêm carousel.
* Thêm autoplay tùy chọn.
* Thêm mobile asset.
* Tối ưu LCP.

Task 4 — Must Try

* Tạo collection/tag must-try.
* Viết API query.
* Viết adapter Product → ShowcaseProduct.
* Build product card.
* Build responsive carousel.
* Thêm hover/focus state.
* Handle empty state.

Task 5 — Footer

* Tạo footer config.
* Build desktop columns.
* Build social links.
* Build mobile accordion.
* Build copyright bar.
* Kiểm tra external links và accessibility.

Task 6 — Quality

* Responsive test.
* Lighthouse.
* Keyboard navigation.
* Screen reader labels.
* Image optimization.
* Cross-browser Safari/Chrome.
* Visual regression với Figma.

⸻

18. Acceptance criteria

Header

* Logo đúng kích thước và khoảng cách.
* Navigation center đúng trên desktop.
* Mobile có drawer.
* Cart count cập nhật từ context.
* Icons có accessible label.

Hero

* Khớp design ở desktop và mobile.
* Không crop mất sản phẩm.
* CTA luôn click được.
* Carousel swipe được.
* LCP image được preload.
* Không layout shift.

Must Try

* Desktop 4 sản phẩm.
* Tablet 2–3.
* Mobile 1–1.2.
* Image giữ đúng tỷ lệ.
* Arrow disabled khi không loop hoặc hoạt động đúng khi loop.
* Product name không làm vỡ layout.

Footer

* Desktop đúng 3 cột + social.
* Mobile stack/accordion.
* Link đúng route.
* Copyright nằm dưới border.

Performance

Mục tiêu:

LCP < 2.5s
CLS < 0.1
INP < 200ms
Lighthouse Performance >= 85
Accessibility >= 95
SEO >= 95

⸻

19. Cách dùng Figma tối ưu để plan code

Trong Figma nên chuẩn bị như sau:

Page: Foundations
├── Colors
├── Typography
├── Spacing
├── Grid
├── Radius
└── Icons
Page: Components
├── Header
├── Button
├── Product Card
├── Carousel Arrow
└── Footer Link
Page: Screens
├── Homepage/Desktop
├── Homepage/Tablet
└── Homepage/Mobile
Page: Assets
├── Hero backgrounds
├── Product packshots
├── Logos
└── Decorative elements

Mỗi component trong Figma nên có variants:

Button:
- Default
- Hover
- Focus
- Disabled
Header:
- Desktop
- Tablet
- Mobile
Product Card:
- Default
- Hover
- Out of stock

Dev Mode cần inspect:

* Width/height.
* Padding.
* Gap.
* Font properties.
* Color exact values.
* Border radius.
* Asset export settings.

Không copy CSS Figma trực tiếp vào code. CSS Figma thường chứa absolute position và giá trị pixel không phù hợp responsive. Dùng Figma để lấy constraint và token, không dùng nó như code generator.

Kết luận implementation

Với design này, hướng production hợp lý nhất là:

Header và Footer → semantic layout, config-driven
Hero → hybrid asset layering + HTML CTA
Must Try → collection-driven carousel
Data fetch → Server Component
Interaction → isolated Client Components
Styling → MUI theme + sx
Assets → SVG/WebP từ Figma
Responsive → có desktop/tablet/mobile riêng

Phần cần đầu tư nhiều nhất không phải header hay footer, mà là hero asset decomposition và responsive composition. Nếu Figma có các layer riêng, nên export từng asset để dựng hero động. Nếu Figma chỉ có artwork hoàn chỉnh, dùng responsive banner image riêng cho desktop/mobile sẽ nhanh và sát thiết kế hơn.