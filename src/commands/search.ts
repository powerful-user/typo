import chalk from 'chalk';
import { searchFonts } from '../fontsource/search.js';
import { logger } from '../utils/logger.js';

export async function searchCommand(query: string, opts: { json?: boolean; limit?: string }): Promise<void> {
  if (!query) {
    logger.error('Search query is required.');
    process.exit(1);
  }

  const limit = opts.limit ? parseInt(opts.limit, 10) : 20;

  logger.info(`Searching Fontsource for "${query}"...`);

  const results = await searchFonts(query);
  const limited = results.slice(0, limit);

  if (limited.length === 0) {
    logger.warn(`No fonts found matching "${query}".`);
    return;
  }

  if (opts.json) {
    console.log(JSON.stringify(limited, null, 2));
    return;
  }

  console.log();
  for (const font of limited) {
    const varLabel = font.variable ? chalk.cyan(' [variable]') : '';
    const weightsStr = font.weights.join(', ');
    console.log(`  ${chalk.bold(font.family)}${varLabel} ${chalk.dim(`(${font.id})`)}`);
    console.log(`  ${chalk.dim(`${font.category} · ${font.license} · weights: ${weightsStr}`)}`);
    console.log();
  }

  if (results.length > limit) {
    logger.dim(`  ...and ${results.length - limit} more. Use --limit to see more.`);
  }
}
