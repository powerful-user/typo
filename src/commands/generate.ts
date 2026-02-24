import { writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { readProjectConfig, writeProjectConfig } from '../config/project.js';
import { createGenerator, createGeneratorForFramework } from '../generators/index.js';
import { detectFramework } from '../detect/framework.js';
import { ensureDir } from '../utils/fs.js';
import { logger } from '../utils/logger.js';
import type { FrameworkId } from '../types/config.js';

export async function generateConfig(opts: { framework?: string }): Promise<void> {
  const config = await readProjectConfig();
  if (!config) {
    logger.error('No project config found. Run "typo init" first.');
    process.exit(1);
  }

  if (config.fonts.length === 0) {
    logger.error('No fonts linked to project. Run "typo link <name>" first.');
    process.exit(1);
  }

  const projectDir = process.cwd();

  // Determine framework
  let framework: FrameworkId = config.framework;
  if (opts.framework) {
    framework = opts.framework as FrameworkId;
  } else if (framework === 'unknown') {
    framework = await detectFramework(projectDir);
    if (framework !== 'unknown') {
      config.framework = framework;
      await writeProjectConfig(config);
      logger.info(`Detected framework: ${framework}`);
    }
  }

  const generator = opts.framework
    ? createGeneratorForFramework(framework, projectDir, config)
    : createGenerator(projectDir, config);

  const fonts = await generator.resolveFonts();
  if (fonts.length === 0) {
    logger.warn('No font files found. Make sure fonts are linked and files exist.');
    return;
  }

  const output = generator.generate(fonts);
  const outputPath = generator.outputPath;

  await ensureDir(dirname(outputPath));
  await writeFile(outputPath, output, 'utf-8');

  logger.success(`Generated ${outputPath}`);
  logger.dim(`  Framework: ${framework}`);
  logger.dim(`  Fonts: ${fonts.map(f => f.manifest.family).join(', ')}`);
}
