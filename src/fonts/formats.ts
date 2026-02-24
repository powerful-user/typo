import { extname } from 'node:path';

export const FONT_EXTENSIONS = ['.woff2', '.woff', '.ttf', '.otf'] as const;

export type FontFormat = 'woff2' | 'woff' | 'ttf' | 'otf';

export const EXTENSION_TO_FORMAT: Record<string, FontFormat> = {
  '.woff2': 'woff2',
  '.woff': 'woff',
  '.ttf': 'ttf',
  '.otf': 'otf',
};

export function isFontFile(filename: string): boolean {
  return FONT_EXTENSIONS.includes(extname(filename).toLowerCase() as typeof FONT_EXTENSIONS[number]);
}

export function getFormat(filename: string): FontFormat | null {
  return EXTENSION_TO_FORMAT[extname(filename).toLowerCase()] ?? null;
}
