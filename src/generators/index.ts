import type { FrameworkId, ProjectConfig } from '../types/config.js';
import type { BaseGenerator } from './base.js';
import { NextjsGenerator } from './nextjs.js';
import { CssGenerator } from './css.js';
import { TailwindGenerator } from './tailwind.js';
import { FlutterGenerator } from './flutter.js';

export function createGenerator(projectDir: string, config: ProjectConfig): BaseGenerator {
  return createGeneratorForFramework(config.framework, projectDir, config);
}

export function createGeneratorForFramework(
  framework: FrameworkId,
  projectDir: string,
  config: ProjectConfig
): BaseGenerator {
  switch (framework) {
    case 'nextjs':
      return new NextjsGenerator(projectDir, config);
    case 'tailwind-v4':
      return new TailwindGenerator(projectDir, config);
    case 'flutter':
      return new FlutterGenerator(projectDir, config);
    case 'vite':
    case 'css':
    case 'unknown':
    default:
      return new CssGenerator(projectDir, config);
  }
}
