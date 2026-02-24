import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { join, basename } from 'node:path';
import { getProjectBuildDir } from '../config/paths.js';
import { ensureDir } from '../utils/fs.js';

const execFileAsync = promisify(execFile);

export async function checkFonttools(): Promise<boolean> {
  try {
    await execFileAsync('fonttools', ['--help']);
    return true;
  } catch {
    // Try python -m fontTools as fallback
    try {
      await execFileAsync('python3', ['-m', 'fontTools', '--help']);
      return true;
    } catch {
      return false;
    }
  }
}

export type ConvertFormat = 'woff2' | 'woff' | 'ttf' | 'otf';

export interface ConvertOptions {
  inputPath: string;
  format: ConvertFormat;
  projectDir?: string;
}

export async function convertFont(opts: ConvertOptions): Promise<string> {
  const buildDir = getProjectBuildDir(opts.projectDir);
  await ensureDir(buildDir);

  const inputName = basename(opts.inputPath)
    .replace(/\.(woff2|woff|ttf|otf)$/i, '');

  const outputFilename = `${inputName}.${opts.format}`;
  const outputPath = join(buildDir, outputFilename);

  // Use pyftsubset for conversion (it handles format conversion well)
  const args = [
    opts.inputPath,
    `--output-file=${outputPath}`,
    '--unicodes=*',
    '--layout-features=*',
  ];

  if (opts.format === 'woff2' || opts.format === 'woff') {
    args.push(`--flavor=${opts.format}`);
  }

  try {
    await execFileAsync('pyftsubset', args);
  } catch {
    // Fallback to fonttools
    try {
      await execFileAsync('fonttools', ['ttLib', opts.inputPath, '-o', outputPath]);
    } catch {
      throw new Error(
        'Font conversion requires fonttools. Install with: pip install fonttools brotli'
      );
    }
  }

  return outputPath;
}
