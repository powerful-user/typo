import { readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { isFontFile } from './formats.js';
import { readFontMetadata } from './metadata.js';
import type { DiscoveredFont } from '../types/font.js';

export async function discoverFontsInDir(dirPath: string): Promise<DiscoveredFont[]> {
  const familyMap = new Map<string, DiscoveredFont>();

  const entries = await readdir(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dirPath, entry.name);

    if (entry.isDirectory()) {
      // Recurse one level into subdirectories
      const subFonts = await discoverFontsFlat(fullPath);
      for (const { path, metadata } of subFonts) {
        const existing = familyMap.get(metadata.family);
        if (existing) {
          existing.files.push({ path, metadata });
        } else {
          familyMap.set(metadata.family, {
            family: metadata.family,
            files: [{ path, metadata }],
          });
        }
      }
    } else if (entry.isFile() && isFontFile(entry.name)) {
      try {
        const metadata = await readFontMetadata(fullPath);
        const existing = familyMap.get(metadata.family);
        if (existing) {
          existing.files.push({ path: fullPath, metadata });
        } else {
          familyMap.set(metadata.family, {
            family: metadata.family,
            files: [{ path: fullPath, metadata }],
          });
        }
      } catch {
        // Skip unreadable font files
      }
    }
  }

  return Array.from(familyMap.values());
}

async function discoverFontsFlat(dirPath: string): Promise<Array<{ path: string; metadata: import('../types/font.js').FontMetadata }>> {
  const results: Array<{ path: string; metadata: import('../types/font.js').FontMetadata }> = [];

  try {
    const entries = await readdir(dirPath);
    for (const name of entries) {
      const fullPath = join(dirPath, name);
      const s = await stat(fullPath);
      if (s.isFile() && isFontFile(name)) {
        try {
          const metadata = await readFontMetadata(fullPath);
          results.push({ path: fullPath, metadata });
        } catch {
          // Skip
        }
      }
    }
  } catch {
    // Directory not readable
  }

  return results;
}
