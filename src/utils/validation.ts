import { z } from 'zod';

export const FrameworkIdSchema = z.enum(['nextjs', 'vite', 'tailwind-v4', 'css', 'flutter', 'unknown']);

export const GlobalConfigSchema = z.object({
  version: z.literal(1),
  libraryDir: z.string(),
  sourceDirs: z.array(z.string()),
  defaultFormat: z.enum(['woff2', 'woff', 'ttf', 'otf']),
  defaultSubset: z.string(),
});

export const ProjectFontSchema = z.object({
  name: z.string(),
  weights: z.array(z.number()).optional(),
  styles: z.array(z.enum(['normal', 'italic'])).optional(),
  subset: z.string().optional(),
  format: z.string().optional(),
  variable: z.boolean().optional(),
  cssVariable: z.string().optional(),
  display: z.enum(['auto', 'block', 'swap', 'fallback', 'optional']).optional(),
});

export const ProjectConfigSchema = z.object({
  version: z.literal(1),
  framework: FrameworkIdSchema,
  fontDir: z.string(),
  buildDir: z.string(),
  fonts: z.array(ProjectFontSchema),
});

export const FontFileEntrySchema = z.object({
  filename: z.string(),
  format: z.enum(['woff2', 'woff', 'ttf', 'otf']),
  weight: z.number(),
  style: z.enum(['normal', 'italic']),
  variable: z.boolean().optional(),
});

export const ManifestEntrySchema = z.object({
  id: z.string(),
  family: z.string(),
  source: z.enum(['fontsource', 'local']),
  dirPath: z.string(),
  files: z.array(FontFileEntrySchema),
  weights: z.array(z.number()),
  styles: z.array(z.enum(['normal', 'italic'])),
  category: z.string().optional(),
  license: z.string().optional(),
  variableAxes: z.array(z.string()).optional(),
  subsets: z.array(z.string()).optional(),
  features: z.array(z.string()).optional(),
});

export const ManifestSchema = z.record(z.string(), ManifestEntrySchema);
