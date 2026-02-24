# Framework Usage Patterns

Load this file after `typo generate` to show the user how to wire up the generated config in their specific framework. Each section shows the generated output AND the integration code.

## Next.js

**Generated**: `src/fonts.ts`

```typescript
// Variable font (preferred)
import localFont from 'next/font/local';

export const inter = localFont({
  src: '../fonts/Inter-Variable.woff2',
  variable: '--font-inter',
  display: 'swap',
});

// Static weights
export const roboto = localFont({
  src: [
    { path: '../fonts/Roboto-Regular.woff2', weight: '400', style: 'normal' },
    { path: '../fonts/Roboto-Bold.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-roboto',
  display: 'swap',
});
```

**Integration** — `app/layout.tsx`:
```tsx
import { inter } from './fonts';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
```

Then use in CSS/Tailwind: `font-family: var(--font-inter)` or with Tailwind v4 `@theme { --font-sans: var(--font-inter); }`.

**Gotcha**: Next.js auto-subsets fonts at build time — do NOT run `typo subset` for Next.js projects. It's redundant and the generated subset may conflict with Next.js's own optimization.

---

## Tailwind v4

**Generated**: `src/fonts.css`

```css
@font-face {
  font-family: 'Inter';
  src: url('../fonts/Inter-Variable.woff2') format('woff2');
  font-weight: 100 900;
  font-style: normal;
  font-display: swap;
}

@theme {
  --font-sans: 'Inter', sans-serif;
}
```

**Integration** — main CSS file (e.g., `src/app/globals.css`):
```css
@import "tailwindcss";
@import "./fonts.css";
```

Order matters: `@import "./fonts.css"` MUST come AFTER `@import "tailwindcss"` so the `@theme` block extends (not gets overwritten by) the default theme.

**Gotcha**: The `@theme` variable name controls the utility class. `--font-sans` maps to `font-sans`, `--font-mono` maps to `font-mono`. If the user wants `font-heading`, the CSS variable must be `--font-heading`.

---

## CSS / Vite

**Generated**: `src/fonts.css`

```css
@font-face {
  font-family: 'Inter';
  src: url('../fonts/Inter-Variable.woff2') format('woff2');
  font-weight: 100 900;
  font-style: normal;
  font-display: swap;
}
```

**Integration**:
```html
<!-- In HTML -->
<link rel="stylesheet" href="/src/fonts.css">
```
```css
/* In CSS */
body { font-family: 'Inter', sans-serif; }
```
```js
// In Vite/JS entry
import './fonts.css';
```

---

## Flutter

**Generated**: merges into `pubspec.yaml`

```yaml
flutter:
  fonts:
    - family: Inter
      fonts:
        - asset: fonts/Inter-Regular.woff2
        - asset: fonts/Inter-Bold.woff2
          weight: 700
        - asset: fonts/Inter-Italic.woff2
          style: italic
```

**Integration**:
```dart
Text(
  'Hello',
  style: TextStyle(fontFamily: 'Inter', fontWeight: FontWeight.w700),
)
```

**Critical**: Flutter CANNOT use symlinks — the build system resolves them and may fail. For Flutter projects, copy font files directly into `fonts/` instead of using `typo link`. After adding to library: `cp ~/.typo/fonts/inter/* fonts/`.

**Gotcha**: Flutter only supports `.ttf` and `.otf` for mobile builds. If you added `.woff2` files, run `typo convert <name> --format ttf` first, then copy the `.fonts/*.ttf` files.
