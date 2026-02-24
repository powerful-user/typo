import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { join, basename } from 'node:path';
import { existsSync } from 'node:fs';
import { getProjectBuildDir } from '../config/paths.js';
import { ensureDir } from '../utils/fs.js';

const execFileAsync = promisify(execFile);

// Common Unicode range presets
export const SUBSET_PRESETS: Record<string, string> = {
  'latin': 'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0300-0301,U+0304,U+0306-0307,U+030A,U+030C,U+0312,U+0326-0328,U+0338,U+2000-206F,U+2074,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD',
  'latin-ext': 'U+0100-02AF,U+0300-036F,U+0370-03FF,U+1E00-1EFF,U+2000-206F,U+20A0-20CF,U+2100-214F,U+2150-218F,U+2C60-2C7F,U+A720-A7FF',
  'cyrillic': 'U+0301,U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116',
  'cyrillic-ext': 'U+0460-052F,U+1C80-1C88,U+20B4,U+2DE0-2DFF,U+A640-A69F,U+FE2E-FE2F',
  'greek': 'U+0370-03FF',
  'greek-ext': 'U+1F00-1FFF',
  'vietnamese': 'U+0102-0103,U+0110-0111,U+0128-0129,U+0168-0169,U+01A0-01A1,U+01AF-01B0,U+0300-0301,U+0303-0304,U+0308-0309,U+0323,U+0329,U+1EA0-1EF9,U+20AB',
};

export async function checkPyftsubset(): Promise<boolean> {
  try {
    await execFileAsync('pyftsubset', ['--help']);
    return true;
  } catch {
    return false;
  }
}

export interface SubsetOptions {
  inputPath: string;
  preset?: string;
  unicodes?: string;
  text?: string;
  outputFormat?: 'woff2' | 'woff' | 'ttf';
  projectDir?: string;
}

export async function subsetFont(opts: SubsetOptions): Promise<string> {
  const available = await checkPyftsubset();
  if (!available) {
    throw new Error('pyftsubset not found. Install it with: pip install fonttools brotli');
  }

  const outputFormat = opts.outputFormat || 'woff2';
  const buildDir = getProjectBuildDir(opts.projectDir);
  await ensureDir(buildDir);

  const inputName = basename(opts.inputPath, '.woff2')
    .replace('.woff', '')
    .replace('.ttf', '')
    .replace('.otf', '');

  let suffix = '';
  const args: string[] = [opts.inputPath];

  if (opts.preset) {
    const unicodes = SUBSET_PRESETS[opts.preset];
    if (!unicodes) {
      throw new Error(`Unknown preset: ${opts.preset}. Available: ${Object.keys(SUBSET_PRESETS).join(', ')}`);
    }
    args.push(`--unicodes=${unicodes}`);
    suffix = `-subset-${opts.preset}`;
  } else if (opts.unicodes) {
    args.push(`--unicodes=${opts.unicodes}`);
    suffix = '-subset-custom';
  } else if (opts.text) {
    args.push(`--text=${opts.text}`);
    suffix = '-subset-text';
  }

  const outputFilename = `${inputName}${suffix}.${outputFormat}`;
  const outputPath = join(buildDir, outputFilename);

  args.push(`--output-file=${outputPath}`);
  args.push(`--flavor=${outputFormat === 'ttf' ? '' : outputFormat}`);
  args.push('--layout-features=*');
  args.push('--no-hinting');
  args.push('--desubroutinize');

  // Remove empty flavor arg for ttf
  const filteredArgs = args.filter(a => a !== '--flavor=');

  await execFileAsync('pyftsubset', filteredArgs);

  return outputPath;
}
