import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { join, resolve } from 'node:path';
import { mkdtemp, rm, readFile, readlink, lstat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { initGlobal, initProject } from '../../src/commands/init.js';
import { addFont } from '../../src/commands/add.js';
import { linkFont } from '../../src/commands/link.js';
import { generateConfig } from '../../src/commands/generate.js';
import { readManifest } from '../../src/config/manifest.js';
import { readProjectConfig } from '../../src/config/project.js';

const FIXTURES_DIR = resolve(__dirname, '../fixtures/fonts');

let tempDir: string;
let projectDir: string;
let origCwd: string;

beforeEach(async () => {
  tempDir = await mkdtemp(join(tmpdir(), 'typo-e2e-'));
  projectDir = join(tempDir, 'my-project');
  process.env.TYPO_HOME = join(tempDir, '.typo');
  origCwd = process.cwd();
});

afterEach(async () => {
  process.chdir(origCwd);
  delete process.env.TYPO_HOME;
  await rm(tempDir, { recursive: true, force: true });
});

describe('e2e: init → add → link → generate', () => {
  it('full flow with local variable font and CSS generator', async () => {
    // Step 1: Initialize global font library
    await initGlobal();

    const globalConfig = join(tempDir, '.typo', 'config.json');
    expect(existsSync(globalConfig)).toBe(true);
    expect(existsSync(join(tempDir, '.typo', 'fonts'))).toBe(true);

    // Step 2: Add local fonts from fixtures
    await addFont('inter', { from: FIXTURES_DIR });

    const manifest = await readManifest();
    expect(manifest['inter']).toBeDefined();
    expect(manifest['inter'].family).toBe('Inter');
    expect(manifest['inter'].source).toBe('local');
    expect(manifest['inter'].files.length).toBe(2);

    // Verify files were copied to the global library
    const libraryDir = join(tempDir, '.typo', 'fonts', 'inter');
    expect(existsSync(join(libraryDir, 'Inter-Regular.woff2'))).toBe(true);
    expect(existsSync(join(libraryDir, 'Inter-Variable.woff2'))).toBe(true);

    // Verify manifest has both static and variable entries
    const staticFile = manifest['inter'].files.find(f => !f.variable);
    const variableFile = manifest['inter'].files.find(f => f.variable);
    expect(staticFile).toBeDefined();
    expect(staticFile!.weight).toBe(400);
    expect(variableFile).toBeDefined();
    expect(variableFile!.variable).toBe(true);

    // Step 3: Create a project and initialize it
    const { mkdir } = await import('node:fs/promises');
    await mkdir(projectDir, { recursive: true });
    process.chdir(projectDir);

    await initProject();

    const projectConfig = join(projectDir, '.typo.json');
    expect(existsSync(projectConfig)).toBe(true);

    // Step 4: Link the variable font to the project
    await linkFont('inter', { variable: true, display: 'swap', cssVariable: '--font-inter' });

    // Verify symlink was created
    const fontDir = join(projectDir, 'fonts');
    expect(existsSync(fontDir)).toBe(true);

    const linkedFile = join(fontDir, 'Inter-Variable.woff2');
    expect(existsSync(linkedFile)).toBe(true);

    // Verify it's actually a symlink
    const stats = await lstat(linkedFile);
    expect(stats.isSymbolicLink()).toBe(true);

    // Verify symlink is relative (portable)
    const linkTarget = await readlink(linkedFile);
    expect(linkTarget).not.toMatch(/^\//); // not absolute

    // Only variable file should be linked, not the static one
    expect(existsSync(join(fontDir, 'Inter-Regular.woff2'))).toBe(false);

    // Verify project config was updated
    const config = await readProjectConfig(projectDir);
    expect(config).not.toBeNull();
    expect(config!.fonts).toHaveLength(1);
    expect(config!.fonts[0].name).toBe('inter');
    expect(config!.fonts[0].variable).toBe(true);
    expect(config!.fonts[0].display).toBe('swap');
    expect(config!.fonts[0].cssVariable).toBe('--font-inter');

    // Step 5: Generate CSS config
    await generateConfig({ framework: 'css' });

    const cssPath = join(projectDir, 'src', 'fonts.css');
    expect(existsSync(cssPath)).toBe(true);

    const css = await readFile(cssPath, 'utf-8');
    expect(css).toContain("@font-face");
    expect(css).toContain("font-family: 'Inter'");
    expect(css).toContain("format('woff2')");
    expect(css).toContain("font-display: swap");
    // Variable font should have a weight range, not a single value
    expect(css).toMatch(/font-weight:\s+\d+\s+\d+/);
  });

  it('full flow with static font filtered by weight', async () => {
    await initGlobal();
    await addFont('inter', { from: FIXTURES_DIR });

    const { mkdir } = await import('node:fs/promises');
    await mkdir(projectDir, { recursive: true });
    process.chdir(projectDir);

    await initProject();

    // Link only static fonts (no variable), weight 400
    await linkFont('inter', {
      variable: false,
      weights: '400',
      display: 'swap',
      cssVariable: '--font-inter',
    });

    const fontDir = join(projectDir, 'fonts');

    // Only the static 400-weight file should be linked
    expect(existsSync(join(fontDir, 'Inter-Regular.woff2'))).toBe(true);
    expect(existsSync(join(fontDir, 'Inter-Variable.woff2'))).toBe(false);

    // Generate CSS
    await generateConfig({ framework: 'css' });

    const css = await readFile(join(projectDir, 'src', 'fonts.css'), 'utf-8');
    expect(css).toContain("font-family: 'Inter'");
    expect(css).toContain("font-weight: 400");
    // Should NOT have a weight range (that's for variable fonts)
    expect(css).not.toMatch(/font-weight:\s+\d+\s+\d+/);
  });

  it('link is idempotent — re-linking updates config without duplicates', async () => {
    await initGlobal();
    await addFont('inter', { from: FIXTURES_DIR });

    const { mkdir } = await import('node:fs/promises');
    await mkdir(projectDir, { recursive: true });
    process.chdir(projectDir);

    await initProject();

    // Link twice with different options
    await linkFont('inter', { variable: true, display: 'swap', cssVariable: '--font-inter' });
    await linkFont('inter', { variable: true, display: 'optional', cssVariable: '--font-heading' });

    const config = await readProjectConfig(projectDir);
    expect(config!.fonts).toHaveLength(1); // no duplicate
    expect(config!.fonts[0].display).toBe('optional'); // updated
    expect(config!.fonts[0].cssVariable).toBe('--font-heading'); // updated
  });
});
