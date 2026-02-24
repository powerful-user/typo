export interface FontMetadata {
  family: string;
  weight: number;
  style: 'normal' | 'italic';
  format: 'woff2' | 'woff' | 'ttf' | 'otf';
  variable: boolean;
  variableAxes?: Array<{
    tag: string;
    name: string;
    min: number;
    max: number;
    default: number;
  }>;
  unitsPerEm?: number;
  ascent?: number;
  descent?: number;
  glyphCount?: number;
}

export interface DiscoveredFont {
  family: string;
  files: Array<{
    path: string;
    metadata: FontMetadata;
  }>;
}
