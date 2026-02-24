# Framework-Specific Generation Details

## Next.js

**Output**: `src/fonts.ts`

Uses `next/font/local` for optimal performance (automatic font subsetting, zero layout shift).

### Variable font example
```typescript
import localFont from 'next/font/local';

export const inter = localFont({
  src: '../fonts/Inter-Variable.woff2',
  variable: '--font-inter',
  display: 'swap',
});
```

### Static font example
```typescript
import localFont from 'next/font/local';

export const roboto = localFont({
  src: [
    { path: '../fonts/Roboto-Regular.woff2', weight: '400', style: 'normal' },
    { path: '../fonts/Roboto-Bold.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-roboto',
  display: 'swap',
});
```

### Usage in layout.tsx
```tsx
import { inter } from './fonts';

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
```

---

## CSS / Vite

**Output**: `src/fonts.css`

Standard `@font-face` declarations. Works with Vite, vanilla HTML, or any bundler.

### Example output
```css
@font-face {
  font-family: 'Inter';
  src: url('../fonts/Inter-Variable.woff2') format('woff2');
  font-weight: 100 900;
  font-style: normal;
  font-display: swap;
}
```

### Usage
```html
<link rel="stylesheet" href="/src/fonts.css">
```
```css
body { font-family: 'Inter', sans-serif; }
```

---

## Tailwind v4

**Output**: `src/fonts.css`

Generates `@font-face` rules plus a `@theme` block for Tailwind CSS v4 custom properties.

### Example output
```css
@font-face {
  font-family: 'Inter';
  src: url('../fonts/Inter-Variable.woff2') format('woff2');
  font-weight: 100 900;
  font-style: normal;
  font-display: swap;
}

@theme {
  --font-inter: 'Inter', sans-serif;
}
```

### Usage
```html
<p class="font-inter">Text with Inter font</p>
```

Import the generated CSS in your main stylesheet:
```css
@import "tailwindcss";
@import "./fonts.css";
```

---

## Flutter

**Output**: Merges into `pubspec.yaml`

Generates the `fonts:` section under `flutter:` in pubspec.yaml.

### Example output
```yaml
flutter:
  fonts:
    - family: Inter
      fonts:
        - asset: fonts/Inter-Regular.woff2
        - asset: fonts/Inter-Bold.woff2
          weight: 700
```

### Usage
```dart
Text(
  'Hello',
  style: TextStyle(fontFamily: 'Inter'),
)
```

**Note**: Flutter requires font files to be committed to the repo (no symlinks). Copy files instead of linking for Flutter projects.
