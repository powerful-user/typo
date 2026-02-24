import { join } from 'node:path';
import { BaseGenerator, type ResolvedFont } from './base.js';

export class TailwindGenerator extends BaseGenerator {
  get outputPath(): string {
    return join(this.projectDir, 'src', 'fonts.css');
  }

  generate(fonts: ResolvedFont[]): string {
    const fontFaceRules: string[] = [];
    const themeVars: string[] = [];

    for (const font of fonts) {
      const display = font.config.display || 'swap';
      const cssVar = font.config.cssVariable || `--font-${font.config.name}`;

      for (const file of font.files) {
        const srcPath = file.relativePath.replace(/\\/g, '/');
        const formatStr = formatToCSS(file.format);

        if (file.variable) {
          const weightRange = `100 900`;
          fontFaceRules.push(`@font-face {
  font-family: '${font.manifest.family}';
  src: url('${srcPath}') format('${formatStr}');
  font-weight: ${weightRange};
  font-style: ${file.style};
  font-display: ${display};
}`);
        } else {
          fontFaceRules.push(`@font-face {
  font-family: '${font.manifest.family}';
  src: url('${srcPath}') format('${formatStr}');
  font-weight: ${file.weight};
  font-style: ${file.style};
  font-display: ${display};
}`);
        }
      }

      // Map common font roles to Tailwind theme variables
      themeVars.push(`  ${cssVar}: '${font.manifest.family}', sans-serif;`);
    }

    const parts = [...fontFaceRules];

    if (themeVars.length > 0) {
      parts.push('');
      parts.push(`@theme {`);
      parts.push(...themeVars);
      parts.push(`}`);
    }

    return parts.join('\n\n') + '\n';
  }
}

function formatToCSS(format: string): string {
  switch (format) {
    case 'woff2': return 'woff2';
    case 'woff': return 'woff';
    case 'ttf': return 'truetype';
    case 'otf': return 'opentype';
    default: return format;
  }
}
