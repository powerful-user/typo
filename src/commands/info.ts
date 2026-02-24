import chalk from 'chalk';
import { getManifestEntry } from '../config/manifest.js';
import { logger } from '../utils/logger.js';
import type { ManifestEntry } from '../types/manifest.js';

export async function showInfo(name: string, opts: { json?: boolean }): Promise<void> {
  const entry = await getManifestEntry(name);

  if (!entry) {
    logger.error(`Font "${name}" not found in library. Run "typo list" to see available fonts.`);
    process.exit(1);
  }

  if (opts.json) {
    console.log(JSON.stringify(entry, null, 2));
    return;
  }

  printInfo(entry);
}

function printInfo(entry: ManifestEntry): void {
  console.log();
  console.log(`  ${chalk.bold.white(entry.family)}`);
  console.log();
  logger.label('ID', entry.id);
  logger.label('Source', entry.source);
  logger.label('Path', entry.dirPath);
  logger.label('Weights', entry.weights.join(', '));
  logger.label('Styles', entry.styles.join(', '));

  if (entry.category) logger.label('Category', entry.category);
  if (entry.license) logger.label('License', entry.license);
  if (entry.subsets?.length) logger.label('Subsets', entry.subsets.join(', '));

  if (entry.variableAxes?.length) {
    logger.label('Variable', `Yes (axes: ${entry.variableAxes.join(', ')})`);
  }

  console.log();
  console.log(`  ${chalk.dim('Files:')}`);
  for (const file of entry.files) {
    const varLabel = file.variable ? chalk.cyan(' [var]') : '';
    console.log(`    ${file.filename} — ${file.format} · ${file.weight} ${file.style}${varLabel}`);
  }
  console.log();
}
