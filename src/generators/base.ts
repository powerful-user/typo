import { join, relative } from 'node:path';
import { existsSync } from 'node:fs';
import { readdir } from 'node:fs/promises';
import type { ProjectConfig, ProjectFont } from '../types/config.js';
import type { ManifestEntry } from '../types/manifest.js';
import { getManifestEntry } from '../config/manifest.js';
import { isFontFile } from '../fonts/formats.js';

export interface ResolvedFont {
  config: ProjectFont;
  manifest: ManifestEntry;
  files: Array<{
    relativePath: string;
    absolutePath: string;
    filename: string;
    weight: number;
    style: 'normal' | 'italic';
    format: string;
    variable?: boolean;
  }>;
}

export abstract class BaseGenerator {
  protected projectDir: string;
  protected config: ProjectConfig;

  constructor(projectDir: string, config: ProjectConfig) {
    this.projectDir = projectDir;
    this.config = config;
  }

  abstract generate(fonts: ResolvedFont[]): string;
  abstract get outputPath(): string;

  async resolveFonts(): Promise<ResolvedFont[]> {
    const resolved: ResolvedFont[] = [];

    for (const fontConfig of this.config.fonts) {
      const manifest = await getManifestEntry(fontConfig.name);
      if (!manifest) continue;

      const files: ResolvedFont['files'] = [];

      // Check build dir first (.fonts/), then font dir (fonts/)
      const buildDir = join(this.projectDir, this.config.buildDir);
      const fontDir = join(this.projectDir, this.config.fontDir);

      // Gather files from both locations, preferring build dir
      const seen = new Set<string>();

      for (const dir of [buildDir, fontDir]) {
        if (!existsSync(dir)) continue;
        try {
          const entries = await readdir(dir);
          for (const entry of entries) {
            if (seen.has(entry) || !isFontFile(entry)) continue;
            seen.add(entry);

            // Find matching manifest file entry
            const manifestFile = manifest.files.find(f => f.filename === entry);
            if (!manifestFile) continue;

            // Apply filters
            if (fontConfig.variable !== undefined) {
              if (fontConfig.variable && !manifestFile.variable) continue;
              if (!fontConfig.variable && manifestFile.variable) continue;
            }
            if (fontConfig.weights?.length && !manifestFile.variable) {
              if (!fontConfig.weights.includes(manifestFile.weight)) continue;
            }

            const absolutePath = join(dir, entry);
            const relativePath = relative(
              join(this.projectDir, 'src'),
              absolutePath
            );

            files.push({
              relativePath,
              absolutePath,
              filename: entry,
              weight: manifestFile.weight,
              style: manifestFile.style,
              format: manifestFile.format,
              variable: manifestFile.variable,
            });
          }
        } catch {}
      }

      if (files.length > 0) {
        resolved.push({ config: fontConfig, manifest, files });
      }
    }

    return resolved;
  }
}
