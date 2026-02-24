import { describe, it, expect } from 'vitest';
import { NextjsGenerator } from '../../src/generators/nextjs.js';
import { CssGenerator } from '../../src/generators/css.js';
import { TailwindGenerator } from '../../src/generators/tailwind.js';
import type { ResolvedFont } from '../../src/generators/base.js';

const mockVariableFont: ResolvedFont = {
  config: {
    name: 'inter',
    variable: true,
    display: 'swap',
    cssVariable: '--font-inter',
  },
  manifest: {
    id: 'inter',
    family: 'Inter',
    source: 'local',
    dirPath: '/lib/fonts/inter',
    files: [{ filename: 'Inter-Variable.woff2', format: 'woff2', weight: 400, style: 'normal', variable: true }],
    weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
    styles: ['normal'],
    variableAxes: ['wght'],
  },
  files: [{
    relativePath: '../fonts/Inter-Variable.woff2',
    absolutePath: '/project/fonts/Inter-Variable.woff2',
    filename: 'Inter-Variable.woff2',
    weight: 400,
    style: 'normal',
    format: 'woff2',
    variable: true,
  }],
};

const mockStaticFont: ResolvedFont = {
  config: {
    name: 'roboto',
    display: 'swap',
    cssVariable: '--font-roboto',
  },
  manifest: {
    id: 'roboto',
    family: 'Roboto',
    source: 'local',
    dirPath: '/lib/fonts/roboto',
    files: [
      { filename: 'Roboto-Regular.woff2', format: 'woff2', weight: 400, style: 'normal' },
      { filename: 'Roboto-Bold.woff2', format: 'woff2', weight: 700, style: 'normal' },
    ],
    weights: [400, 700],
    styles: ['normal'],
  },
  files: [
    {
      relativePath: '../fonts/Roboto-Regular.woff2',
      absolutePath: '/project/fonts/Roboto-Regular.woff2',
      filename: 'Roboto-Regular.woff2',
      weight: 400,
      style: 'normal',
      format: 'woff2',
    },
    {
      relativePath: '../fonts/Roboto-Bold.woff2',
      absolutePath: '/project/fonts/Roboto-Bold.woff2',
      filename: 'Roboto-Bold.woff2',
      weight: 700,
      style: 'normal',
      format: 'woff2',
    },
  ],
};

const dummyConfig = { version: 1 as const, framework: 'nextjs' as const, fontDir: 'fonts', buildDir: '.fonts', fonts: [] };

describe('NextjsGenerator', () => {
  it('generates variable font config', () => {
    const gen = new NextjsGenerator('/project', dummyConfig);
    const output = gen.generate([mockVariableFont]);

    expect(output).toContain("import localFont from 'next/font/local'");
    expect(output).toContain("src: '../fonts/Inter-Variable.woff2'");
    expect(output).toContain("variable: '--font-inter'");
    expect(output).toContain("display: 'swap'");
  });

  it('generates static font config with multiple weights', () => {
    const gen = new NextjsGenerator('/project', dummyConfig);
    const output = gen.generate([mockStaticFont]);

    expect(output).toContain("path: '../fonts/Roboto-Regular.woff2', weight: '400'");
    expect(output).toContain("path: '../fonts/Roboto-Bold.woff2', weight: '700'");
  });
});

describe('CssGenerator', () => {
  it('generates @font-face rules', () => {
    const gen = new CssGenerator('/project', { ...dummyConfig, framework: 'css' });
    const output = gen.generate([mockStaticFont]);

    expect(output).toContain("font-family: 'Roboto'");
    expect(output).toContain("format('woff2')");
    expect(output).toContain('font-weight: 400');
    expect(output).toContain('font-weight: 700');
    expect(output).toContain('font-display: swap');
  });

  it('generates variable font @font-face with weight range', () => {
    const gen = new CssGenerator('/project', { ...dummyConfig, framework: 'css' });
    const output = gen.generate([mockVariableFont]);

    expect(output).toContain('font-weight: 100 900');
  });
});

describe('TailwindGenerator', () => {
  it('generates @font-face rules plus @theme block', () => {
    const gen = new TailwindGenerator('/project', { ...dummyConfig, framework: 'tailwind-v4' });
    const output = gen.generate([mockVariableFont]);

    expect(output).toContain("font-family: 'Inter'");
    expect(output).toContain('@theme {');
    expect(output).toContain("--font-inter: 'Inter', sans-serif");
  });
});
