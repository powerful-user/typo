import { getProjectConfigPath } from './paths.js';
import { readJson, writeJson } from '../utils/fs.js';
import { ProjectConfigSchema } from '../utils/validation.js';
import type { ProjectConfig, FrameworkId } from '../types/config.js';

export function createDefaultProjectConfig(framework: FrameworkId = 'unknown'): ProjectConfig {
  return {
    version: 1,
    framework,
    fontDir: 'fonts',
    buildDir: '.fonts',
    fonts: [],
  };
}

export async function readProjectConfig(projectDir?: string): Promise<ProjectConfig | null> {
  const raw = await readJson<unknown>(getProjectConfigPath(projectDir));
  if (!raw) return null;
  const result = ProjectConfigSchema.safeParse(raw);
  return result.success ? result.data : null;
}

export async function writeProjectConfig(config: ProjectConfig, projectDir?: string): Promise<void> {
  await writeJson(getProjectConfigPath(projectDir), config);
}
