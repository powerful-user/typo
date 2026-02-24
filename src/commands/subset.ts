import { join } from 'node:path';
import { existsSync } from 'node:fs';
import { getManifestEntry } from '../config/manifest.js';
import { subsetFont, checkPyftsubset, SUBSET_PRESETS } from '../tools/subset.js';
import { logger } from '../utils/logger.js';
import { stat } from 'node:fs/promises';

export async function subsetCommand(
  name: string,
  opts: { preset?: string; unicodes?: string; text?: string; format?: string }
): Promise<void> {
  if (!opts.preset && !opts.unicodes && !opts.text) {
    logger.error('Specify --preset, --unicodes, or --text for subsetting.');
    logger.dim(`  Available presets: ${Object.keys(SUBSET_PRESETS).join(', ')}`);
    process.exit(1);
  }

  const available = await checkPyftsubset();
  if (!available) {
    logger.error('pyftsubset not found. Install with: pip install fonttools brotli');
    process.exit(1);
  }

  const entry = await getManifestEntry(name);
  if (!entry) {
    logger.error(`Font "${name}" not found in library.`);
    process.exit(1);
  }

  let subsetCount = 0;
  for (const file of entry.files) {
    const inputPath = join(entry.dirPath, file.filename);
    if (!existsSync(inputPath)) {
      logger.warn(`File not found: ${inputPath}`);
      continue;
    }

    try {
      const outputPath = await subsetFont({
        inputPath,
        preset: opts.preset,
        unicodes: opts.unicodes,
        text: opts.text,
        outputFormat: (opts.format as 'woff2' | 'woff' | 'ttf') || 'woff2',
      });

      const outputStat = await stat(outputPath);
      const inputStat = await stat(inputPath);
      const savings = Math.round((1 - outputStat.size / inputStat.size) * 100);

      logger.dim(`  ${file.filename} → ${outputPath} (${savings}% smaller)`);
      subsetCount++;
    } catch (error) {
      logger.warn(`Failed to subset ${file.filename}: ${error instanceof Error ? error.message : error}`);
    }
  }

  if (subsetCount > 0) {
    logger.success(`Subset ${subsetCount} file${subsetCount === 1 ? '' : 's'} to .fonts/`);
  }
}
