import { join } from 'node:path';
import { getManifestEntry } from '../config/manifest.js';
import { readProjectConfig, writeProjectConfig } from '../config/project.js';
import { getProjectFontDir } from '../config/paths.js';
import { createSymlink } from '../tools/symlink.js';
import { logger } from '../utils/logger.js';
import type { ProjectFont } from '../types/config.js';

export async function linkFont(
  name: string,
  opts: { weights?: string; variable?: boolean; display?: string; cssVariable?: string }
): Promise<void> {
  const config = await readProjectConfig();
  if (!config) {
    logger.error('No project config found. Run "typo init" first.');
    process.exit(1);
  }

  const entry = await getManifestEntry(name);
  if (!entry) {
    logger.error(`Font "${name}" not found in library. Run "typo list" to see available fonts.`);
    process.exit(1);
  }

  const requestedWeights = opts.weights
    ? opts.weights.split(',').map(w => parseInt(w.trim(), 10))
    : undefined;

  const fontDir = getProjectFontDir();
  let linkedCount = 0;

  for (const file of entry.files) {
    // Filter by variable preference
    if (opts.variable !== undefined) {
      if (opts.variable && !file.variable) continue;
      if (!opts.variable && file.variable) continue;
    }

    // Filter by weight
    if (requestedWeights && !file.variable && !requestedWeights.includes(file.weight)) {
      continue;
    }

    const sourcePath = join(entry.dirPath, file.filename);
    const targetPath = join(fontDir, file.filename);

    await createSymlink(sourcePath, targetPath, { relative: true });
    linkedCount++;
    logger.dim(`  ${file.filename}`);
  }

  if (linkedCount === 0) {
    logger.warn('No matching font files found with the given filters.');
    return;
  }

  // Update project config
  const existingIdx = config.fonts.findIndex(f => f.name === name);
  const projectFont: ProjectFont = {
    name,
    weights: requestedWeights,
    variable: opts.variable,
    display: (opts.display as ProjectFont['display']) || 'swap',
    cssVariable: opts.cssVariable || `--font-${name}`,
  };

  if (existingIdx >= 0) {
    config.fonts[existingIdx] = projectFont;
  } else {
    config.fonts.push(projectFont);
  }

  await writeProjectConfig(config);

  logger.success(`Linked ${entry.family} (${linkedCount} file${linkedCount === 1 ? '' : 's'}) to project`);
}
