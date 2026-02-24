import { existsSync } from 'node:fs';
import { getTypoHome, getGlobalConfigPath, getProjectConfigPath } from '../config/paths.js';
import { createDefaultGlobalConfig, readGlobalConfig, writeGlobalConfig } from '../config/global.js';
import { createDefaultProjectConfig, readProjectConfig, writeProjectConfig } from '../config/project.js';
import { ensureDir } from '../utils/fs.js';
import { logger } from '../utils/logger.js';

export async function initGlobal(): Promise<void> {
  const typoHome = getTypoHome();
  const configPath = getGlobalConfigPath();

  if (existsSync(configPath)) {
    const existing = await readGlobalConfig();
    if (existing) {
      logger.warn(`Global config already exists at ${configPath}`);
      return;
    }
  }

  const config = createDefaultGlobalConfig();
  await ensureDir(typoHome);
  await ensureDir(config.libraryDir);
  await writeGlobalConfig(config);

  logger.success(`Initialized global font library at ${typoHome}`);
}

export async function initProject(): Promise<void> {
  const configPath = getProjectConfigPath();

  if (existsSync(configPath)) {
    const existing = await readProjectConfig();
    if (existing) {
      logger.warn(`Project config already exists at ${configPath}`);
      return;
    }
  }

  // Framework detection will be added in Phase 3
  const config = createDefaultProjectConfig('unknown');
  await writeProjectConfig(config);

  logger.success(`Created project config at ${configPath}`);
  logger.dim('Run typo generate after linking fonts to generate framework config.');
}
