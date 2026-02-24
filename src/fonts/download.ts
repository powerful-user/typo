import { join } from 'node:path';
import { writeFile } from 'node:fs/promises';
import { getFontDetail } from '../fontsource/api.js';
import { getFontFamilyDir } from '../config/paths.js';
import { ensureDir } from '../utils/fs.js';
import { httpGetBuffer } from '../utils/http.js';
import { logger } from '../utils/logger.js';
import type { FontFileEntry, ManifestEntry } from '../types/manifest.js';

const CDN_BASE = 'https://cdn.jsdelivr.net/fontsource/fonts';

export async function downloadFromFontsource(
  fontId: string,
  opts?: { subset?: string; weights?: number[]; format?: 'woff2' | 'woff' }
): Promise<ManifestEntry> {
  const detail = await getFontDetail(fontId);
  const format = opts?.format || 'woff2';
  const subset = opts?.subset || detail.defSubset || 'latin';
  const weights = opts?.weights || detail.weights;

  const familyDir = getFontFamilyDir(fontId);
  await ensureDir(familyDir);

  const files: FontFileEntry[] = [];
  const downloadedWeights = new Set<number>();
  const styles: Set<'normal' | 'italic'> = new Set();

  // Download variable font if available
  if (detail.variable) {
    try {
      const url = `${CDN_BASE}/${fontId}:vf@latest/${subset}-wght-normal.${format}`;
      const buffer = await httpGetBuffer(url);
      const filename = `${detail.family.replace(/\s+/g, '-')}-Variable.${format}`;
      await writeFile(join(familyDir, filename), buffer);

      files.push({
        filename,
        format,
        weight: 400,
        style: 'normal',
        variable: true,
      });
      styles.add('normal');
      logger.dim(`  ${filename} [variable]`);
    } catch {
      logger.warn('Variable font not available, downloading static weights.');
    }
  }

  // Download static weights
  for (const weight of weights) {
    for (const style of ['normal', 'italic'] as const) {
      // Check if this variant exists
      if (!detail.variants?.[style]?.[String(weight)]?.[subset]) continue;

      try {
        const url = `${CDN_BASE}/${fontId}@latest/${subset}-${weight}-${style}.${format}`;
        const buffer = await httpGetBuffer(url);
        const styleSuffix = style === 'italic' ? '-Italic' : '';
        const filename = `${detail.family.replace(/\s+/g, '-')}-${weightToName(weight)}${styleSuffix}.${format}`;
        await writeFile(join(familyDir, filename), buffer);

        files.push({
          filename,
          format,
          weight,
          style,
        });
        downloadedWeights.add(weight);
        styles.add(style);
        logger.dim(`  ${filename}`);
      } catch {
        // Variant not available for this subset/format
      }
    }
  }

  return {
    id: fontId,
    family: detail.family,
    source: 'fontsource',
    dirPath: familyDir,
    files,
    weights: Array.from(downloadedWeights).sort((a, b) => a - b),
    styles: Array.from(styles),
    category: detail.category,
    license: detail.license,
    variableAxes: detail.variable ? ['wght'] : undefined,
    subsets: detail.subsets,
  };
}

function weightToName(weight: number): string {
  const map: Record<number, string> = {
    100: 'Thin',
    200: 'ExtraLight',
    300: 'Light',
    400: 'Regular',
    500: 'Medium',
    600: 'SemiBold',
    700: 'Bold',
    800: 'ExtraBold',
    900: 'Black',
  };
  return map[weight] || String(weight);
}
