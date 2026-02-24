import { join } from 'node:path';
import { existsSync } from 'node:fs';
import { stat } from 'node:fs/promises';
import { getManifestEntry } from '../config/manifest.js';
import { convertFont, checkFonttools, type ConvertFormat } from '../tools/convert.js';
import { logger } from '../utils/logger.js';

const VALID_FORMATS: ConvertFormat[] = ['woff2', 'woff', 'ttf', 'otf'];

export async function convertCommand(
  name: string,
  opts: { format?: string }
): Promise<void> {
  if (!opts.format) {
    logger.error('Specify --format (woff2, woff, ttf, otf).');
    process.exit(1);
  }

  if (!VALID_FORMATS.includes(opts.format as ConvertFormat)) {
    logger.error(`Invalid format "${opts.format}". Valid: ${VALID_FORMATS.join(', ')}`);
    process.exit(1);
  }

  const available = await checkFonttools();
  if (!available) {
    logger.error('fonttools not found. Install with: pip install fonttools brotli');
    process.exit(1);
  }

  const entry = await getManifestEntry(name);
  if (!entry) {
    logger.error(`Font "${name}" not found in library.`);
    process.exit(1);
  }

  let convertCount = 0;
  for (const file of entry.files) {
    if (file.format === opts.format) {
      logger.dim(`  ${file.filename} already in ${opts.format}, skipping`);
      continue;
    }

    const inputPath = join(entry.dirPath, file.filename);
    if (!existsSync(inputPath)) {
      logger.warn(`File not found: ${inputPath}`);
      continue;
    }

    try {
      const outputPath = await convertFont({
        inputPath,
        format: opts.format as ConvertFormat,
      });

      const outputStat = await stat(outputPath);
      const sizeKb = Math.round(outputStat.size / 1024);

      logger.dim(`  ${file.filename} → ${outputPath} (${sizeKb} KB)`);
      convertCount++;
    } catch (error) {
      logger.warn(`Failed to convert ${file.filename}: ${error instanceof Error ? error.message : error}`);
    }
  }

  if (convertCount > 0) {
    logger.success(`Converted ${convertCount} file${convertCount === 1 ? '' : 's'} to ${opts.format}`);
  }
}
