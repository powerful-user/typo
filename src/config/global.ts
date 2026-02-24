import { getGlobalConfigPath, getLibraryDir } from './paths.js';
import { readJson, writeJson } from '../utils/fs.js';
import { GlobalConfigSchema } from '../utils/validation.js';
import type { GlobalConfig } from '../types/config.js';

export function createDefaultGlobalConfig(): GlobalConfig {
  return {
    version: 1,
    libraryDir: getLibraryDir(),
    sourceDirs: [],
    defaultFormat: 'woff2',
    defaultSubset: 'latin',
  };
}

export async function readGlobalConfig(): Promise<GlobalConfig | null> {
  const raw = await readJson<unknown>(getGlobalConfigPath());
  if (!raw) return null;
  const result = GlobalConfigSchema.safeParse(raw);
  return result.success ? result.data : null;
}

export async function writeGlobalConfig(config: GlobalConfig): Promise<void> {
  await writeJson(getGlobalConfigPath(), config);
}
