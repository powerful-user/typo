import chalk from 'chalk';
import { listManifestEntries } from '../config/manifest.js';
import { readProjectConfig } from '../config/project.js';
import { logger } from '../utils/logger.js';

export async function listFonts(opts: { project?: boolean; json?: boolean }): Promise<void> {
  if (opts.project) {
    return listProjectFonts(opts.json);
  }
  return listLibraryFonts(opts.json);
}

async function listLibraryFonts(json?: boolean): Promise<void> {
  const entries = await listManifestEntries();

  if (entries.length === 0) {
    logger.info('No fonts in library. Use "typo add" to add fonts.');
    return;
  }

  if (json) {
    console.log(JSON.stringify(entries, null, 2));
    return;
  }

  logger.info(`${entries.length} font${entries.length === 1 ? '' : 's'} in library:\n`);

  for (const entry of entries) {
    const varLabel = entry.variableAxes?.length ? chalk.cyan(' [variable]') : '';
    const weightsStr = entry.weights.join(', ');
    console.log(`  ${chalk.bold(entry.family)}${varLabel}`);
    console.log(`  ${chalk.dim(`${entry.source} · ${entry.files.length} files · weights: ${weightsStr}`)}`);
    console.log();
  }
}

async function listProjectFonts(json?: boolean): Promise<void> {
  const config = await readProjectConfig();
  if (!config) {
    logger.error('No project config found. Run "typo init" first.');
    process.exit(1);
  }

  if (config.fonts.length === 0) {
    logger.info('No fonts linked to this project. Use "typo link" to add fonts.');
    return;
  }

  if (json) {
    console.log(JSON.stringify(config.fonts, null, 2));
    return;
  }

  logger.info(`${config.fonts.length} font${config.fonts.length === 1 ? '' : 's'} in project:\n`);

  for (const font of config.fonts) {
    const varLabel = font.variable ? chalk.cyan(' [variable]') : '';
    const weightsStr = font.weights?.join(', ') || 'all';
    console.log(`  ${chalk.bold(font.name)}${varLabel}`);
    console.log(`  ${chalk.dim(`weights: ${weightsStr} · display: ${font.display || 'swap'}`)}`);
    console.log();
  }
}
