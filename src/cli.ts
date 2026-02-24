import { Command } from 'commander';
import { initGlobal, initProject } from './commands/init.js';
import { addFont } from './commands/add.js';
import { listFonts } from './commands/list.js';
import { showInfo } from './commands/info.js';
import { linkFont } from './commands/link.js';
import { generateConfig } from './commands/generate.js';
import { searchCommand } from './commands/search.js';
import { subsetCommand } from './commands/subset.js';
import { convertCommand } from './commands/convert.js';

const program = new Command();

program
  .name('typo')
  .description('Font management CLI for web and mobile projects')
  .version('0.1.0');

program
  .command('init')
  .description('Initialize typo configuration')
  .option('--global', 'Initialize global font library (~/.typo/)')
  .action(async (opts: { global?: boolean }) => {
    if (opts.global) {
      await initGlobal();
    } else {
      await initProject();
    }
  });

program
  .command('add [name]')
  .description('Add a font to the library (from Fontsource or local path)')
  .option('--from <path>', 'Path to local font file or directory')
  .option('--weights <weights>', 'Comma-separated weights to download (e.g. 400,700)')
  .option('--subset <subset>', 'Subset to download (default: latin)')
  .action(async (name: string | undefined, opts: { from?: string; weights?: string; subset?: string }) => {
    await addFont(name || '', opts);
  });

program
  .command('link <name>')
  .description('Link a font from library to the current project')
  .option('--weights <weights>', 'Comma-separated weights (e.g. 400,700)')
  .option('--variable', 'Link only variable font files')
  .option('--display <value>', 'Font-display value (default: swap)')
  .option('--css-variable <name>', 'CSS variable name (default: --font-<name>)')
  .action(async (name: string, opts: { weights?: string; variable?: boolean; display?: string; cssVariable?: string }) => {
    await linkFont(name, opts);
  });

program
  .command('list')
  .description('List fonts in library or project')
  .option('--project', 'List project fonts instead of library')
  .option('--json', 'Output as JSON')
  .action(async (opts: { project?: boolean; json?: boolean }) => {
    await listFonts(opts);
  });

program
  .command('info <name>')
  .description('Show detailed information about a font')
  .option('--json', 'Output as JSON')
  .action(async (name: string, opts: { json?: boolean }) => {
    await showInfo(name, opts);
  });

program
  .command('generate')
  .description('Generate framework-specific font configuration')
  .option('--framework <id>', 'Override framework detection (nextjs, tailwind-v4, css, flutter)')
  .action(async (opts: { framework?: string }) => {
    await generateConfig(opts);
  });

program
  .command('search <query>')
  .description('Search Fontsource catalog for fonts')
  .option('--json', 'Output as JSON')
  .option('--limit <n>', 'Maximum results to show (default: 20)')
  .action(async (query: string, opts: { json?: boolean; limit?: string }) => {
    await searchCommand(query, opts);
  });

program
  .command('subset <name>')
  .description('Subset a font (output to .fonts/)')
  .option('--preset <name>', 'Unicode range preset (latin, cyrillic, greek, etc.)')
  .option('--unicodes <ranges>', 'Custom Unicode ranges (e.g. U+0000-00FF)')
  .option('--text <text>', 'Subset to only characters in this text')
  .option('--format <fmt>', 'Output format (default: woff2)')
  .action(async (name: string, opts: { preset?: string; unicodes?: string; text?: string; format?: string }) => {
    await subsetCommand(name, opts);
  });

program
  .command('convert <name>')
  .description('Convert font format (output to .fonts/)')
  .option('--format <fmt>', 'Target format (woff2, woff, ttf, otf)')
  .action(async (name: string, opts: { format?: string }) => {
    await convertCommand(name, opts);
  });

program.parse();
