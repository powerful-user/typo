export type FontSource = 'fontsource' | 'local';

export interface FontFileEntry {
  filename: string;
  format: 'woff2' | 'woff' | 'ttf' | 'otf';
  weight: number;
  style: 'normal' | 'italic';
  variable?: boolean;
}

export interface ManifestEntry {
  id: string;
  family: string;
  source: FontSource;
  dirPath: string;
  files: FontFileEntry[];
  weights: number[];
  styles: ('normal' | 'italic')[];
  category?: string;
  license?: string;
  variableAxes?: string[];
  subsets?: string[];
  features?: string[];
}

export type Manifest = Record<string, ManifestEntry>;
