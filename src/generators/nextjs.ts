import { join } from 'node:path';
import { BaseGenerator, type ResolvedFont } from './base.js';

export class NextjsGenerator extends BaseGenerator {
  get outputPath(): string {
    return join(this.projectDir, 'src', 'fonts.ts');
  }

  generate(fonts: ResolvedFont[]): string {
    const imports = [`import localFont from 'next/font/local';`];
    const declarations: string[] = [];
    const exports: string[] = [];

    for (const font of fonts) {
      const varName = toCamelCase(font.config.name);
      const cssVar = font.config.cssVariable || `--font-${font.config.name}`;
      const display = font.config.display || 'swap';

      // Check if variable font
      const varFile = font.files.find(f => f.variable);

      if (varFile) {
        declarations.push(`
export const ${varName} = localFont({
  src: '${varFile.relativePath}',
  variable: '${cssVar}',
  display: '${display}',
});`);
      } else {
        const srcEntries = font.files.map(f => {
          return `    { path: '${f.relativePath}', weight: '${f.weight}', style: '${f.style}' }`;
        });

        declarations.push(`
export const ${varName} = localFont({
  src: [
${srcEntries.join(',\n')}
  ],
  variable: '${cssVar}',
  display: '${display}',
});`);
      }

      exports.push(varName);
    }

    return [
      imports.join('\n'),
      ...declarations,
      '',
    ].join('\n');
  }
}

function toCamelCase(str: string): string {
  return str.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}
