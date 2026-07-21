---
name: Luminous Productivity
colors:
  surface: '#f8f9fa'
  surface-dim: '#d9dadb'
  surface-bright: '#f8f9fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f5'
  surface-container: '#edeeef'
  surface-container-high: '#e7e8e9'
  surface-container-highest: '#e1e3e4'
  on-surface: '#191c1d'
  on-surface-variant: '#444748'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f2'
  outline: '#747878'
  outline-variant: '#c4c7c7'
  surface-tint: '#5f5e5e'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#1c1b1b'
  on-primary-container: '#858383'
  inverse-primary: '#c8c6c5'
  secondary: '#5952af'
  on-secondary: '#ffffff'
  secondary-container: '#a19afd'
  on-secondary-container: '#352c8a'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#002018'
  on-tertiary-container: '#009579'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e5e2e1'
  primary-fixed-dim: '#c8c6c5'
  on-primary-fixed: '#1c1b1b'
  on-primary-fixed-variant: '#474746'
  secondary-fixed: '#e3dfff'
  secondary-fixed-dim: '#c5c0ff'
  on-secondary-fixed: '#140067'
  on-secondary-fixed-variant: '#413996'
  tertiary-fixed: '#6cfad4'
  tertiary-fixed-dim: '#4addb9'
  on-tertiary-fixed: '#002018'
  on-tertiary-fixed-variant: '#005140'
  background: '#f8f9fa'
  on-background: '#191c1d'
  surface-variant: '#e1e3e4'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  title-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-bold:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 16px
  margin-mobile: 20px
---

## Brand & Style

This design system is built for high-performance time tracking with a soft, approachable exterior. The brand personality is **Professional yet Playful**, balancing the rigor of time management with a stress-reducing aesthetic.

The visual style is **Corporate Modern with a Soft Edge**. It utilizes clean, generous whitespace and structured layouts typical of SaaS products, but softens the experience through high-saturation pastel backgrounds, hyper-rounded corners, and distinctive thin-stroke iconography. The goal is to evoke a sense of calm organization and clarity, moving away from the industrial "clock-in" feel of traditional trackers toward a more lifestyle-oriented productivity tool.

## Colors

The palette relies on a "Chroma-Neutral" foundation. The core UI is anchored by a deep near-black primary for high-contrast text and primary actions, set against a light grey and pure white background.

Functional depth is provided through a suite of **vibrant pastels** used for categorization and status signaling.

- **Primary:** Deep Onyx (#1A1A1A) for readability and authority.
- **Secondary:** Soft Lavender (#A29BFE) for focus states and primary interactive accents.
- **Accents:** A spectrum of mint, peach, and lemon is used for card backgrounds and status badges to differentiate projects or task types at a glance.
- **Status Contrast:** While backgrounds are soft, text within status chips should remain high-contrast (black or dark grey) to ensure legibility.

## Typography

The design system uses **Plus Jakarta Sans** exclusively to maintain a modern, geometric, and friendly tone. The font's tall x-height and open counters ensure excellent legibility on small mobile screens.

- **Headlines:** Use Bold and Semi-Bold weights with slight negative letter-spacing for a "tight," professional look.
- **Body:** Regular weight is used for task descriptions and notes to provide visual relief.
- **Labels:** Small caps or bolded 12px labels are used for metadata (dates, counters, status) to create clear information hierarchy without occupying excessive space.

## Layout & Spacing

The design system utilizes a **Fluid Grid** with a 4px baseline. Mobile layouts should adhere to a 20px side margin to give the content "breathing room" against the device edges.

- **Vertical Rhythm:** Components are separated by `md` (16px) or `lg` (24px) blocks.
- **Internal Padding:** Cards use a consistent `md` (16px) padding to ensure content doesn't feel cramped within the rounded borders.
- **Grouped Elements:** Small related items (like avatars or status chips) use `sm` (8px) spacing.

## Elevation & Depth

This design system avoids heavy shadows in favor of **Tonal Layering and Thin Outlines**.

- **Surface Levels:** The primary background is the lowest level (Neutral #F8F9FA). Cards sit on the second level, defined by white backgrounds or soft pastel fills.
- **Borders:** Instead of shadows, cards use a subtle 1px border (#E0E0E0) or no border at all when using a colored background.
- **Active States:** Subtle, highly-diffused ambient shadows (Opacity 5%, Blur 10px) are reserved only for "floating" elements like the Floating Action Button (FAB) or active modal sheets.

## Shapes

The shape language is **Ultra-Rounded**.

- **Cards & Containers:** Use a base 16px (`rounded-lg`) radius to create a friendly, approachable feel.
- **Interactive Elements:** Buttons and Input fields use a 12px-16px radius, matching the containers.
- **Chips & Badges:** Use a fully rounded (Pill-shaped) style to distinguish them from structural card elements.
- **Avatars:** Strictly circular to contrast against the softened rectangular cards.

## Components

### Buttons

- **Primary:** Solid Black (#1A1A1A) with White text. High-contrast and clear.
- **Secondary:** Lavender fill (#A29BFE) with Dark text.
- **Icon Buttons:** Circular with a thin stroke outline, used for supplementary actions like "Add" or "Filter."

### Status Chips

- **Status:** Pill-shaped with high-saturation backgrounds.
- **Priority:** Small, rounded-rectangle labels with high-contrast borders and text.
- **In-Progress:** High-visibility Lavender or Blue to draw the eye to active work.

### Cards

- **Task Cards:** White background with 1px light grey border. When a task is "Active," the card background may transition to a soft green or lavender to highlight the current state.
- **Calendar Blocks:** Solid pastel fills with no borders, using the color-coding associated with the project or category.

### Inputs

- **Text Fields:** Subtle grey-filled backgrounds with no border until focused. On focus, use a 1.5px Lavender border.
- **Selection:** Use large, touch-friendly "pill" buttons for selecting priority (Low, Medium, High) rather than dropdowns.
