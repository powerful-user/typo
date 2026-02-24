import { symlink, readlink, unlink, stat } from 'node:fs/promises';
import { relative, dirname } from 'node:path';
import { ensureDir } from '../utils/fs.js';

export async function createSymlink(source: string, target: string, opts?: { relative?: boolean }): Promise<void> {
  await ensureDir(dirname(target));

  // Remove existing symlink if present
  try {
    const existing = await readlink(target);
    if (existing) await unlink(target);
  } catch {
    // Not a symlink or doesn't exist
    try {
      await stat(target);
      throw new Error(`Target path already exists and is not a symlink: ${target}`);
    } catch {
      // Doesn't exist, good
    }
  }

  const linkPath = opts?.relative ? relative(dirname(target), source) : source;
  await symlink(linkPath, target);
}
