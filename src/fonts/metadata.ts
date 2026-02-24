import * as fontkit from 'fontkit';
import { readFile } from 'node:fs/promises';
import { basename } from 'node:path';
import { getFormat } from './formats.js';
import type { FontMetadata } from '../types/font.js';

// Common weight name patterns in filenames
const WEIGHT_PATTERNS: [RegExp, number][] = [
  [/thin|hairline/i, 100],
  [/extralight|ultra-?light/i, 200],
  [/light/i, 300],
  [/regular|normal|book/i, 400],
  [/medium/i, 500],
  [/semibold|demi-?bold/i, 600],
  [/extrabold|ultra-?bold/i, 800],
  [/bold/i, 700],
  [/black|heavy/i, 900],
];

function inferWeightFromFilename(filename: string): number {
  const name = basename(filename);
  for (const [pattern, weight] of WEIGHT_PATTERNS) {
    if (pattern.test(name)) return weight;
  }
  return 400;
}

function inferStyleFromFilename(filename: string): 'normal' | 'italic' {
  return /italic/i.test(basename(filename)) ? 'italic' : 'normal';
}

export async function readFontMetadata(filePath: string): Promise<FontMetadata> {
  const buffer = await readFile(filePath);
  const font = fontkit.create(buffer as unknown as Buffer);

  const format = getFormat(filePath);
  if (!format) throw new Error(`Unknown font format: ${filePath}`);

  // Check if it's a variable font by looking for variation axes
  const variableAxes = 'variationAxes' in font && font.variationAxes
    ? Object.entries(font.variationAxes as Record<string, { name: string; min: number; max: number; default: number }>).map(
        ([tag, axis]) => ({
          tag,
          name: axis.name || tag,
          min: axis.min,
          max: axis.max,
          default: axis.default,
        })
      )
    : [];

  const isVariable = variableAxes.length > 0;

  // Try to get weight from OS/2 table, fall back to filename
  let weight = 400;
  if ('OS/2' in font && font['OS/2']) {
    const os2 = font['OS/2'] as { usWeightClass?: number };
    if (os2.usWeightClass) weight = os2.usWeightClass;
  } else {
    weight = inferWeightFromFilename(filePath);
  }

  const style = inferStyleFromFilename(filePath);

  return {
    family: font.familyName || basename(filePath, '.' + format),
    weight,
    style,
    format,
    variable: isVariable,
    variableAxes: isVariable ? variableAxes : undefined,
    unitsPerEm: font.unitsPerEm,
    ascent: font.ascent,
    descent: font.descent,
    glyphCount: font.numGlyphs,
  };
}
