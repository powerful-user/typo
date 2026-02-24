import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { join } from 'node:path';
import { mkdtemp, rm, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { initGlobal, initProject } from '../../src/commands/init.js';

let tempDir: string;

beforeEach(async () => {
  tempDir = await mkdtemp(join(tmpdir(), 'typo-test-'));
  process.env.TYPO_HOME = join(tempDir, '.typo');
});

afterEach(async () => {
  delete process.env.TYPO_HOME;
  await rm(tempDir, { recursive: true, force: true });
});

describe('typo init --global', () => {
  it('creates global config and font library directory', async () => {
    await initGlobal();

    const configPath = join(tempDir, '.typo', 'config.json');
    expect(existsSync(configPath)).toBe(true);

    const config = JSON.parse(await readFile(configPath, 'utf-8'));
    expect(config.version).toBe(1);
    expect(config.defaultFormat).toBe('woff2');

    const fontsDir = join(tempDir, '.typo', 'fonts');
    expect(existsSync(fontsDir)).toBe(true);
  });

  it('warns if already initialized', async () => {
    await initGlobal();
    // Should not throw, just warn
    await initGlobal();
  });
});

describe('typo init (project)', () => {
  it('creates project config', async () => {
    const origCwd = process.cwd();
    process.chdir(tempDir);

    try {
      await initProject();

      const configPath = join(tempDir, '.typo.json');
      expect(existsSync(configPath)).toBe(true);

      const config = JSON.parse(await readFile(configPath, 'utf-8'));
      expect(config.version).toBe(1);
      expect(config.fontDir).toBe('fonts');
      expect(config.buildDir).toBe('.fonts');
      expect(config.fonts).toEqual([]);
    } finally {
      process.chdir(origCwd);
    }
  });
});
