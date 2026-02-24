import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { join } from 'node:path';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { readGlobalConfig, writeGlobalConfig, createDefaultGlobalConfig } from '../../src/config/global.js';
import { readProjectConfig, writeProjectConfig, createDefaultProjectConfig } from '../../src/config/project.js';
import { readManifest, writeManifest, setManifestEntry, getManifestEntry, listManifestEntries } from '../../src/config/manifest.js';
import type { ManifestEntry } from '../../src/types/manifest.js';

let tempDir: string;

beforeEach(async () => {
  tempDir = await mkdtemp(join(tmpdir(), 'typo-test-'));
  process.env.TYPO_HOME = join(tempDir, '.typo');
});

afterEach(async () => {
  delete process.env.TYPO_HOME;
  await rm(tempDir, { recursive: true, force: true });
});

describe('GlobalConfig', () => {
  it('returns null when no config exists', async () => {
    const config = await readGlobalConfig();
    expect(config).toBeNull();
  });

  it('writes and reads config', async () => {
    const config = createDefaultGlobalConfig();
    await writeGlobalConfig(config);
    const read = await readGlobalConfig();
    expect(read).toEqual(config);
  });
});

describe('ProjectConfig', () => {
  it('returns null when no config exists', async () => {
    const config = await readProjectConfig(tempDir);
    expect(config).toBeNull();
  });

  it('writes and reads config', async () => {
    const config = createDefaultProjectConfig('nextjs');
    await writeProjectConfig(config, tempDir);
    const read = await readProjectConfig(tempDir);
    expect(read).toEqual(config);
  });
});

describe('Manifest', () => {
  it('returns empty object when no manifest exists', async () => {
    const manifest = await readManifest();
    expect(manifest).toEqual({});
  });

  it('sets and gets entries', async () => {
    const entry: ManifestEntry = {
      id: 'inter',
      family: 'Inter',
      source: 'local',
      dirPath: '/fonts/inter',
      files: [{ filename: 'Inter-Regular.woff2', format: 'woff2', weight: 400, style: 'normal' }],
      weights: [400],
      styles: ['normal'],
    };

    await setManifestEntry('inter', entry);
    const read = await getManifestEntry('inter');
    expect(read).toEqual(entry);
  });

  it('lists all entries', async () => {
    const entry1: ManifestEntry = {
      id: 'inter',
      family: 'Inter',
      source: 'local',
      dirPath: '/fonts/inter',
      files: [],
      weights: [400],
      styles: ['normal'],
    };

    const entry2: ManifestEntry = {
      id: 'roboto',
      family: 'Roboto',
      source: 'fontsource',
      dirPath: '/fonts/roboto',
      files: [],
      weights: [400, 700],
      styles: ['normal', 'italic'],
    };

    await setManifestEntry('inter', entry1);
    await setManifestEntry('roboto', entry2);

    const entries = await listManifestEntries();
    expect(entries).toHaveLength(2);
  });
});
