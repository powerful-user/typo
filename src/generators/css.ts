import { join } from 'node:path';
import { BaseGenerator, type ResolvedFont } from './base.js';

export class CssGenerator extends BaseGenerator {
  get outputPath(): string {
    return join(this.projectDir, 'src', 'fonts.css');
  }

  generate(fonts: ResolvedFont[]): string {
    const rules: string[] = [];

    for (const font of fonts) {
      const display = font.config.display || 'swap';

      for (const file of font.files) {
        const srcPath = file.relativePath.replace(/\\/g, '/');
        const formatStr = formatToCSS(file.format);

        if (file.variable) {
          // Variable font: use weight range from manifest
          const wghtAxis = font.manifest.variableAxes?.includes('wght');
          const weightRange = wghtAxis
            ? `${Math.min(...font.manifest.weights)} ${Math.max(...font.manifest.weights)}`
            : `100 900`;

          rules.push(`@font-face {
  font-family: '${font.manifest.family}';
  src: url('${srcPath}') format('${formatStr}');
  font-weight: ${weightRange};
  font-style: ${file.style};
  font-display: ${display};
}`);
        } else {
          rules.push(`@font-face {
  font-family: '${font.manifest.family}';
  src: url('${srcPath}') format('${formatStr}');
  font-weight: ${file.weight};
  font-style: ${file.style};
  font-display: ${display};
}`);
        }
      }
    }

    return rules.join('\n\n') + '\n';
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
