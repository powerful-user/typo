import { join } from 'node:path';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { BaseGenerator, type ResolvedFont } from './base.js';

export class FlutterGenerator extends BaseGenerator {
  get outputPath(): string {
    return join(this.projectDir, 'pubspec.yaml');
  }

  generate(fonts: ResolvedFont[]): string {
    // Generate the fonts YAML section
    const lines: string[] = [];
    lines.push('  fonts:');

    for (const font of fonts) {
      lines.push(`    - family: ${font.manifest.family}`);
      lines.push('      fonts:');

      for (const file of font.files) {
        const assetPath = `fonts/${file.filename}`;
        lines.push(`        - asset: ${assetPath}`);
        if (file.weight !== 400) {
          lines.push(`          weight: ${file.weight}`);
        }
        if (file.style === 'italic') {
          lines.push(`          style: italic`);
        }
      }
    }

    return lines.join('\n') + '\n';
  }

  async mergeIntoPubspec(): Promise<string> {
    const pubspecPath = this.outputPath;
    if (!existsSync(pubspecPath)) {
      throw new Error('pubspec.yaml not found');
    }

    const content = await readFile(pubspecPath, 'utf-8');
    const fonts = await this.resolveFonts();
    const fontsSection = this.generate(fonts);

    // Find and replace existing fonts section under flutter:
    const flutterIdx = content.indexOf('flutter:');
    if (flutterIdx === -1) {
      return content + '\nflutter:\n' + fontsSection;
    }

    // Find existing fonts: section
    const fontsIdx = content.indexOf('  fonts:', flutterIdx);
    if (fontsIdx === -1) {
      // Insert before the end of flutter section
      const nextTopLevel = content.indexOf('\n', flutterIdx + 'flutter:\n'.length);
      const insertAt = nextTopLevel === -1 ? content.length : nextTopLevel;
      return content.slice(0, insertAt) + '\n' + fontsSection + content.slice(insertAt);
    }

    // Find end of fonts section (next non-indented or section at same level)
    let endIdx = fontsIdx + 1;
    const lines = content.slice(fontsIdx).split('\n');
    let pastFirst = false;
    for (const line of lines) {
      if (pastFirst && line.length > 0 && !line.startsWith('    ') && !line.startsWith('\t\t')) {
        break;
      }
      pastFirst = true;
      endIdx += line.length + 1;
    }

    return content.slice(0, fontsIdx) + fontsSection + content.slice(fontsIdx + endIdx - 1);
  }
}
