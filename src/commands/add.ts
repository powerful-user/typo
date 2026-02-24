import { existsSync } from 'node:fs';
import { copyFile, readdir, stat } from 'node:fs/promises';
import { basename, join, resolve } from 'node:path';
import { readGlobalConfig } from '../config/global.js';
import { setManifestEntry } from '../config/manifest.js';
import { getFontFamilyDir } from '../config/paths.js';
import { readFontMetadata } from '../fonts/metadata.js';
import { isFontFile, getFormat } from '../fonts/formats.js';
import { downloadFromFontsource } from '../fonts/download.js';
import { ensureDir } from '../utils/fs.js';
import { logger } from '../utils/logger.js';
import type { ManifestEntry, FontFileEntry } from '../types/manifest.js';

export async function addFont(name: string, opts: { from?: string; weights?: string; subset?: string }): Promise<void> {
  const config = await readGlobalConfig();
  if (!config) {
    logger.error('Global config not found. Run "typo init --global" first.');
    process.exit(1);
  }

  if (opts.from) {
    await addFromLocal(name, opts.from);
  } else {
    await addFromFontsource(name, opts);
  }
}

export async function addFromLocal(nameOrPath: string, fromPath: string): Promise<void> {
  const config = await readGlobalConfig();
  if (!config) {
    logger.error('Global config not found. Run "typo init --global" first.');
    process.exit(1);
  }

  const resolvedPath = resolve(fromPath);
  if (!existsSync(resolvedPath)) {
    logger.error(`Path not found: ${resolvedPath}`);
    process.exit(1);
  }

  const pathStat = await stat(resolvedPath);
  const fontFiles: string[] = [];

  if (pathStat.isDirectory()) {
    const entries = await readdir(resolvedPath);
    for (const entry of entries) {
      if (isFontFile(entry)) {
        fontFiles.push(join(resolvedPath, entry));
      }
    }
  } else if (pathStat.isFile() && isFontFile(resolvedPath)) {
    fontFiles.push(resolvedPath);
  }

  if (fontFiles.length === 0) {
    logger.error('No font files found at the specified path.');
    process.exit(1);
  }

  const firstMeta = await readFontMetadata(fontFiles[0]);
  const familyId = nameOrPath || firstMeta.family.toLowerCase().replace(/\s+/g, '-');
  const familyDir = getFontFamilyDir(familyId);
  await ensureDir(familyDir);

  const files: FontFileEntry[] = [];
  const weights = new Set<number>();
  const styles = new Set<'normal' | 'italic'>();
  let hasVariable = false;
  let variableAxes: string[] = [];

  for (const fontFile of fontFiles) {
    const metadata = await readFontMetadata(fontFile);
    const filename = basename(fontFile);
    const destPath = join(familyDir, filename);

    await copyFile(fontFile, destPath);

    const format = getFormat(filename);
    if (!format) continue;

    files.push({
      filename,
      format,
      weight: metadata.weight,
      style: metadata.style,
      variable: metadata.variable || undefined,
    });

    weights.add(metadata.weight);
    styles.add(metadata.style);

    if (metadata.variable) {
      hasVariable = true;
      if (metadata.variableAxes) {
        variableAxes = metadata.variableAxes.map(a => a.tag);
      }
    }
  }

  const entry: ManifestEntry = {
    id: familyId,
    family: firstMeta.family,
    source: 'local',
    dirPath: familyDir,
    files,
    weights: Array.from(weights).sort((a, b) => a - b),
    styles: Array.from(styles),
    variableAxes: hasVariable ? variableAxes : undefined,
  };

  await setManifestEntry(familyId, entry);

  logger.success(`Added ${firstMeta.family} (${files.length} file${files.length === 1 ? '' : 's'}) to library`);
  for (const file of files) {
    const varLabel = file.variable ? ' [variable]' : '';
    logger.dim(`  ${file.filename} — ${file.weight} ${file.style}${varLabel}`);
  }
}

async function addFromFontsource(name: string, opts: { weights?: string; subset?: string }): Promise<void> {
  if (!name) {
    logger.error('Font name is required. Use "typo search <query>" to find fonts.');
    process.exit(1);
  }

  const fontId = name.toLowerCase().replace(/\s+/g, '-');
  const weights = opts.weights
    ? opts.weights.split(',').map(w => parseInt(w.trim(), 10))
    : undefined;

  logger.info(`Downloading ${fontId} from Fontsource...`);

  try {
    const entry = await downloadFromFontsource(fontId, {
      subset: opts.subset,
      weights,
    });

    await setManifestEntry(entry.id, entry);

    logger.success(`Added ${entry.family} (${entry.files.length} file${entry.files.length === 1 ? '' : 's'}) to library`);
  } catch (error) {
    logger.error(`Failed to download font "${fontId}". Check the name with "typo search ${name}".`);
    if (error instanceof Error) {
      logger.dim(`  ${error.message}`);
    }
    process.exit(1);
  }
}
