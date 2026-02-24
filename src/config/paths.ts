import { homedir } from 'node:os';
import { join, resolve } from 'node:path';

export function getTypoHome(): string {
  return process.env.TYPO_HOME || join(homedir(), '.typo');
}

export function getGlobalConfigPath(): string {
  return join(getTypoHome(), 'config.json');
}

export function getManifestPath(): string {
  return join(getTypoHome(), 'manifest.json');
}

export function getLibraryDir(): string {
  return join(getTypoHome(), 'fonts');
}

export function getCacheDir(): string {
  return join(getTypoHome(), 'cache');
}

export function getProjectConfigPath(projectDir?: string): string {
  return join(projectDir || process.cwd(), '.typo.json');
}

export function getProjectFontDir(projectDir?: string): string {
  return join(projectDir || process.cwd(), 'fonts');
}

export function getProjectBuildDir(projectDir?: string): string {
  return join(projectDir || process.cwd(), '.fonts');
}

export function getFontFamilyDir(familyId: string): string {
  return join(getLibraryDir(), familyId);
}

export function resolveProjectPath(relativePath: string, projectDir?: string): string {
  return resolve(projectDir || process.cwd(), relativePath);
}
