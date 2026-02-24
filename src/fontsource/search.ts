import { readFile, writeFile, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { getCacheDir } from '../config/paths.js';
import { ensureDir } from '../utils/fs.js';
import { join } from 'node:path';
import { listAllFonts } from './api.js';
import type { FontsourceFont } from './types.js';

const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

async function getCachedCatalog(): Promise<FontsourceFont[] | null> {
  const cacheFile = join(getCacheDir(), 'fontsource-catalog.json');
  if (!existsSync(cacheFile)) return null;

  try {
    const stats = await stat(cacheFile);
    if (Date.now() - stats.mtimeMs > CACHE_TTL) return null;

    const content = await readFile(cacheFile, 'utf-8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}

async function setCachedCatalog(catalog: FontsourceFont[]): Promise<void> {
  const cacheDir = getCacheDir();
  await ensureDir(cacheDir);
  const cacheFile = join(cacheDir, 'fontsource-catalog.json');
  await writeFile(cacheFile, JSON.stringify(catalog), 'utf-8');
}

export async function searchFonts(query: string): Promise<FontsourceFont[]> {
  let catalog = await getCachedCatalog();
  if (!catalog) {
    catalog = await listAllFonts();
    await setCachedCatalog(catalog);
  }

  const q = query.toLowerCase();

  // Score-based fuzzy matching
  const scored = catalog
    .map(font => {
      let score = 0;
      const family = font.family.toLowerCase();
      const id = font.id.toLowerCase();

      if (family === q || id === q) score = 100;
      else if (family.startsWith(q) || id.startsWith(q)) score = 80;
      else if (family.includes(q) || id.includes(q)) score = 60;
      else {
        // Simple word-level match
        const words = q.split(/\s+/);
        for (const word of words) {
          if (family.includes(word) || id.includes(word)) score += 20;
        }
      }

      return { font, score };
    })
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.map(s => s.font);
}
