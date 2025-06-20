# S.U.N. Festival - Visual Style Guide

## 1. Design Philosophy
**Organic & Immersive** - Creating a seamless digital experience that mirrors the natural, free-spirited essence of the festival.

## 2. Color Palette

### Primary Colors
- **Deep Purple** `#4A1D96`
  - Usage: Primary brand color, main headings, key elements
- **Vibrant Gold** `#F59E0B`
  - Usage: Accents, CTAs, highlights
- **Midnight Blue** `#1E40AF`
  - Usage: Secondary brand color, backgrounds

### Neutral Tones
- **Off-White** `#F8FAFC`
  - Usage: Backgrounds, light text on dark
- **Warm Gray** `#4B5563`
  - Usage: Secondary text, borders
- **Dark Gray** `#1F2937`
  - Usage: Main text on light backgrounds

## 3. Typography

### Primary Font: Solar United Natives
- **Usage**: Headings, display text
- **Weights**: Bold (700)
- **Fallback**: 'Poppins', sans-serif

### Secondary Font: Inter
- **Usage**: Body text, paragraphs, UI elements
- **Weights**: 300, 400, 500, 600
- **Fallback**: -apple-system, system-ui, sans-serif

### Type Scale
```
H1: 4.5rem (72px) - Main headline
H2: 3rem (48px) - Section headers
H3: 2rem (32px) - Subsection headers
H4: 1.5rem (24px) - Card titles
Body: 1.125rem (18px) - Main content
Small: 0.875rem (14px) - Captions, labels
```

## 4. Layout & Spacing

### Grid System
- 12-column responsive grid
- 1.5rem (24px) gutter width
- Max-width: 1440px for large screens
- 5% side margins on mobile, 10% on tablet, 15% on desktop

### Spacing Scale
```
xs: 0.25rem (4px)
sm: 0.5rem (8px)
md: 1rem (16px)
lg: 1.5rem (24px)
xl: 3rem (48px)
2xl: 4.5rem (72px)
```

## 5. UI Components

### Buttons
```
Primary:
- Background: #F59E0B
- Text: #111827
- Hover: #D97706
- Padding: 0.75rem 2rem
- Border radius: 9999px

Secondary:
- Background: transparent
- Border: 2px solid #F59E0B
- Text: #F59E0B
- Hover: rgba(245, 158, 11, 0.1)
```

### Cards
- Background: White/10 with backdrop-blur
- Border: 1px solid rgba(255, 255, 255, 0.1)
- Border radius: 1rem
- Box shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1)
- Hover effect: Scale(1.02), shadow-lg

## 6. Imagery

### Style
- Natural, warm color grading
- Slightly desaturated
- Soft shadows and highlights
- Organic, flowing compositions

### Usage
- Full-bleed hero images
- Rounded corners for thumbnails (0.75rem)
- Consistent aspect ratios (16:9, 4:3, 1:1)

## 7. Animations & Transitions

### Micro-interactions
- Button hover: Scale 1.05
- Card hover: TranslateY(-4px)
- Menu items: Fade in/up
- Page transitions: Fade 300ms

### Scroll Behavior
- Smooth scrolling
- Parallax effects for depth
- Lazy loading for images

## 8. Accessibility

### Contrast Ratios
- Normal text: 4.5:1 minimum
- Large text: 3:1 minimum
- UI components: 3:1 minimum

### Focus States
- Visible outline
- High contrast
- Keyboard navigation support

## 9. Implementation

### Tailwind Config
```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'festival': {
          purple: '#4A1D96',
          blue: '#1E40AF',
          gold: '#F59E0B',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'sans-serif'],
        display: ['Solar United Natives', 'sans-serif'],
      },
    },
  },
}
```

## 10. Do's and Don'ts

### Do
- Use the color palette consistently
- Maintain proper spacing
- Follow the typography scale
- Keep animations subtle and purposeful
- Ensure text is always readable

### Don't
- Use more than 3 type sizes on a single page
- Overwhelm with too many colors
- Use animation just for the sake of it
- Sacrifice readability for style

---
*Last Updated: May 27, 2025*
