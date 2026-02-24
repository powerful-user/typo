export type FrameworkId = 'nextjs' | 'vite' | 'tailwind-v4' | 'css' | 'flutter' | 'unknown';

export interface GlobalConfig {
  version: 1;
  libraryDir: string;
  sourceDirs: string[];
  defaultFormat: 'woff2' | 'woff' | 'ttf' | 'otf';
  defaultSubset: string;
}

export interface ProjectFont {
  name: string;
  weights?: number[];
  styles?: ('normal' | 'italic')[];
  subset?: string;
  format?: string;
  variable?: boolean;
  cssVariable?: string;
  display?: 'auto' | 'block' | 'swap' | 'fallback' | 'optional';
}

export interface ProjectConfig {
  version: 1;
  framework: FrameworkId;
  fontDir: string;
  buildDir: string;
  fonts: ProjectFont[];
}
