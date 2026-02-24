import { getManifestPath } from './paths.js';
import { readJson, writeJson } from '../utils/fs.js';
import { ManifestSchema } from '../utils/validation.js';
import type { Manifest, ManifestEntry } from '../types/manifest.js';

export async function readManifest(): Promise<Manifest> {
  const raw = await readJson<unknown>(getManifestPath());
  if (!raw) return {};
  const result = ManifestSchema.safeParse(raw);
  return result.success ? result.data : {};
}

export async function writeManifest(manifest: Manifest): Promise<void> {
  await writeJson(getManifestPath(), manifest);
}

export async function getManifestEntry(id: string): Promise<ManifestEntry | null> {
  const manifest = await readManifest();
  return manifest[id] || null;
}

export async function setManifestEntry(id: string, entry: ManifestEntry): Promise<void> {
  const manifest = await readManifest();
  manifest[id] = entry;
  await writeManifest(manifest);
}

export async function removeManifestEntry(id: string): Promise<boolean> {
  const manifest = await readManifest();
  if (!manifest[id]) return false;
  delete manifest[id];
  await writeManifest(manifest);
  return true;
}

export async function listManifestEntries(): Promise<ManifestEntry[]> {
  const manifest = await readManifest();
  return Object.values(manifest);
}
