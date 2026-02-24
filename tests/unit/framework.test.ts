import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { join } from 'node:path';
import { mkdtemp, rm, writeFile, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { detectFramework } from '../../src/detect/framework.js';

let tempDir: string;

beforeEach(async () => {
  tempDir = await mkdtemp(join(tmpdir(), 'typo-fw-'));
});

afterEach(async () => {
  await rm(tempDir, { recursive: true, force: true });
});

describe('detectFramework', () => {
  it('detects Next.js from package.json', async () => {
    await writeFile(join(tempDir, 'package.json'), JSON.stringify({
      dependencies: { next: '14.0.0', react: '18.0.0' },
    }));
    expect(await detectFramework(tempDir)).toBe('nextjs');
  });

  it('detects Tailwind v4 from package.json', async () => {
    await writeFile(join(tempDir, 'package.json'), JSON.stringify({
      devDependencies: { tailwindcss: '^4.0.0' },
    }));
    expect(await detectFramework(tempDir)).toBe('tailwind-v4');
  });

  it('detects Vite from package.json', async () => {
    await writeFile(join(tempDir, 'package.json'), JSON.stringify({
      devDependencies: { vite: '^5.0.0' },
    }));
    expect(await detectFramework(tempDir)).toBe('vite');
  });

  it('detects Flutter from pubspec.yaml', async () => {
    await writeFile(join(tempDir, 'pubspec.yaml'), 'name: my_app\nflutter:\n  uses-material-design: true\n');
    expect(await detectFramework(tempDir)).toBe('flutter');
  });

  it('resolves Next.js + Tailwind conflict as nextjs', async () => {
    await writeFile(join(tempDir, 'package.json'), JSON.stringify({
      dependencies: { next: '14.0.0' },
      devDependencies: { tailwindcss: '^4.0.0' },
    }));
    expect(await detectFramework(tempDir)).toBe('nextjs');
  });

  it('detects Tailwind v4 from CSS @import', async () => {
    await writeFile(join(tempDir, 'package.json'), JSON.stringify({}));
    await mkdir(join(tempDir, 'src'), { recursive: true });
    await writeFile(join(tempDir, 'src', 'index.css'), '@import "tailwindcss";\n');
    expect(await detectFramework(tempDir)).toBe('tailwind-v4');
  });

  it('returns unknown for empty project', async () => {
    expect(await detectFramework(tempDir)).toBe('unknown');
  });
});
