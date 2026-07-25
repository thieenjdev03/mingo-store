---
name: Vibrant Creamery
colors:
  surface: '#f8f9ff'
  surface-dim: '#ccdbf4'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e6eeff'
  surface-container-high: '#dde9ff'
  surface-container-highest: '#d5e3fd'
  on-surface: '#0d1c2f'
  on-surface-variant: '#5b4137'
  inverse-surface: '#233144'
  inverse-on-surface: '#ebf1ff'
  outline: '#8f7065'
  outline-variant: '#e4beb1'
  surface-tint: '#a73a00'
  primary: '#a73a00'
  on-primary: '#ffffff'
  primary-container: '#ff5c00'
  on-primary-container: '#521800'
  inverse-primary: '#ffb59a'
  secondary: '#605f53'
  on-secondary: '#ffffff'
  secondary-container: '#e6e3d3'
  on-secondary-container: '#666558'
  tertiary: '#9d4300'
  on-tertiary: '#ffffff'
  tertiary-container: '#ef6b0a'
  on-tertiary-container: '#4d1d00'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbce'
  primary-fixed-dim: '#ffb59a'
  on-primary-fixed: '#370e00'
  on-primary-fixed-variant: '#802a00'
  secondary-fixed: '#e6e3d3'
  secondary-fixed-dim: '#cac7b8'
  on-secondary-fixed: '#1c1c13'
  on-secondary-fixed-variant: '#48473c'
  tertiary-fixed: '#ffdbca'
  tertiary-fixed-dim: '#ffb690'
  on-tertiary-fixed: '#341100'
  on-tertiary-fixed-variant: '#783200'
  background: '#f8f9ff'
  on-background: '#0d1c2f'
  surface-variant: '#d5e3fd'
typography:
  display-lg:
    fontFamily: Montserrat
    fontSize: 56px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Montserrat
    fontSize: 40px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Montserrat
    fontSize: 28px
    fontWeight: '700'
    lineHeight: '1.3'
  headline-sm:
    fontFamily: Montserrat
    fontSize: 20px
    fontWeight: '700'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Be Vietnam Pro
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  body-sm:
    fontFamily: Be Vietnam Pro
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: Be Vietnam Pro
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
  headline-lg-mobile:
    fontFamily: Montserrat
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 64px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
  section-padding: 80px
---

## Brand & Style

This design system is built on a foundation of warmth, playfulness, and approachability. It targets a broad demographic seeking small moments of joy, utilizing a visual language that feels as indulgent and friendly as the product itself.

The aesthetic blends **Modern Minimalism** with **Organic Tactility**. It uses high-contrast, vibrant primary colors against soft, creamy neutrals to create an environment that feels premium yet accessible. The design avoids sharp corners and rigid structures, opting instead for generous roundedness and soft, pill-shaped elements that evoke the physical form of ice cream scoops and bars. The emotional goal is to inspire optimism and appetite.

## Colors

The palette is dominated by "Solar Orange" and "Creamy Off-White," creating a high-energy contrast that remains easy on the eyes.

- **Primary (#FF5C00):** Used for calls to action, active states, and key brand headlines. It represents the energy and flavor of the brand.
- **Secondary (#FFFBEB):** The primary background color. It provides a softer, more "food-safe" and premium feel than pure white.
- **Tertiary (#F97316):** Used for subtle accents, hover states, and supporting backgrounds to create depth without losing brand consistency.
- **Neutral (#334155):** Used primarily for body text and secondary labels to ensure high legibility against the cream background.
- **Functional Tint (#FDF2F2):** A very pale orange/red tint used for form field backgrounds and container fills to maintain the warm "cream" theme.

## Typography

The typography strategy pairs a bold, geometric sans-serif for impact with a highly legible, friendly sans-serif for information.

- **Headlines:** Use Montserrat. Heavy weights (700-800) are essential to maintain the "chunky," friendly personality. Titles should often be centered to emphasize the playful nature.
- **Body & Labels:** Use Be Vietnam Pro. This font offers a contemporary feel with excellent readability at small sizes. 
- **Hierarchy:** Use the Primary Orange for major display titles to draw the eye immediately. Use Neutral for all functional text to maintain accessibility.

## Layout & Spacing

This design system employs a **Fluid Grid** with generous white space (or "cream space") to let product imagery breathe.

- **Grid:** A 12-column grid for desktop with 24px gutters. For mobile, a 4-column grid with 16px margins.
- **Rhythm:** Spacing follows a base-8 scale. Larger section gaps (80px+) are encouraged to separate distinct brand stories (e.g., "About" vs "Products").
- **Alignment:** Central alignment is the default for hero sections and headlines to evoke a sense of balance and focus. Left-alignment is reserved for data-heavy sections like contact details or footer links.

## Elevation & Depth

Visual hierarchy is achieved through **Tonal Layers** and **Low-Contrast Outlines** rather than aggressive shadows.

- **Surface Tiers:** Use subtle shifts in background color (e.g., moving from Cream #FFFBEB to a soft Peach-White) to define sections.
- **Outlines:** Form fields and secondary buttons use thin, low-opacity borders (usually a tint of the neutral or primary color) to define boundaries without adding visual "weight."
- **Focus States:** Elements "lift" slightly using a very soft, diffused shadow (0px 4px 20px, 5% opacity) only when interacted with, maintaining a flat but tactile feel.

## Shapes

The shape language is defined by the **Pill** and the **Soft Square**.

- **Buttons & Inputs:** Use full "pill" roundedness (rounded-full) for primary actions to maximize the friendly, approachable aesthetic.
- **Cards & Containers:** Use `rounded-xl` (1.5rem) to ensure large surfaces feel soft and never clinical.
- **Icons:** Should always feature rounded terminals and corners to match the typography.

## Components

### Buttons
- **Primary:** Solid Primary Orange (#FF5C00) with white text. Pill-shaped. Height: 48px or 56px.
- **Secondary:** Transparent background with a thin border in Primary Orange. Pill-shaped.
- **Ghost:** No background, Primary Orange text. Used for less critical navigation.

### Form Fields
- **Inputs:** Background uses a soft tint (#FDF2F2), pill-shaped, with a subtle border. Labels are placed above the field in `label-md` style.
- **Selects:** Feature a rounded chevron icon and follow the input field styling.

### Cards
- **Product Cards:** Image-centric. The product sits on a transparent or neutral background. The title is centered below in `headline-sm`. No borders are required; the product silhouette creates the boundary.
- **Store Cards:** Use a simple divider line (1px, neutral-light) between entries to maintain a clean list structure without adding boxes.

### Chips & Tags
- Used for categories or filters. High-contrast (Primary Orange background with white text) for active states, and light cream for inactive states. Always pill-shaped.