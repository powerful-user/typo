import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { existsSync } from 'node:fs';
import type { FrameworkId } from '../types/config.js';

interface Signal {
  framework: FrameworkId;
  weight: number;
}

export async function detectFramework(projectDir?: string): Promise<FrameworkId> {
  const dir = projectDir || process.cwd();
  const signals: Signal[] = [];

  // Check pubspec.yaml for Flutter
  const pubspecPath = join(dir, 'pubspec.yaml');
  if (existsSync(pubspecPath)) {
    try {
      const content = await readFile(pubspecPath, 'utf-8');
      if (content.includes('flutter:')) {
        signals.push({ framework: 'flutter', weight: 10 });
      }
    } catch {}
  }

  // Check package.json for JS frameworks
  const pkgPath = join(dir, 'package.json');
  if (existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(await readFile(pkgPath, 'utf-8'));
      const allDeps = {
        ...pkg.dependencies,
        ...pkg.devDependencies,
      };

      if (allDeps['next']) {
        signals.push({ framework: 'nextjs', weight: 9 });
      }

      if (allDeps['tailwindcss']) {
        // Check if it's v4
        const twVersion = allDeps['tailwindcss'];
        if (twVersion && (twVersion.startsWith('4') || twVersion.startsWith('^4') || twVersion.startsWith('~4'))) {
          signals.push({ framework: 'tailwind-v4', weight: 8 });
        }
      }

      // Check for @tailwindcss/* plugins (v4 indicator)
      for (const dep of Object.keys(allDeps)) {
        if (dep.startsWith('@tailwindcss/')) {
          signals.push({ framework: 'tailwind-v4', weight: 8 });
          break;
        }
      }

      if (allDeps['vite']) {
        signals.push({ framework: 'vite', weight: 5 });
      }
    } catch {}
  }

  // Check CSS files for Tailwind v4 @import
  const cssFiles = ['src/app/globals.css', 'src/globals.css', 'src/index.css', 'styles/globals.css', 'app/globals.css'];
  for (const cssFile of cssFiles) {
    const cssPath = join(dir, cssFile);
    if (existsSync(cssPath)) {
      try {
        const content = await readFile(cssPath, 'utf-8');
        if (content.includes('@import "tailwindcss"') || content.includes("@import 'tailwindcss'")) {
          signals.push({ framework: 'tailwind-v4', weight: 7 });
          break;
        }
      } catch {}
    }
  }

  if (signals.length === 0) {
    return 'unknown';
  }

  // Sort by weight descending, resolve conflicts
  signals.sort((a, b) => b.weight - a.weight);

  // Next.js + Tailwind -> nextjs (handles both)
  const hasNextjs = signals.some(s => s.framework === 'nextjs');
  const hasTailwind = signals.some(s => s.framework === 'tailwind-v4');
  if (hasNextjs && hasTailwind) {
    return 'nextjs';
  }

  return signals[0].framework;
}
